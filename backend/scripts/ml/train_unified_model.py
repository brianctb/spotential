import polars as pl
import xgboost as xgb
from sklearn.model_selection import train_test_split
import joblib
import mlflow
from config.business_type import BUSINESS_CONFIGS
from db import engine
from pathlib import Path
from sqlmodel import select
from models.business import Business
from models.census import CensusDemographics
from sklearn.metrics import mean_absolute_error
import numpy as np


current_file = Path(__file__).resolve()
backend_root = current_file.parents[2]
ml_dir = backend_root /"ml"
tracking_uri = ml_dir / "mlruns"
model_dir = ml_dir/"models"
model_dir.mkdir(parents=True, exist_ok=True)
model_name = "unified_spotential_model.pkl"
model_path = model_dir / model_name

pl.Config.set_tbl_cols(-1)
pl.Config.set_tbl_width_chars(200)

mlflow.set_tracking_uri(tracking_uri)
mlflow.set_experiment("spotential_v1")


def prepare_data(db_engine):

    # Pulling raw tables via SQLModel/Engine
    tracts_query = select(CensusDemographics)
    biz_query = select(Business)

    df_tracts = pl.read_database(tracts_query, db_engine)
    df_biz = pl.read_database(biz_query, db_engine)

    categories = pl.DataFrame([
        {"type": bt.value, "business_type_id": config.id}
        for bt, config in BUSINESS_CONFIGS.items()
    ])

    # create a df where each demo data per tract is mapped to duplicated demo data with different business type
    df = df_tracts.join(categories, how="cross")

    # Total counts per tract per business type
    biz_counts = (
        df_biz.group_by(["tract_id", "type"])
        .agg(pl.len().alias("target_count"))
    )

    # Total density per tract
    total_counts = (
        df_biz.group_by("tract_id")
        .agg(pl.len().alias("total_biz_count"))
    )

    # combining demo data
    df = (
        df.join(biz_counts,
                left_on=["tract_id", "type"],
                right_on=["tract_id", "type"],
                how="left")
        # total count is per tract, so we joining by tract_id
        .join(total_counts,
              on=['tract_id'],
              how="left")
    )

    df = df.with_columns([
        pl.col("target_count").fill_null(0),
        pl.col("total_biz_count").fill_null(0)
    ])
    df = df.with_columns([
        (pl.col("total_biz_count") - pl.col("target_count")).alias("other_business_count")
    ])

    print(f"Rows before cleaning demographics: {df.height}")
    df = df.drop_nulls(subset=["median_household_income", "population"])
    print(f"Rows after cleaning demographics: {df.height}")

    return df


def train_unified_model(df: pl.DataFrame):
    features = [
        "population",
        "population_density",
        "median_household_income",
        "pct_working_age",
        "pct_highly_educated",
        "avg_household_size",
        "other_business_count",
        "business_type_id"
    ]
    target = "target_count"

    x = df.select(features).to_pandas()
    y = df.select(target).to_pandas()

    x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

    # Shrink the gap between busy hubs and quiet neighborhoods
    # Without Log, a miss of 10 in downtown is a disaster. A miss of 1 in a suburb is nothing
    y_train_log = np.log1p(y_train)
    y_test_log = np.log1p(y_test)

    with mlflow.start_run(run_name="unified_xgb_regressor"):
        params = {
            "n_estimators": 2000,
            "learning_rate": 0.05,
            "max_depth": 7,
            "subsample": 0.7,
            "random_state": 42
        }
        mlflow.log_params(params)

        model = xgb.XGBRegressor(**params)
        print("Training model")
        model.fit(
            x_train, y_train_log,
            eval_set=[(x_test, y_test_log)],
            verbose=False
        )

        y_pred_log = model.predict(x_test)
        y_pred = np.expm1(y_pred_log)

        # Log Metrics
        score = model.score(x_test, y_test_log)
        mae = mean_absolute_error(y_test, y_pred)
        mlflow.log_metric("mae", mae)
        mlflow.log_metric("r2_score", score)
        print(f"Training Complete. R² Score: {score:.4f}")
        print(f"MAE: {mae:.2f} businesses")

        joblib.dump(model, model_path)
        mlflow.log_artifact(f"{model_path}")

        return model


if __name__ == "__main__":
    processed_df = prepare_data(engine)
    train_unified_model(processed_df)
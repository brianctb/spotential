import polars as pl
import xgboost as xgb
import mlflow
from config.business_type import BUSINESS_CONFIGS
from db import engine
from sqlmodel import select
from models.business import Business
from models.census import CensusDemographics
from sklearn.metrics import mean_absolute_error, mean_squared_log_error
import numpy as np
from schema.ml_model import ModelFeatures
from sklearn.model_selection import KFold
from config.mlflow_config import init_mlflow
from datetime import datetime

pl.Config.set_tbl_cols(-1)
pl.Config.set_tbl_width_chars(200)

run_name = f"Unified_Model_{datetime.now().strftime('%m%d_%H%M')}"


def prepare_data(db_engine):
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
    features = ModelFeatures.feature_columns()
    target = "target_count"

    X = df.select(features).to_pandas()
    y = df.select(target).to_pandas().values.ravel()

    params = {
        "n_estimators": 2000,
        "learning_rate": 0.04,
        "max_depth": 5,
        "random_state": 42,
        "subsample": 0.7,
        "colsample_bytree": 0.7,
        "objective": "count:poisson",
    }

    with mlflow.start_run(run_name=run_name) as parent_run:
        mlflow.log_params(params)

        kf = KFold(n_splits=5, shuffle=True, random_state=42)
        mae_scores = []
        rmsle_scores = []

        for fold, (train_idx, val_idx) in enumerate(kf.split(X, y)):
            x_train, x_val = X.iloc[train_idx], X.iloc[val_idx]
            y_train, y_val = y[train_idx], y[val_idx]

            with mlflow.start_run(run_name=f"fold_{fold + 1}", nested=True):
                model = xgb.XGBRegressor(**params)
                model.fit(
                    x_train, y_train,
                    eval_set=[(x_val, y_val)],
                    verbose=False
                )

                y_pred = model.predict(x_val)
                y_pred_clipped = np.maximum(y_pred, 0)

                f_mae = mean_absolute_error(y_val, y_pred)
                f_rmsle = np.sqrt(mean_squared_log_error(y_val, y_pred_clipped))

                mae_scores.append(f_mae)
                rmsle_scores.append(f_rmsle)

                mlflow.log_metric("mae", f_mae)
                mlflow.log_metric("rmsle", f_rmsle)
                print(f"Fold {fold + 1} | MAE: {f_mae:.4f}")

        avg_mae = np.mean(mae_scores)
        avg_rmsle = np.mean(rmsle_scores)

        mlflow.log_metric("avg_mae", float(avg_mae))
        mlflow.log_metric("std_mae", float(np.std(mae_scores)))
        mlflow.log_metric("avg_rmsle", float(avg_rmsle))
        mlflow.log_metric("std_rmsle", float(np.std(rmsle_scores)))

        print(f"\nFinal CV Results: MAE {avg_mae:.4f}")

        final_model = xgb.XGBRegressor(**params)
        final_model.fit(X, y)

        mlflow.xgboost.log_model(final_model, name="model")
        return final_model


if __name__ == "__main__":
    init_mlflow()
    processed_df = prepare_data(engine)
    train_unified_model(processed_df)

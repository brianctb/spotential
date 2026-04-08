import os
import polars as pl
from sqlmodel import Session, create_engine, delete
from models.census import CensusDemographics
from config.census_constants import CHAR_ID_MAP
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

def load_demographics(data_path: str, geo_path: str):

    target_ids = list(CHAR_ID_MAP.keys())

    # load all the tract that is in vancouver
    print("Filtering for Vancouver Tracts using Geo Name")
    vancouver_geo = (
        pl.read_csv(geo_path, encoding="latin1")
        .filter(
            # filter for names starting with '933' (Vancouver CMA)
            pl.col("Geo Name").str.starts_with("933")
        )
        .select([
            pl.col("Geo Name").cast(pl.Utf8).alias("tract_id")  # This is your clean '9330001.00'
        ])
        .unique()
    )

    # Load the actual demo data and join with Vancouvers Geo Code
    data_df = pl.scan_csv(
        data_path,
        encoding="utf8-lossy",
        schema_overrides={"ALT_GEO_CODE": pl.Utf8}
    )

    filtered = (
        data_df
        .join(
            vancouver_geo.lazy(),
            left_on="ALT_GEO_CODE",
            right_on="tract_id",
            how="inner"
        )
        .filter(pl.col("CHARACTERISTIC_ID").is_in(target_ids))
        .select([
            pl.col("ALT_GEO_CODE").alias("tract_id"),
            "CHARACTERISTIC_ID",
            "C1_COUNT_TOTAL"
        ])
        .collect()
    )

    # Pivot row structure to column structure
    print("Pivoting data...")
    wide = filtered.pivot(
        index="tract_id",
        on="CHARACTERISTIC_ID",
        values="C1_COUNT_TOTAL",
    )

    # Renaming the char_ID to Census Model's field name
    rename_map = {str(k): v for k, v in CHAR_ID_MAP.items()}
    wide = wide.rename(rename_map)

    # derive columns
    wide = wide.with_columns([
        pl.when(pl.col("population") > 0)
        .then((pl.col("count_age_15_64") / pl.col("population")) * 100)
        .otherwise(0)
        .alias("pct_working_age"),

        pl.when(pl.col("education_base_pop_25_plus") > 0)
        .then((pl.col("count_postsecondary_edu_plus") / pl.col("education_base_pop_25_plus")) * 100)
        .otherwise(0)
        .alias("pct_highly_educated"),

        pl.when(pl.col("household_count") > 0)
        .then(pl.col("population") / pl.col("household_count"))
        .otherwise(0)
        .alias("avg_household_size")
    ])


    # Wipe db and insert
    engine = create_engine(os.getenv("DATABASE_URL"))
    records = wide.to_dicts()

    print(f"Uploading {len(records)} Vancouver records...")
    with Session(engine) as session:

        statement = delete(CensusDemographics)
        session.exec(statement)

        for row in records:
            # This 'tract_id' (e.g. '9330001.00') now matches Shapefile's CTUID
            db_record = CensusDemographics(**row)
            session.add(db_record)
        session.commit()

if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    DATA_FOLDER = BASE_DIR / "data" / "census" / "demographics"
    DATA_FILE = DATA_FOLDER / "98-401-X2021007_English_CSV_data.csv"
    GEO_FILE = DATA_FOLDER / "98-401-X2021007_Geo_starting_row.csv"

    if DATA_FILE.exists() and GEO_FILE.exists():
        load_demographics(str(DATA_FILE), str(GEO_FILE))
    else:
        print("Error: Census data files missing.")
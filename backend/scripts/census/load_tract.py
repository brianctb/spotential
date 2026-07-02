import geopandas as gpd
from sqlmodel import Session, create_engine
import os
from dotenv import load_dotenv
from pathlib import Path
import pandas as pd
from models.census import CensusTract

load_dotenv()
engine = create_engine(os.environ["DATABASE_URL"])

pd.set_option('display.max_columns', None)  # Show all columns
pd.set_option('display.width', 1000)        # Don't wrap lines
pd.set_option('display.max_colwidth', 50)

def load_tract_shapefile(file_path):

    df = gpd.read_file(file_path)
    df = df.rename(columns={'CTUID': 'tract_id'})
    # Filter for Vancouver (933)
    df = df[df['tract_id'].str.startswith('933')]
    # Convert to Lat/Lng
    df = df.to_crs(epsg=4326)

    with Session(engine) as session:
        for index, row in df.iterrows():
            # Create the model instance
            tract = CensusTract(
                tract_id=row['tract_id'],
                geom=row['geometry'].wkt
            )
            session.add(tract)

        session.commit()
        print(f"Successfully loaded {len(df)} tracts.")


if __name__ == "__main__":
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    DATA_FOLDER = BASE_DIR / "data" / "census" / "tract"
    SHAPER_FILEPATH = DATA_FOLDER / "lct_000b21a_e.shp"
    load_tract_shapefile(str(SHAPER_FILEPATH))
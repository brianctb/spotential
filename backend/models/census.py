from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from typing import Optional
from geoalchemy2 import Geometry


class CensusTract(SQLModel, table=True):
    __tablename__ = "census_tracts"

    id: Optional[int] = Field(default=None, primary_key=True)
    tract_id: str = Field(unique=True)
    geom: str = Field(
        sa_column=Column(Geometry("MULTIPOLYGON", srid=4326, spatial_index=False))
    )


class CensusDemographics(SQLModel, table=True):
    __tablename__ = "census_demographics"

    id: Optional[int] = Field(default=None, primary_key=True)
    tract_id: str = Field(foreign_key="census_tracts.tract_id", unique=True)

    population: Optional[int]
    population_density: Optional[float]
    count_age_15_64: Optional[int]
    household_count: Optional[int]
    median_household_income: Optional[float]
    education_base_pop_25_plus: Optional[int]
    count_postsecondary_edu_plus: Optional[int]

    # Derived Columns
    pct_working_age: Optional[float] = None
    pct_highly_educated: Optional[float] = None
    avg_household_size: Optional[float] = None

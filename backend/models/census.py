from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from typing import Optional
from geoalchemy2 import Geometry


class CensusTract(SQLModel, table=True):
    __tablename__ = "census_tracts"  # pyright: ignore[reportAssignmentType]

    id: Optional[int] = Field(default=None, primary_key=True)
    tract_id: str = Field(unique=True)
    geom: str = Field(
        sa_column=Column(Geometry("MULTIPOLYGON", srid=4326, spatial_index=False))
    )

    # geography of tracts
    country_id: Optional[int] = Field(default=None, foreign_key="countries.id")
    state_id: Optional[int] = Field(default=None, foreign_key="states.id")
    city_id: Optional[int] = Field(default=None, foreign_key="cities.id")
    neighbourhood_id: Optional[int] = Field(default=None, foreign_key="neighbourhoods.id")

class CensusDemographicsBase(SQLModel):
    tract_id: str = Field(foreign_key="census_tracts.tract_id", unique=True)
    population: Optional[int] = None
    population_density: Optional[float] = None
    count_age_15_64: Optional[int] = None
    household_count: Optional[int] = None
    median_household_income: Optional[float] = None
    education_base_pop_25_plus: Optional[int] = None
    count_postsecondary_edu_plus: Optional[int] = None

    # Derived Columns
    pct_working_age: Optional[float] = None
    pct_highly_educated: Optional[float] = None
    avg_household_size: Optional[float] = None

class CensusDemographics(CensusDemographicsBase, table=True):
    __tablename__ = "census_demographics"  # pyright: ignore[reportAssignmentType]
    id: Optional[int] = Field(default=None, primary_key=True)


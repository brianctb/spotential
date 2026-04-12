from typing import Optional
from sqlalchemy import BigInteger
from sqlmodel import Field, SQLModel, Column
from geoalchemy2 import Geometry
from config.business_type import BusinessType, BusinessCategory


class Business(SQLModel, table=True):
    __tablename__ = "business"

    id: Optional[int] = Field(default=None, primary_key=True)
    osm_id: int = Field(unique=True, sa_type=BigInteger)
    tract_id: Optional[str] = Field(foreign_key="census_tracts.tract_id", index=True)

    name: str
    type: BusinessType = Field(index=True)
    category: BusinessCategory = Field(index=True)

    website: Optional[str] = None
    opening_hours: Optional[str] = None

    lng: float
    lat: float
    geom: Optional[str] = Field(sa_column=Column(Geometry("POINT", srid=4326, spatial_index=False)))

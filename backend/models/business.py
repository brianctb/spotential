from typing import Optional
from sqlmodel import Field, SQLModel, Column
from geoalchemy2 import Geometry
from config.business_type import BusinessType, BusinessCategory
from models.census import CensusTract


class Business(SQLModel, table=True):
    __tablename__ = "business"

    id: Optional[int] = Field(default=None, primary_key=True)
    osm_id: int
    tract_id: Optional[str] = Field(foreign_key=CensusTract.tract_id, index=True)

    name: str
    type: BusinessType = Field(index=True)
    category: BusinessCategory = Field(index=True)

    lat: float
    lng: float

    geom: Optional[str] = Field(
        sa_column=Column(Geometry("POINT", srid=4326))
    )
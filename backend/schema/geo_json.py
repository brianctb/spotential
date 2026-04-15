from pydantic import BaseModel
from typing import Any, List, Literal
from models.census import CensusDemographicsBase
from models.business import BusinessBase

class Geometry(BaseModel):
    type: Literal["Point", "LineString", "Polygon", "MultiPolygon"]
    coordinates: Any

class FeatureBase(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: Geometry

class CensusFeature(FeatureBase):
    properties: CensusDemographicsBase

class BusinessFeature(FeatureBase):
    properties: BusinessBase

class BusinessCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[BusinessFeature]
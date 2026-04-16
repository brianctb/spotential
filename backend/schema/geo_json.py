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

    @staticmethod
    def to_feature(props: CensusDemographicsBase, geom: dict):
        return CensusFeature(
            properties=props,
            geometry=Geometry(**geom),
        )

class BusinessFeature(FeatureBase):
    properties: BusinessBase

    @staticmethod
    def to_feature(props: BusinessBase, geom: dict):
        return BusinessFeature(
            properties=props,
            geometry=Geometry(**geom),
        )

class BusinessCollection(BaseModel):
    type: Literal["FeatureCollection"] = "FeatureCollection"
    features: List[BusinessFeature]
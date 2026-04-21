from pydantic import BaseModel
from typing import Any, List, Literal
from models.business import BusinessBase

class Geometry(BaseModel):
    type: Literal["Point", "LineString", "Polygon", "MultiPolygon"]
    coordinates: Any

class FeatureBase(BaseModel):
    type: Literal["Feature"] = "Feature"
    geometry: Geometry

class TractFeatureProps(BaseModel):
    tract_id: str
    score: float

class TractFeature(FeatureBase):
    properties: TractFeatureProps

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
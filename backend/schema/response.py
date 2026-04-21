from pydantic import BaseModel
from schema.business import Business
from models.census import CensusDemographicsBase
from typing import Any
from schema.geo_json import BusinessCollection, TractFeature

class BusinessTypeResponse(BaseModel):
    key: str
    label: str

class BusinessCategoryResponse(BaseModel):
    key: str
    label: str
    business: list[BusinessTypeResponse]

class BusinessesResponse(BaseModel):
    businesses: list[Business]
    count: int

class CensusInfoResponse(BaseModel):
    tract_id: str
    demographics: CensusDemographicsBase
    geometry: dict[str, Any]

class TractStats(BaseModel):
    tract_id: str
    score: float
    business_in_tract: int
    predicted_count: float
    actual_count: int

class AnalysisResponse(BaseModel):
    tract: TractFeature
    businesses: BusinessCollection
    tract_stats: TractStats
    demographics: CensusDemographicsBase
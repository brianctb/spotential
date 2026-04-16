from pydantic import BaseModel
from models.business import BusinessBase
from schema.business import Business
from models.census import CensusDemographicsBase
from typing import Any
from schema.geo_json import BusinessCollection, CensusFeature


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

class AnalysisResponse(BaseModel):
    census: CensusFeature
    businesses: BusinessCollection
    score: float
    businesses_in_tract: int
    predicted_count: float
    actual_count: int
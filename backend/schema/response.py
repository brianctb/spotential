from pydantic import BaseModel

from models.business import BusinessBase
from schema.business import Business
from models.census import CensusDemographicsBase
from typing import Any


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

class BusinessInfoResponse(BaseModel):
    details: BusinessBase
    geometry: dict[str, Any]

class AnalysisResponse(BaseModel):
    census: CensusInfoResponse
    businesses: list[BusinessInfoResponse]

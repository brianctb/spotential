from pydantic import BaseModel
from schema.business import Business


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

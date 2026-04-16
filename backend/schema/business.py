from pydantic import BaseModel
from config.business_type import BusinessCategory, BusinessType
from models.business import BusinessBase

class Business(BaseModel):
    id: int
    lat: float
    lng: float
    name: str
    business_type: BusinessType
    business_category: BusinessCategory

class BusinessWithGeometry(BaseModel):
    business: BusinessBase
    geometry: dict
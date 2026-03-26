from pydantic import BaseModel


class BusinessTypeResponse(BaseModel):
    key: str
    label: str

class BusinessCategoryResponse(BaseModel):
    key: str
    label: str
    business: list[BusinessTypeResponse]

from sqlmodel import SQLModel, Field
from typing import Optional
from config.business_type import BusinessType, BusinessCategory
from sqlalchemy import Column, String

class ModelPrediction(SQLModel, table=True):
    __tablename__ = "model_predictions"  # pyright: ignore[reportAssignmentType]
    tract_id: str = Field(
        foreign_key="census_tracts.tract_id",
        primary_key=True,
    )
    business_type: BusinessType = Field(
        sa_column=Column(String, primary_key=True)
    )
    business_category: BusinessCategory = Field(
        sa_column=Column(String)
    )
    total_business_count: Optional[int] = None
    actual_count: Optional[int] = None
    predicted_count: Optional[float] = None
    prediction_score: Optional[float] = None
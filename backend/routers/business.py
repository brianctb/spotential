from fastapi import APIRouter, Depends
from config.business_type import BUSINESS_CONFIGS, BusinessType
from schema.response import BusinessCategoryResponse, BusinessTypeResponse
from config.business_type import BusinessCategory
from service.BusinessService import BusinessService
from dependencies import get_business_service
from typing import Optional

router = APIRouter(prefix="/business", tags=["business"])


@router.get("/menu", response_model=list[BusinessCategoryResponse])
async def get_menu():
    grouped: dict[BusinessCategory, list[BusinessTypeResponse]] = {}

    for key, config in BUSINESS_CONFIGS.items():
        if config.category not in grouped:
            grouped[config.category] = []
        grouped[config.category].append(
            BusinessTypeResponse(key=key, label=config.label)
        )

    categories = [
        BusinessCategoryResponse(
            key=category,
            label=category.label,
            business=types
        )
        for category, types in grouped.items()
    ]

    return categories


@router.get("/tract/{tract_id}")
async def get_business_from_tract(
        tract_id: str,
        business_type: Optional[BusinessType] = None,
        service: BusinessService = Depends(get_business_service),
):
    return service.get_business_from_tract(tract_id, business_type)

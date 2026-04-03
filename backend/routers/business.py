from fastapi import APIRouter
from config.business_type import BUSINESS_CONFIGS
from schema.response import BusinessCategoryResponse, BusinessTypeResponse
from config.business_type import BusinessCategory

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

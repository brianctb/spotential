from fastapi import APIRouter, HTTPException
import httpx
from config.business_type import BUSINESS_CONFIGS, BusinessType
from schema.business import BusinessesResponse, Business
from service.osm import fetch_businesses

router = APIRouter(prefix="/locations", tags=["locations"])

OVERPASS_URL = "https://overpass.kumi.systems/api/interpreter"


@router.get("/businesses", response_model=BusinessesResponse)
async def get_businesses(
        business_type: BusinessType,
        lat: float,
        lng: float,
        radius: int = 2000,
):
    businesses = await fetch_businesses(business_type, lat, lng, radius)
    return BusinessesResponse(businesses=businesses, count=len(businesses))

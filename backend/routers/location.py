from fastapi import APIRouter, Depends
from config.business_type import BusinessType
from schema.response import BusinessesResponse
from service.OSMService import OSMService
from dependencies import get_osm_service

router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("/businesses", response_model=BusinessesResponse)
async def get_businesses(
        business_type: BusinessType,
        lat: float,
        lng: float,
        radius: int = 2000,
        service: OSMService = Depends(get_osm_service),
):
    businesses = await service.fetch_businesses(business_type, lat, lng, radius)
    return BusinessesResponse(businesses=businesses, count=len(businesses))

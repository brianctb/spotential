from fastapi import APIRouter, Depends, HTTPException
from config.business_type import BusinessType
from schema.response import BusinessesResponse, AnalysisResponse
from service.OSMService import OSMService
from service.AnalysisService import AnalysisService
from dependencies import get_osm_service, get_analysis_service

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

@router.get("/analysis", response_model=AnalysisResponse)
async def get_analysis(
        lng: float,
        lat: float,
        business_type: BusinessType,
        service: AnalysisService = Depends(get_analysis_service),
):
    try:
        return service.analyze_business(lng, lat, business_type)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

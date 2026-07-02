from fastapi import APIRouter, Depends, HTTPException
from config.business_type import BusinessType
from schema.response import AnalysisResponse
from service.AnalysisService import AnalysisService
from dependencies import get_analysis_service

router = APIRouter(prefix="/locations", tags=["locations"])


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

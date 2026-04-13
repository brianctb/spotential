from fastapi import APIRouter, Depends, HTTPException
from schema.response import CensusInfoResponse
from service.CensusService import CensusService
from dependencies import get_census_service

router = APIRouter(prefix="/census", tags=["census"])


@router.get("/search")
def find_tract(
        lng: float,
        lat: float,
        service: CensusService = Depends(get_census_service),
):
    tract_id = service.find_tract_id_by_coords(lng, lat)
    if not tract_id:
        raise HTTPException(status_code=404, detail="Location not found in census data")
    return {"tract_id": tract_id}


@router.get("/{tract_id}", response_model=CensusInfoResponse)
def get_tract_details(
        tract_id: str,
        service: CensusService = Depends(get_census_service),
):
    details = service.get_tract_details(tract_id)
    if not details:
        raise HTTPException(status_code=404, detail="Tract not found")
    return details

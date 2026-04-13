from service.CensusService import CensusService
from service.BusinessService import BusinessService
from config.business_type import BusinessType
from schema.response import AnalysisResponse

class AnalysisService:
    def __init__(
        self,
        business_service: BusinessService,
        census_service: CensusService
    ):
        self.business_service = business_service
        self.census_service = census_service

    def analyze_business(
            self,
            lng: float,
            lat: float,
            business_type: BusinessType,
    ) -> AnalysisResponse | None:
        tract_id = self.census_service.find_tract_id_by_coords(lng, lat)
        if not tract_id:
            raise ValueError(f"Location ({lng}, {lat}) does not belong to any census tract")

        census = self.census_service.get_tract_details(tract_id)
        if not census:
            raise ValueError(f"Tract ({tract_id}) does not have any census data")

        businesses = self.business_service.get_business_from_tract(tract_id, business_type)
        return AnalysisResponse(
            census=census,
            businesses=businesses,
        )
from service.CensusService import CensusService
from service.BusinessService import BusinessService
from service.PredictionService import PredictionService
from config.business_type import BusinessType
from schema.response import AnalysisResponse, TractStats
from schema.geo_json import BusinessFeature, BusinessCollection, TractFeature, TractFeatureProps, Geometry

class AnalysisService:
    def __init__(
        self,
        business_service: BusinessService,
        census_service: CensusService,
        prediction_service: PredictionService,
    ):
        self.business_service = business_service
        self.census_service = census_service
        self.prediction_service = prediction_service

    def analyze_business(
            self,
            lng: float,
            lat: float,
            business_type: BusinessType,
    ) -> AnalysisResponse:
        tract_id = self.census_service.find_tract_id_by_coords(lng, lat)
        if not tract_id:
            raise ValueError(f"Location ({lng}, {lat}) does not belong to any census tract")

        cached = self.prediction_service.get_cached_prediction(tract_id, business_type)
        if not cached:
            raise ValueError(
                "Analysis for this location and business type is not available"
            )

        census = self.census_service.get_tract_details(tract_id)
        if not census:
            raise ValueError(f"Tract ({tract_id}) does not have any census data")
        census_demo, census_geom = census

        bizs_with_geom = self.business_service.get_business_from_tract(tract_id, business_type)
        business_features= [
            BusinessFeature.to_feature(b.business, b.geometry) for b in bizs_with_geom
        ]

        return AnalysisResponse(
            # Converting census and businesses data to GeoJson
            tract=TractFeature(
                properties=TractFeatureProps(tract_id=tract_id, score=cached.prediction_score),
                geometry=Geometry(**census_geom)
            ),
            businesses=BusinessCollection(features=business_features),
            tract_stats=TractStats(
                tract_id=tract_id,
                score=cached.prediction_score,
                business_in_tract=cached.total_business_count,
                predicted_count=cached.predicted_count,
                actual_count=cached.actual_count,
            ),
            demographics=census_demo
        )

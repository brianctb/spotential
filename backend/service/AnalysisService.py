from schema.geo_json import CensusFeature
from service.CensusService import CensusService
from service.BusinessService import BusinessService
from config.business_type import BusinessType
from schema.response import AnalysisResponse
from xgboost import XGBRegressor
from schema.ml_model import ModelFeatures
from config.business_type import BUSINESS_CONFIGS
import math
from schema.geo_json import BusinessFeature, BusinessCollection
import pandas as pd

class AnalysisService:
    def __init__(
        self,
        business_service: BusinessService,
        census_service: CensusService,
        model: XGBRegressor
    ):
        self.business_service = business_service
        self.census_service = census_service
        self.model = model

    def predict_business_count(self, features: ModelFeatures) -> float:
        x = features.model_dump()
        # this is to ensure the right ordering of features input into the model
        x_matrix = pd.DataFrame(
            [[x[f] for f in ModelFeatures.feature_columns()]],
            columns=ModelFeatures.feature_columns()
        )
        pred = self.model.predict(x_matrix)[0]
        return max(0.0, float(pred))

    @staticmethod
    def score_tract(actual: int, predicted: float) -> float:
        # sigmoid function for scoring
        ratio = math.log1p(predicted) - math.log1p(actual)
        ratio = ratio / (abs(ratio) + 1)

        k = 5
        return 100 / (1 + math.exp(-k * ratio))

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
        census_demo, census_geom = census

        bizs_with_geom = self.business_service.get_business_from_tract(tract_id, business_type)
        business_features= [
            BusinessFeature.to_feature(b.business, b.geometry) for b in bizs_with_geom
        ]

        total_biz_count = self.business_service.get_total_biz_count_in_tract(tract_id)
        actual_count = len(bizs_with_geom)
        model_features = ModelFeatures(
            business_type_id=BUSINESS_CONFIGS[business_type].id,
            other_business_count=total_biz_count-actual_count,
            **census_demo.model_dump(),
        )
        prediction = self.predict_business_count(model_features)
        score = self.score_tract(actual_count, prediction)


        return AnalysisResponse(
            # Converting census and businesses data to GeoJson
            census=CensusFeature.to_feature(census_demo, census_geom),
            businesses=BusinessCollection(features=business_features),
            businesses_in_tract=total_biz_count,
            actual_count=actual_count,
            predicted_count=prediction,
            score=score,
        )
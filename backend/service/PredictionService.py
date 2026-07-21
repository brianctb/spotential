import math
from typing import Literal, Optional
import pandas as pd
from sqlmodel import Session, col, delete, select
from xgboost import XGBRegressor
from config.business_type import BusinessType, BUSINESS_CONFIGS
from schema.ml_model import ModelFeatures
from service.BusinessService import BusinessService
from service.CensusService import CensusService
from models.model_outputs import ModelPrediction
from models.census import CensusTract
from models.geography import City, State, Country


class PredictionService:
    def __init__(
        self,
        session: Session,
        model: XGBRegressor,
        business_service: BusinessService,
        census_service: CensusService,
    ):
        self.session = session
        self.model = model
        self.business_service = business_service
        self.census_service = census_service

    def predict_business_count(self, features: ModelFeatures) -> float:
        x = features.model_dump()
        # this is to ensure the right ordering of features input into the model
        x_matrix = pd.DataFrame(
            [[x[f] for f in ModelFeatures.feature_columns()]],
            columns=pd.Index(ModelFeatures.feature_columns())
        )
        pred = self.model.predict(x_matrix)[0]
        return max(0.0, float(pred))

    def predict_batch(self, features_list: list[ModelFeatures]) -> list[float]:
        """Batch prediction — used by both single and batch precompute paths"""
        x = pd.DataFrame(
            [f.model_dump() for f in features_list],
            columns=pd.Index(ModelFeatures.feature_columns())
        )
        raw_predictions = self.model.predict(x)
        return [max(0.0, float(p)) for p in raw_predictions]

    @staticmethod
    def score_tract(actual: int, predicted: float) -> float:
        # sigmoid function for scoring
        ratio = math.log1p(predicted) - math.log1p(actual)
        k = 5
        return 100 / (1 + math.exp(-k * ratio))

    def get_cached_prediction(
            self,
            tract_id: str,
            business_type: BusinessType,
    ) -> ModelPrediction | None:
        stmt = select(ModelPrediction).where(
            ModelPrediction.tract_id == tract_id,
            ModelPrediction.business_type == business_type.value,
        )
        return self.session.exec(stmt).first()

    def get_top_tracts(
        self,
        business_type: BusinessType,
        limit: int,
        order: Literal["asc", "desc"] = "desc",
        neighbourhood_ids: Optional[list[int]] = None,
        cities: Optional[list[str]] = None,
        state: Optional[str] = None,
        country: Optional[str] = None,
    ) -> list[ModelPrediction]:
        capped_limit = max(1, min(limit, 5))
        score_col = col(ModelPrediction.prediction_score)
        stmt = select(ModelPrediction).where(ModelPrediction.business_type == business_type.value)

        # ModelPrediction has no geography FKs of its own — only tract_id — so
        # any geography filter has to join through CensusTract. Only join/filter
        # for fields actually provided; zero fields provided stays identical to
        # the previous unfiltered query.
        if neighbourhood_ids or cities or state or country:
            stmt = stmt.join(CensusTract, col(ModelPrediction.tract_id) == col(CensusTract.tract_id))
            if neighbourhood_ids:
                stmt = stmt.where(col(CensusTract.neighbourhood_id).in_(neighbourhood_ids))
            if cities:
                stmt = stmt.join(City, col(CensusTract.city_id) == col(City.id)).where(
                    col(City.name).in_(cities)
                )
            if state:
                stmt = stmt.join(State, col(CensusTract.state_id) == col(State.id)).where(
                    State.name == state
                )
            if country:
                stmt = stmt.join(Country, col(CensusTract.country_id) == col(Country.id)).where(
                    Country.name == country
                )

        stmt = stmt.order_by(score_col.desc() if order == "desc" else score_col.asc()).limit(capped_limit)
        return list(self.session.exec(stmt).all())

    def precompute_all_predictions(self) -> list[ModelPrediction]:
        """
        Builds features and runs predictions for every tract x business type.
        Returns ModelPrediction objects ready to insert into the database.
        """
        tracts = self.census_service.get_all_tracts()

        feature_rows = []
        prediction_meta = []

        print(f"Building features for {len(tracts)} tracts x {len(BusinessType)} types...")

        for tract_id, census_demo in tracts:
            total_biz_count = self.business_service.get_total_biz_count_in_tract(tract_id)

            for business_type in BusinessType:
                bizs = self.business_service.get_business_from_tract(tract_id, business_type)
                actual_count = len(bizs)

                census_dict = census_demo.model_dump()
                if any(v is None for v in census_dict.values()):
                    continue

                features = ModelFeatures(
                    business_type_id=BUSINESS_CONFIGS[business_type].id,
                    other_business_count=total_biz_count - actual_count,
                    **census_dict,
                )
                feature_rows.append(features)
                prediction_meta.append((tract_id, business_type, total_biz_count, actual_count))

        if not feature_rows:
            return []

        print(f"Running batch prediction on {len(feature_rows)} rows...")
        predictions = self.predict_batch(feature_rows)

        prediction_objects = []
        for (tract_id, business_type, total_biz_count, actual_count), predicted_count in zip(
            prediction_meta, predictions
        ):
            prediction_objects.append(
                ModelPrediction(
                    tract_id=tract_id,
                    business_type=business_type,
                    business_category=BUSINESS_CONFIGS[business_type].category,
                    total_business_count=total_biz_count,
                    actual_count=actual_count,
                    predicted_count=predicted_count,
                    prediction_score=self.score_tract(actual_count, predicted_count),
                )
            )

        return prediction_objects

    def save_predictions(self, predictions: list[ModelPrediction]) -> None:
        """Truncate-and-reload the model_predictions table."""
        self.session.exec(delete(ModelPrediction))
        self.session.add_all(predictions)
        self.session.commit()

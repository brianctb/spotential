from config.business_type import BusinessType
from models.business import Business, BusinessBase
from schema.geo_json import Geometry, BusinessFeature, BusinessCollection
from sqlmodel import Session, func, select
from typing import Optional
import json


class BusinessService:
    def __init__(self, session: Session):
        self.session: Session = session

    def get_business_from_tract(
            self,
            tract_id: str,
            business_type: Optional[BusinessType] = None
    ) -> BusinessCollection:

        stmt = (
            select(
                Business,
                func.ST_AsGeoJSON(Business.geom).label("geojson")
            )
            .where(Business.tract_id == tract_id)
        )

        if business_type:
            stmt = stmt.where(Business.type == business_type)

        results = self.session.exec(stmt).all()

        features = []

        for business_obj, geojson_str in results:
            props = BusinessBase.model_validate(business_obj)
            geom = json.loads(geojson_str)

            features.append(
                BusinessFeature(
                    properties=props,
                    geometry=Geometry(**geom)
                )
            )

        return BusinessCollection(features=features)



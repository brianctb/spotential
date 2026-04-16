from config.business_type import BusinessType
from models.business import Business, BusinessBase
from sqlmodel import Session, func, select
from typing import Optional
from schema.business import BusinessWithGeometry
import json


class BusinessService:
    def __init__(self, session: Session):
        self.session: Session = session

    def get_business_from_tract(
            self,
            tract_id: str,
            business_type: Optional[BusinessType] = None
    ) -> list[BusinessWithGeometry]:

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

        businesses = []

        for business_obj, geojson_str in results:
            business = BusinessBase.model_validate(business_obj)
            geom = json.loads(geojson_str)

            businesses.append(
                BusinessWithGeometry(
                    business = business,
                    geometry = geom
                )
            )

        return businesses

    def get_total_biz_count_in_tract(self, tract_id: str) -> int:
        stmt = select(func.count(Business.id)).where(
            Business.tract_id == tract_id
        )

        count = self.session.exec(stmt).one()
        return count
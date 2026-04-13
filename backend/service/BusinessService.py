from config.business_type import BusinessType
from models.business import Business
from sqlmodel import Session, func, select
from typing import Sequence, Optional
import json


class BusinessService:
    def __init__(self, session: Session):
        self.session: Session = session

    def get_business_from_tract(
            self,
            tract_id: str,
            business_type: Optional[BusinessType] = None
    ):
        # Select the WHOLE model plus the function
        stmt = (
            select(
                Business,
                func.ST_AsGeoJSON(Business.geom).label("geojson"))
            .where(Business.tract_id == tract_id)
        )
        
        if business_type:
            stmt = stmt.where(Business.type == business_type)

        results = self.session.exec(stmt).all()

        output = []
        for business_obj, geojson_str in results:
            data = {
                "id": business_obj.id,
                "name": business_obj.name,
                "geometry": json.loads(geojson_str)
            }
            output.append(data)
        return output

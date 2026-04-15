from models.census import CensusTract, CensusDemographics
from sqlmodel import Session, func, select
from schema.response import CensusDemographicsBase
from schema.geo_json import CensusFeature
import json


class CensusService:
    def __init__(self, session: Session):
        self.session = session

    def find_tract_id_by_coords(self, lng: float, lat: float) -> str | None:
        point = func.ST_SetSRID(func.ST_MakePoint(lng, lat), 4326)

        statement = select(CensusTract.tract_id).where(
            func.ST_Contains(CensusTract.geom, point)
        )
        return self.session.scalar(statement)

    def get_tract_details(self, tract_id: str) -> CensusFeature | None:
        stmt_tract = select(
            CensusTract,
            func.ST_AsGeoJSON(CensusTract.geom).label("geojson")
        ).where(CensusTract.tract_id == tract_id)

        result = self.session.exec(stmt_tract).first()
        if not result:
            return None

        tract, geojson_str = result

        stmt_demo = select(CensusDemographics).where(
            CensusDemographics.tract_id == tract_id
        )
        demo = self.session.exec(stmt_demo).first()
        demo = CensusDemographicsBase.model_validate(demo)

        return CensusFeature(
            geometry=json.loads(geojson_str),
            properties=demo
        )


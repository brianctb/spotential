from typing import Optional
from models.census import CensusTract, CensusDemographics
from models.geography import Neighbourhood, City, State, Country
from sqlmodel import Session, col, func, select
from schema.response import CensusDemographicsBase
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

    def get_tract_details(self, tract_id: str) -> tuple[CensusDemographicsBase, dict] | None:
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

        return demo, json.loads(geojson_str)

    def get_tract_centroids(self, tract_ids: list[str]) -> dict[str, tuple[float, float]]:
        stmt = select(
            CensusTract.tract_id,
            func.ST_X(func.ST_Centroid(CensusTract.geom)),
            func.ST_Y(func.ST_Centroid(CensusTract.geom)),
        ).where(col(CensusTract.tract_id).in_(tract_ids))

        return {
            tract_id: (lng, lat)
            for tract_id, lng, lat in self.session.exec(stmt).all()
        }

    def get_tract_geography(
        self, tract_ids: list[str]
    ) -> dict[str, tuple[Optional[str], Optional[str], Optional[str], Optional[str]]]:
        # isouter=True on every join: country_id/state_id/city_id/neighbourhood_id
        # are all nullable on CensusTract — a tract can legitimately be missing
        # a neighbourhood assignment (reverse-geocoding coverage isn't 100%).
        stmt = (
            select(  # pyright: ignore[reportCallIssue]
                CensusTract.tract_id, Neighbourhood.name, City.name, State.name, Country.name
            )
            .join(Neighbourhood, col(CensusTract.neighbourhood_id) == col(Neighbourhood.id), isouter=True)
            .join(City, col(CensusTract.city_id) == col(City.id), isouter=True)
            .join(State, col(CensusTract.state_id) == col(State.id), isouter=True)
            .join(Country, col(CensusTract.country_id) == col(Country.id), isouter=True)
            .where(col(CensusTract.tract_id).in_(tract_ids))
        )
        return {
            tract_id: (neighbourhood, city, state, country)
            for tract_id, neighbourhood, city, state, country in self.session.exec(stmt).all()
        }

    def get_all_tracts(self) -> list[tuple[str, CensusDemographicsBase]]:
        stmt = select(CensusTract.tract_id, CensusDemographics).join(
            CensusDemographics,
            col(CensusTract.tract_id) == col(CensusDemographics.tract_id)
        )

        results = self.session.exec(stmt).all()

        return [
            (tract_id, CensusDemographicsBase.model_validate(demo))
            for tract_id, demo in results
        ]

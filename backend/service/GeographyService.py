from typing import Optional, cast
from sqlmodel import Session, col, func, select
from models.geography import City, Neighbourhood
from schema.geography import GeographyResolution


class GeographyService:
    def __init__(self, session: Session):
        self.session = session

    def resolve_neighbourhoods(
        self, queries: list[str], cities: Optional[list[str]] = None
    ) -> GeographyResolution:
        resolved_ids: list[int] = []
        for raw_query in queries:
            query = raw_query.strip()
            matches = self._match(query, cities)
            if not matches:
                return GeographyResolution(status="not_found", query=raw_query)
            if len(matches) > 1:
                return GeographyResolution(
                    status="ambiguous",
                    query=raw_query,
                    candidates=[f"{name} ({city_name})" for _, name, city_name in matches],
                )
            # Neighbourhood.id is Optional[int] at the type level (nullable PK
            # column), but every persisted row has one — this cast reflects
            # that runtime guarantee.
            resolved_ids.append(cast(int, matches[0][0]))
        deduped_ids = list(dict.fromkeys(resolved_ids))
        return GeographyResolution(status="found", neighbourhood_ids=deduped_ids)

    def _match(self, query: str, cities: Optional[list[str]]) -> list[tuple[Optional[int], str, str]]:
        exact = self.session.exec(self._build_query(query, cities, ilike=False)).all()
        if exact:
            return [(id_, name, city_name) for id_, name, city_name in exact]
        ilike_matches = self.session.exec(self._build_query(query, cities, ilike=True)).all()
        return [(id_, name, city_name) for id_, name, city_name in ilike_matches]

    @staticmethod
    def _build_query(query: str, cities: Optional[list[str]], ilike: bool):
        # Always join City (not only when `cities` is given) so an ambiguous
        # match can report which city each candidate belongs to — a bare
        # neighbourhood name can't disambiguate duplicates like two "Downtown"s.
        stmt = select(Neighbourhood.id, Neighbourhood.name, City.name).join(
            City, col(Neighbourhood.city_id) == col(City.id)
        )
        if cities:
            stmt = stmt.where(col(City.name).in_(cities))
        name_col = col(Neighbourhood.name)
        if ilike:
            stmt = stmt.where(name_col.ilike(f"%{query}%"))
        else:
            stmt = stmt.where(func.lower(name_col) == query.lower())
        return stmt

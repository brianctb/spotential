from enum import Enum
from pydantic import BaseModel


class OSMTags(str, Enum):
    LEISURE = "leisure"
    AMENITY = "amenity"
    SHOP = "shop"
    SPORT = 'sport'

    def __str__(self) -> str:
        return str(self.value)


class OSMQuery(BaseModel):
    filters: list[str]

    def to_nwr(self, lat, lng, radius) -> str:
        queries = "\n".join(
            f'nwr{f}(around:{radius},{lat},{lng});'
            for f in self.filters
        )
        return f"""
    [out:json][timeout:25];
    (
    {queries}
    );
    out center;
    """

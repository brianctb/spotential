from enum import Enum
from pydantic import BaseModel


class OSMTags(str, Enum):
    LEISURE = "leisure"
    AMENITY = "amenity"
    SHOP = "shop"


class OSMFilter(BaseModel):
    tag: OSMTags
    value: str

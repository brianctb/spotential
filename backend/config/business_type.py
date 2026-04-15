from enum import Enum
from pydantic import BaseModel
from config.osm import OSMTags, OSMQuery

class BusinessCategory(str, Enum):
    FITNESS = "fitness"
    FOOD = "food & drink"
    RETAIL = "retail"
    SERVICE = "service"

    @property
    def label(self) -> str:
        return CATEGORY_LABELS[self]


CATEGORY_LABELS = {
    BusinessCategory.FITNESS: "Fitness",
    BusinessCategory.FOOD: "Food & Drink",
    BusinessCategory.RETAIL: "Retail",
    BusinessCategory.SERVICE: "Service",
}


class BusinessType(str, Enum):
    # Fitness
    FITNESS_CENTRE = "fitness_centre"  # Often mapped to the same OSM tag

    # Food & Drink
    RESTAURANT = "restaurant"
    CAFE = "cafe"
    FAST_FOOD = "fast_food"
    BAR = "bar"

    # Retail
    SUPERMARKET = "supermarket"
    CONVENIENCE = "convenience"
    BAKERY = "bakery"

    # Services
    BANK = "bank"
    CLINIC = "clinic"
    DENTIST = "dentist"


class BusinessConfig(BaseModel):
    id: int
    label: str
    category: BusinessCategory
    osm_query: OSMQuery

BUSINESS_CONFIGS: dict[BusinessType, BusinessConfig] = {
    BusinessType.FITNESS_CENTRE: BusinessConfig(
        id=1,
        label="Gym",
        category=BusinessCategory.FITNESS,
        osm_query=OSMQuery(
            filters=[f'["{OSMTags.LEISURE}"="fitness_centre"]["{OSMTags.SPORT}"~"fitness"]']
        ),
    ),
    BusinessType.RESTAURANT: BusinessConfig(
        id=2,
        label="Restaurant",
        category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="restaurant"]'])
    ),
    BusinessType.CAFE: BusinessConfig(
        id=3,
        label="Cafe",
        category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="cafe"]'])
    ),
    BusinessType.FAST_FOOD: BusinessConfig(
        id=4,
        label="Fast Food",
        category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="fast_food"]'])
    ),
    BusinessType.BAR: BusinessConfig(
        id=5,
        label="Bar",
        category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="bar"]'])
    ),
    BusinessType.SUPERMARKET: BusinessConfig(
        id=6,
        label="Supermarket",
        category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="supermarket"]'])
    ),
    BusinessType.CONVENIENCE: BusinessConfig(
        id=7,
        label="Convenience Store",
        category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="convenience"]'])
    ),
    BusinessType.BAKERY: BusinessConfig(
        id=8,
        label="Bakery",
        category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="bakery"]'])
    ),
    BusinessType.BANK: BusinessConfig(
        id=9,
        label="Bank",
        category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="bank"]'])
    ),
    BusinessType.CLINIC: BusinessConfig(
        id=10,
        label="Clinic",
        category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="clinic"]'])
    ),
    BusinessType.DENTIST: BusinessConfig(
        id=11,
        label="Dentist",
        category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="dentist"]'])
    ),
}

from enum import Enum
from pydantic import BaseModel
from config.osm import OSMTags, OSMQuery


class BusinessCategory(str, Enum):
    FITNESS = "fitness"
    FOOD = "food & drink"
    RETAIL = "retail"
    SERVICE = "service"


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
    label: str
    category: BusinessCategory
    osm_query: OSMQuery


BUSINESS_CONFIGS: dict[BusinessType, BusinessConfig] = {
    BusinessType.FITNESS_CENTRE: BusinessConfig(
        label="Gym",
        category=BusinessCategory.FITNESS,
        osm_query=OSMQuery(
            filters=[f'["{OSMTags.LEISURE}"="fitness_centre"]["{OSMTags.SPORT}"~"fitness"]']
        ),
    ),
    BusinessType.RESTAURANT: BusinessConfig(
        label="Restaurant", category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="restaurant"]'])
    ),
    BusinessType.CAFE: BusinessConfig(
        label="Cafe", category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="cafe"]'])
    ),
    BusinessType.FAST_FOOD: BusinessConfig(
        label="Fast Food", category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="fast_food"]'])
    ),
    BusinessType.BAR: BusinessConfig(
        label="Bar", category=BusinessCategory.FOOD,
        osm_query=OSMQuery(filters=['["amenity"="bar"]'])
    ),
    BusinessType.SUPERMARKET: BusinessConfig(
        label="Supermarket", category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="supermarket"]'])
    ),
    BusinessType.CONVENIENCE: BusinessConfig(
        label="Convenience Store", category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="convenience"]'])
    ),
    BusinessType.BAKERY: BusinessConfig(
        label="Bakery", category=BusinessCategory.RETAIL,
        osm_query=OSMQuery(filters=['["shop"="bakery"]'])
    ),
    BusinessType.BANK: BusinessConfig(
        label="Bank", category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="bank"]'])
    ),
    BusinessType.CLINIC: BusinessConfig(
        label="Clinic", category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="clinic"]'])
    ),
    BusinessType.DENTIST: BusinessConfig(
        label="Dentist", category=BusinessCategory.SERVICE,
        osm_query=OSMQuery(filters=['["amenity"="dentist"]'])
    ),
}

from enum import Enum
from pydantic import BaseModel
from config.osm import OSMFilter, OSMTags


class BusinessCategory(str, Enum):
    FITNESS = "fitness"
    FOOD = "food"
    RETAIL = "retail"
    SERVICE = "service"


class BusinessType(str, Enum):
    # Fitness
    FITNESS_CENTRE = "fitness_centre"  # Often mapped to the same OSM tag
    ICE_RINK = "ice_rink"

    # Food
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
    osm_filters: list[OSMFilter]


BUSINESS_CONFIGS: dict[BusinessType, BusinessConfig] = {
    # Fitness
    BusinessType.FITNESS_CENTRE: BusinessConfig(
        label="Gym",
        category=BusinessCategory.FITNESS,
        osm_filters=[
            OSMFilter(tag=OSMTags.LEISURE, value="fitness_centre"),
            OSMFilter(tag=OSMTags.AMENITY, value="gym"),
        ],
    ),

    BusinessType.ICE_RINK: BusinessConfig(
        label="Ice Rink",
        category=BusinessCategory.FITNESS,
        osm_filters=[
            OSMFilter(tag=OSMTags.LEISURE, value="ice_rink"),
        ],
    ),

    # Food
    BusinessType.RESTAURANT: BusinessConfig(
        label="Restaurant",
        category=BusinessCategory.FOOD,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="restaurant"),
        ],
    ),

    BusinessType.CAFE: BusinessConfig(
        label="Cafe",
        category=BusinessCategory.FOOD,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="cafe"),
        ],
    ),

    BusinessType.FAST_FOOD: BusinessConfig(
        label="Fast Food",
        category=BusinessCategory.FOOD,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="fast_food"),
        ],
    ),

    BusinessType.BAR: BusinessConfig(
        label="Bar",
        category=BusinessCategory.FOOD,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="bar"),
        ],
    ),

    # Retail
    BusinessType.SUPERMARKET: BusinessConfig(
        label="Supermarket",
        category=BusinessCategory.RETAIL,
        osm_filters=[
            OSMFilter(tag=OSMTags.SHOP, value="supermarket"),
        ],
    ),

    BusinessType.CONVENIENCE: BusinessConfig(
        label="Convenience Store",
        category=BusinessCategory.RETAIL,
        osm_filters=[
            OSMFilter(tag=OSMTags.SHOP, value="convenience"),
        ],
    ),

    BusinessType.BAKERY: BusinessConfig(
        label="Bakery",
        category=BusinessCategory.RETAIL,
        osm_filters=[
            OSMFilter(tag=OSMTags.SHOP, value="bakery"),
        ],
    ),

    # Services
    BusinessType.BANK: BusinessConfig(
        label="Bank",
        category=BusinessCategory.SERVICE,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="bank"),
        ],
    ),

    BusinessType.CLINIC: BusinessConfig(
        label="Clinic",
        category=BusinessCategory.SERVICE,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="clinic"),
        ],
    ),

    BusinessType.DENTIST: BusinessConfig(
        label="Dentist",
        category=BusinessCategory.SERVICE,
        osm_filters=[
            OSMFilter(tag=OSMTags.AMENITY, value="dentist"),
        ],
    ),
}

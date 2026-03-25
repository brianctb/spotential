from enum import Enum
from pydantic import BaseModel
from osm import OSMTags

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
    osm_tag: OSMTags
    osm_value: BusinessType

BUSINESS_CONFIGS: dict[BusinessType, BusinessConfig] = {
    # Fitness
    BusinessType.FITNESS_CENTRE: BusinessConfig(
        label="Gym",
        category=BusinessCategory.FITNESS,
        osm_tag=OSMTags.LEISURE,
        osm_value=BusinessType.FITNESS_CENTRE,
    ),
    BusinessType.ICE_RINK: BusinessConfig(
        label="Ice Rink",
        category=BusinessCategory.FITNESS,
        osm_tag=OSMTags.LEISURE,
        osm_value=BusinessType.ICE_RINK,
    ),

    # Food
    BusinessType.RESTAURANT: BusinessConfig(
        label="Restaurant",
        category=BusinessCategory.FOOD,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.RESTAURANT,
    ),
    BusinessType.CAFE: BusinessConfig(
        label="Cafe",
        category=BusinessCategory.FOOD,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.CAFE,
    ),
    BusinessType.FAST_FOOD: BusinessConfig(
        label="Fast Food",
        category=BusinessCategory.FOOD,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.FAST_FOOD,
    ),
    BusinessType.BAR: BusinessConfig(
        label="Bar",
        category=BusinessCategory.FOOD,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.BAR,
    ),

    # Retail
    BusinessType.SUPERMARKET: BusinessConfig(
        label="Supermarket",
        category=BusinessCategory.RETAIL,
        osm_tag=OSMTags.SHOP,
        osm_value=BusinessType.SUPERMARKET,
    ),
    BusinessType.CONVENIENCE: BusinessConfig(
        label="Convenience Store",
        category=BusinessCategory.RETAIL,
        osm_tag=OSMTags.SHOP,
        osm_value=BusinessType.CONVENIENCE,
    ),
    BusinessType.BAKERY: BusinessConfig(
        label="Bakery",
        category=BusinessCategory.RETAIL,
        osm_tag=OSMTags.SHOP,
        osm_value=BusinessType.BAKERY,
    ),

    # Services
    BusinessType.BANK: BusinessConfig(
        label="Bank",
        category=BusinessCategory.SERVICE,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.BANK,
    ),
    BusinessType.CLINIC: BusinessConfig(
        label="Clinic",
        category=BusinessCategory.SERVICE,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.CLINIC,
    ),
    BusinessType.DENTIST: BusinessConfig(
        label="Dentist",
        category=BusinessCategory.SERVICE,
        osm_tag=OSMTags.AMENITY,
        osm_value=BusinessType.DENTIST,
    ),
}
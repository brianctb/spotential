import httpx
from config.business_type import BUSINESS_CONFIGS, BusinessType
from schema.business import Business
from fastapi import HTTPException


class OSMService:
    def __init__(self, client: httpx.AsyncClient, base_url: str):
        self.client = client
        self.base_url = base_url

    @staticmethod
    def _parse_element(element: dict) -> dict | None:
        point_lat = element.get("lat") or element.get("center", {}).get("lat")
        point_lng = element.get("lon") or element.get("center", {}).get("lon")
        osm_id = element.get("id")

        if not point_lat or not point_lng or not osm_id:
            return None

        return {
            "id": osm_id,
            "name": element.get("tags", {}).get("name", "Unknown"),
            "lat": point_lat,
            "lng": point_lng,
        }

    async def fetch_businesses(
            self,
            business_type: BusinessType,
            lat: float,
            lng: float,
            radius: int
    ) -> list[Business]:
        config = BUSINESS_CONFIGS[business_type]
        query = config.osm_query.to_nwr(lat, lng, radius)

        try:
            response = await self.client.post(
                self.base_url,
                data={"data": query},
                timeout=30
            )
            response.raise_for_status()
            data = response.json()

        except httpx.ReadTimeout:
            raise HTTPException(
                status_code=504,
                detail="External API timed out"
            )

        businesses = []
        for element in data.get("elements", []):
            osm_info = self._parse_element(element)
            if not osm_info:
                continue

            businesses.append(
                Business(
                    business_type=business_type,
                    business_category=config.category,
                    **osm_info
                )
            )

        return businesses

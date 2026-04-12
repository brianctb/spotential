import httpx
from sqlmodel import Session, create_engine
from sqlalchemy.dialects.postgresql import insert
from models.business import Business
from config.business_type import BUSINESS_CONFIGS, BusinessType
from config.osm import OVERPASS_URL
from dotenv import load_dotenv
import os

load_dotenv()

engine = create_engine(os.getenv("DATABASE_URL"))

VANCOUVER_BOUNDS = (
    (-123.30, 49.10),  # west, south
    (-122.75, 49.38),  # east, north
)


def build_query(filter_str: str, bounds):
    (west, south), (east, north) = bounds
    bbox = f"{south},{west},{north},{east}"

    return f"""
    [out:json][timeout:180];
    (
      nwr{filter_str}({bbox});
    );
    out center tags;
    """


def fetch_osm(query: str):
    with httpx.Client(timeout=200) as client:
        response = client.post(OVERPASS_URL, content=query)
        response.raise_for_status()
        return response.json().get("elements", [])


def to_business(el, b_type: BusinessType):
    tags = el.get("tags", {})

    lat = el.get("lat")
    lon = el.get("lon")

    if lat is None or lon is None:
        return None

    config = BUSINESS_CONFIGS[b_type]

    geom_wkt = f"POINT({lon} {lat})"

    return Business(
        osm_id=el["id"],
        name=tags.get("name") or config.label,
        type=b_type,
        category=config.category,
        lat=lat,
        lng=lon,
        geom=geom_wkt,
        website=tags.get("website"),
        opening_hours=tags.get("opening_hours"),
    )


def insert_business_batch(session, businesses: list[Business]):
    if not businesses:
        return

    data = [
        b.model_dump(exclude_unset=True)
        for b in businesses
    ]

    stmt = insert(Business).values(data)

    stmt = stmt.on_conflict_do_nothing(
        index_elements=["osm_id"]
    )

    session.execute(stmt)


def ingest():
    with Session(engine) as session:

        for b_type, config in BUSINESS_CONFIGS.items():
            print(f"Fetching {b_type.value}")

            batch = []

            for filter_str in config.osm_query.filters:
                query = build_query(filter_str, VANCOUVER_BOUNDS)
                elements = fetch_osm(query)

                for el in elements:
                    business = to_business(el, b_type)
                    if business:
                        batch.append(business)

            if batch:
                insert_business_batch(session, batch)
                session.commit()

            print(f"Saved {len(batch)} {b_type.value}")


if __name__ == "__main__":
    ingest()

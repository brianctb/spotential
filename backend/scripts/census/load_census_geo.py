import httpx
import time
from sqlmodel import Session, select, func, col
from models.census import CensusTract
from models.geography import Country, State, City, Neighbourhood
from typing import Optional
from db import engine

def reverse_geocode(lat: float, lng: float) -> dict:
    with httpx.Client(timeout=30) as client:
        response = client.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
            },
            headers={"User-Agent": "Spotential/1.0"}
        )
        response.raise_for_status()
        return response.json()

def extract_address(data: dict) -> dict:
    address = data.get("address", {})
    return {
        "neighbourhood": (
            address.get("neighbourhood") or
            address.get("suburb")
        ),
        "city": (
            address.get("city") or
            address.get("town") or
            address.get("municipality")
        ),
        "state": (
            address.get("state") or
            address.get("province")
        ),
        "country_name": address.get("country", "Canada"),
        "country_code": address.get("country_code", "ca").upper(),
    }

def get_or_create_country(session: Session, name: str, code: str) -> Country:
    existing = session.exec(
        select(Country).where(Country.code == code)
    ).first()
    if existing:
        return existing
    obj = Country(name=name, code=code)
    session.add(obj)
    session.flush()
    return obj

def get_or_create_state(session: Session, name: str) -> State:
    existing = session.exec(
        select(State).where(State.name == name)
    ).first()
    if existing:
        return existing
    obj = State(name=name)
    session.add(obj)
    session.flush()
    return obj

def get_or_create_city(
    session: Session, name: str, state_id: Optional[int]
) -> City:
    existing = session.exec(
        select(City).where(
            City.name == name,
            City.state_id == state_id
        )
    ).first()
    if existing:
        return existing
    obj = City(name=name, state_id=state_id)
    session.add(obj)
    session.flush()
    return obj

def get_or_create_neighbourhood(
    session: Session, name: str, city_id: Optional[int]
) -> Neighbourhood:
    existing = session.exec(
        select(Neighbourhood).where(
            Neighbourhood.name == name,
            Neighbourhood.city_id == city_id
        )
    ).first()
    if existing:
        return existing
    obj = Neighbourhood(name=name, city_id=city_id)
    session.add(obj)
    session.flush()
    return obj

def enrich_tracts():
    with Session(engine) as session:
        stmt = select(
            CensusTract,
            func.ST_Y(func.ST_Centroid(CensusTract.geom)).label("lat"),
            func.ST_X(func.ST_Centroid(CensusTract.geom)).label("lng")
        ).where(
            col(CensusTract.country_id).is_(None),
            col(CensusTract.geom).isnot(None)
        )

        results = session.exec(stmt).all()
        print(f"Enriching {len(results)} tracts...")

        for i, row in enumerate(results):
            try:
                tract: CensusTract = row[0]
                lat: float = row[1]
                lng: float = row[2]
                geo = reverse_geocode(lat, lng)
                addr = extract_address(geo)

                if not addr["country_code"]:
                    print(f"  Skipping {tract.tract_id} — no country returned")
                    continue

                country = get_or_create_country(
                    session, addr["country_name"], addr["country_code"]
                )

                state = None
                if addr["state"]:
                    state = get_or_create_state(session, addr["state"])

                city = None
                if addr["city"]:
                    city = get_or_create_city(
                        session, addr["city"],
                        state.id if state else None
                    )

                neighbourhood = None
                if addr["neighbourhood"]:
                    neighbourhood = get_or_create_neighbourhood(
                        session, addr["neighbourhood"],
                        city.id if city else None
                    )

                tract.country_id = country.id
                tract.state_id = state.id if state else None
                tract.city_id = city.id if city else None
                tract.neighbourhood_id = neighbourhood.id if neighbourhood else None

                session.add(tract)

                if (i + 1) % 10 == 0:
                    session.commit()
                    print(f"  {i+1}/{len(results)} — {tract.tract_id}: "
                          f"{addr['neighbourhood']}, {addr['city']}")

                time.sleep(1.1)

            except Exception as e:
                tract_id = tract.tract_id if 'tract' in locals() and tract else "unknown"
                print(f"  Failed {tract_id}: {e}")
                session.rollback()
                time.sleep(2)
                continue

        session.commit()
        print("Done.")

if __name__ == "__main__":
    enrich_tracts()
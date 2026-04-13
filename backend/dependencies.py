import httpx
from fastapi import Request, Depends
from service.BusinessService import BusinessService
from service.CensusService import CensusService
from service.OSMService import OSMService
from config.osm import OVERPASS_URL
from sqlmodel import Session
from db import engine
from typing import Generator


def get_http_client(request: Request) -> httpx.AsyncClient:
    return request.app.state.http_client


def get_db_session() -> Generator[Session, None, None]:
    with Session(engine) as session:
        yield session


def get_osm_service(client: httpx.AsyncClient = Depends(get_http_client)) -> OSMService:
    return OSMService(client=client, base_url=OVERPASS_URL)


def get_census_service(session: Session = Depends(get_db_session)) -> CensusService:
    return CensusService(session=session)


def get_business_service(session: Session = Depends(get_db_session)) -> BusinessService:
    return BusinessService(session=session)

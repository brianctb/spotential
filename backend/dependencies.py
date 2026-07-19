import httpx
import anthropic
from fastapi import Request, Depends
from service.BusinessService import BusinessService
from service.CensusService import CensusService
from service.AnalysisService import AnalysisService
from service.PredictionService import PredictionService
from service.OSMService import OSMService
from service.AgentService import AgentService
from service.GeographyService import GeographyService
from config.osm import OVERPASS_URL
from sqlmodel import Session
from db import engine
from typing import Generator
import xgboost as xgb


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

def get_ml_model(request: Request) -> xgb.XGBRegressor:
    return request.app.state.model

def get_prediction_service(
        session: Session = Depends(get_db_session),
        business_service: BusinessService=Depends(get_business_service),
        census_service: CensusService=Depends(get_census_service),
        model: xgb.XGBRegressor=Depends(get_ml_model),
) -> PredictionService:
    return PredictionService(session, model, business_service, census_service)

def get_analysis_service(
        business_service: BusinessService=Depends(get_business_service),
        census_service: CensusService=Depends(get_census_service),
        prediction_service: PredictionService=Depends(get_prediction_service),
) -> AnalysisService:
    return AnalysisService(business_service, census_service, prediction_service)

def get_anthropic_client(request: Request) -> anthropic.AsyncAnthropic:
    return request.app.state.anthropic_client

def get_geography_service(session: Session = Depends(get_db_session)) -> GeographyService:
    return GeographyService(session=session)

def get_supported_countries(request: Request) -> list[str]:
    return request.app.state.supported_countries

def get_supported_states(request: Request) -> list[str]:
    return request.app.state.supported_states

def get_supported_cities(request: Request) -> list[str]:
    return request.app.state.supported_cities

def get_agent_service(
        prediction_service: PredictionService=Depends(get_prediction_service),
        census_service: CensusService=Depends(get_census_service),
        geography_service: GeographyService=Depends(get_geography_service),
        anthropic_client: anthropic.AsyncAnthropic=Depends(get_anthropic_client),
        supported_countries: list[str]=Depends(get_supported_countries),
        supported_states: list[str]=Depends(get_supported_states),
        supported_cities: list[str]=Depends(get_supported_cities),
) -> AgentService:
    return AgentService(
        prediction_service,
        census_service,
        geography_service,
        anthropic_client,
        supported_countries,
        supported_states,
        supported_cities,
    )

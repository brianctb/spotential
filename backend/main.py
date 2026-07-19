from contextlib import asynccontextmanager
from typing import cast
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.types import ExceptionHandler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.extension import _rate_limit_exceeded_handler
from limiter import limiter
from routers.business import router as business_router
from routers.location import router as location_router
from routers.census import router as census_router
from routers.agent import router as agent_router
from config.mlflow_config import MODELS_PATH, LOCAL_MODEL_NAME
from sqlmodel import Session, select
from db import engine
from models.geography import Country, State, City
import anthropic
import httpx
import joblib
import os
from dotenv import load_dotenv

load_dotenv()


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    http_client = httpx.AsyncClient()
    fastapi_app.state.http_client = http_client
    fastapi_app.state.model = joblib.load(MODELS_PATH / LOCAL_MODEL_NAME)
    fastapi_app.state.anthropic_client = anthropic.AsyncAnthropic(
        api_key=os.environ["ANTHROPIC_API_KEY"], timeout=30.0
    )
    fastapi_app.state.limiter = limiter

    # Enum values for the agent's find_top_locations tool schema — sourced live
    # from the DB (a byproduct of load_census_geo.py's reverse-geocoding
    # ingestion), not hardcoded, so they never silently drift from real data.
    with Session(engine) as session:
        fastapi_app.state.supported_countries = sorted(session.exec(select(Country.name).distinct()).all())
        fastapi_app.state.supported_states = sorted(session.exec(select(State.name).distinct()).all())
        fastapi_app.state.supported_cities = sorted(session.exec(select(City.name).distinct()).all())

    yield
    await http_client.aclose()


app = FastAPI(
    title="Spotential API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.environ['FRONTEND_URL']],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_exception_handler(
    RateLimitExceeded, cast(ExceptionHandler, _rate_limit_exceeded_handler)
)
# Middleware needed to actually blocks request if limiter is broken
app.add_middleware(SlowAPIMiddleware)

app.include_router(business_router)
app.include_router(location_router)
app.include_router(census_router)
app.include_router(agent_router)


@app.get("/health")
async def health():
    return {"status": "ok"}

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.business import router as business_router
from routers.location import router as location_router
from routers.census import router as census_router
import httpx


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    http_client = httpx.AsyncClient()
    fastapi_app.state.http_client = http_client
    yield
    await http_client.aclose()


app = FastAPI(
    title="Spotential API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(business_router)
app.include_router(location_router)
app.include_router(census_router)


@app.get("/")
async def root():
    return {"message": "Spotential API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.business import router as business_router
from routers.location import router as location_router

app = FastAPI(title="Spotential API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(business_router)
app.include_router(location_router)


@app.get("/")
async def root():
    return {"message": "Spotential API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}

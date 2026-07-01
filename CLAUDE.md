# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotential is a location-intelligence platform that scores business opportunities in Vancouver by comparing an ML-predicted "capacity" for a business type against the actual business count within a census tract. It's a monorepo with a Next.js frontend and a FastAPI backend, backed by PostgreSQL + PostGIS. See `README.md` for feature overview and `ML_ARCHITECTURE.md` for the full scoring methodology (the "Spotentiate" engine).

## Commands

### Backend (`backend/`, Python 3.12, managed with `uv`)

```bash
cd backend
uv sync                          # install dependencies
uv run fastapi dev               # run dev server (http://localhost:8000)
uv run fastapi run main.py       # production-style run (used in Dockerfile)
uv run alembic upgrade head      # apply DB migrations
uv run alembic revision --autogenerate -m "message"   # create a migration after editing models/
```

No test suite exists in this repo currently.

Data/model pipeline scripts (run individually from `backend/`, e.g. `uv run python scripts/ml/train_unified_model.py`):
- `scripts/census/load_tract.py`, `load_census_geo.py`, `load_census_demographics.py` — ingest StatCan census tract shapefiles/CSVs into PostGIS
- `scripts/business/ingest_osm_business.py` — pull business POIs from OSM Overpass
- `scripts/business/assign_tracts.py` — spatially assign each business to a census tract
- `scripts/ml/train_unified_model.py` — trains the unified XGBoost regressor, logs runs to MLflow (`init_mlflow()`), registers the model
- `config/mlflow_config.py` `export_model()` — exports the latest registered MLflow model to `models/production_model.pkl`, the file loaded by the FastAPI app at startup
- `scripts/analysis/precompute_tracts.py` — runs `AnalysisService.precompute_all_predictions()` for every tract × business type and writes results to the `model_predictions` table

### Frontend (`frontend/`, Next.js 15 + React 19, managed with `pnpm`)

```bash
cd frontend
pnpm install
pnpm dev                         # dev server (http://localhost:3000)
pnpm build
pnpm lint
pnpm generate:types               # regenerate src/types/generated.ts from the running backend's OpenAPI schema (backend must be running on :8000)
```

Run `pnpm generate:types` after changing any FastAPI response/request schema so the frontend's generated types stay in sync.

## Architecture

### Request flow

```
Frontend (Next.js/React) → FastAPI routers → Services → SQLModel/PostGIS + XGBoost model
```

The core interaction: user clicks a point on the map with a selected business type → `GET /locations/analysis?lng&lat&business_type` → `AnalysisService.analyze_business()`.

### Backend layering (`backend/`)

- `routers/` — thin FastAPI route handlers (`business.py`, `census.py`, `location.py`), no business logic
- `service/` — business logic, one class per domain, constructed via FastAPI `Depends` chains defined in `dependencies.py`:
  - `CensusService` — finds a tract by point (`ST_Contains`), fetches tract demographics/geometry
  - `BusinessService` — fetches businesses within a tract, counts total businesses per tract
  - `OSMService` — queries the Overpass API for a business type/radius (used by ingestion scripts, not the live analysis path)
  - `AnalysisService` — orchestrates the other services: builds `ModelFeatures`, runs the XGBoost model, computes the opportunity score, and also powers the batch `precompute_all_predictions()` path
- `models/` — SQLModel table definitions (`census.py`, `business.py`, `geography.py`, `model_outputs.py`) — the source of truth for DB schema; edit these then generate an Alembic migration
- `schema/` — Pydantic (non-table) schemas: API response shapes (`response.py`), GeoJSON wrappers (`geo_json.py`), the ML feature contract (`ml_model.py`)
- `config/` — static config: `business_type.py` (the `BusinessType`/`BusinessCategory` enums and their OSM Overpass query definitions — this is the canonical list of supported business types), `census_constants.py`, `osm.py`, `mlflow_config.py`
- `main.py` — app wiring: CORS (single origin from `FRONTEND_URL` env var), slowapi rate limiting (8/min, 50/day per IP by default), loads `production_model.pkl` into `app.state.model` at startup lifespan
- `dependencies.py` — all FastAPI `Depends` providers; this is where services are wired together with a DB session

### The opportunity score

`AnalysisService.score_tract(actual, predicted)` computes a sigmoid-normalized score (0–100) from `ln(1+predicted) - ln(1+actual)`. The XGBoost model predicts "capacity" (expected business count) from `ModelFeatures` (census demographics + `other_business_count` + `business_type_id`); actual supply comes from counting real OSM-sourced businesses in the tract. Feature order matters — always build the feature vector via `ModelFeatures.feature_columns()` (see `AnalysisService.predict_business_count`).

### ML/data pipeline

Training happens offline via MLflow (SQLite backend at `backend/mlflow.db`, artifacts in `backend/mlruns/`), producing a registered model. `export_model()` pulls the raw XGBoost model out of the registry and serializes it to `backend/models/production_model.pkl` — this flat file, not the MLflow registry, is what the running API loads. After retraining, re-run `export_model()` and restart the API (or redeploy) to pick up the new model. Precomputed tract×type predictions (`model_predictions` table, via `scripts/analysis/precompute_tracts.py`) exist as a cache/reporting layer separate from the live per-request `/locations/analysis` inference path.

### Frontend structure (`frontend/src/`)

- `api/` — typed fetch wrappers over `apiClient` (`client.ts`), one file per backend resource (`analysis.ts`, `business.ts`)
- `types/generated.ts` — auto-generated from the backend OpenAPI schema via `openapi-typescript`; do not hand-edit
- `store/mapStore.ts` — Zustand store for map/UI state (selected business type, draft/search pin, dialog state)
- `hooks/` — `useAnalysisQuery` (TanStack Query wrapper around the analysis endpoint), `useAppParams` (reads `lat`/`lng`/`business_type` from URL search params — the app's source of truth for "what's currently selected", not just local state), `useMenuQuery`, `useMapView`, `useBusinessMeta`
- `components/map/` — MapLibre/react-map-gl layers: `TractLayer` (colors tracts by score), `BusinessLayer`, `PinMarker/` (draft vs. search pins), popups
- `components/tabs/` — sidebar/drawer accordions for demographics and business category browsing
- State flows through URL search params (`lat`, `lng`, `business_type`) rather than only client state, so the analysis view is shareable/linkable

### Database

PostgreSQL + PostGIS (Neon in production). Geometry columns use `geoalchemy2.Geometry` (`MULTIPOLYGON` for tracts, `POINT` for businesses), queried with PostGIS functions (`ST_Contains`, `ST_AsGeoJSON`, `ST_MakePoint`) directly through SQLModel/SQLAlchemy `select()` statements in the service layer. Migrations are managed with Alembic (`backend/alembic/`); always generate a migration after changing a `table=True` model in `models/`.

## Deployment

Frontend → Vercel, backend → Railway (Docker, see `backend/Dockerfile`), database → Neon PostgreSQL. Backend CORS only allows the single origin configured in `FRONTEND_URL`.

# 📍 Spotential Roadmap

## Phase 1: Foundation & Geospatial MVP

**Goal:** Monorepo setup and live map with real-time business data.

- [x] **Project Setup:** Create `frontend/` and `backend/` folders.
- [x] **Frameworks:** Init Next.js 15 (TS + Tailwind + shadcn/ui) & FastAPI (uv + Python 3.12).
- [x] **Map Core:** Install React Leaflet and render Vancouver map.
- [x] **OSM Integration:** Build FastAPI endpoint for OSM Overpass API.
- [x] **Data Flow:** Return gym locations as GeoJSON and plot as dots on the map.
- [x] **State Management:** Implement **Zustand** and **TanStack Query** caching.
- [x] **DX:** Set up `openapi-typescript` for type-safe frontend/backend communication.

---

## Phase 2: Census Data Pipeline (Current)

**Goal:** Move from "where things are" to "who lives here" using demographics.

- [x] **Database:** Set up Neon PostgreSQL + Enable PostGIS extension.
- [x] **Infrastructure:** Create Neon account and production database branch.
- [x] **Geometry:** Download StatCan Census Tract (CT) shapefiles for BC.
- [x] **Ingestion:** Script `load_census_tract.py` using **GeoPandas** to push shapes to PostGIS.
- [x] **Demographics:** Download Census CSV (Income, Pop, Age).
- [x] **Ingestion:** Script `load_census_demographics.py` using **Polars**.
- [x] **Database Schema:** Define `CensusTract` and `CensusDemographics` via **SQLModel**.
- [x] **Migrations:** Initialize **Alembic** and run first migration to create tables.
- [x] **Spatial Logic:** Build `CensusService` to find tract by Lat/Lng via `ST_Contains`.
- [ ] **Transit Layer:** Load TransLink GTFS stops; build proximity scoring (stops within 500m).
- [x] **Unified API:** Build `GET` endpoint to return all data for a clicked point.
- [x] **Display Tract and Business:** Maplibre to display Source and Layer for Tract

---

## Phase 3: ML Pipeline & Location Scoring

**Goal:** A trained model that predicts location desirability.

- [x] **Data Prep:** Pull features for all Vancouver tracts; build proxy labels (density per capita).
- [x] **EDA:** Exploratory analysis with Polars to understand feature distributions.
- [x] **Experiment Tracking:** Set up **MLflow** to log training runs.
- [x] **Modeling:** Train **XGBoost Regressor** and evaluate with RMSE + R².
- [x] **Inference API:** Load model in FastAPI; build scoring endpoint.
- [x] **UI Feature:** Add popover for business when hover/click, Add popover for search pin to display scoring metrics, add tab at menu to display census data
- [x] **UI Upgrade:** TractLayer dynamic color based on score
- [x] **UI Feature:** Redirect to the tract and proper zoom after fetching
- [x] **UI Upgrade:** Upgrade UI for Menu, Demographics
- [x] **UI Upgrade:** Add animation for fetching, and delay
- [x] **UI Feature:** Add disable Tooltip and error sonner
- [x] **UI Feature:** Add Dark Mode and mode trigger
- [ ] **UI Feature:** Add UI for mobile/small screen view
- [x] **UI Feature:** Add darkmode for map style

---

## Phase 4: Deployment

- [ ] **Docker:** Docker containerize app
- [ ] **Deployment:** Frontend on Vercel, Backend on Fly.io, custom domain `spotential.dev`.
- [ ] **Showcase:** Record demo video and create architecture diagrams for portfolio.

---

## Phase 5: GenAI Layer & Production Polish

**Goal:** Natural language queries and professional deployment.

- [ ] **Natural Language:** Integrate **Vercel AI SDK**; build chat interface for plain English queries.
- [ ] **RAG Pipeline:** Use **pgvector** in Neon to embed neighborhood context for grounded AI answers.
- [ ] **UX Polish:** Add Recharts bar charts for score breakdowns; implement mobile-responsive layout.
- [ ] **Reliability:** Complete **Pytest** coverage for backend and ML pipeline.

---

## Technical Debt & Tooling

- [x] Add `DATABASE_URL` to `.env` (Use `sslmode=require`).
- [ ] Install dependencies: `uv add asyncpg psycopg2-binary geopandas`.
- [x] Configure `env.py` from alembic to point to Neon.

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
- [ ] **Geometry:** Download StatCan Census Tract (CT) shapefiles for BC.
- [ ] **Ingestion:** Script `load_census_tract.py` using **GeoPandas** to push shapes to PostGIS.
- [ ] **Demographics:** Download Census CSV (Income, Pop, Age).
- [ ] **Ingestion:** Script `load_census_demographics.py` using **Polars**.
- [ ] **Database Schema:** Define `CensusTract` and `CensusDemographics` via **SQLModel**.
- [ ] **Migrations:** Initialize **Alembic** and run first migration to create tables.
- [ ] **Spatial Logic:** Build `CensusService` to find tract by Lat/Lng via `ST_Contains`.
- [ ] **Transit Layer:** Load TransLink GTFS stops; build proximity scoring (stops within 500m).
- [ ] **Unified API:** Build `GET` endpoint to return all data for a clicked point.

---

## Phase 3: ML Pipeline & Location Scoring

**Goal:** A trained model that predicts location desirability.

- [ ] **Data Prep:** Pull features for all Vancouver tracts; build proxy labels (density per capita).
- [ ] **EDA:** Exploratory analysis with Polars to understand feature distributions.
- [ ] **Experiment Tracking:** Set up **MLflow** to log training runs.
- [ ] **Modeling:** Train **XGBoost Regressor** and evaluate with RMSE + R².
- [ ] **Inference API:** Load model in FastAPI; build `POST /score` endpoint.
- [ ] **Clustering:** Add K-Means for neighborhood archetypes and Isolation Forest for gap detection.
- [ ] **UI Upgrade:** Migrate to **MapLibre** for smoother 3D choropleth overlays (color by score).

---

## Phase 4: GenAI Layer & Production Polish

**Goal:** Natural language queries and professional deployment.

- [ ] **Natural Language:** Integrate **Vercel AI SDK**; build chat interface for plain English queries.
- [ ] **RAG Pipeline:** Use **pgvector** in Neon to embed neighborhood context for grounded AI answers.
- [ ] **UX Polish:** Add Recharts bar charts for score breakdowns; implement mobile-responsive layout.
- [ ] **Reliability:** Complete **Pytest** coverage for backend and ML pipeline.
- [ ] **Deployment:** Frontend on Vercel, Backend on Fly.io, custom domain `spotential.dev`.
- [ ] **Showcase:** Record demo video and create architecture diagrams for portfolio.

---

## Technical Debt & Tooling

- [ ] Add `DATABASE_URL` to `.env` (Use `sslmode=require`).
- [ ] Install dependencies: `uv add asyncpg psycopg2-binary geopandas`.
- [ ] Configure `alembic.ini` to point to Neon.

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
- [x] **UI Feature:** Add UI for mobile/small screen view
- [x] **UI Feature:** Add darkmode for map style

---

## Phase 4: Deployment

- [x] **Docker:** Docker containerize app
- [x] **Deployment:** Deploy frontend and backend, with a custom domain
- [ ] **Showcase:** Record demo video

---

## Phase 5: Agentic Layer

**Goal:** Transform Spotential from a data dashboard into an autonomous business consulting service.

- [ ] **Multi-Agent Orchestration (CrewAI):** Deploy specialized agents that collaborate to solve complex location queries:
  - **Geospatial Researcher:** Uses **LangChain Tools** to scan PostGIS metrics and transit data.
  - **ML Data Scientist:** Triggers XGBoost inference and interprets feature importance.
  - **Business Strategist:** Synthesizes technical outputs into a narrative analysis.
- [ ] **Agentic RAG Pipeline:** Implement semantic search via **pgvector** and **LangChain** to retrieve qualitative neighborhood context to ground quantitative recommendations.
- [ ] **Streaming Agent UI:** Integrate **Vercel AI SDK** to stream the "thought process" and delegation logs of the agents to the frontend for full reasoning transparency.

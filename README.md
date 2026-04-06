# 📍 Spotential

> Location intelligence platform — score any Vancouver location for business success using ML and open data.

## What It Does

- **Business Selection:** User selects a business type (gym, restaurant, grocery, etc.).
- **Spatial Search:** User clicks any location in Vancouver on an interactive map.
- **ML Scoring:** A custom XGBoost model scores the location based on demographics, competitor density, and transit accessibility.
- **Deep Insights:** Returns a 0-100 score with a visual breakdown of components and opportunity gap detection.

## Tech Stack

### Frontend

- **Framework:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Maps:** Maplibre
- **Data Fetching:** TanStack Query (React Query)
- **State:** Zustand

### Backend

- **API:** FastAPI (Python 3.12)
- **Database:** Neon PostgreSQL + **PostGIS** (Spatial Engine)
- **ORM:** SQLModel (SQLAlchemy + Pydantic v2)
- **Migrations:** Alembic
- **Tooling:** **uv** for lightning-fast package management

### Data Science & ML

- **Processing:** Polars (high-performance data manipulation)
- **Modeling:** XGBoost (Regression), scikit-learn (K-Means, Isolation Forest)
- **Geospatial:** GeoPandas
- **Tracking:** MLflow, joblib

---

## Getting Started

### Prerequisites

1. **Node.js 18+** & **pnpm**
2. **Python 3.12+**
3. **uv** — [Installation Guide](https://github.com/astral-sh/uv) (Required for Python environment management)
4. **Docker** (Optional for local DB, Neon Cloud used for production)

### 1. Backend Setup

The backend handles geospatial logic and ML inference.

```bash
cd backend

# Install dependencies
uv sync

# Start the dev server
uv run fastapi dev
```

### 1. Frontend Setup

The backend handles geospatial logic and ML inference.

```bash
cd frontend

# Install dependencies
pnpm install

# Start the front end
pnpm dev
```

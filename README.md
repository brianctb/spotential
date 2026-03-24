# Spotential

> Location intelligence platform — score any Vancouver location for business success using ML and open data.

## What It Does
- User selects a business type (gym, restaurant, grocery, etc)
- User clicks any location in Vancouver on the map
- ML model scores the location across demographics, competition, and transit access
- Returns a 0-100 score with breakdown and opportunity insights

## Tech Stack
### Frontend
- Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- React Leaflet, Recharts, TanStack Query

### Backend
- FastAPI, Pydantic v2, SQLModel, Alembic
- Python 3.12, uv

### Data Sources
- OpenStreetMap Overpass API — competitor locations
- Statistics Canada Census — demographics
- TransLink GTFS — transit access

### ML
- XGBoost — location score regression
- scikit-learn — Isolation Forest + K-Means
- Polars, joblib, MLflow

### Infrastructure
- Docker + Docker Compose
- Vercel (frontend)
- GitHub Actions CI/CD

## Getting Started
### Prerequisites
- Node.js 18+
- Python 3.12+
- uv
- Docker

### Run Locally
```bash
# Clone the repo
git clone https://github.com/yourusername/spotential.git
cd spotential

# Start everything with Docker
docker compose up
```

## Project Status
🚧 In active development — started March 2026
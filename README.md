# Geospatial Tracker

A real-time hybrid AI application that tracks live aircraft (OpenSky) and detects vehicles/infrastructure from live DOT traffic cameras using Groq Vision (LLaVA-v1.5-7b) and Sentinel Hub. Open-source backend with FastAPI and a React/Leaflet GUI.

## Tech Stack
- **Backend:** Python 3.11+, FastAPI, Pydantic, httpx, Groq SDK
- **Frontend:** React 18, Vite, TypeScript, React Leaflet
- **Data Sources:** OpenSky API, Groq Vision API, Sentinel Hub, public DOT feeds
- **Infrastructure:** Docker, Docker Compose

## Quickstart

### Prerequisites
- Docker & Docker Compose
- API Keys: Groq (Free), Sentinel Hub (Free tier)

### Setup
1. Clone the repository
2. Fill out `.env` based on `.env.example`
3. Run the stack:
```bash
docker-compose up --build
```
4. Access the frontend GUI at `http://localhost:5173`

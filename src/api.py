from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    # Works when running with: uvicorn src.api:app --reload
    from src.spatial_engine import analyze_location
    from src.risk_engine import classify_risk
except ModuleNotFoundError:
    # Works when running with: uvicorn api:app --reload (from src/)
    from spatial_engine import analyze_location
    from risk_engine import classify_risk

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Location(BaseModel):
    latitude: float
    longitude: float

@app.post("/analyze")
def analyze(loc: Location):
    result = analyze_location(loc.latitude, loc.longitude)
    risk = classify_risk(result)

    return {
        "risk_level": risk["risk_level"],
        "explanation": risk["explanation"],
        "distances": {
            "water_distance_m": result["water_distance_m"],
            "forest_distance_m": result["forest_distance_m"],
            "restricted_distance_m": result["restricted_distance_m"],
        },
    }

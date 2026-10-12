"""
STORMGUARD AI — FastAPI REST API Endpoints
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, List, Optional
from models.schemas import (
    AtmosphericVector, GenesisPredictionResponse, TimeFrameData,
    ScenarioMetadata
)
from services.ml_service import ml_service
from services.weather_service import weather_service

router = APIRouter(prefix="/api")

@router.get("/health")
def health_check():
    info = ml_service.get_model_info()
    return {
        'status': 'healthy',
        'platform': 'StormGuard AI Prelims Prototype (SIH 2026)',
        'ml_engine': 'Online',
        'model_loaded': True,
        'model_architecture': info.get('model_architecture', 'ConvectiveGenesisEnsembleClassifier'),
        'version': '1.0.0'
    }

@router.get("/scenarios", response_model=List[ScenarioMetadata])
def get_scenarios():
    """Returns list of available demo meteorological scenarios."""
    return weather_service.get_scenarios()

@router.get("/weather/timeline", response_model=List[TimeFrameData])
def get_weather_timeline(
    scenario_id: str = Query('ncr_cloudburst', description="Scenario ID (ncr_cloudburst, western_ghats_supercell, coastal_dissipation)")
):
    """Returns all sequential timeframes (T0 to T+60m) with precomputed nowcasting vectors."""
    return weather_service.get_timeline(scenario_id)

@router.get("/weather/current", response_model=TimeFrameData)
def get_current_weather(
    scenario_id: str = Query('ncr_cloudburst', description="Scenario ID"),
    timestep: str = Query('T0', description="Timestep (T0, T+15, T+30, T+45, T+60)")
):
    """Returns current weather state, genesis zones, storm cells, and sounding metrics for given timestep."""
    return weather_service.get_frame(scenario_id, timestep)

@router.post("/predict", response_model=GenesisPredictionResponse)
def predict_genesis(input_data: AtmosphericVector):
    """
    Runs live Scikit-learn/Ensemble model inference on custom atmospheric sounding parameters
    and returns Genesis Probability, Threat Classification, Hazard Breakdown, and XAI Feature Attributions.
    """
    try:
        data_dict = input_data.model_dump()
        result = ml_service.predict(data_dict)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.get("/storms")
def get_storms(
    scenario_id: str = Query('ncr_cloudburst'),
    timestep: str = Query('T0')
):
    """Returns active storm cells, intensity dBZ, polygons, and AI trajectory vectors."""
    frame = weather_service.get_frame(scenario_id, timestep)
    return {
        'timestep': frame.timestep,
        'storm_cells': frame.storm_cells,
        'genesis_zones': frame.genesis_zones
    }

@router.get("/explanation")
def get_explanation(
    scenario_id: str = Query('ncr_cloudburst'),
    timestep: str = Query('T0')
):
    """
    Returns Explainable AI (XAI) feature attribution rankings and meteorological reasoning
    for the active storm cell / genesis area.
    """
    frame = weather_service.get_frame(scenario_id, timestep)
    sounding = frame.column_sounding
    prediction = ml_service.predict(sounding)
    return {
        'timestep': frame.timestep,
        'overall_genesis_probability': prediction['convective_genesis_probability'],
        'threat_level': prediction['threat_level'],
        'contributing_factors': prediction['contributing_factors'],
        'meteorological_reasoning': prediction['meteorological_reasoning'],
        'sounding_parameters': sounding
    }

@router.get("/model/info")
def get_model_info():
    """Returns ML architecture details, training accuracy, and global feature importances."""
    return ml_service.get_model_info()

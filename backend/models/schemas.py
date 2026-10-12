"""
STORMGUARD AI — API Pydantic Data Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class AtmosphericVector(BaseModel):
    cape_j_kg: float = Field(2400.0, description="Convective Available Potential Energy (J/kg)")
    cin_j_kg: float = Field(25.0, description="Convective Inhibition (J/kg)")
    lifted_index_k: float = Field(-5.2, description="Lifted Index (K)")
    k_index: float = Field(34.0, description="K-Index (K)")
    precipitable_water_mm: float = Field(52.0, description="Total Precipitable Water (mm)")
    surface_temp_c: float = Field(33.5, description="Surface Temperature (°C)")
    relative_humidity_pct: float = Field(76.0, description="Relative Humidity (%)")
    dew_point_depression_c: float = Field(2.5, description="Dew Point Depression (°C)")
    pressure_tendency_hpa_3h: float = Field(-1.8, description="3-hr Pressure Tendency (hPa)")
    updraft_helicity_m2_s2: float = Field(140.0, description="Updraft Helicity (m²/s²)")
    vertical_velocity_ms: float = Field(18.0, description="Vertical Velocity (m/s)")
    wind_shear_knots: float = Field(26.0, description="0-3km Bulk Wind Shear (knots)")
    reflectivity_gradient_dbz_10m: float = Field(8.5, description="Radar Reflectivity Growth (dBZ/10m)")
    cloud_top_cooling_c_15m: float = Field(-8.0, description="Cloud Top Cooling Rate (°C/15m)")

class HazardBreakdown(BaseModel):
    thunderstorm_risk_pct: float
    hail_risk_pct: float
    cloudburst_risk_pct: float

class XaiFactor(BaseModel):
    feature_key: str
    feature_name: str
    value: float
    unit: str
    importance_pct: float
    contribution_score: float

class GenesisPredictionResponse(BaseModel):
    convective_genesis_probability: float
    threat_level: str
    threat_code: str
    status_text: str
    hazards: HazardBreakdown
    contributing_factors: List[XaiFactor]
    meteorological_reasoning: str
    input_parameters: Dict[str, float]

class TrajectoryPoint(BaseModel):
    timestep: str
    time_offset_min: int
    lat: float
    lng: float
    intensity_dbz: float
    estimated_arrival_time: str
    threat_level: str

class StormCell(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    intensity_dbz: float
    radius_km: float
    vertical_extent_km: float
    motion_speed_kmh: float
    motion_bearing_deg: float
    genesis_probability: float
    threat_level: str
    phase: str
    trajectory: List[TrajectoryPoint]
    sounding: Dict[str, float]

class GenesisZone(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    radius_km: float
    initiation_probability: float
    threat_level: str
    status: str
    dominant_trigger: str

class StationObservation(BaseModel):
    id: str
    name: str
    lat: float
    lng: float
    temp_c: float
    humidity_pct: float
    pressure_hpa: float
    wind_speed_kmh: float
    wind_dir: str
    rain_rate_mmh: float
    local_risk_pct: float
    threat_level: str

class TimeFrameData(BaseModel):
    timestep: str
    time_offset_min: int
    display_time: str
    overall_threat_level: str
    overall_threat_code: str
    overall_genesis_prob: float
    hazards: HazardBreakdown
    estimated_impact_countdown_min: int
    summary_bulletin: str
    genesis_zones: List[GenesisZone]
    storm_cells: List[StormCell]
    stations: List[StationObservation]
    column_sounding: Dict[str, float]

class ScenarioMetadata(BaseModel):
    id: str
    title: str
    region_name: str
    description: str
    center_lat: float
    center_lng: float
    default_zoom: int
    severity_type: str
    total_timesteps: int

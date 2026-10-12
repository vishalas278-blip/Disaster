"""
STORMGUARD AI — Weather Simulation Service
Generates deterministic spatiotemporal weather scenarios (T0..T60)
for convective-scale nowcasting, early genesis detection, and hazard forecasting.
100% Local & Self-Contained — Zero External API Dependencies.
"""

from typing import List, Dict, Any, Optional
from models.schemas import (
    TimeFrameData,
    HazardBreakdown,
    GenesisZone,
    StormCell,
    TrajectoryPoint,
    StationObservation,
    ScenarioMetadata
)

SCENARIOS: List[ScenarioMetadata] = [
    ScenarioMetadata(
        id="ncr_cloudburst",
        title="DEMO SCENARIO: NCR Convective Initiation & Cloudburst Risk",
        region_name="National Capital Region (Delhi-NCR)",
        description="Explosive boundary layer moisture convergence leading to rapid convective genesis and severe localized cloudburst precipitation shaft.",
        center_lat=28.6139,
        center_lng=77.2090,
        default_zoom=11,
        severity_type="Severe Cloudburst / Flash Flood Risk",
        total_timesteps=5
    ),
    ScenarioMetadata(
        id="western_ghats_supercell",
        title="DEMO SCENARIO: Pune & Western Ghats Supercell & Hail Genesis",
        region_name="Pune - Lonavala Orographic Corridor",
        description="Orographic lift coupled with extreme thermal instability and deep vertical shear generating severe hail cores and graupel downburst.",
        center_lat=18.5204,
        center_lng=73.8567,
        default_zoom=11,
        severity_type="Severe Hailstorm & Supercell Nowcast",
        total_timesteps=5
    ),
    ScenarioMetadata(
        id="coastal_dissipation",
        title="DEMO SCENARIO: Coastal Sea-Breeze Convection & Dissipation",
        region_name="Mumbai Coastal Zone",
        description="Early afternoon thermal convective flare encountering stable maritime sea-breeze boundary layer with subsequent storm decay.",
        center_lat=19.0760,
        center_lng=72.8777,
        default_zoom=11,
        severity_type="Incipient Convection -> Dissipation",
        total_timesteps=5
    )
]

def get_all_scenarios() -> List[ScenarioMetadata]:
    return SCENARIOS

def get_scenario_by_id(scenario_id: str) -> Optional[ScenarioMetadata]:
    for s in SCENARIOS:
        if s.id == scenario_id:
            return s
    return SCENARIOS[0]

def build_ncr_cloudburst_timeline() -> List[TimeFrameData]:
    """
    Deterministic 5-step forecast timeline calibrated to user demonstration requirements:
    T0 (Genesis 45%), T+15 (Genesis 61%), T+30 (Genesis 72%), T+45 (Genesis 81%), T+60 (Genesis 88%)
    """
    frames = [
        TimeFrameData(
            timestep="T0",
            time_offset_min=0,
            display_time="14:00 IST (T0)",
            overall_threat_level="WATCH",
            overall_threat_code="yellow",
            overall_genesis_prob=45.0,
            hazards=HazardBreakdown(
                thunderstorm_risk_pct=42.0,
                hail_risk_pct=18.0,
                cloudburst_risk_pct=22.0
            ),
            estimated_impact_countdown_min=45,
            summary_bulletin="INCIPIENT GENESIS: Mesoscale boundary layer convergence detected over SW NCR (Gurugram-Dwarka). Thermal cap eroding with nascent updrafts.",
            genesis_zones=[
                GenesisZone(
                    id="gz-ncr-1",
                    name="SW NCR Genesis Corridor (Gurugram-Dwarka)",
                    lat=28.505,
                    lng=77.065,
                    radius_km=6.5,
                    initiation_probability=45.0,
                    threat_level="WATCH",
                    status="INCIPIENT",
                    dominant_trigger="Boundary Layer Moisture Convergence & High CAPE"
                )
            ],
            storm_cells=[
                StormCell(
                    id="cell-ncr-alpha",
                    name="Convective Cell Alpha",
                    lat=28.520,
                    lng=77.080,
                    intensity_dbz=28.0,
                    radius_km=6.5,
                    vertical_extent_km=7.5,
                    motion_speed_kmh=28.0,
                    motion_bearing_deg=55.0,
                    genesis_probability=45.0,
                    threat_level="WATCH",
                    phase="INCIPIENT GENESIS",
                    trajectory=[
                        TrajectoryPoint(timestep="T0", time_offset_min=0, lat=28.520, lng=77.080, intensity_dbz=28.0, estimated_arrival_time="14:00 IST (T0)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+15", time_offset_min=15, lat=28.565, lng=77.135, intensity_dbz=42.0, estimated_arrival_time="14:15 IST (+15m)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+30", time_offset_min=30, lat=28.610, lng=77.190, intensity_dbz=54.0, estimated_arrival_time="14:30 IST (+30m)", threat_level="WARNING"),
                        TrajectoryPoint(timestep="T+45", time_offset_min=45, lat=28.655, lng=77.245, intensity_dbz=62.0, estimated_arrival_time="14:45 IST (+45m)", threat_level="SEVERE"),
                        TrajectoryPoint(timestep="T+60", time_offset_min=60, lat=28.700, lng=77.300, intensity_dbz=66.0, estimated_arrival_time="15:00 IST (+60m)", threat_level="SEVERE"),
                    ],
                    sounding={
                        "cape_j_kg": 2350.0,
                        "cin_j_kg": 38.0,
                        "lifted_index_k": -4.8,
                        "k_index": 33.0,
                        "precipitable_water_mm": 51.0,
                        "surface_temp_c": 35.2,
                        "relative_humidity_pct": 72.0,
                        "dew_point_depression_c": 3.2,
                        "pressure_tendency_hpa_3h": -1.4,
                        "updraft_helicity_m2_s2": 95.0,
                        "vertical_velocity_ms": 13.5,
                        "wind_shear_knots": 22.0,
                        "reflectivity_gradient_dbz_10m": 7.5,
                        "cloud_top_cooling_c_15m": -6.5
                    }
                )
            ],
            stations=[
                StationObservation(id="stn-1", name="IMD Safdarjung (Central)", lat=28.5830, lng=77.2060, temp_c=35.2, humidity_pct=72.0, pressure_hpa=1003.6, wind_speed_kmh=18.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=35.0, threat_level="LOW"),
                StationObservation(id="stn-2", name="IGI Airport Met (Dwarka)", lat=28.5562, lng=77.1000, temp_c=35.0, humidity_pct=74.0, pressure_hpa=1003.4, wind_speed_kmh=22.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=44.0, threat_level="WATCH"),
                StationObservation(id="stn-3", name="Noida Sector 62 AWS", lat=28.6280, lng=77.3670, temp_c=35.5, humidity_pct=70.0, pressure_hpa=1004.0, wind_speed_kmh=15.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=20.0, threat_level="LOW"),
                StationObservation(id="stn-4", name="Gurugram CyberCity AWS", lat=28.4900, lng=77.0890, temp_c=34.8, humidity_pct=76.0, pressure_hpa=1003.0, wind_speed_kmh=24.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=46.0, threat_level="WATCH"),
            ],
            column_sounding={
                "cape_j_kg": 2350.0,
                "cin_j_kg": 38.0,
                "lifted_index_k": -4.8,
                "k_index": 33.0,
                "precipitable_water_mm": 51.0,
                "surface_temp_c": 35.2,
                "relative_humidity_pct": 72.0,
                "dew_point_depression_c": 3.2,
                "pressure_tendency_hpa_3h": -1.4,
                "updraft_helicity_m2_s2": 95.0,
                "vertical_velocity_ms": 13.5,
                "wind_shear_knots": 22.0,
                "reflectivity_gradient_dbz_10m": 7.5,
                "cloud_top_cooling_c_15m": -6.5
            }
        ),
        TimeFrameData(
            timestep="T+15",
            time_offset_min=15,
            display_time="14:15 IST (T+15m)",
            overall_threat_level="WATCH",
            overall_threat_code="yellow",
            overall_genesis_prob=61.0,
            hazards=HazardBreakdown(
                thunderstorm_risk_pct=57.0,
                hail_risk_pct=25.0,
                cloudburst_risk_pct=34.0
            ),
            estimated_impact_countdown_min=30,
            summary_bulletin="ACCELERATING DEVELOPMENT: Cap inversion eroded (CIN < 18 J/kg). Cloud growth accelerating (-10°C/15m). First radar echo 42 dBZ over Dwarka corridor.",
            genesis_zones=[
                GenesisZone(
                    id="gz-ncr-1",
                    name="SW NCR Genesis Corridor",
                    lat=28.550,
                    lng=77.120,
                    radius_km=8.0,
                    initiation_probability=61.0,
                    threat_level="WATCH",
                    status="DEVELOPING",
                    dominant_trigger="Rapid Vertical Updraft Acceleration"
                )
            ],
            storm_cells=[
                StormCell(
                    id="cell-ncr-alpha",
                    name="Convective Cell Alpha",
                    lat=28.565,
                    lng=77.135,
                    intensity_dbz=42.0,
                    radius_km=8.5,
                    vertical_extent_km=9.2,
                    motion_speed_kmh=28.0,
                    motion_bearing_deg=55.0,
                    genesis_probability=61.0,
                    threat_level="WATCH",
                    phase="DEVELOPING ECHO",
                    trajectory=[
                        TrajectoryPoint(timestep="T0", time_offset_min=0, lat=28.520, lng=77.080, intensity_dbz=28.0, estimated_arrival_time="14:00 IST (T0)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+15", time_offset_min=15, lat=28.565, lng=77.135, intensity_dbz=42.0, estimated_arrival_time="14:15 IST (+15m)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+30", time_offset_min=30, lat=28.610, lng=77.190, intensity_dbz=54.0, estimated_arrival_time="14:30 IST (+30m)", threat_level="WARNING"),
                        TrajectoryPoint(timestep="T+45", time_offset_min=45, lat=28.655, lng=77.245, intensity_dbz=62.0, estimated_arrival_time="14:45 IST (+45m)", threat_level="SEVERE"),
                        TrajectoryPoint(timestep="T+60", time_offset_min=60, lat=28.700, lng=77.300, intensity_dbz=66.0, estimated_arrival_time="15:00 IST (+60m)", threat_level="SEVERE"),
                    ],
                    sounding={
                        "cape_j_kg": 2850.0,
                        "cin_j_kg": 18.0,
                        "lifted_index_k": -6.2,
                        "k_index": 37.0,
                        "precipitable_water_mm": 56.0,
                        "surface_temp_c": 34.6,
                        "relative_humidity_pct": 78.0,
                        "dew_point_depression_c": 2.4,
                        "pressure_tendency_hpa_3h": -2.1,
                        "updraft_helicity_m2_s2": 145.0,
                        "vertical_velocity_ms": 18.2,
                        "wind_shear_knots": 27.0,
                        "reflectivity_gradient_dbz_10m": 11.5,
                        "cloud_top_cooling_c_15m": -10.0
                    }
                )
            ],
            stations=[
                StationObservation(id="stn-1", name="IMD Safdarjung (Central)", lat=28.5830, lng=77.2060, temp_c=34.6, humidity_pct=76.0, pressure_hpa=1002.9, wind_speed_kmh=22.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=52.0, threat_level="WATCH"),
                StationObservation(id="stn-2", name="IGI Airport Met (Dwarka)", lat=28.5562, lng=77.1000, temp_c=33.8, humidity_pct=82.0, pressure_hpa=1002.0, wind_speed_kmh=32.0, wind_dir="SW", rain_rate_mmh=12.0, local_risk_pct=64.0, threat_level="WARNING"),
                StationObservation(id="stn-3", name="Noida Sector 62 AWS", lat=28.6280, lng=77.3670, temp_c=35.0, humidity_pct=72.0, pressure_hpa=1003.5, wind_speed_kmh=18.0, wind_dir="SW", rain_rate_mmh=0.0, local_risk_pct=32.0, threat_level="LOW"),
                StationObservation(id="stn-4", name="Gurugram CyberCity AWS", lat=28.4900, lng=77.0890, temp_c=33.5, humidity_pct=80.0, pressure_hpa=1002.4, wind_speed_kmh=28.0, wind_dir="SW", rain_rate_mmh=5.0, local_risk_pct=58.0, threat_level="WATCH"),
            ],
            column_sounding={
                "cape_j_kg": 2850.0,
                "cin_j_kg": 18.0,
                "lifted_index_k": -6.2,
                "k_index": 37.0,
                "precipitable_water_mm": 56.0,
                "surface_temp_c": 34.6,
                "relative_humidity_pct": 78.0,
                "dew_point_depression_c": 2.4,
                "pressure_tendency_hpa_3h": -2.1,
                "updraft_helicity_m2_s2": 145.0,
                "vertical_velocity_ms": 18.2,
                "wind_shear_knots": 27.0,
                "reflectivity_gradient_dbz_10m": 11.5,
                "cloud_top_cooling_c_15m": -10.0
            }
        ),
        TimeFrameData(
            timestep="T+30",
            time_offset_min=30,
            display_time="14:30 IST (T+30m)",
            overall_threat_level="WARNING",
            overall_threat_code="orange",
            overall_genesis_prob=72.0,
            hazards=HazardBreakdown(
                thunderstorm_risk_pct=71.0,
                hail_risk_pct=34.0,
                cloudburst_risk_pct=49.0
            ),
            estimated_impact_countdown_min=15,
            summary_bulletin="INTENSIFICATION WARNING: Mature storm core (54 dBZ) approaching Central Delhi. Heavy rain shaft forming with elevated hail risk and high-velocity downdrafts.",
            genesis_zones=[
                GenesisZone(
                    id="gz-ncr-1",
                    name="SW NCR Genesis Corridor",
                    lat=28.590,
                    lng=77.170,
                    radius_km=10.0,
                    initiation_probability=72.0,
                    threat_level="WARNING",
                    status="MATURING CORE",
                    dominant_trigger="Deep Convective Overturning"
                )
            ],
            storm_cells=[
                StormCell(
                    id="cell-ncr-alpha",
                    name="Convective Cell Alpha",
                    lat=28.610,
                    lng=77.190,
                    intensity_dbz=54.0,
                    radius_km=11.0,
                    vertical_extent_km=11.5,
                    motion_speed_kmh=28.0,
                    motion_bearing_deg=55.0,
                    genesis_probability=72.0,
                    threat_level="WARNING",
                    phase="MATURE INTENSE",
                    trajectory=[
                        TrajectoryPoint(timestep="T0", time_offset_min=0, lat=28.520, lng=77.080, intensity_dbz=28.0, estimated_arrival_time="14:00 IST (T0)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+15", time_offset_min=15, lat=28.565, lng=77.135, intensity_dbz=42.0, estimated_arrival_time="14:15 IST (+15m)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+30", time_offset_min=30, lat=28.610, lng=77.190, intensity_dbz=54.0, estimated_arrival_time="14:30 IST (+30m)", threat_level="WARNING"),
                        TrajectoryPoint(timestep="T+45", time_offset_min=45, lat=28.655, lng=77.245, intensity_dbz=62.0, estimated_arrival_time="14:45 IST (+45m)", threat_level="SEVERE"),
                        TrajectoryPoint(timestep="T+60", time_offset_min=60, lat=28.700, lng=77.300, intensity_dbz=66.0, estimated_arrival_time="15:00 IST (+60m)", threat_level="SEVERE"),
                    ],
                    sounding={
                        "cape_j_kg": 3300.0,
                        "cin_j_kg": 8.0,
                        "lifted_index_k": -7.5,
                        "k_index": 40.0,
                        "precipitable_water_mm": 62.0,
                        "surface_temp_c": 33.2,
                        "relative_humidity_pct": 84.0,
                        "dew_point_depression_c": 1.6,
                        "pressure_tendency_hpa_3h": -2.9,
                        "updraft_helicity_m2_s2": 195.0,
                        "vertical_velocity_ms": 23.5,
                        "wind_shear_knots": 32.0,
                        "reflectivity_gradient_dbz_10m": 15.0,
                        "cloud_top_cooling_c_15m": -14.5
                    }
                )
            ],
            stations=[
                StationObservation(id="stn-1", name="IMD Safdarjung (Central)", lat=28.5830, lng=77.2060, temp_c=31.5, humidity_pct=88.0, pressure_hpa=1001.2, wind_speed_kmh=42.0, wind_dir="WNW", rain_rate_mmh=38.0, local_risk_pct=74.0, threat_level="WARNING"),
                StationObservation(id="stn-2", name="IGI Airport Met (Dwarka)", lat=28.5562, lng=77.1000, temp_c=32.0, humidity_pct=84.0, pressure_hpa=1001.8, wind_speed_kmh=35.0, wind_dir="WNW", rain_rate_mmh=22.0, local_risk_pct=68.0, threat_level="WARNING"),
                StationObservation(id="stn-3", name="Noida Sector 62 AWS", lat=28.6280, lng=77.3670, temp_c=34.0, humidity_pct=76.0, pressure_hpa=1002.5, wind_speed_kmh=25.0, wind_dir="SW", rain_rate_mmh=5.0, local_risk_pct=55.0, threat_level="WATCH"),
                StationObservation(id="stn-4", name="Gurugram CyberCity AWS", lat=28.4900, lng=77.0890, temp_c=32.2, humidity_pct=82.0, pressure_hpa=1002.0, wind_speed_kmh=26.0, wind_dir="W", rain_rate_mmh=10.0, local_risk_pct=50.0, threat_level="WATCH"),
            ],
            column_sounding={
                "cape_j_kg": 3300.0,
                "cin_j_kg": 8.0,
                "lifted_index_k": -7.5,
                "k_index": 40.0,
                "precipitable_water_mm": 62.0,
                "surface_temp_c": 33.2,
                "relative_humidity_pct": 84.0,
                "dew_point_depression_c": 1.6,
                "pressure_tendency_hpa_3h": -2.9,
                "updraft_helicity_m2_s2": 195.0,
                "vertical_velocity_ms": 23.5,
                "wind_shear_knots": 32.0,
                "reflectivity_gradient_dbz_10m": 15.0,
                "cloud_top_cooling_c_15m": -14.5
            }
        ),
        TimeFrameData(
            timestep="T+45",
            time_offset_min=45,
            display_time="14:45 IST (T+45m)",
            overall_threat_level="SEVERE",
            overall_threat_code="red",
            overall_genesis_prob=81.0,
            hazards=HazardBreakdown(
                thunderstorm_risk_pct=82.0,
                hail_risk_pct=42.0,
                cloudburst_risk_pct=63.0
            ),
            estimated_impact_countdown_min=5,
            summary_bulletin="SEVERE CLOUDBURST ALERT: Reflectivity 62 dBZ over Delhi-Noida Yamuna corridor. Intense localized precipitation rate exceeding 65 mm/hr with squall line gale force gusts.",
            genesis_zones=[
                GenesisZone(
                    id="gz-ncr-1",
                    name="SW NCR Genesis Corridor",
                    lat=28.630,
                    lng=77.220,
                    radius_km=12.0,
                    initiation_probability=81.0,
                    threat_level="SEVERE",
                    status="OVERSHOOTING BURST",
                    dominant_trigger="High TPW + Updraft Collapse"
                )
            ],
            storm_cells=[
                StormCell(
                    id="cell-ncr-alpha",
                    name="Convective Cell Alpha",
                    lat=28.655,
                    lng=77.245,
                    intensity_dbz=62.0,
                    radius_km=13.5,
                    vertical_extent_km=13.2,
                    motion_speed_kmh=28.0,
                    motion_bearing_deg=55.0,
                    genesis_probability=81.0,
                    threat_level="SEVERE",
                    phase="SEVERE CLOUDBURST",
                    trajectory=[
                        TrajectoryPoint(timestep="T0", time_offset_min=0, lat=28.520, lng=77.080, intensity_dbz=28.0, estimated_arrival_time="14:00 IST (T0)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+15", time_offset_min=15, lat=28.565, lng=77.135, intensity_dbz=42.0, estimated_arrival_time="14:15 IST (+15m)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+30", time_offset_min=30, lat=28.610, lng=77.190, intensity_dbz=54.0, estimated_arrival_time="14:30 IST (+30m)", threat_level="WARNING"),
                        TrajectoryPoint(timestep="T+45", time_offset_min=45, lat=28.655, lng=77.245, intensity_dbz=62.0, estimated_arrival_time="14:45 IST (+45m)", threat_level="SEVERE"),
                        TrajectoryPoint(timestep="T+60", time_offset_min=60, lat=28.700, lng=77.300, intensity_dbz=66.0, estimated_arrival_time="15:00 IST (+60m)", threat_level="SEVERE"),
                    ],
                    sounding={
                        "cape_j_kg": 3600.0,
                        "cin_j_kg": 4.0,
                        "lifted_index_k": -8.4,
                        "k_index": 42.0,
                        "precipitable_water_mm": 67.0,
                        "surface_temp_c": 31.8,
                        "relative_humidity_pct": 89.0,
                        "dew_point_depression_c": 1.1,
                        "pressure_tendency_hpa_3h": -3.6,
                        "updraft_helicity_m2_s2": 230.0,
                        "vertical_velocity_ms": 27.0,
                        "wind_shear_knots": 36.0,
                        "reflectivity_gradient_dbz_10m": 17.5,
                        "cloud_top_cooling_c_15m": -18.0
                    }
                )
            ],
            stations=[
                StationObservation(id="stn-1", name="IMD Safdarjung (Central)", lat=28.5830, lng=77.2060, temp_c=29.8, humidity_pct=92.0, pressure_hpa=999.8, wind_speed_kmh=55.0, wind_dir="NW", rain_rate_mmh=62.0, local_risk_pct=84.0, threat_level="SEVERE"),
                StationObservation(id="stn-2", name="IGI Airport Met (Dwarka)", lat=28.5562, lng=77.1000, temp_c=30.5, humidity_pct=88.0, pressure_hpa=1000.5, wind_speed_kmh=38.0, wind_dir="W", rain_rate_mmh=28.0, local_risk_pct=70.0, threat_level="WARNING"),
                StationObservation(id="stn-3", name="Noida Sector 62 AWS", lat=28.6280, lng=77.3670, temp_c=30.2, humidity_pct=90.0, pressure_hpa=1000.0, wind_speed_kmh=48.0, wind_dir="NW", rain_rate_mmh=54.0, local_risk_pct=82.0, threat_level="SEVERE"),
                StationObservation(id="stn-4", name="Gurugram CyberCity AWS", lat=28.4900, lng=77.0890, temp_c=31.0, humidity_pct=85.0, pressure_hpa=1001.2, wind_speed_kmh=25.0, wind_dir="W", rain_rate_mmh=15.0, local_risk_pct=55.0, threat_level="WATCH"),
            ],
            column_sounding={
                "cape_j_kg": 3600.0,
                "cin_j_kg": 4.0,
                "lifted_index_k": -8.4,
                "k_index": 42.0,
                "precipitable_water_mm": 67.0,
                "surface_temp_c": 31.8,
                "relative_humidity_pct": 89.0,
                "dew_point_depression_c": 1.1,
                "pressure_tendency_hpa_3h": -3.6,
                "updraft_helicity_m2_s2": 230.0,
                "vertical_velocity_ms": 27.0,
                "wind_shear_knots": 36.0,
                "reflectivity_gradient_dbz_10m": 17.5,
                "cloud_top_cooling_c_15m": -18.0
            }
        ),
        TimeFrameData(
            timestep="T+60",
            time_offset_min=60,
            display_time="15:00 IST (T+60m)",
            overall_threat_level="SEVERE",
            overall_threat_code="red",
            overall_genesis_prob=88.0,
            hazards=HazardBreakdown(
                thunderstorm_risk_pct=89.0,
                hail_risk_pct=54.0,
                cloudburst_risk_pct=76.0
            ),
            estimated_impact_countdown_min=0,
            summary_bulletin="EMERGENCY ACTION LEVEL: Torrential downburst (>85 mm/hr) active across East Delhi-Ghaziabad-Noida. Severe urban flash flood inundation and power line disruption.",
            genesis_zones=[
                GenesisZone(
                    id="gz-ncr-1",
                    name="SW NCR Genesis Corridor",
                    lat=28.680,
                    lng=77.280,
                    radius_km=15.0,
                    initiation_probability=88.0,
                    threat_level="SEVERE",
                    status="PEAK IMPACT",
                    dominant_trigger="Full Atmospheric Convective Discharge"
                )
            ],
            storm_cells=[
                StormCell(
                    id="cell-ncr-alpha",
                    name="Convective Cell Alpha",
                    lat=28.700,
                    lng=77.300,
                    intensity_dbz=66.0,
                    radius_km=15.0,
                    vertical_extent_km=14.5,
                    motion_speed_kmh=28.0,
                    motion_bearing_deg=55.0,
                    genesis_probability=88.0,
                    threat_level="SEVERE",
                    phase="EXTREME PEAK IMPACT",
                    trajectory=[
                        TrajectoryPoint(timestep="T0", time_offset_min=0, lat=28.520, lng=77.080, intensity_dbz=28.0, estimated_arrival_time="14:00 IST (T0)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+15", time_offset_min=15, lat=28.565, lng=77.135, intensity_dbz=42.0, estimated_arrival_time="14:15 IST (+15m)", threat_level="WATCH"),
                        TrajectoryPoint(timestep="T+30", time_offset_min=30, lat=28.610, lng=77.190, intensity_dbz=54.0, estimated_arrival_time="14:30 IST (+30m)", threat_level="WARNING"),
                        TrajectoryPoint(timestep="T+45", time_offset_min=45, lat=28.655, lng=77.245, intensity_dbz=62.0, estimated_arrival_time="14:45 IST (+45m)", threat_level="SEVERE"),
                        TrajectoryPoint(timestep="T+60", time_offset_min=60, lat=28.700, lng=77.300, intensity_dbz=66.0, estimated_arrival_time="15:00 IST (+60m)", threat_level="SEVERE"),
                    ],
                    sounding={
                        "cape_j_kg": 3750.0,
                        "cin_j_kg": 2.0,
                        "lifted_index_k": -8.9,
                        "k_index": 44.0,
                        "precipitable_water_mm": 71.0,
                        "surface_temp_c": 30.5,
                        "relative_humidity_pct": 93.0,
                        "dew_point_depression_c": 0.8,
                        "pressure_tendency_hpa_3h": -4.2,
                        "updraft_helicity_m2_s2": 255.0,
                        "vertical_velocity_ms": 29.5,
                        "wind_shear_knots": 39.0,
                        "reflectivity_gradient_dbz_10m": 19.0,
                        "cloud_top_cooling_c_15m": -20.5
                    }
                )
            ],
            stations=[
                StationObservation(id="stn-1", name="IMD Safdarjung (Central)", lat=28.5830, lng=77.2060, temp_c=28.5, humidity_pct=94.0, pressure_hpa=998.5, wind_speed_kmh=45.0, wind_dir="NW", rain_rate_mmh=75.0, local_risk_pct=88.0, threat_level="SEVERE"),
                StationObservation(id="stn-2", name="IGI Airport Met (Dwarka)", lat=28.5562, lng=77.1000, temp_c=29.2, humidity_pct=91.0, pressure_hpa=999.0, wind_speed_kmh=30.0, wind_dir="WNW", rain_rate_mmh=35.0, local_risk_pct=72.0, threat_level="WARNING"),
                StationObservation(id="stn-3", name="Noida Sector 62 AWS", lat=28.6280, lng=77.3670, temp_c=28.0, humidity_pct=95.0, pressure_hpa=997.8, wind_speed_kmh=58.0, wind_dir="NW", rain_rate_mmh=88.0, local_risk_pct=92.0, threat_level="SEVERE"),
                StationObservation(id="stn-4", name="Gurugram CyberCity AWS", lat=28.4900, lng=77.0890, temp_c=30.0, humidity_pct=88.0, pressure_hpa=1000.0, wind_speed_kmh=22.0, wind_dir="W", rain_rate_mmh=18.0, local_risk_pct=60.0, threat_level="WATCH"),
            ],
            column_sounding={
                "cape_j_kg": 3750.0,
                "cin_j_kg": 2.0,
                "lifted_index_k": -8.9,
                "k_index": 44.0,
                "precipitable_water_mm": 71.0,
                "surface_temp_c": 30.5,
                "relative_humidity_pct": 93.0,
                "dew_point_depression_c": 0.8,
                "pressure_tendency_hpa_3h": -4.2,
                "updraft_helicity_m2_s2": 255.0,
                "vertical_velocity_ms": 29.5,
                "wind_shear_knots": 39.0,
                "reflectivity_gradient_dbz_10m": 19.0,
                "cloud_top_cooling_c_15m": -20.5
            }
        ),
    ]
    return frames

class WeatherService:
    def __init__(self):
        pass

    def get_scenarios(self) -> List[ScenarioMetadata]:
        return get_all_scenarios()

    def get_scenario(self, scenario_id: str) -> Optional[ScenarioMetadata]:
        return get_scenario_by_id(scenario_id)

    def get_timeline(self, scenario_id: str) -> List[TimeFrameData]:
        return build_ncr_cloudburst_timeline()

    def get_frame(self, scenario_id: str, timestep: str) -> TimeFrameData:
        tl = self.get_timeline(scenario_id)
        for f in tl:
            if f.timestep == timestep:
                return f
        return tl[0]

    def get_current_frame(self, scenario_id: str, timestep: str) -> TimeFrameData:
        return self.get_frame(scenario_id, timestep)

weather_service = WeatherService()

export interface HazardBreakdown {
  thunderstorm_risk_pct: number;
  hail_risk_pct: number;
  cloudburst_risk_pct: number;
}

export interface XaiFactor {
  feature_key: string;
  feature_name: string;
  value: number;
  unit: string;
  importance_pct: number;
  contribution_score: number;
}

export interface TrajectoryPoint {
  timestep: string;
  time_offset_min: number;
  lat: number;
  lng: number;
  intensity_dbz: number;
  estimated_arrival_time: string;
  threat_level: string;
}

export interface StormCell {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity_dbz: number;
  radius_km: number;
  vertical_extent_km: number;
  motion_speed_kmh: number;
  motion_bearing_deg: number;
  genesis_probability: number;
  threat_level: string;
  phase: string;
  trajectory: TrajectoryPoint[];
  sounding: Record<string, number>;
}

export interface GenesisZone {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radius_km: number;
  initiation_probability: number;
  threat_level: string;
  status: string;
  dominant_trigger: string;
}

export interface StationObservation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp_c: number;
  humidity_pct: number;
  pressure_hpa: number;
  wind_speed_kmh: number;
  wind_dir: string;
  rain_rate_mmh: number;
  local_risk_pct: number;
  threat_level: string;
}

export interface TimeFrameData {
  timestep: string;
  time_offset_min: number;
  display_time: string;
  overall_threat_level: 'LOW' | 'WATCH' | 'WARNING' | 'SEVERE';
  overall_threat_code: 'green' | 'yellow' | 'orange' | 'red';
  overall_genesis_prob: number;
  hazards: HazardBreakdown;
  estimated_impact_countdown_min: number;
  summary_bulletin: string;
  genesis_zones: GenesisZone[];
  storm_cells: StormCell[];
  stations: StationObservation[];
  column_sounding: Record<string, number>;
}

export interface ScenarioMetadata {
  id: string;
  title: string;
  region_name: string;
  description: string;
  center_lat: number;
  center_lng: number;
  default_zoom: number;
  severity_type: string;
  total_timesteps: number;
}

export interface GenesisPredictionResponse {
  convective_genesis_probability: number;
  threat_level: string;
  threat_code: string;
  status_text: string;
  hazards: HazardBreakdown;
  contributing_factors: XaiFactor[];
  meteorological_reasoning: string;
  input_parameters: Record<string, number>;
}

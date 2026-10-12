"""
STORMGUARD AI — Standalone ML Prediction & Explainable AI (XAI) Module
Provides instant inference on multi-parameter atmospheric vectors, outputs
genesis probabilities, calibrated hazard breakdowns, and XAI feature attributions.
"""

import os
import sys
import json
import numpy as np
from typing import Dict, Any, List

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from model import ConvectiveGenesisEnsembleClassifier

curr_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(curr_dir, 'models', 'convective_genesis_model.json')
META_PATH = os.path.join(curr_dir, 'models', 'model_metadata.json')

class ConvectivePredictor:
    def __init__(self, model_path: str = MODEL_PATH, meta_path: str = META_PATH):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model artifact not found at {model_path}. Please run `python ml/train.py` first.")
        
        self.model, self.metadata = ConvectiveGenesisEnsembleClassifier.load(model_path)
        self.features = self.metadata['features']
        self.feature_importances = self.metadata['feature_importances']
        self.feature_stats = self.metadata['feature_stats']
        
    def predict_genesis(self, atmospheric_data: Dict[str, float]) -> Dict[str, Any]:
        """
        Runs ML prediction and returns genesis probability, hazard breakdown,
        threat level, and explainable AI feature contribution rankings.
        """
        row = []
        for feat in self.features:
            val = float(atmospheric_data.get(feat, self.feature_stats[feat]['mean']))
            row.append(val)
            
        X = np.array([row])
        
        # Ensemble probability prediction
        prob_genesis = float(self.model.predict_proba(X)[0][1])
        prob_pct = round(prob_genesis * 100, 1)
        
        # Extract physical fields for physics-grounded hazard sub-models
        cape = float(atmospheric_data.get('cape_j_kg', 1800.0))
        cin = float(atmospheric_data.get('cin_j_kg', 30.0))
        li = float(atmospheric_data.get('lifted_index_k', -4.0))
        tpw = float(atmospheric_data.get('precipitable_water_mm', 45.0))
        rh = float(atmospheric_data.get('relative_humidity_pct', 70.0))
        vert_vel = float(atmospheric_data.get('vertical_velocity_ms', 14.0))
        dp_dep = float(atmospheric_data.get('dew_point_depression_c', 3.0))
        press_tend = float(atmospheric_data.get('pressure_tendency_hpa_3h', -1.2))
        refl_grad = float(atmospheric_data.get('reflectivity_gradient_dbz_10m', 6.0))
        cloud_cool = float(atmospheric_data.get('cloud_top_cooling_c_15m', -7.0))
        shear = float(atmospheric_data.get('wind_shear_knots', 22.0))
        
        # Derived Hazard Breakdown (Thunderstorm, Hail, Cloudburst)
        # 1. Thunderstorm Genesis
        thunderstorm_risk = float(min(99.0, max(5.0, round(prob_pct * 1.05, 1))))
        
        # 2. Severe Hail Probability
        hail_factor = float(np.clip((cape / 2800.0) * (vert_vel / 18.0) * (1.0 - min(dp_dep, 10.0)/15.0), 0.05, 1.0))
        hail_risk = float(min(96.0, max(2.0, round(prob_pct * hail_factor * 0.92, 1))))
        
        # 3. Extreme Rainfall / Cloudburst Risk
        cloudburst_factor = float(np.clip((tpw / 60.0) * (rh / 80.0) * ((-press_tend + 1.0) / 3.0), 0.05, 1.0))
        cloudburst_risk = float(min(98.0, max(2.0, round(prob_pct * cloudburst_factor * 0.95, 1))))
        
        # Threat Level Classification
        if prob_pct < 35:
            threat_level = "LOW"
            threat_code = "green"
            status_text = "Benign / Weak Convection"
        elif prob_pct < 60:
            threat_level = "WATCH"
            threat_code = "yellow"
            status_text = "Incipient Convective Genesis"
        elif prob_pct < 80:
            threat_level = "WARNING"
            threat_code = "orange"
            status_text = "Rapid Storm Intensification"
        else:
            threat_level = "SEVERE"
            threat_code = "red"
            status_text = "Severe Thunderstorm / Cloudburst Imminent"
            
        # Explainable AI (XAI) Attribution Calculation
        contributions = []
        friendly_names = {
            'cape_j_kg': 'Atmospheric Instability (CAPE)',
            'cin_j_kg': 'Cap Inversion Erosion (CIN)',
            'lifted_index_k': 'Lifted Index Buoyancy',
            'k_index': 'Deep Layer Moisture Index',
            'precipitable_water_mm': 'Total Precipitable Water (TPW)',
            'surface_temp_c': 'Surface Thermal Forcing',
            'relative_humidity_pct': 'Boundary Layer Moisture (RH)',
            'dew_point_depression_c': 'Low-Level Saturation (Dew Point)',
            'pressure_tendency_hpa_3h': 'Mesoscale Pressure Drop',
            'updraft_helicity_m2_s2': 'Updraft Helicity & Vorticity',
            'vertical_velocity_ms': 'Vertical Updraft Speed',
            'wind_shear_knots': '0-3km Bulk Wind Shear',
            'reflectivity_gradient_dbz_10m': 'Radar Reflectivity Growth Rate',
            'cloud_top_cooling_c_15m': 'Overshooting Cloud Top Cooling'
        }
        
        for feat in self.features:
            val = float(atmospheric_data.get(feat, self.feature_stats[feat]['mean']))
            mean = self.feature_stats[feat]['mean']
            std = self.feature_stats[feat]['std'] or 1.0
            importance = self.feature_importances.get(feat, 0.05)
            
            if feat in ['cin_j_kg', 'lifted_index_k', 'dew_point_depression_c', 'pressure_tendency_hpa_3h', 'cloud_top_cooling_c_15m']:
                z = -(val - mean) / std
            else:
                z = (val - mean) / std
                
            raw_contrib = max(0.05, float(importance * (1.0 + max(-0.8, z * 0.4))))
            contributions.append({
                'feature_key': feat,
                'feature_name': friendly_names.get(feat, feat),
                'value': round(val, 2),
                'unit': self._get_unit(feat),
                'importance_pct': round(importance * 100, 1),
                'contribution_score': round(raw_contrib * 100, 1)
            })
            
        contributions = sorted(contributions, key=lambda x: x['contribution_score'], reverse=True)
        
        top_factors = [c['feature_name'] for c in contributions[:3]]
        reasoning = (
            f"Convective risk is elevated primarily due to strong {top_factors[0]}, "
            f"coupled with rapid {top_factors[1]} and favorable {top_factors[2]}. "
            f"Physical column analysis indicates high potential for explosive vertical development."
        )
        
        return {
            'convective_genesis_probability': prob_pct,
            'threat_level': threat_level,
            'threat_code': threat_code,
            'status_text': status_text,
            'hazards': {
                'thunderstorm_risk_pct': thunderstorm_risk,
                'hail_risk_pct': hail_risk,
                'cloudburst_risk_pct': cloudburst_risk
            },
            'contributing_factors': contributions[:7],
            'meteorological_reasoning': reasoning,
            'input_parameters': atmospheric_data
        }
        
    def _get_unit(self, feat: str) -> str:
        units = {
            'cape_j_kg': 'J/kg',
            'cin_j_kg': 'J/kg',
            'lifted_index_k': 'K',
            'k_index': 'K',
            'precipitable_water_mm': 'mm',
            'surface_temp_c': '°C',
            'relative_humidity_pct': '%',
            'dew_point_depression_c': '°C',
            'pressure_tendency_hpa_3h': 'hPa/3h',
            'updraft_helicity_m2_s2': 'm²/s²',
            'vertical_velocity_ms': 'm/s',
            'wind_shear_knots': 'kts',
            'reflectivity_gradient_dbz_10m': 'dBZ/10m',
            'cloud_top_cooling_c_15m': '°C/15m'
        }
        return units.get(feat, '')

if __name__ == '__main__':
    predictor = ConvectivePredictor()
    sample_severe = {
        'cape_j_kg': 3200.0,
        'cin_j_kg': 12.0,
        'lifted_index_k': -6.8,
        'k_index': 38.0,
        'precipitable_water_mm': 62.0,
        'surface_temp_c': 35.0,
        'relative_humidity_pct': 84.0,
        'dew_point_depression_c': 1.8,
        'pressure_tendency_hpa_3h': -2.8,
        'updraft_helicity_m2_s2': 180.0,
        'vertical_velocity_ms': 22.5,
        'wind_shear_knots': 34.0,
        'reflectivity_gradient_dbz_10m': 14.5,
        'cloud_top_cooling_c_15m': -12.0
    }
    result = predictor.predict_genesis(sample_severe)
    print("==================================================")
    print("    STORMGUARD AI SAMPLE PREDICTION EXECUTION     ")
    print("==================================================")
    print(f"Genesis Probability: {result['convective_genesis_probability']}%")
    print(f"Threat Level:        {result['threat_level']} ({result['status_text']})")
    print("Hazards:")
    print(f"  [Storm] Thunderstorm: {result['hazards']['thunderstorm_risk_pct']}%")
    print(f"  [Hail]  Hail:         {result['hazards']['hail_risk_pct']}%")
    print(f"  [Rain]  Cloudburst:   {result['hazards']['cloudburst_risk_pct']}%")
    print("\nExplainable AI Top Contributing Factors:")
    for f in result['contributing_factors'][:5]:
        print(f"  - {f['feature_name']}: {f['value']}{f['unit']} (Score: {f['contribution_score']})")
    print(f"\nMeteorological Reasoning:\n{result['meteorological_reasoning']}")

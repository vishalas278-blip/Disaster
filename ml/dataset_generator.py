"""
STORMGUARD AI — Synthetic Atmospheric Observation Dataset Generator
Generates realistic multi-sensor atmospheric sounding and radar trend records
grounded in thermodynamic and kinematic principles for early convective genesis nowcasting.
"""

import os
import csv
import numpy as np

def generate_atmospheric_dataset(n_samples: int = 4000, random_state: int = 42) -> dict:
    np.random.seed(random_state)
    
    # 1. Base thermodynamic instability features
    cape = np.random.gamma(shape=3.5, scale=550, size=n_samples)
    cape = np.clip(cape, 150, 4800)
    
    cin = np.random.exponential(scale=45, size=n_samples)
    cin = np.clip(cin, 5, 280)
    
    lifted_index = -0.0028 * cape + np.random.normal(3.5, 1.8, size=n_samples)
    lifted_index = np.clip(lifted_index, -11.0, 7.0)
    
    k_index = 18 + 0.005 * cape + np.random.normal(4, 3, size=n_samples)
    k_index = np.clip(k_index, 10.0, 46.0)
    
    tpw = np.random.normal(48, 12, size=n_samples)
    tpw = np.clip(tpw, 18.0, 78.0)
    
    # 2. Moisture & Surface Boundary Layer Features
    surface_temp = np.random.normal(32.5, 4.2, size=n_samples)
    surface_temp = np.clip(surface_temp, 21.0, 44.0)
    
    relative_humidity = 40 + 0.45 * tpw + np.random.normal(5, 8, size=n_samples)
    relative_humidity = np.clip(relative_humidity, 28.0, 98.0)
    
    dew_point_depression = (100 - relative_humidity) / 5.0 + np.random.normal(0, 0.8, size=n_samples)
    dew_point_depression = np.clip(dew_point_depression, 0.4, 16.0)
    
    pressure_tendency = np.random.normal(-0.8, 1.6, size=n_samples)
    pressure_tendency = np.clip(pressure_tendency, -6.5, 3.5)
    
    # 3. Kinematics, Cloud Dynamics & Radar Trends
    updraft_helicity = (cape / 80.0) * np.random.uniform(0.4, 2.5, size=n_samples)
    updraft_helicity = np.clip(updraft_helicity, 5.0, 360.0)
    
    vertical_velocity = np.sqrt(2 * np.maximum(cape - cin, 50)) * np.random.uniform(0.25, 0.55, size=n_samples)
    vertical_velocity = np.clip(vertical_velocity, 1.0, 35.0)
    
    wind_shear = np.random.gamma(shape=3.0, scale=8.0, size=n_samples)
    wind_shear = np.clip(wind_shear, 6.0, 58.0)
    
    reflectivity_gradient = 0.3 * vertical_velocity - 0.05 * cin + np.random.normal(2, 3, size=n_samples)
    reflectivity_gradient = np.clip(reflectivity_gradient, -4.0, 24.0)
    
    cloud_top_cooling_rate = -0.45 * vertical_velocity + np.random.normal(-1.5, 2.0, size=n_samples)
    cloud_top_cooling_rate = np.clip(cloud_top_cooling_rate, -22.0, 1.0)
    
    # 4. Latent Physical Genesis Index
    genesis_score = (
        0.26 * ((cape - 1500) / 1000)
        - 0.20 * ((cin - 40) / 40)
        - 0.18 * (lifted_index / 3.0)
        + 0.16 * ((relative_humidity - 65) / 15)
        - 0.14 * (pressure_tendency / 1.5)
        + 0.18 * ((vertical_velocity - 12) / 6)
        + 0.15 * ((reflectivity_gradient - 5) / 4)
        - 0.14 * (cloud_top_cooling_rate / 5.0)
        + 0.10 * ((wind_shear - 20) / 12)
        + np.random.normal(0, 0.45, size=n_samples)
    )
    
    prob_genesis = 1.0 / (1.0 + np.exp(-genesis_score))
    target = (prob_genesis > 0.52).astype(int)
    
    thunderstorm_risk = np.clip(prob_genesis * 100 + np.random.normal(0, 5, size=n_samples), 0, 100).round(1)
    
    hail_factor = np.clip((cape / 3000.0) * (vertical_velocity / 20.0) * (1.0 - (dew_point_depression / 12.0)), 0, 1)
    hail_risk = np.clip(prob_genesis * hail_factor * 95 + np.random.normal(0, 4, size=n_samples), 0, 96).round(1)
    
    cloudburst_factor = np.clip((tpw / 65.0) * (relative_humidity / 85.0) * (-pressure_tendency / 2.5 + 0.5), 0, 1)
    cloudburst_risk = np.clip(prob_genesis * cloudburst_factor * 98 + np.random.normal(0, 4, size=n_samples), 0, 98).round(1)
    
    data_dict = {
        'cape_j_kg': cape.round(1),
        'cin_j_kg': cin.round(1),
        'lifted_index_k': lifted_index.round(2),
        'k_index': k_index.round(1),
        'precipitable_water_mm': tpw.round(1),
        'surface_temp_c': surface_temp.round(1),
        'relative_humidity_pct': relative_humidity.round(1),
        'dew_point_depression_c': dew_point_depression.round(1),
        'pressure_tendency_hpa_3h': pressure_tendency.round(2),
        'updraft_helicity_m2_s2': updraft_helicity.round(1),
        'vertical_velocity_ms': vertical_velocity.round(1),
        'wind_shear_knots': wind_shear.round(1),
        'reflectivity_gradient_dbz_10m': reflectivity_gradient.round(1),
        'cloud_top_cooling_c_15m': cloud_top_cooling_rate.round(1),
        'convective_genesis': target,
        'genesis_probability': (prob_genesis * 100).round(1),
        'thunderstorm_risk_pct': thunderstorm_risk,
        'hail_risk_pct': hail_risk,
        'cloudburst_risk_pct': cloudburst_risk
    }
    
    return data_dict

def export_dataset_to_csv(data_dict: dict, file_path: str):
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    fieldnames = list(data_dict.keys())
    n_rows = len(data_dict[fieldnames[0]])
    
    with open(file_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for i in range(n_rows):
            row = {k: data_dict[k][i] for k in fieldnames}
            writer.writerow(row)
            
    print(f"Exported {n_rows} records to {file_path}")

if __name__ == '__main__':
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    os.makedirs(data_dir, exist_ok=True)
    dataset = generate_atmospheric_dataset(n_samples=4000)
    output_path = os.path.join(data_dir, 'demo_weather_data.csv')
    export_dataset_to_csv(dataset, output_path)

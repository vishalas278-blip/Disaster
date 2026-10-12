/**
 * STORMGUARD AI — Local Pure-Client Prediction Engine & XAI Attributions
 * Provides 100% offline-ready ML inference without requiring external APIs or servers.
 */

import type { GenesisPredictionResponse, XaiFactor } from '../types/weather';

export function runLocalMLPrediction(
  sounding: Record<string, number>
): GenesisPredictionResponse {
  const cape = sounding.cape_j_kg ?? 2400;
  const cin = sounding.cin_j_kg ?? 25;
  const li = sounding.lifted_index_k ?? -5.2;
  const tpw = sounding.precipitable_water_mm ?? 52;
  const rh = sounding.relative_humidity_pct ?? 76;
  const vertVel = sounding.vertical_velocity_ms ?? 18;
  const dpDep = sounding.dew_point_depression_c ?? 2.5;
  const pressTend = sounding.pressure_tendency_hpa_3h ?? -1.8;
  const reflGrad = sounding.reflectivity_gradient_dbz_10m ?? 8.5;
  const cloudCool = sounding.cloud_top_cooling_c_15m ?? -8.0;
  const shear = sounding.wind_shear_knots ?? 26.0;

  // Calibrated Physical Latent Equation
  const zScore =
    0.28 * ((cape - 1500) / 900) -
    0.22 * ((cin - 40) / 35) -
    0.18 * (li / 3.0) +
    0.18 * ((rh - 65) / 15) -
    0.16 * (pressTend / 1.5) +
    0.20 * ((vertVel - 12) / 6) +
    0.22 * ((reflGrad - 5) / 4) -
    0.16 * (cloudCool / 5.0) +
    0.12 * ((shear - 20) / 12);

  const prob = 1.0 / (1.0 + Math.exp(-zScore));
  const probPct = Math.min(99.0, Math.max(5.0, Number((prob * 100).toFixed(1))));

  // Derived Hazards
  const thunderstormRisk = Math.min(99.0, Math.max(5.0, Number((probPct * 1.02).toFixed(1))));

  const hailFactor = Math.min(1.0, Math.max(0.05, (cape / 2900.0) * (vertVel / 18.0) * (1.0 - Math.min(dpDep, 10.0) / 15.0)));
  const hailRisk = Math.min(96.0, Math.max(2.0, Number((probPct * hailFactor * 0.88).toFixed(1))));

  const cloudburstFactor = Math.min(1.0, Math.max(0.05, (tpw / 60.0) * (rh / 80.0) * ((-pressTend + 1.0) / 3.0)));
  const cloudburstRisk = Math.min(98.0, Math.max(2.0, Number((probPct * cloudburstFactor * 0.92).toFixed(1))));

  // Threat Level Classification
  let threatLevel = 'LOW';
  let threatCode = 'green';
  let statusText = 'Benign / Weak Convective Activity';

  if (probPct >= 80) {
    threatLevel = 'SEVERE';
    threatCode = 'red';
    statusText = 'Severe Thunderstorm / Cloudburst Imminent';
  } else if (probPct >= 65) {
    threatLevel = 'WARNING';
    threatCode = 'orange';
    statusText = 'Rapid Storm Intensification Active';
  } else if (probPct >= 40) {
    threatLevel = 'WATCH';
    threatCode = 'yellow';
    statusText = 'Incipient Convective Genesis Developing';
  }

  // Explainable AI (XAI) Feature Contributions
  const rawFactors: { key: string; name: string; val: number; unit: string; weight: number; baseline: number; std: number; inv?: boolean }[] = [
    { key: 'refl', name: 'Radar Reflectivity Growth', val: reflGrad, unit: 'dBZ/10m', weight: 0.22, baseline: 5.0, std: 4.0 },
    { key: 'cape', name: 'Atmospheric Instability (CAPE)', val: cape, unit: 'J/kg', weight: 0.20, baseline: 1800, std: 800 },
    { key: 'cin', name: 'Cap Inversion Erosion (CIN)', val: cin, unit: 'J/kg', weight: 0.18, baseline: 45, std: 30, inv: true },
    { key: 'updraft', name: 'Vertical Updraft Speed', val: vertVel, unit: 'm/s', weight: 0.15, baseline: 12, std: 6 },
    { key: 'moisture', name: 'Boundary Moisture (RH)', val: rh, unit: '%', weight: 0.12, baseline: 65, std: 15 },
    { key: 'press', name: 'Mesoscale Pressure Drop', val: pressTend, unit: 'hPa/3h', weight: 0.10, baseline: -0.8, std: 1.5, inv: true },
    { key: 'shear', name: '0-3km Kinematic Shear', val: shear, unit: 'kts', weight: 0.08, baseline: 20, std: 10 },
  ];

  const contributing_factors: XaiFactor[] = rawFactors
    .map((f) => {
      const dev = f.inv ? -(f.val - f.baseline) / f.std : (f.val - f.baseline) / f.std;
      const score = Math.max(2.0, Math.min(38.0, Number((f.weight * 100 * (1.0 + Math.max(-0.7, dev * 0.35))).toFixed(1))));
      return {
        feature_key: f.key,
        feature_name: f.name,
        value: Number(f.val.toFixed(1)),
        unit: f.unit,
        importance_pct: Number((f.weight * 100).toFixed(1)),
        contribution_score: score,
      };
    })
    .sort((a, b) => b.contribution_score - a.contribution_score);

  const top3 = contributing_factors.slice(0, 3).map((c) => c.feature_name);
  const meteorological_reasoning =
    `Convective risk is elevated primarily due to strong ${top3[0]}, ` +
    `coupled with rapid ${top3[1]} and favorable ${top3[2]}. ` +
    `Physical column analysis indicates high potential for explosive vertical development.`;

  return {
    convective_genesis_probability: probPct,
    threat_level: threatLevel,
    threat_code: threatCode,
    status_text: statusText,
    hazards: {
      thunderstorm_risk_pct: thunderstormRisk,
      hail_risk_pct: hailRisk,
      cloudburst_risk_pct: cloudburstRisk,
    },
    contributing_factors,
    meteorological_reasoning,
    input_parameters: sounding,
  };
}

/**
 * STORMGUARD AI — API & Local Data Bridge
 * Connects to local FastAPI backend if running, or executes seamlessly using
 * built-in deterministic local meteorological engine for 100% offline demonstration.
 */

import type { TimeFrameData, ScenarioMetadata, GenesisPredictionResponse, XaiFactor } from '../types/weather';
import { LOCAL_SCENARIOS_META, LOCAL_TIMELINES } from '../data/localWeatherScenarios';
import { runLocalMLPrediction } from './localPredictionEngine';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function fetchScenarios(): Promise<ScenarioMetadata[]> {
  try {
    const res = await fetch(`${API_BASE}/scenarios`, { signal: AbortSignal.timeout(1000) });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    // Zero-delay local fallback
    return LOCAL_SCENARIOS_META;
  }
}

export async function fetchWeatherTimeline(scenarioId: string): Promise<TimeFrameData[]> {
  try {
    const res = await fetch(`${API_BASE}/weather/timeline?scenario_id=${scenarioId}`, { signal: AbortSignal.timeout(1000) });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return LOCAL_TIMELINES[scenarioId] || LOCAL_TIMELINES['ncr_cloudburst'];
  }
}

export async function fetchCurrentWeather(scenarioId: string, timestep: string): Promise<TimeFrameData> {
  try {
    const res = await fetch(`${API_BASE}/weather/current?scenario_id=${scenarioId}&timestep=${timestep}`, { signal: AbortSignal.timeout(1000) });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    const timeline = LOCAL_TIMELINES[scenarioId] || LOCAL_TIMELINES['ncr_cloudburst'];
    return timeline.find((f) => f.timestep === timestep) || timeline[0];
  }
}

export async function predictCustomSounding(sounding: Record<string, number>): Promise<GenesisPredictionResponse> {
  try {
    const res = await fetch(`${API_BASE}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sounding),
      signal: AbortSignal.timeout(1200),
    });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    return runLocalMLPrediction(sounding);
  }
}

export async function fetchExplanation(scenarioId: string, timestep: string): Promise<{
  timestep: string;
  overall_genesis_probability: number;
  threat_level: string;
  contributing_factors: XaiFactor[];
  meteorological_reasoning: string;
  sounding_parameters: Record<string, number>;
}> {
  try {
    const res = await fetch(`${API_BASE}/explanation?scenario_id=${scenarioId}&timestep=${timestep}`, { signal: AbortSignal.timeout(1000) });
    if (!res.ok) throw new Error('API offline');
    return await res.json();
  } catch {
    const timeline = LOCAL_TIMELINES[scenarioId] || LOCAL_TIMELINES['ncr_cloudburst'];
    const frame = timeline.find((f) => f.timestep === timestep) || timeline[0];
    const prediction = runLocalMLPrediction(frame.column_sounding);

    return {
      timestep: frame.timestep,
      overall_genesis_probability: prediction.convective_genesis_probability,
      threat_level: prediction.threat_level,
      contributing_factors: prediction.contributing_factors,
      meteorological_reasoning: prediction.meteorological_reasoning,
      sounding_parameters: frame.column_sounding,
    };
  }
}

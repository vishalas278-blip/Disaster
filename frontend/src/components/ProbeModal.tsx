import React, { useState } from 'react';
import { X, Sparkles, Sliders, RefreshCw } from 'lucide-react';
import { predictCustomSounding } from '../services/api';
import type { GenesisPredictionResponse } from '../types/weather';

interface ProbeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSounding?: Record<string, number>;
  probeCoords?: { lat: number; lng: number } | null;
}

export const ProbeModal: React.FC<ProbeModalProps> = ({
  isOpen,
  onClose,
  initialSounding,
  probeCoords,
}) => {
  const [sounding, setSounding] = useState<Record<string, number>>(
    initialSounding || {
      cape_j_kg: 2800,
      cin_j_kg: 20,
      lifted_index_k: -6.0,
      k_index: 36,
      precipitable_water_mm: 55,
      surface_temp_c: 34,
      relative_humidity_pct: 78,
      dew_point_depression_c: 2.2,
      pressure_tendency_hpa_3h: -2.0,
      updraft_helicity_m2_s2: 150,
      vertical_velocity_ms: 19,
      wind_shear_knots: 28,
      reflectivity_gradient_dbz_10m: 10,
      cloud_top_cooling_c_15m: -9.5,
    }
  );

  const [prediction, setPrediction] = useState<GenesisPredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (initialSounding) {
      setSounding(initialSounding);
    }
  }, [initialSounding]);

  const handleRunInference = async () => {
    setLoading(true);
    try {
      const res = await predictCustomSounding(sounding);
      setPrediction(res);
    } catch (e) {
      console.error('Probe prediction failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key: string, val: number) => {
    setSounding((prev) => ({ ...prev, [key]: val }));
  };

  const presetSevere = () => {
    setSounding({
      cape_j_kg: 3600,
      cin_j_kg: 5,
      lifted_index_k: -8.5,
      k_index: 42,
      precipitable_water_mm: 68,
      surface_temp_c: 35.5,
      relative_humidity_pct: 88,
      dew_point_depression_c: 1.2,
      pressure_tendency_hpa_3h: -3.5,
      updraft_helicity_m2_s2: 240,
      vertical_velocity_ms: 28,
      wind_shear_knots: 38,
      reflectivity_gradient_dbz_10m: 18,
      cloud_top_cooling_c_15m: -18,
    });
  };

  const presetBenign = () => {
    setSounding({
      cape_j_kg: 850,
      cin_j_kg: 120,
      lifted_index_k: 1.5,
      k_index: 20,
      precipitable_water_mm: 38,
      surface_temp_c: 28,
      relative_humidity_pct: 55,
      dew_point_depression_c: 6.5,
      pressure_tendency_hpa_3h: 0.8,
      updraft_helicity_m2_s2: 15,
      vertical_velocity_ms: 3.5,
      wind_shear_knots: 10,
      reflectivity_gradient_dbz_10m: -4,
      cloud_top_cooling_c_15m: 2.0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="tactical-card max-w-3xl w-full rounded-2xl border border-cyan-500/40 p-6 shadow-2xl bg-radar-panel max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                HYPERLOCAL SOUNDING COLUMN SIMULATOR
              </h2>
              <p className="text-xs text-slate-400">
                {probeCoords
                  ? `Probe Target: ${probeCoords.lat.toFixed(4)}°N, ${probeCoords.lng.toFixed(4)}°E`
                  : 'Adjust Thermodynamic / Kinematic inputs and trigger live Scikit-Learn inference'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex items-center justify-between gap-2 my-4">
          <span className="text-xs font-mono text-slate-400">ATMOSPHERIC PRESETS:</span>
          <div className="flex gap-2">
            <button
              onClick={presetSevere}
              className="px-2.5 py-1 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-mono hover:bg-red-900/60 transition"
            >
              Severe Cloudburst / Hail
            </button>
            <button
              onClick={presetBenign}
              className="px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900/60 transition"
            >
              Benign / Dissipating
            </button>
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
          {/* CAPE */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">CAPE (Instability)</span>
              <span className="text-cyan-400 font-bold">{sounding.cape_j_kg} J/kg</span>
            </div>
            <input
              type="range"
              min="200"
              max="4500"
              step="50"
              value={sounding.cape_j_kg || 2400}
              onChange={(e) => updateParam('cape_j_kg', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* CIN */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">CIN (Cap Inversion)</span>
              <span className="text-cyan-400 font-bold">{sounding.cin_j_kg} J/kg</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={sounding.cin_j_kg || 25}
              onChange={(e) => updateParam('cin_j_kg', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Relative Humidity */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Relative Humidity</span>
              <span className="text-cyan-400 font-bold">{sounding.relative_humidity_pct}%</span>
            </div>
            <input
              type="range"
              min="30"
              max="98"
              step="1"
              value={sounding.relative_humidity_pct || 75}
              onChange={(e) => updateParam('relative_humidity_pct', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Vertical Velocity */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Updraft Velocity</span>
              <span className="text-cyan-400 font-bold">{sounding.vertical_velocity_ms} m/s</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="0.5"
              value={sounding.vertical_velocity_ms || 18}
              onChange={(e) => updateParam('vertical_velocity_ms', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Precipitable Water TPW */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Precipitable Water (TPW)</span>
              <span className="text-cyan-400 font-bold">{sounding.precipitable_water_mm} mm</span>
            </div>
            <input
              type="range"
              min="20"
              max="75"
              step="1"
              value={sounding.precipitable_water_mm || 50}
              onChange={(e) => updateParam('precipitable_water_mm', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>

          {/* Reflectivity Growth Rate */}
          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-slate-300">Reflectivity Growth</span>
              <span className="text-cyan-400 font-bold">{sounding.reflectivity_gradient_dbz_10m} dBZ/10m</span>
            </div>
            <input
              type="range"
              min="-10"
              max="22"
              step="1"
              value={sounding.reflectivity_gradient_dbz_10m || 8}
              onChange={(e) => updateParam('reflectivity_gradient_dbz_10m', parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center my-4">
          <button
            onClick={handleRunInference}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-cyan-500/25 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>RUN SCIKIT-LEARN INFERENCE</span>
          </button>
        </div>

        {/* Prediction Results Display */}
        {prediction && (
          <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 mt-4 animate-fade-in font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs text-slate-400">ML INFERENCE RESULT</span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  prediction.threat_level === 'SEVERE'
                    ? 'bg-red-500 text-white'
                    : prediction.threat_level === 'WARNING'
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-cyan-500 text-slate-950'
                }`}
              >
                {prediction.threat_level} ({prediction.status_text})
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3">
              <div className="p-2 rounded bg-slate-950">
                <div className="text-[10px] text-slate-400">GENESIS PROB</div>
                <div className="text-lg font-black text-cyan-400">
                  {prediction.convective_genesis_probability}%
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950">
                <div className="text-[10px] text-slate-400">⛈️ THUNDERSTORM</div>
                <div className="text-lg font-black text-yellow-400">
                  {prediction.hazards.thunderstorm_risk_pct}%
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950">
                <div className="text-[10px] text-slate-400">🧊 HAIL RISK</div>
                <div className="text-lg font-black text-cyan-300">
                  {prediction.hazards.hail_risk_pct}%
                </div>
              </div>
              <div className="p-2 rounded bg-slate-950">
                <div className="text-[10px] text-slate-400">🌧️ CLOUDBURST</div>
                <div className="text-lg font-black text-sky-400">
                  {prediction.hazards.cloudburst_risk_pct}%
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-slate-800">
              <span className="text-cyan-400 font-bold block mb-1">METEOROLOGICAL REASONING:</span>
              {prediction.meteorological_reasoning}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

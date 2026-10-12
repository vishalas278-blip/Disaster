import React from 'react';
import { CloudLightning, Snowflake, CloudRain } from 'lucide-react';
import type { HazardBreakdown } from '../types/weather';

interface HazardMatrixProps {
  hazards: HazardBreakdown;
  genesisProb?: number;
}

export const HazardMatrix: React.FC<HazardMatrixProps> = ({ hazards }) => {
  const getRiskColor = (val: number) => {
    if (val >= 75) return { text: 'text-red-400', bar: 'bg-red-500', glow: 'shadow-red-500/20', bg: 'bg-red-950/20 border-red-500/30' };
    if (val >= 50) return { text: 'text-orange-400', bar: 'bg-orange-500', glow: 'shadow-orange-500/20', bg: 'bg-orange-950/20 border-orange-500/30' };
    if (val >= 30) return { text: 'text-amber-400', bar: 'bg-amber-500', glow: 'shadow-amber-500/20', bg: 'bg-amber-950/20 border-amber-500/30' };
    return { text: 'text-emerald-400', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-950/20 border-emerald-500/30' };
  };

  const stormColor = getRiskColor(hazards.thunderstorm_risk_pct);
  const hailColor = getRiskColor(hazards.hail_risk_pct);
  const rainColor = getRiskColor(hazards.cloudburst_risk_pct);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* 1. Thunderstorm Genesis Card */}
      <div className={`tactical-card p-3.5 rounded-xl border ${stormColor.bg} flex flex-col justify-between transition-all hover:scale-[1.01]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
              <CloudLightning className="w-4 h-4 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-slate-300 tracking-wider">THUNDERSTORM</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">NOWCAST RISK</span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <span className={`text-3xl font-black font-mono tracking-tight ${stormColor.text}`}>
            {hazards.thunderstorm_risk_pct}%
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {hazards.thunderstorm_risk_pct > 70 ? 'HIGH PROBABILITY' : (hazards.thunderstorm_risk_pct > 40 ? 'MODERATE' : 'LOW')}
          </span>
        </div>

        <div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${stormColor.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${hazards.thunderstorm_risk_pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0%</span>
            <span>THRESHOLD: 60%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 2. Hail Hazard Card */}
      <div className={`tactical-card p-3.5 rounded-xl border ${hailColor.bg} flex flex-col justify-between transition-all hover:scale-[1.01]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Snowflake className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 tracking-wider">SEVERE HAIL</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">GRAUPEL PROB</span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <span className={`text-3xl font-black font-mono tracking-tight ${hailColor.text}`}>
            {hazards.hail_risk_pct}%
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {hazards.hail_risk_pct > 60 ? 'DIAMETER > 2cm' : (hazards.hail_risk_pct > 30 ? 'LIGHT / GRAUPEL' : 'UNLIKELY')}
          </span>
        </div>

        <div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${hailColor.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${hazards.hail_risk_pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0%</span>
            <span>THRESHOLD: 50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* 3. Extreme Rain / Cloudburst Card */}
      <div className={`tactical-card p-3.5 rounded-xl border ${rainColor.bg} flex flex-col justify-between transition-all hover:scale-[1.01]`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/30">
              <CloudRain className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold text-slate-300 tracking-wider">CLOUDBURST / EXTREME</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">&gt; 50 mm/hr</span>
        </div>

        <div className="my-3 flex items-baseline justify-between">
          <span className={`text-3xl font-black font-mono tracking-tight ${rainColor.text}`}>
            {hazards.cloudburst_risk_pct}%
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {hazards.cloudburst_risk_pct > 75 ? 'FLASH FLOOD ALERT' : (hazards.cloudburst_risk_pct > 40 ? 'LOCAL DOWNPOUR' : 'NORMAL')}
          </span>
        </div>

        <div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${rainColor.bar} transition-all duration-500 rounded-full`}
              style={{ width: `${hazards.cloudburst_risk_pct}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
            <span>0%</span>
            <span>THRESHOLD: 65%</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

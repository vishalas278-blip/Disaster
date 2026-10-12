import React from 'react';
import { Zap, CheckCircle2, ArrowUpRight } from 'lucide-react';
import type { TimeFrameData } from '../types/weather';

interface GenesisIntelligenceProps {
  currentFrame: TimeFrameData;
}

export const GenesisIntelligence: React.FC<GenesisIntelligenceProps> = ({ currentFrame }) => {
  const { overall_genesis_prob, overall_threat_level, column_sounding } = currentFrame;

  // Evaluate physical convective triggers based on sounding metrics
  const cape = column_sounding.cape_j_kg || 2400;
  const cin = column_sounding.cin_j_kg || 25;
  const rh = column_sounding.relative_humidity_pct || 75;
  const shear = column_sounding.wind_shear_knots || 25;
  const cloudCool = column_sounding.cloud_top_cooling_c_15m || -8;

  const triggers = [
    {
      title: 'Thermodynamic Instability Surge',
      metric: `CAPE ${cape.toFixed(0)} J/kg`,
      active: cape > 2200,
      description: 'Extreme buoyant potential energy driving explosive vertical parcel acceleration.',
    },
    {
      title: 'Cap Inversion Erosion',
      metric: `CIN ${cin.toFixed(0)} J/kg`,
      active: cin < 30,
      description: 'Thermal boundary layer capping barrier dissipated, triggering unrestricted updraft.',
    },
    {
      title: 'Boundary Moisture Convergence',
      metric: `RH ${rh.toFixed(0)}%`,
      active: rh > 70,
      description: 'Deep tropospheric moisture flux feeding latent heat release into cloud column.',
    },
    {
      title: 'Rapid Cloud Top Overshooting',
      metric: `${cloudCool.toFixed(1)} °C/15m`,
      active: cloudCool < -7.0,
      description: 'Satellite IR thermal signature confirms vigorous vertical cumulus growth.',
    },
    {
      title: 'Kinematic 0-3km Shear Alignment',
      metric: `${shear.toFixed(0)} kts shear`,
      active: shear > 20,
      description: 'Organizes storm inflow/outflow balance, preventing early cell collapse.',
    },
  ];

  const activeTriggersCount = triggers.filter((t) => t.active).length;

  return (
    <div className="tactical-card p-4 rounded-xl border border-radar-border flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Zap className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wider">
              CONVECTIVE GENESIS INTELLIGENCE
            </h3>
            <span className="text-[10px] text-cyan-400 font-mono">
              EARLY PRE-RADAR DETECTION SYSTEM
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
            {overall_threat_level}
          </span>
        </div>
      </div>

      {/* Main Probability Indicator */}
      <div className="flex items-center justify-between bg-slate-900/60 p-3.5 rounded-lg border border-slate-800/80">
        <div>
          <div className="text-[11px] font-mono text-slate-400">INITIATION PROBABILITY</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-3xl font-black font-mono text-cyan-400">
              {overall_genesis_prob}%
            </span>
            <span className="text-xs font-semibold text-slate-300 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400" />
              {overall_genesis_prob > 75 ? 'Explosive Initiation' : (overall_genesis_prob > 45 ? 'Developing Convective Core' : 'Incipient / Weak')}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-mono text-slate-400">TRIGGERS MET</div>
          <div className="text-xl font-bold font-mono text-amber-400">
            {activeTriggersCount} / {triggers.length}
          </div>
        </div>
      </div>

      {/* Physical Indicators Checklist */}
      <div className="flex flex-col gap-2">
        <span className="text-[11px] font-mono font-semibold text-slate-400 tracking-wider">
          PHYSICAL CONVECTIVE CRITERIA SIGNALS:
        </span>
        <div className="space-y-1.5">
          {triggers.map((t, idx) => (
            <div
              key={idx}
              className={`flex items-start justify-between p-2 rounded-lg text-xs transition-colors border ${
                t.active
                  ? 'bg-cyan-950/20 border-cyan-500/30 text-slate-200'
                  : 'bg-slate-900/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-start gap-2">
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    t.active ? 'text-cyan-400' : 'text-slate-600'
                  }`}
                />
                <div>
                  <div className="font-semibold text-[11px] text-slate-200">{t.title}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">{t.description}</div>
                </div>
              </div>

              <span
                className={`font-mono text-[10px] px-2 py-0.5 rounded shrink-0 ml-2 font-bold ${
                  t.active
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'bg-slate-800 text-slate-500'
                }`}
              >
                {t.metric}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

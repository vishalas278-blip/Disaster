import React from 'react';
import { Activity } from 'lucide-react';

interface AtmosphericSoundingProps {
  sounding: Record<string, number>;
}

export const AtmosphericSounding: React.FC<AtmosphericSoundingProps> = ({ sounding }) => {
  const metrics = [
    {
      label: 'CAPE',
      value: `${(sounding.cape_j_kg || 2400).toFixed(0)}`,
      unit: 'J/kg',
      desc: 'Instability Energy',
      highlight: (sounding.cape_j_kg || 2400) > 2500 ? 'text-red-400' : 'text-amber-400',
    },
    {
      label: 'CIN',
      value: `${(sounding.cin_j_kg || 25).toFixed(0)}`,
      unit: 'J/kg',
      desc: 'Inhibition Cap',
      highlight: (sounding.cin_j_kg || 25) < 20 ? 'text-cyan-400' : 'text-slate-300',
    },
    {
      label: 'Lifted Index',
      value: `${(sounding.lifted_index_k || -5.2).toFixed(1)}`,
      unit: 'K',
      desc: 'Buoyancy Index',
      highlight: (sounding.lifted_index_k || -5.2) < -6 ? 'text-red-400' : 'text-amber-400',
    },
    {
      label: 'TPW (Moisture)',
      value: `${(sounding.precipitable_water_mm || 52).toFixed(0)}`,
      unit: 'mm',
      desc: 'Precipitable Water',
      highlight: (sounding.precipitable_water_mm || 52) > 55 ? 'text-sky-400' : 'text-slate-300',
    },
    {
      label: 'Updraft Velocity',
      value: `${(sounding.vertical_velocity_ms || 18).toFixed(1)}`,
      unit: 'm/s',
      desc: 'Peak Updraft',
      highlight: (sounding.vertical_velocity_ms || 18) > 20 ? 'text-red-400' : 'text-cyan-400',
    },
    {
      label: '0-3km Shear',
      value: `${(sounding.wind_shear_knots || 26).toFixed(0)}`,
      unit: 'kts',
      desc: 'Kinematic Shear',
      highlight: 'text-amber-400',
    },
    {
      label: 'Cloud Cooling',
      value: `${(sounding.cloud_top_cooling_c_15m || -8.0).toFixed(1)}`,
      unit: '°C/15m',
      desc: 'IR Cloud Growth',
      highlight: (sounding.cloud_top_cooling_c_15m || -8.0) < -12 ? 'text-red-400' : 'text-cyan-400',
    },
    {
      label: 'Pressure Drop',
      value: `${(sounding.pressure_tendency_hpa_3h || -1.8).toFixed(1)}`,
      unit: 'hPa/3h',
      desc: 'Mesoscale Fall',
      highlight: (sounding.pressure_tendency_hpa_3h || -1.8) < -2.5 ? 'text-red-400' : 'text-slate-300',
    },
  ];

  return (
    <div className="tactical-card p-4 rounded-xl border border-radar-border flex flex-col gap-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wider">
            ATMOSPHERIC SOUNDING COLUMN
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400">PHYSICAL SENSORS</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex flex-col justify-between hover:border-slate-700 transition"
          >
            <div className="text-[10px] font-mono text-slate-400">{m.label}</div>
            <div className="my-1 flex items-baseline gap-1">
              <span className={`text-base font-black font-mono ${m.highlight}`}>
                {m.value}
              </span>
              <span className="text-[10px] font-mono text-slate-500">{m.unit}</span>
            </div>
            <div className="text-[9px] text-slate-400 truncate">{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

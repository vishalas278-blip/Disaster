import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import type { TimeFrameData } from '../types/weather';

interface EarlyWarningBannerProps {
  currentFrame: TimeFrameData;
}

export const EarlyWarningBanner: React.FC<EarlyWarningBannerProps> = ({ currentFrame }) => {
  const { overall_threat_level, overall_genesis_prob, estimated_impact_countdown_min, summary_bulletin } = currentFrame;

  const isSevere = overall_threat_level === 'SEVERE';
  const isWarning = overall_threat_level === 'WARNING';
  const isWatch = overall_threat_level === 'WATCH';

  const config = isSevere
    ? {
        border: 'border-red-500/60',
        bg: 'bg-red-950/40',
        text: 'text-red-400',
        badgeBg: 'bg-red-500 text-white animate-pulse',
        icon: <AlertOctagon className="w-5 h-5 text-red-400 animate-bounce" />,
        status: 'EMERGENCY: SEVERE NOWCAST ALERT',
      }
    : isWarning
    ? {
        border: 'border-orange-500/60',
        bg: 'bg-orange-950/40',
        text: 'text-orange-400',
        badgeBg: 'bg-orange-500 text-slate-950 font-bold',
        icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
        status: 'WARNING: CONVECTIVE INTENSIFICATION',
      }
    : isWatch
    ? {
        border: 'border-amber-500/50',
        bg: 'bg-amber-950/30',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500 text-slate-950 font-bold',
        icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
        status: 'WATCH: INCIPIENT CONVECTIVE GENESIS',
      }
    : {
        border: 'border-emerald-500/40',
        bg: 'bg-emerald-950/30',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500 text-slate-950 font-bold',
        icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
        status: 'MONITORING: BENIGN / DISSIPATING',
      };

  return (
    <div
      className={`rounded-xl border ${config.border} ${config.bg} p-3.5 sm:p-4 shadow-lg backdrop-blur-md transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Threat Indicator */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-black/40 border border-slate-700/50 shrink-0">
            {config.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wide ${config.badgeBg}`}>
                {overall_threat_level}
              </span>
              <h2 className={`text-sm sm:text-base font-bold tracking-wide ${config.text}`}>
                {config.status}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 max-w-2xl">
              {summary_bulletin}
            </p>
          </div>
        </div>

        {/* Right Timers & Trend Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center shrink-0 border-t sm:border-t-0 sm:border-l border-slate-700/50 pt-2 sm:pt-0 sm:pl-5">
          {/* Estimated Impact Arrival */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-slate-400">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>EST. IMPACT</span>
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-slate-100">
              {estimated_impact_countdown_min > 0 ? (
                <span className={isSevere ? 'text-red-400 font-bold' : 'text-cyan-300'}>
                  {estimated_impact_countdown_min} MIN
                </span>
              ) : (
                <span className="text-red-400 font-bold">IMPACTING NOW</span>
              )}
            </div>
          </div>

          {/* Risk Trend */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 text-[11px] font-mono text-slate-400">
              <span>RISK TREND</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-sm font-bold font-mono">
              {overall_genesis_prob >= 50 ? (
                <span className="text-red-400 flex items-center gap-0.5">
                  <TrendingUp className="w-4 h-4" /> INCREASING
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-0.5">
                  <TrendingDown className="w-4 h-4" /> DECAYING
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import type { TimeFrameData } from '../types/weather';

interface TimelinePlayerProps {
  timeline: TimeFrameData[];
  selectedTimestep: string;
  onSelectTimestep: (step: string) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeed: number;
  onToggleSpeed: () => void;
}

export const TimelinePlayer: React.FC<TimelinePlayerProps> = ({
  selectedTimestep,
  onSelectTimestep,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onToggleSpeed,
}) => {
  const steps = ['T0', 'T+15', 'T+30', 'T+45', 'T+60'];
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = 2200 / playbackSpeed;
      timerRef.current = setInterval(() => {
        const currIdx = steps.indexOf(selectedTimestep);
        const nextIdx = (currIdx + 1) % steps.length;
        onSelectTimestep(steps[nextIdx]);
      }, interval);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedTimestep, playbackSpeed]);

  const currentIndex = steps.indexOf(selectedTimestep);

  return (
    <div className="tactical-card p-3 rounded-xl border border-radar-border flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
      {/* Left Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all shadow-md ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY FORECAST</span>
            </>
          )}
        </button>

        <button
          onClick={() => onSelectTimestep('T0')}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          title="Reset to T0 (Now)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onToggleSpeed}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-cyan-300 border border-slate-700"
          title="Toggle Playback Speed"
        >
          {playbackSpeed}x SPEED
        </button>
      </div>

      {/* Center Timestep Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 w-full justify-center">
        {steps.map((step, idx) => {
          const isSelected = selectedTimestep === step;
          const isPast = idx <= currentIndex;

          return (
            <button
              key={step}
              onClick={() => onSelectTimestep(step)}
              className={`flex-1 sm:flex-initial flex flex-col items-center px-2.5 sm:px-4 py-1.5 rounded-lg transition-all border text-center ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/20 font-bold'
                  : isPast
                  ? 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-600'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-mono font-bold tracking-tight">
                {step === 'T0' ? 'NOW (T0)' : step}
              </span>
              <span className="text-[9px] font-mono text-slate-400 hidden sm:inline">
                {step === 'T0' ? '0 min' : `+${idx * 15}m`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Timestamp display */}
      <div className="hidden lg:flex items-center gap-2 text-right shrink-0 border-l border-slate-800 pl-3">
        <Clock className="w-3.5 h-3.5 text-cyan-400" />
        <div className="text-[11px] font-mono">
          <div className="text-slate-400">NOWCAST WINDOW</div>
          <div className="text-cyan-300 font-bold">0 — 60 MINUTES</div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Radar, Cpu, Sparkles, AlertTriangle, Compass } from 'lucide-react';
import type { ScenarioMetadata } from '../types/weather';

interface HeaderProps {
  scenarios: ScenarioMetadata[];
  selectedScenarioId: string;
  onSelectScenario: (id: string) => void;
  onOpenProbe: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenarios,
  selectedScenarioId,
  onSelectScenario,
  onOpenProbe,
}) => {
  return (
    <header className="border-b border-radar-border bg-radar-bg/95 backdrop-blur-md px-4 lg:px-6 py-3 sticky top-0 z-50">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Radar className="w-6 h-6 animate-pulse text-cyan-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                STORMGUARD AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> PROTOTYPE
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                ● DEMO MODE
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Early Convective Genesis, Nowcasting &amp; Hyperlocal Impact Intelligence (SIH 2026)
            </p>
          </div>
        </div>

        {/* Middle Scenario Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-radar-panel/80 px-3 py-1.5 rounded-lg border border-radar-border text-xs">
            <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-slate-400 font-mono hidden md:inline">DEMO SCENARIO:</span>
            <select
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              aria-label="Select Demo Scenario"
              className="bg-radar-card text-cyan-300 border border-slate-700/60 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer font-medium"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Actions & Status (No SIH Roadmap button) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Local AI Engine Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-400 font-mono">
            <Cpu className="w-3.5 h-3.5 animate-pulse" />
            <span>LOCAL AI ENGINE ONLINE</span>
          </div>

          {/* Custom Sounding Simulator Button */}
          <button
            onClick={onOpenProbe}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 border border-cyan-400/30 transition"
            title="Open Interactive Sounding Column Editor"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Probe</span>
          </button>
        </div>
      </div>
    </header>
  );
};

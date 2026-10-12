import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { EarlyWarningBanner } from './components/EarlyWarningBanner';
import { HazardMatrix } from './components/HazardMatrix';
import { GenesisIntelligence } from './components/GenesisIntelligence';
import { XaiExplanationPanel } from './components/XaiExplanationPanel';
import { AtmosphericSounding } from './components/AtmosphericSounding';
import { TimelinePlayer } from './components/TimelinePlayer';
import { WeatherMap } from './maps/WeatherMap';
import { ProbeModal } from './components/ProbeModal';
import { fetchScenarios, fetchWeatherTimeline, fetchExplanation } from './services/api';
import type { TimeFrameData, ScenarioMetadata, XaiFactor } from './types/weather';
import { RefreshCw, ShieldAlert } from 'lucide-react';

export function App() {
  const [scenarios, setScenarios] = useState<ScenarioMetadata[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('ncr_cloudburst');
  const [timeline, setTimeline] = useState<TimeFrameData[]>([]);
  const [selectedTimestep, setSelectedTimestep] = useState<string>('T0');
  const [loading, setLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isProbeOpen, setIsProbeOpen] = useState<boolean>(false);
  const [probeCoords, setProbeCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [xaiFactors, setXaiFactors] = useState<XaiFactor[]>([]);
  const [meteorologicalReasoning, setMeteorologicalReasoning] = useState<string>('');

  // 1. Initial Load of Scenarios
  useEffect(() => {
    async function loadScenarios() {
      try {
        const scList = await fetchScenarios();
        setScenarios(scList);
        if (scList.length > 0) {
          setSelectedScenarioId(scList[0].id);
        }
      } catch (err) {
        console.error('Error fetching scenarios:', err);
      }
    }
    loadScenarios();
  }, []);

  // 2. Load Timeline for Selected Scenario
  useEffect(() => {
    async function loadTimeline() {
      setLoading(true);
      try {
        const tl = await fetchWeatherTimeline(selectedScenarioId);
        setTimeline(tl);
        setSelectedTimestep('T0');
      } catch (err) {
        console.error('Error fetching timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    if (selectedScenarioId) {
      loadTimeline();
    }
  }, [selectedScenarioId]);

  // 3. Load XAI Explanation for Current Timestep
  useEffect(() => {
    async function loadExplanation() {
      try {
        const exp = await fetchExplanation(selectedScenarioId, selectedTimestep);
        setXaiFactors(exp.contributing_factors);
        setMeteorologicalReasoning(exp.meteorological_reasoning);
      } catch (err) {
        console.error('Error fetching explanation:', err);
      }
    }
    if (selectedScenarioId && selectedTimestep) {
      loadExplanation();
    }
  }, [selectedScenarioId, selectedTimestep]);

  const activeScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const currentFrame = timeline.find((f) => f.timestep === selectedTimestep) || timeline[0];

  const handleMapClickProbe = (lat: number, lng: number) => {
    setProbeCoords({ lat, lng });
    setIsProbeOpen(true);
  };

  const handleToggleSpeed = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 2 : 1));
  };

  if (loading || !currentFrame || !activeScenario) {
    return (
      <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col items-center justify-center p-6 gap-4">
        <div className="relative flex items-center justify-center w-16 h-16">
          <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin" />
        </div>
        <div className="text-sm font-mono tracking-widest text-cyan-300 uppercase">
          Initializing StormGuard AI Platform...
        </div>
        <div className="text-xs text-slate-400">Loading neural models &amp; radar telemetry</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col antialiased">
      {/* 1. Header (No Roadmap button) */}
      <Header
        scenarios={scenarios}
        selectedScenarioId={selectedScenarioId}
        onSelectScenario={(id) => {
          setSelectedScenarioId(id);
          setIsPlaying(false);
        }}
        onOpenProbe={() => {
          setProbeCoords(null);
          setIsProbeOpen(true);
        }}
      />

      {/* 2. Main Dashboard Content */}
      <main className="flex-1 p-3 sm:p-4 lg:p-5 flex flex-col gap-4 max-w-[1700px] mx-auto w-full">
        {/* Early Warning Alert Banner */}
        <EarlyWarningBanner currentFrame={currentFrame} />

        {/* Hazard Cards Matrix (Thunderstorm, Hail, Cloudburst) */}
        <HazardMatrix
          hazards={currentFrame.hazards}
          genesisProb={currentFrame.overall_genesis_prob}
        />

        {/* Tactical 3-Column Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
          {/* Left Column: Genesis Intelligence & Sounding Column */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Convective Genesis Panel (Core SIH Differentiator) */}
            <GenesisIntelligence currentFrame={currentFrame} />

            {/* Sounding Metrics */}
            <AtmosphericSounding sounding={currentFrame.column_sounding} />
          </div>

          {/* Center Column: Built-In SVG GIS Weather Map */}
          <div className="lg:col-span-5 flex flex-col gap-4 min-h-[480px]">
            <WeatherMap
              currentFrame={currentFrame}
              scenario={activeScenario}
              onMapClickProbe={handleMapClickProbe}
            />
          </div>

          {/* Right Column: Explainable AI (XAI) Panel */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            <XaiExplanationPanel
              factors={xaiFactors}
              reasoning={meteorologicalReasoning}
            />

            {/* Hyperlocal Vulnerability Widget */}
            <div className="tactical-card p-4 rounded-xl border border-radar-border flex flex-col gap-2.5">
              <span className="text-xs font-mono font-bold text-slate-300 tracking-wider">
                HYPERLOCAL IMPACT HAZARD ASSESSMENT
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Urban Inundation / Waterlogging</span>
                  <span
                    className={`font-mono font-bold ${
                      currentFrame.overall_genesis_prob > 70 ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {currentFrame.overall_genesis_prob > 70 ? 'CRITICAL' : 'MODERATE'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Aviation / Wind Shear Hazard</span>
                  <span
                    className={`font-mono font-bold ${
                      currentFrame.column_sounding.wind_shear_knots > 30 ? 'text-red-400' : 'text-cyan-300'
                    }`}
                  >
                    {currentFrame.column_sounding.wind_shear_knots > 30 ? 'SEVERE GALE' : 'NORMAL'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Power Grid Lightning Exposure</span>
                  <span
                    className={`font-mono font-bold ${
                      currentFrame.hazards.thunderstorm_risk_pct > 75 ? 'text-red-400' : 'text-amber-400'
                    }`}
                  >
                    {currentFrame.hazards.thunderstorm_risk_pct > 75 ? 'HIGH SURGE' : 'WATCH'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Interactive Forecast Timeline Controller */}
        <TimelinePlayer
          timeline={timeline}
          selectedTimestep={selectedTimestep}
          onSelectTimestep={(step) => {
            setSelectedTimestep(step);
          }}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          playbackSpeed={playbackSpeed}
          onToggleSpeed={handleToggleSpeed}
        />

        {/* 5. Scientific Prototype Disclaimer Footer */}
        <footer className="text-center py-2 text-[11px] font-mono text-slate-500 border-t border-slate-900 flex items-center justify-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
          <span>
            Prototype demonstration using simulated meteorological data. Not an operational weather warning service.
          </span>
        </footer>
      </main>

      {/* 6. AI Probe Modal */}
      <ProbeModal
        isOpen={isProbeOpen}
        onClose={() => setIsProbeOpen(false)}
        initialSounding={currentFrame.column_sounding}
        probeCoords={probeCoords}
      />
    </div>
  );
}

export default App;

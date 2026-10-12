import React, { useState, useRef } from 'react';
import {
  Layers,
  Crosshair,
  Zap,
  Plus,
  Minus,
  RotateCcw,
  Info,
} from 'lucide-react';
import type { TimeFrameData, ScenarioMetadata, StationObservation } from '../types/weather';
import { NCR_GEO_DATA } from '../data/localWeatherScenarios';

interface WeatherMapProps {
  currentFrame: TimeFrameData;
  scenario: ScenarioMetadata;
  onMapClickProbe?: (lat: number, lng: number) => void;
}

export const WeatherMap: React.FC<WeatherMapProps> = ({
  currentFrame,
  scenario,
  onMapClickProbe,
}) => {
  const [showGenesisZones, setShowGenesisZones] = useState(true);
  const [showRadarReflectivity, setShowRadarReflectivity] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showStations, setShowStations] = useState(true);

  // Zoom & Pan state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Hovered element info
  const [hoveredStation, setHoveredStation] = useState<StationObservation | null>(null);
  const [selectedProbePoint, setSelectedProbePoint] = useState<{
    lat: number;
    lng: number;
    localRisk: number;
    timeToImpactMin: number;
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Geographic bounds for projection (NCR Default)
  const bounds = NCR_GEO_DATA.viewBox; // minLat: 28.35, maxLat: 28.85, minLng: 76.85, maxLng: 77.55
  const svgWidth = 700;
  const svgHeight = 520;

  // Convert GPS (lat, lng) to SVG pixel coordinates (x, y)
  const project = (lat: number, lng: number): [number, number] => {
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * svgWidth;
    const y = svgHeight - ((lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * svgHeight;
    return [x, y];
  };

  // Convert SVG pixel back to GPS coordinates for click-to-probe
  const unproject = (x: number, y: number): [number, number] => {
    const lng = bounds.minLng + (x / svgWidth) * (bounds.maxLng - bounds.minLng);
    const lat = bounds.minLat + ((svgHeight - y) / svgHeight) * (bounds.maxLat - bounds.minLat);
    return [Number(lat.toFixed(4)), Number(lng.toFixed(4))];
  };

  // Map Click Handler for Ad-Hoc Atmospheric Column Probing
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - panOffset.x) / zoomLevel;
    const clickY = (e.clientY - rect.top - panOffset.y) / zoomLevel;

    const [lat, lng] = unproject(clickX, clickY);

    // Calculate distance to active storm cell
    const activeStorm = currentFrame.storm_cells[0];
    let distKm = 25;
    if (activeStorm) {
      const dLat = (lat - activeStorm.lat) * 111;
      const dLng = (lng - activeStorm.lng) * 98;
      distKm = Math.sqrt(dLat * dLat + dLng * dLng);
    }

    const proximityFactor = Math.max(0.1, 1.0 - distKm / 35.0);
    const localRisk = Math.min(99.0, Math.max(8.0, Number((currentFrame.overall_genesis_prob * proximityFactor).toFixed(1))));
    const timeToImpact = Math.max(0, Math.round(distKm / 0.5)); // Assuming ~30 km/h storm speed

    setSelectedProbePoint({ lat, lng, localRisk, timeToImpactMin: timeToImpact });

    if (onMapClickProbe) {
      onMapClickProbe(lat, lng);
    }
  };

  // Mouse Drag for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - dragStart.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedProbePoint(null);
  };

  const activeStorm = currentFrame.storm_cells[0];

  // Helper for radar colors
  const getRadarColor = (dbz: number) => {
    if (dbz >= 60) return '#d946ef'; // Magenta / Extreme Hail
    if (dbz >= 50) return '#ef4444'; // Red / Severe
    if (dbz >= 40) return '#f59e0b'; // Amber / Heavy
    if (dbz >= 30) return '#10b981'; // Green / Moderate
    return '#06b6d4'; // Cyan / Light
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[480px] rounded-xl overflow-hidden border border-radar-border shadow-2xl bg-[#060a14] select-none flex flex-col justify-between"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Map Tactical Banner */}
      <div className="absolute top-3 left-3 z-30 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="px-3 py-1.5 rounded-lg bg-radar-panel/90 backdrop-blur-md border border-radar-border text-xs flex items-center gap-2 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span className="font-mono font-bold text-cyan-300">
            {scenario.region_name}
          </span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-slate-700 pl-2">
            FRAME: {currentFrame.display_time}
          </span>
        </div>

        {/* Prototype Data Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 backdrop-blur-md border border-amber-500/30 text-[10px] font-mono text-amber-400">
          <Info className="w-3 h-3 text-amber-400" />
          <span>SIMULATED RADAR / PROTOTYPE DATA</span>
        </div>
      </div>

      {/* Layer Controls Top Right */}
      <div className="absolute top-3 right-3 z-30 bg-radar-panel/90 backdrop-blur-md border border-radar-border rounded-lg p-2.5 text-xs flex flex-col gap-1.5 shadow-xl pointer-events-auto">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400 font-bold border-b border-slate-800 pb-1">
          <Layers className="w-3 h-3 text-cyan-400" />
          <span>GIS RADAR LAYERS</span>
        </div>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer hover:text-cyan-300">
          <input
            type="checkbox"
            checked={showGenesisZones}
            onChange={(e) => setShowGenesisZones(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Genesis Hotspots (SIH)</span>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer hover:text-cyan-300">
          <input
            type="checkbox"
            checked={showRadarReflectivity}
            onChange={(e) => setShowRadarReflectivity(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Radar Reflectivity (dBZ)</span>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer hover:text-cyan-300">
          <input
            type="checkbox"
            checked={showTrajectory}
            onChange={(e) => setShowTrajectory(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>AI Trajectory Vectors</span>
        </label>
        <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer hover:text-cyan-300">
          <input
            type="checkbox"
            checked={showStations}
            onChange={(e) => setShowStations(e.target.checked)}
            className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
          />
          <span>Ground Stations (AWS)</span>
        </label>
      </div>

      {/* Zoom / Pan Controls Bottom Right */}
      <div className="absolute bottom-12 right-3 z-30 flex flex-col gap-1.5 pointer-events-auto">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          className="p-2 rounded-lg bg-radar-panel/90 border border-radar-border text-slate-300 hover:text-cyan-300 hover:bg-slate-800 shadow-lg transition"
          title="Zoom In"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          className="p-2 rounded-lg bg-radar-panel/90 border border-radar-border text-slate-300 hover:text-cyan-300 hover:bg-slate-800 shadow-lg transition"
          title="Zoom Out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={resetView}
          className="p-2 rounded-lg bg-radar-panel/90 border border-radar-border text-slate-300 hover:text-cyan-300 hover:bg-slate-800 shadow-lg transition"
          title="Reset Map View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Left Radar Color Legend */}
      <div className="absolute bottom-3 left-3 z-30 bg-radar-panel/90 backdrop-blur-md border border-radar-border rounded-lg px-3 py-1.5 text-[10px] font-mono shadow-lg flex items-center gap-3 pointer-events-auto">
        <span className="text-slate-400 font-bold">RADAR REFLECTIVITY:</span>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981]"></span>
            <span className="text-slate-300">LOW</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b]"></span>
            <span className="text-slate-300">WATCH</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]"></span>
            <span className="text-slate-300">WARNING</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#d946ef]"></span>
            <span className="text-slate-300">SEVERE</span>
          </div>
        </div>
      </div>

      {/* Selected Location Probe Banner */}
      {selectedProbePoint && (
        <div className="absolute bottom-12 left-3 z-30 bg-slate-900/95 border border-cyan-500/50 rounded-xl p-2.5 shadow-2xl text-xs font-mono max-w-sm pointer-events-auto animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
            <span className="font-bold text-cyan-300 flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-amber-400" /> SELECTED PROBE POINT
            </span>
            <button
              onClick={() => setSelectedProbePoint(null)}
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div>Coords: <span className="text-white font-bold">{selectedProbePoint.lat}°N, {selectedProbePoint.lng}°E</span></div>
            <div>Risk: <span className={`font-bold ${selectedProbePoint.localRisk > 70 ? 'text-red-400' : 'text-amber-400'}`}>{selectedProbePoint.localRisk}%</span></div>
            <div>Est. Arrival: <span className="text-cyan-300 font-bold">{selectedProbePoint.timeToImpactMin} MIN</span></div>
            <div>Alert: <span className="text-amber-300 font-bold">{selectedProbePoint.localRisk > 75 ? 'SEVERE' : (selectedProbePoint.localRisk > 50 ? 'WARNING' : 'WATCH')}</span></div>
          </div>
        </div>
      )}

      {/* Main Self-Contained SVG Radar & GIS Map Canvas */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-full cursor-crosshair"
        onClick={handleSvgClick}
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.15s ease-out',
        }}
      >
        <defs>
          {/* Tactical Grid Pattern */}
          <pattern id="tacticalGrid" width="35" height="35" patternUnits="userSpaceOnUse">
            <path d="M 35 0 L 0 0 0 35" fill="none" stroke="rgba(14, 165, 233, 0.08)" strokeWidth="0.8" />
            <circle cx="0" cy="0" r="1.2" fill="rgba(14, 165, 233, 0.25)" />
          </pattern>

          {/* Radar Reflectivity Radial Gradient */}
          <radialGradient id="stormRadarGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d946ef" stopOpacity="0.95" />
            <stop offset="25%" stopColor="#ef4444" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.65" />
            <stop offset="75%" stopColor="#10b981" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          {/* Incipient Genesis Pulse Gradient */}
          <radialGradient id="genesisPulseGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>

          {/* Arrow Marker for Trajectory */}
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#06b6d4" />
          </marker>
        </defs>

        {/* 1. Tactical Coordinate Grid Background */}
        <rect width={svgWidth} height={svgHeight} fill="#070c18" />
        <rect width={svgWidth} height={svgHeight} fill="url(#tacticalGrid)" />

        {/* Lat/Lon Reference Lines & Labels */}
        <g stroke="rgba(51, 65, 85, 0.4)" strokeWidth="0.5" strokeDasharray="3,3">
          {[28.4, 28.5, 28.6, 28.7, 28.8].map((lat) => {
            const [, y] = project(lat, bounds.minLng);
            return (
              <React.Fragment key={`lat-${lat}`}>
                <line x1="0" y1={y} x2={svgWidth} y2={y} />
                <text x="8" y={y - 4} fill="#475569" fontSize="9" fontFamily="monospace">
                  {lat.toFixed(1)}°N
                </text>
              </React.Fragment>
            );
          })}
          {[76.9, 77.1, 77.3, 77.5].map((lng) => {
            const [x] = project(bounds.minLat, lng);
            return (
              <React.Fragment key={`lng-${lng}`}>
                <line x1={x} y1="0" x2={x} y2={svgHeight} />
                <text x={x + 4} y={svgHeight - 8} fill="#475569" fontSize="9" fontFamily="monospace">
                  {lng.toFixed(1)}°E
                </text>
              </React.Fragment>
            );
          })}
        </g>

        {/* 2. Yamuna River Geometric Path */}
        <path
          d="M 420 0 Q 390 120 410 200 T 430 320 T 480 440 T 520 520"
          fill="none"
          stroke="rgba(6, 182, 212, 0.25)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <text x="440" y="340" fill="rgba(6, 182, 212, 0.4)" fontSize="9" fontFamily="monospace" transform="rotate(70 440 340)">
          YAMUNA RIVER
        </text>

        {/* 3. District / Regional Geographic Outlines */}
        <g>
          {NCR_GEO_DATA.districts.map((district) => {
            const [cx, cy] = project(district.center[0], district.center[1]);
            return (
              <g key={district.id}>
                <circle
                  cx={cx}
                  cy={cy}
                  r="65"
                  fill="rgba(15, 23, 42, 0.4)"
                  stroke="rgba(56, 189, 248, 0.25)"
                  strokeWidth="1.2"
                  strokeDasharray="4,2"
                />
                <text
                  x={cx}
                  y={cy}
                  fill="rgba(148, 163, 184, 0.65)"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {district.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </g>

        {/* 4. Incipient Convective Genesis Pulsing Zones (SIH Core Differentiator) */}
        {showGenesisZones &&
          currentFrame.genesis_zones.map((zone) => {
            const [zx, zy] = project(zone.lat, zone.lng);
            const radiusPx = (zone.radius_km / 35) * svgWidth * 0.35;
            return (
              <g key={zone.id}>
                {/* Outer animated radar pulse ring */}
                <circle
                  cx={zx}
                  cy={zy}
                  r={radiusPx * 1.5}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  className="pulsing-genesis-ring"
                  opacity="0.8"
                />
                <circle
                  cx={zx}
                  cy={zy}
                  r={radiusPx}
                  fill="url(#genesisPulseGradient)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <g transform={`translate(${zx - 10}, ${zy - 10})`}>
                  <Zap className="w-5 h-5 text-amber-400 animate-pulse" />
                </g>
                <text
                  x={zx}
                  y={zy + radiusPx + 14}
                  fill="#f59e0b"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  GENESIS ZONE ({zone.initiation_probability}%)
                </text>
              </g>
            );
          })}

        {/* 5. Simulated Radar Reflectivity Heatmap Core */}
        {showRadarReflectivity &&
          currentFrame.storm_cells.map((cell) => {
            const [cx, cy] = project(cell.lat, cell.lng);
            const rPx = (cell.radius_km / 35) * svgWidth * 0.45;
            const coreColor = getRadarColor(cell.intensity_dbz);

            return (
              <g key={cell.id}>
                {/* Outer dBZ Contour */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rPx * 1.3}
                  fill={cell.intensity_dbz > 50 ? 'url(#stormRadarGradient)' : coreColor}
                  fillOpacity="0.45"
                  stroke={coreColor}
                  strokeWidth="1"
                />
                {/* Intense Core */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={rPx * 0.65}
                  fill={coreColor}
                  fillOpacity="0.8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
                {/* Center Blip */}
                <circle cx={cx} cy={cy} r="4" fill="#ffffff" />
                <text
                  x={cx}
                  y={cy - rPx - 8}
                  fill="#f8fafc"
                  fontSize="11"
                  fontWeight="black"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {cell.name} ({cell.intensity_dbz} dBZ)
                </text>
              </g>
            );
          })}

        {/* 6. AI-Estimated Trajectory Vector Line & Predicted Positions */}
        {showTrajectory && activeStorm && activeStorm.trajectory && (
          <g>
            {/* Trajectory Connecting Polyline with Arrowhead */}
            <polyline
              points={activeStorm.trajectory
                .map((p) => {
                  const [px, py] = project(p.lat, p.lng);
                  return `${px},${py}`;
                })
                .join(' ')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              markerEnd="url(#arrow)"
            />

            {/* Trajectory Waypoints */}
            {activeStorm.trajectory.map((pt, idx) => {
              const [px, py] = project(pt.lat, pt.lng);
              const isCurrent = idx === 0;
              const isLast = idx === activeStorm.trajectory.length - 1;

              return (
                <g key={idx}>
                  <circle
                    cx={px}
                    cy={py}
                    r={isCurrent ? 7 : (isLast ? 6 : 4.5)}
                    fill={isCurrent ? '#06b6d4' : (isLast ? '#ef4444' : '#0f172a')}
                    stroke={isCurrent ? '#ffffff' : (isLast ? '#ffffff' : '#f59e0b')}
                    strokeWidth="2"
                  />
                  <text
                    x={px + 10}
                    y={py + 3}
                    fill={isCurrent ? '#38bdf8' : (isLast ? '#f87171' : '#94a3b8')}
                    fontSize="9"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.timestep} ({pt.intensity_dbz} dBZ)
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* 7. Ground Observation Stations (AWS) */}
        {showStations &&
          currentFrame.stations.map((stn) => {
            const [sx, sy] = project(stn.lat, stn.lng);
            const isHovered = hoveredStation?.id === stn.id;
            const markerColor =
              stn.local_risk_pct > 70 ? '#ef4444' : (stn.local_risk_pct > 40 ? '#f59e0b' : '#10b981');

            return (
              <g
                key={stn.id}
                onMouseEnter={() => setHoveredStation(stn)}
                onMouseLeave={() => setHoveredStation(null)}
                className="cursor-pointer"
              >
                <circle cx={sx} cy={sy} r={isHovered ? 7 : 5} fill="#0f172a" stroke={markerColor} strokeWidth="2" />
                <circle cx={sx} cy={sy} r="2" fill={markerColor} />
                <text
                  x={sx}
                  y={sy + 14}
                  fill="#94a3b8"
                  fontSize="8.5"
                  fontFamily="monospace"
                  textAnchor="middle"
                >
                  {stn.name.split(' (')[0]}
                </text>
              </g>
            );
          })}

        {/* 8. Selected Probe Crosshair Target */}
        {selectedProbePoint && (
          <g>
            {(() => {
              const [px, py] = project(selectedProbePoint.lat, selectedProbePoint.lng);
              return (
                <g>
                  <circle cx={px} cy={py} r="14" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                  <line x1={px - 20} y1={py} x2={px + 20} y2={py} stroke="#f59e0b" strokeWidth="1" />
                  <line x1={px} y1={py - 20} x2={px} y2={py + 20} stroke="#f59e0b" strokeWidth="1" />
                  <circle cx={px} cy={py} r="3" fill="#f59e0b" />
                </g>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};

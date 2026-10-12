import React from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import type { XaiFactor } from '../types/weather';

interface XaiExplanationPanelProps {
  factors: XaiFactor[];
  reasoning: string;
}

export const XaiExplanationPanel: React.FC<XaiExplanationPanelProps> = ({ factors, reasoning }) => {
  const chartData = (factors || []).slice(0, 6).map((f) => ({
    name: f.feature_name.split(' (')[0], // Clean label
    score: f.contribution_score,
    value: `${f.value} ${f.unit}`,
    fullName: f.feature_name,
  }));

  const getBarColor = (score: number) => {
    if (score >= 30) return '#ef4444'; // Red
    if (score >= 20) return '#f97316'; // Orange
    if (score >= 12) return '#f59e0b'; // Amber
    return '#06b6d4'; // Cyan
  };

  return (
    <div className="tactical-card p-4 rounded-xl border border-radar-border flex flex-col gap-3.5">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-100 tracking-wider">
              EXPLAINABLE AI: WHY THIS WARNING?
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              FEATURE CONTRIBUTION &amp; ATTRIBUTION ANALYSIS
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
          SHAP-ALIGNED
        </span>
      </div>

      {/* Feature Contribution Horizontal Bar Chart */}
      <div className="h-44 w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
          >
            <XAxis type="number" domain={[0, 40]} hide />
            <YAxis
              dataKey="name"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              width={140}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-cyan-500/40 p-2 rounded-lg text-xs shadow-xl font-mono">
                      <div className="font-bold text-cyan-300">{data.fullName}</div>
                      <div className="text-slate-300">Observed: <span className="text-white font-bold">{data.value}</span></div>
                      <div className="text-amber-400">Risk Weight Score: {data.score}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={12}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Natural Language Meteorological Interpretation */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300 block mb-0.5 font-mono text-[11px]">
            AI METEOROLOGICAL REASONING:
          </span>
          <p className="text-[11px] text-slate-300">{reasoning}</p>
        </div>
      </div>
    </div>
  );
};

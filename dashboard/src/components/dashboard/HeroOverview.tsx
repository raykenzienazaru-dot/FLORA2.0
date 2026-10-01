import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { fmt, formatTime } from '../../utils/formatters';
import { evaluatePlantPillars } from '../../utils/sensorRules';

interface HeroOverviewProps {
  latest: TelemetryRecord | null;
}

export const HeroOverview: React.FC<HeroOverviewProps> = ({ latest }) => {
  const pillars = evaluatePlantPillars(latest);
  const conditionTitle = latest?.condition?.title || 'Awaiting Telemetry Stream';
  const lastUpdate = latest?.timestamp ? `Updated ${formatTime(latest.timestamp)}` : 'Awaiting data';

  const hasTemp = latest?.temperature !== undefined && latest?.temperature !== null;
  const hasHum = latest?.humidity !== undefined && latest?.humidity !== null;
  const hasSoil = latest?.soil_moisture !== undefined && latest?.soil_moisture !== null;

  return (
    <section
      id="overview"
      className="bg-flora-card border border-flora-soft-white/40 rounded-xl p-6 lg:p-8 flex flex-col gap-6 transition-all"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-flora-soft-white/20">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-flora-primary block mb-1">
            Environmental Status
          </span>
          <h2 className="text-2xl font-bold text-flora-text tracking-tight">
            {conditionTitle}
          </h2>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <span className="text-[11px] text-flora-text-secondary font-mono px-3 py-1.5 rounded-lg bg-flora-soft-white/50 border border-flora-soft-white/30">
            {lastUpdate}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-5">
        <p className="text-sm text-flora-text-secondary leading-relaxed max-w-3xl">
          {pillars.overallAssessment}
        </p>

        {/* Live Sensor Pills */}
        <div className="flex flex-wrap gap-2">
          <div className="bg-flora-soft-white/60 border border-flora-soft-white/40 px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs">
            <span className="text-flora-text-secondary font-medium">Temperature</span>
            <span className="font-bold text-flora-text font-mono">
              {hasTemp ? `${fmt(latest!.temperature)}°C` : '—'}
            </span>
          </div>

          <div className="bg-flora-soft-white/60 border border-flora-soft-white/40 px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs">
            <span className="text-flora-text-secondary font-medium">Humidity</span>
            <span className="font-bold text-flora-text font-mono">
              {hasHum ? `${fmt(latest!.humidity)}%` : '—'}
            </span>
          </div>

          <div className="bg-flora-soft-white/60 border border-flora-soft-white/40 px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs">
            <span className="text-flora-text-secondary font-medium">Soil Moisture</span>
            <span className="font-bold text-flora-text font-mono">
              {hasSoil ? `${fmt(latest!.soil_moisture)}%` : '—'}
            </span>
          </div>

          <div className="bg-flora-soft-white/60 border border-flora-soft-white/40 px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs">
            <span className="text-flora-text-secondary font-medium">Air Quality</span>
            <span className={`font-bold font-mono ${
              (latest?.mq135_ppm ?? 0) > 600 ? 'text-amber-600' : 'text-flora-text'
            }`}>
              {latest?.mq135_ppm !== undefined ? `${latest.mq135_ppm} PPM` : '—'}
            </span>
          </div>

          <div className={`px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs border ${
            latest?.flame_detected
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-flora-soft-white/60 border-flora-soft-white/40'
          }`}>
            <span className="text-flora-text-secondary font-medium">Flame Detection</span>
            <span className={`font-bold ${latest?.flame_detected ? 'text-red-600 animate-pulse' : 'text-flora-text'}`}>
              {latest?.flame_detected ? '🔥 Detected' : 'Safe'}
            </span>
          </div>

          {latest?.vision_prediction && (
            <div className="bg-flora-soft-white/60 border border-flora-soft-white/40 px-3.5 py-2 rounded-lg flex items-center gap-2.5 text-xs">
              <span className="text-flora-text-secondary font-medium">Plant Status</span>
              <span className="font-bold text-flora-text capitalize">
                {latest.vision_prediction}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 4-Pillar Grid */}
      <div className="pt-4 border-t border-flora-soft-white/20 grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-flora-soft-white/40 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider block mb-2">
            Environment
          </span>
          <span className="text-sm font-bold text-flora-text block">
            {pillars.environment.status}
          </span>
          <span className="text-xs text-flora-text-secondary block font-mono mt-1">
            {pillars.environment.detail}
          </span>
        </div>

        <div className="bg-flora-soft-white/40 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider block mb-2">
            Soil
          </span>
          <span className="text-sm font-bold text-flora-text block">
            {pillars.soil.status}
          </span>
          <span className="text-xs text-flora-text-secondary block font-mono mt-1">
            {pillars.soil.detail}
          </span>
        </div>

        <div className="bg-flora-soft-white/40 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider block mb-2">
            Risk
          </span>
          <span className="text-sm font-bold text-flora-text block">
            {pillars.aiRisk.status}
          </span>
          <span className="text-xs text-flora-text-secondary block font-mono mt-1">
            {pillars.aiRisk.detail}
          </span>
        </div>

        <div className="bg-flora-soft-white/40 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider block mb-2">
            Health
          </span>
          <span className="text-sm font-bold text-flora-text block">
            {pillars.aiVision.status}
          </span>
          <span className="text-xs text-flora-text-secondary block font-mono mt-1">
            {pillars.aiVision.detail}
          </span>
        </div>
      </div>
    </section>
  );
};

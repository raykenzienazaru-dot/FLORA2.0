import React, { useState } from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { evaluateSensorFusionHazard } from '../../utils/sensorRules';

interface AiHazardFusionPanelProps {
  latest: TelemetryRecord | null;
  onToast?: (msg: string) => void;
}

export const AiHazardFusionPanel: React.FC<AiHazardFusionPanelProps> = ({
  latest,
  onToast,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string>('LIVE');

  const hazard = latest?.hazard_ai || evaluateSensorFusionHazard(latest);
  const flameDetected = latest?.flame_detected === true || (latest?.flame_raw !== undefined && latest.flame_raw > 0 && latest.flame_raw < 1500);
  const mqPpm = Number(latest?.mq135_ppm ?? 220);

  const handleSimulate = async (scenario: string) => {
    setIsSimulating(true);
    setActiveScenario(scenario);
    try {
      const res = await fetch('/api/simulate-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      if (res.ok) {
        onToast?.(`Simulasi Skenario '${scenario}' berhasil diaktifkan ke AI Logic!`);
      } else {
        onToast?.('Gagal memicu simulasi hazard di backend.');
      }
    } catch {
      onToast?.('Koneksi backend tidak tersedia untuk simulasi.');
    } finally {
      setIsSimulating(false);
    }
  };

  // Severity style configuration
  const getBadgeStyle = () => {
    switch (hazard.threatLevel) {
      case 'EMERGENCY':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          border: 'border-red-600',
          badgeText: 'CRITICAL HAZARD',
          accentBorder: 'border-red-400',
          ring: 'ring-1 ring-red-500/20',
          pulse: true,
        };
      case 'CRITICAL':
        return {
          bg: 'bg-amber-600',
          text: 'text-white',
          border: 'border-amber-700',
          badgeText: 'HIGH RISK',
          accentBorder: 'border-amber-400',
          ring: 'ring-1 ring-amber-500/20',
          pulse: false,
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500',
          text: 'text-white',
          border: 'border-amber-600',
          badgeText: 'WARNING',
          accentBorder: 'border-amber-400',
          ring: '',
          pulse: false,
        };
      case 'ADVISORY':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          border: 'border-blue-600',
          badgeText: 'ADVISORY',
          accentBorder: 'border-blue-400',
          ring: '',
          pulse: false,
        };
      default:
        return {
          bg: 'bg-flora-primary',
          text: 'text-white',
          border: 'border-flora-forest',
          badgeText: 'ALL CLEAR',
          accentBorder: 'border-flora-soft-white',
          ring: '',
          pulse: false,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <section id="hazard-safety" className="mt-8">
      <div
        className={`bg-flora-card p-6 lg:p-8 border rounded-xl transition-all ${badgeStyle.ring} ${
          hazard.threatLevel === 'EMERGENCY' ? 'bg-red-50/30' : ''
        }`}
      >
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-flora-soft-white/30 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="text-[10px] font-bold text-flora-primary uppercase tracking-widest">
                Safety Intelligence
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg ${badgeStyle.bg} ${badgeStyle.text} tracking-wide ${
                  badgeStyle.pulse ? 'animate-pulse' : ''
                }`}
              >
                {badgeStyle.badgeText}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-flora-text tracking-tight">
              Environmental Hazard Analysis
            </h2>
          </div>

          {/* Threat Score Gauge */}
          <div className="flex items-center gap-4 bg-flora-soft-white p-4 rounded-lg border border-flora-soft-white/60 shrink-0 self-start lg:self-center">
            <div className="text-right">
              <span className="text-[10px] font-bold text-flora-text-secondary uppercase tracking-wider block">
                Threat Level
              </span>
              <div className="flex items-baseline justify-end gap-1 mt-1">
                <span
                  className={`text-3xl font-extrabold font-mono tracking-tight ${
                    hazard.threatScore > 75
                      ? 'text-red-600'
                      : hazard.threatScore > 40
                      ? 'text-amber-600'
                      : 'text-flora-primary'
                  }`}
                >
                  {hazard.threatScore}
                </span>
                <span className="text-sm font-bold text-flora-text-secondary">%</span>
              </div>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-flora-soft-white/60"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${
                    hazard.threatScore > 75
                      ? 'text-red-600'
                      : hazard.threatScore > 40
                      ? 'text-amber-500'
                      : 'text-flora-primary'
                  } transition-all duration-700`}
                  strokeDasharray={`${hazard.threatScore}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-sm">
                {hazard.threatLevel === 'SAFE' ? '🛡️' : hazard.threatLevel === 'EMERGENCY' ? '🔥' : '⚠️'}
              </span>
            </div>
          </div>
        </div>

        {/* Sensor Fusion Diagram */}
        <div className="mt-6">
          <span className="text-xs font-bold text-flora-text uppercase tracking-wider flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-flora-primary" />
            Dual-Sensor Cross-Validation
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-flora-soft-white/50 p-5 rounded-lg border border-flora-soft-white/60">
            {/* Flame Sensor */}
            <div
              className={`p-4 rounded-lg border bg-flora-card transition-all ${
                flameDetected ? 'border-red-300 ring-1 ring-red-100' : 'border-flora-soft-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0 ${
                      flameDetected ? 'bg-red-100 text-red-600' : 'bg-flora-soft-white text-flora-primary'
                    }`}
                  >
                    🔥
                  </span>
                  <span className="text-xs font-bold text-flora-text">Flame Sensor (IR)</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                    flameDetected ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-700'
                  }`}
                >
                  {flameDetected ? 'ACTIVE' : 'SAFE'}
                </span>
              </div>
              <div className="text-[11px] text-flora-text-secondary space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>Spectrum:</span>
                  <strong>760–1100 nm</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={flameDetected ? 'text-red-600' : 'text-flora-primary'}>
                    {flameDetected ? 'Fire Signal' : 'Clear'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Fusion Core */}
            <div className="p-4 rounded-lg border bg-flora-card border-flora-primary/30 flex flex-col justify-between text-center">
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-flora-soft-white text-flora-primary flex items-center justify-center text-xs font-bold">
                    ⚡
                  </span>
                  <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider">
                    AI Core
                  </span>
                </div>
                <div className="text-sm font-bold text-flora-text tracking-tight">
                  {hazard.crossValidationDetails}
                </div>
              </div>
              <p className="text-[10px] text-flora-text-secondary mt-3 pt-3 border-t border-flora-soft-white/50 italic">
                {flameDetected && mqPpm > 600
                  ? 'Dual sensor confirm: actual fire'
                  : flameDetected && mqPpm <= 350
                  ? 'Flame active but air clean: optical anomaly'
                  : !flameDetected && mqPpm > 600
                  ? 'Smoke without flame: smoldering risk'
                  : 'All sensors indicate safe conditions'}
              </p>
            </div>

            {/* Gas/Smoke Sensor */}
            <div
              className={`p-4 rounded-lg border bg-flora-card transition-all ${
                mqPpm > 600 ? 'border-amber-300 ring-1 ring-amber-100' : 'border-flora-soft-white/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0 ${
                      mqPpm > 600 ? 'bg-amber-100 text-amber-600' : 'bg-flora-soft-white text-flora-primary'
                    }`}
                  >
                    💨
                  </span>
                  <span className="text-xs font-bold text-flora-text">Air Quality (MQ-135)</span>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                    mqPpm > 1000
                      ? 'bg-red-600 text-white'
                      : mqPpm > 600
                      ? 'bg-amber-600 text-white'
                      : mqPpm > 350
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  {mqPpm > 600 ? 'HAZARD' : 'CLEAN'}
                </span>
              </div>
              <div className="text-[11px] text-flora-text-secondary space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span>PPM:</span>
                  <strong>{mqPpm}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <strong className={mqPpm > 600 ? 'text-amber-600' : 'text-flora-primary'}>
                    {mqPpm > 600 ? 'Smoke/Gas' : 'Optimal'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Cards */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Diagnosis */}
          <div className="p-5 rounded-lg bg-flora-soft-white/50 border border-flora-soft-white/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-md bg-flora-soft-white text-flora-primary flex items-center justify-center text-xs font-bold">
                🧠
              </span>
              <span className="text-xs font-bold text-flora-text-secondary uppercase tracking-wider">
                Root Cause Analysis
              </span>
            </div>

            <h4 className="text-base font-bold text-flora-text">
              {hazard.threatTitle}
            </h4>
            <p className="text-xs text-flora-text-secondary mt-2 leading-relaxed">
              {hazard.causeAnalysis}
            </p>

            <div className="mt-4 pt-4 border-t border-flora-soft-white/60">
              <span className="text-[10px] font-bold text-flora-text-secondary uppercase tracking-wider block mb-2">
                Evidence Factors:
              </span>
              <ul className="space-y-1.5">
                {hazard.factors.map((factor, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-flora-text">
                    <span className="text-flora-primary font-bold shrink-0 mt-0.5">✔</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="p-5 rounded-lg bg-flora-soft-white/50 border border-flora-soft-white/60">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-5 h-5 rounded-md bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">
                🚨
              </span>
              <span className="text-xs font-bold text-flora-text-secondary uppercase tracking-wider">
                Response Protocol
              </span>
            </div>

            <div className="space-y-2">
              {hazard.immediateActions.map((action, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-flora-card border border-flora-soft-white/40 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-flora-text text-flora-warm-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-flora-text leading-relaxed">
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Simulator */}
        <div className="mt-6 pt-6 border-t border-flora-soft-white/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <span className="text-[10px] font-bold text-flora-primary uppercase tracking-wider block">
                Testing Scenarios
              </span>
              <p className="text-xs text-flora-text-secondary mt-1">
                Test different conditions to understand hazard detection logic:
              </p>
            </div>
            {activeScenario !== 'LIVE' && (
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 whitespace-nowrap self-start sm:self-auto">
                Simulating: {activeScenario}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Normal', emoji: '🟢', desc: 'Safe conditions', scenario: 'NORMAL', color: 'bg-green-50 border-green-200' },
              { label: 'Active Fire', emoji: '🔥', desc: 'Dual sensor alert', scenario: 'FIRE_EMERGENCY', color: 'bg-red-50 border-red-200' },
              { label: 'Smoke', emoji: '💨', desc: 'High gas level', scenario: 'SMOKE_HAZARD', color: 'bg-orange-50 border-orange-200' },
              { label: 'Optical', emoji: '☀️', desc: 'False alarm', scenario: 'OPTICAL_ANOMALY', color: 'bg-blue-50 border-blue-200' },
              { label: 'Thermal', emoji: '🌡️', desc: 'High temp', scenario: 'THERMAL_STRESS', color: 'bg-amber-50 border-amber-200' },
              { label: 'Live', emoji: '⚡', desc: 'Real sensor data', scenario: 'LIVE', color: 'bg-flora-soft-white border-flora-soft-white/60' },
            ].map(({ label, emoji, desc, scenario, color }) => (
              <button
                key={scenario}
                disabled={isSimulating}
                onClick={() => {
                  if (scenario === 'LIVE') {
                    setActiveScenario('LIVE');
                    onToast?.('Returned to live telemetry.');
                  } else {
                    handleSimulate(scenario);
                  }
                }}
                className={`p-3 rounded-lg border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                  activeScenario === scenario || (activeScenario === 'LIVE' && scenario === 'LIVE')
                    ? `${color} ring-1 ring-offset-0`
                    : 'border-flora-soft-white/40 bg-flora-card hover:bg-flora-soft-white/30'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-1.5 mb-1">
                    <span>{emoji}</span>
                    <span className="truncate">{label}</span>
                  </div>
                  <div className="text-[10px] text-flora-text-secondary line-clamp-2">
                    {desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

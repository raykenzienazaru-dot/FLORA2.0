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
  const temp = Number(latest?.temperature ?? 26);
  const soil = Number(latest?.soil_moisture ?? 55);

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
          bg: 'bg-red-600',
          text: 'text-white',
          border: 'border-red-700',
          badgeText: 'CRITICAL EMERGENCY',
          accentBorder: 'border-red-400',
          ring: 'ring-2 ring-red-500/50',
          pulse: true,
        };
      case 'CRITICAL':
        return {
          bg: 'bg-orange-600',
          text: 'text-white',
          border: 'border-orange-700',
          badgeText: 'HIGH RISK / TOXIC',
          accentBorder: 'border-orange-400',
          ring: 'ring-1 ring-orange-500/40',
          pulse: false,
        };
      case 'WARNING':
        return {
          bg: 'bg-amber-500',
          text: 'text-neutral-900',
          border: 'border-amber-600',
          badgeText: 'HAZARD WARNING',
          accentBorder: 'border-amber-400',
          ring: '',
          pulse: false,
        };
      case 'ADVISORY':
        return {
          bg: 'bg-sky-500',
          text: 'text-white',
          border: 'border-sky-600',
          badgeText: 'OPTICAL ADVISORY',
          accentBorder: 'border-sky-400',
          ring: '',
          pulse: false,
        };
      default:
        return {
          bg: 'bg-[#597C00]',
          text: 'text-white',
          border: 'border-[#4A6800]',
          badgeText: 'SECURE & ALL CLEAR',
          accentBorder: 'border-[#E4EBE0]',
          ring: '',
          pulse: false,
        };
    }
  };

  const badgeStyle = getBadgeStyle();

  return (
    <section id="hazard-safety" className="mt-8">
      {/* Panel Container */}
      <div
        className={`flora-card p-5 sm:p-7 transition-all duration-300 ${badgeStyle.ring} ${
          hazard.threatLevel === 'EMERGENCY' ? 'bg-red-50/15' : ''
        }`}
      >
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-[#E4EBE0] gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] font-extrabold text-[#597C00] uppercase tracking-widest">
                FLORA 2.0 AI Core
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${badgeStyle.bg} ${badgeStyle.text} tracking-wider shadow-xs ${
                  badgeStyle.pulse ? 'animate-pulse' : ''
                }`}
              >
                {badgeStyle.badgeText}
              </span>
              <span className="text-[10px] font-bold text-[#617253] bg-[#F4F7F2] px-2 py-0.5 rounded border border-[#E4EBE0]">
                Rule-Based Multi-Sensor Fusion
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1B2408] tracking-tight font-display">
              AI Hazard Logic: Sinergi MQ-135 & Flame Sensor
            </h2>
            <p className="text-xs sm:text-sm text-[#617253] mt-1 max-w-2xl leading-relaxed">
              Sistem inferensi fusi multi-sensor non-dataset yang secara aktif melakukan verifikasi silang (cross-validation) antara spektrum nyala api inframerah dan partikel gas/asap untuk menolak false positive dan mengonfirmasi bahaya nyata.
            </p>
          </div>

          {/* Threat Score Gauge Box */}
          <div className="flex items-center gap-4 bg-[#F7FAF8] p-3 sm:p-4 rounded-2xl border border-[#E4EBE0] shrink-0 self-start lg:self-center">
            <div className="text-right">
              <span className="text-[10px] font-bold text-[#617253] uppercase tracking-wider block">
                Skor Tingkat Bahaya
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <span
                  className={`text-3xl sm:text-4xl font-extrabold font-tabular tracking-tight ${
                    hazard.threatScore > 75
                      ? 'text-red-600'
                      : hazard.threatScore > 40
                      ? 'text-amber-600'
                      : 'text-[#597C00]'
                  }`}
                >
                  {hazard.threatScore}
                </span>
                <span className="text-sm font-bold text-[#617253]">%</span>
              </div>
              <span className="text-[10px] font-semibold text-[#617253]">
                Korelasi: {hazard.sensorCorrelationIndex}%
              </span>
            </div>

            {/* Circular Visual Indicator */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-neutral-200"
                  strokeWidth="3.5"
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
                      : 'text-[#597C00]'
                  } transition-all duration-700 ease-out`}
                  strokeDasharray={`${hazard.threatScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold">
                {hazard.threatLevel === 'SAFE' ? '🛡️' : hazard.threatLevel === 'EMERGENCY' ? '🔥' : '⚠️'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. SENSOR FUSION CROSS-VALIDATION DIAGRAM */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold text-[#1B2408] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#597C00]" />
              Diagram Fusi & Validasi Silang Sensor (Mutual Cross-Validation Matrix)
            </span>
            <span className="text-[11px] font-mono text-[#617253] bg-neutral-100 px-2 py-0.5 rounded">
              Status Fusi: <strong className="text-[#1B2408]">{hazard.crossValidationStatus}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-stretch bg-[#F4F7F2] p-4 rounded-2xl border border-[#E4EBE0]">
            {/* Node A: Flame Sensor */}
            <div
              className={`p-4 rounded-xl border bg-white flex flex-col justify-between h-full shadow-xs transition-all ${
                flameDetected ? 'border-red-400 ring-1 ring-red-400 bg-red-50/10' : 'border-[#E4EBE0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      flameDetected ? 'bg-red-100 text-red-600' : 'bg-[#EAF4E8] text-[#597C00]'
                    }`}>
                      🔥
                    </span>
                    <span className="text-xs font-bold text-[#1B2408] truncate">Flame Sensor (IR)</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      flameDetected ? 'bg-red-600 text-white animate-pulse' : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {flameDetected ? 'API AKTIF' : 'AMAN'}
                  </span>
                </div>
                <div className="text-[11px] text-[#617253] space-y-1.5 font-tabular">
                  <div className="flex justify-between">
                    <span>Spektrum:</span>
                    <strong className="text-[#1B2408]">760 – 1100 nm</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Probe:</span>
                    <strong className={flameDetected ? 'text-red-600' : 'text-[#22531A]'}>
                      {flameDetected ? 'Sinyal IR Aktif' : 'Nol Emisi Api'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Intensitas:</span>
                    <strong className="text-[#1B2408]">
                      {latest?.flame_raw ? `${latest.flame_raw} ADC` : 'Normal'}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E4EBE0] flex justify-between items-center text-[10px] text-[#617253]">
                <span>Cross-Check:</span>
                <span className="font-semibold text-[#1B2408] bg-[#F4F7F2] px-2 py-0.5 rounded">Jalur Optik IR</span>
              </div>
            </div>

            {/* Middle: AI Fusion Consensus Core */}
            <div className="p-4 rounded-xl border bg-white border-[#597C00]/30 shadow-xs flex flex-col justify-between h-full text-center relative">
              <div>
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-[#EAF4E8] text-[#597C00] flex items-center justify-center text-[11px]">
                    ⚡
                  </span>
                  <span className="text-[10px] font-extrabold text-[#597C00] uppercase tracking-wider">
                    AI Consensus Engine
                  </span>
                </div>
                <div className="text-sm font-extrabold text-[#1B2408] tracking-tight leading-snug">
                  {hazard.crossValidationDetails}
                </div>
                <div className="mt-2.5 flex items-center justify-center gap-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F4F7F2] border border-[#E4EBE0] font-semibold text-[#617253]">
                    Korelasi: {hazard.sensorCorrelationIndex}%
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#F4F7F2] border border-[#E4EBE0] font-semibold text-[#617253]">
                    Suhu: {temp.toFixed(1)}°C · Tanah: {soil.toFixed(0)}%
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-[#617253] mt-2 italic pt-2 border-t border-[#E4EBE0]">
                {flameDetected && mqPpm > 600
                  ? 'Kedua sensor saling mendukung = Kebakaran Nyata Terkonfirmasi'
                  : flameDetected && mqPpm <= 350
                  ? 'Sensor api terpicu tapi udara bersih = Anomali Optik Matahari'
                  : !flameDetected && mqPpm > 600
                  ? 'Asap tinggi tanpa api terbuka = Bara Tersembunyi (Smoldering)'
                  : 'Seluruh sensor sepakat pada status mikroklimat aman'}
              </p>
            </div>

            {/* Node B: MQ-135 Gas & Smoke */}
            <div
              className={`p-4 rounded-xl border bg-white flex flex-col justify-between h-full shadow-xs transition-all ${
                mqPpm > 600 ? 'border-orange-400 ring-1 ring-orange-400 bg-orange-50/10' : 'border-[#E4EBE0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                      mqPpm > 600 ? 'bg-orange-100 text-orange-600' : 'bg-[#EAF4E8] text-[#597C00]'
                    }`}>
                      💨
                    </span>
                    <span className="text-xs font-bold text-[#1B2408] truncate">Gas/Asap MQ-135</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${
                      mqPpm > 1000
                        ? 'bg-red-600 text-white'
                        : mqPpm > 600
                        ? 'bg-orange-600 text-white'
                        : mqPpm > 350
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {mqPpm > 600 ? 'POLUSI/ASAP' : 'BERSIH'}
                  </span>
                </div>
                <div className="text-[11px] text-[#617253] space-y-1.5 font-tabular">
                  <div className="flex justify-between">
                    <span>Konsentrasi:</span>
                    <strong className="text-[#1B2408]">{mqPpm} PPM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Status Udara:</span>
                    <strong className={mqPpm > 600 ? 'text-orange-600' : 'text-[#22531A]'}>
                      {mqPpm > 600 ? 'Bahaya Asap' : 'Optimal Bersih'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Target:</span>
                    <strong className="text-[#1B2408]">Asap, CO2, VOC</strong>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#E4EBE0] flex justify-between items-center text-[10px] text-[#617253]">
                <span>Cross-Check:</span>
                <span className="font-semibold text-[#1B2408] bg-[#F4F7F2] px-2 py-0.5 rounded">Jalur Kimia Gas</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AI DIAGNOSIS & REASONING DETAILS */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
          {/* Card Left: Diagnosis & Root Cause */}
          <div className="p-5 rounded-2xl bg-white border border-[#E4EBE0] flex flex-col justify-between h-full shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-[#EAF4E8] text-[#597C00] flex items-center justify-center text-xs font-bold shrink-0">
                  🧠
                </span>
                <span className="text-xs font-bold text-[#617253] uppercase tracking-wider">
                  Analisis Logika Sebab-Akibat (AI Root Cause Reasoning)
                </span>
              </div>

              <h4 className="text-base font-bold text-[#1B2408] tracking-tight">
                {hazard.threatTitle}
              </h4>
              <p className="text-xs sm:text-sm text-[#3E4F32] mt-2 leading-relaxed">
                {hazard.causeAnalysis}
              </p>

              {/* Contributing Factors */}
              <div className="mt-4 pt-3 border-t border-[#E4EBE0]">
                <span className="text-[11px] font-bold text-[#617253] uppercase tracking-wider block mb-2">
                  Faktor-Faktor Bukti Telemetry:
                </span>
                <ul className="space-y-1.5">
                  {hazard.factors.map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#1B2408]">
                      <span className="text-[#597C00] font-bold shrink-0 mt-0.5">✔</span>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#E4EBE0] flex items-center justify-between text-[11px] text-[#617253]">
              <span>Rekomendasi Inspeksi:</span>
              <strong className="text-[#1B2408]">{hazard.recommendedInspection}</strong>
            </div>
          </div>

          {/* Card Right: Actionable Guide & Automated System Responses */}
          <div className="p-5 rounded-2xl bg-white border border-[#E4EBE0] flex flex-col justify-between h-full shadow-xs">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0">
                  🚨
                </span>
                <span className="text-xs font-bold text-[#617253] uppercase tracking-wider">
                  Protokol Tanggap Darurat & Mitigasi Cepat
                </span>
              </div>

              <div className="space-y-2 mt-3">
                {hazard.immediateActions.map((action, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#F7FAF8] border border-[#E4EBE0] flex items-start gap-2.5"
                  >
                    <span className="w-5 h-5 rounded-full bg-[#1B2408] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-xs text-[#1B2408] font-medium leading-relaxed">
                      {action}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Automated Hardware Defensive Response */}
            <div className="mt-5 pt-3 border-t border-[#E4EBE0]">
              <span className="text-[11px] font-bold text-[#597C00] uppercase tracking-wider block mb-2">
                Respon Otomatis Sistem FLORA:
              </span>
              <div className="space-y-1">
                {hazard.systemResponses.map((resp, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#617253]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#597C00] shrink-0" />
                    <span>{resp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE HAZARD TEST BENCH & SIMULATOR */}
        <div className="mt-6 pt-5 border-t border-[#E4EBE0]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] font-bold text-[#597C00] uppercase tracking-wider block">
                Simulator Pengujian Logika AI FLORA 2.0 (Testing Bench)
              </span>
              <p className="text-xs text-[#617253]">
                Uji langsung bagaimana AI Logic membedakan kebakaran aktif nyata, false alarm optik, ataupun kebocoran asap tanpa membakar sensor fisik:
              </p>
            </div>
            {activeScenario !== 'LIVE' && (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 whitespace-nowrap self-start sm:self-auto">
                Mode Simulasi: {activeScenario}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
            {/* Scenario 1: Live Stream */}
            <button
              disabled={isSimulating}
              onClick={() => handleSimulate('NORMAL')}
              className={`p-3.5 rounded-xl border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                activeScenario === 'LIVE' || activeScenario === 'NORMAL'
                  ? 'border-[#597C00] bg-[#EAF4E8] text-[#22531A] font-bold shadow-xs ring-1 ring-[#597C00]/40'
                  : 'border-[#E4EBE0] bg-white hover:bg-neutral-50 text-[#1B2408]'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>🟢</span>
                  <span className="truncate">Normal (Aman)</span>
                </div>
                <div className="text-[10px] text-[#617253] line-clamp-2">
                  Mikroklimat optimal; sensor MQ &amp; Flame aman.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#E4EBE0]/80 text-[10px] font-mono text-[#597C00] font-semibold">
                Flame: 0 · 225 PPM
              </div>
            </button>

            {/* Scenario 2: Active Fire */}
            <button
              disabled={isSimulating}
              onClick={() => handleSimulate('FIRE_EMERGENCY')}
              className={`p-3.5 rounded-xl border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                activeScenario === 'FIRE_EMERGENCY'
                  ? 'border-red-600 bg-red-100 text-red-900 font-bold shadow-xs ring-1 ring-red-500/50'
                  : 'border-red-200 bg-red-50/50 hover:bg-red-50 text-red-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>🔥</span>
                  <span className="truncate">Api + Asap</span>
                </div>
                <div className="text-[10px] text-red-700/80 line-clamp-2">
                  Dual sensor terkonfirmasi kebakaran nyata.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-red-200 text-[10px] font-mono text-red-700 font-bold">
                Flame: 1 · 985 PPM
              </div>
            </button>

            {/* Scenario 3: Smoke/Gas Only */}
            <button
              disabled={isSimulating}
              onClick={() => handleSimulate('SMOKE_HAZARD')}
              className={`p-3.5 rounded-xl border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                activeScenario === 'SMOKE_HAZARD'
                  ? 'border-orange-600 bg-orange-100 text-orange-900 font-bold shadow-xs ring-1 ring-orange-500/50'
                  : 'border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-orange-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>💨</span>
                  <span className="truncate">Asap / Bara</span>
                </div>
                <div className="text-[10px] text-orange-700/80 line-clamp-2">
                  Bara sekam / korsleting kabel tanpa api terbuka.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-orange-200 text-[10px] font-mono text-orange-700 font-bold">
                Flame: 0 · 1140 PPM
              </div>
            </button>

            {/* Scenario 4: Optical Anomaly / Glare */}
            <button
              disabled={isSimulating}
              onClick={() => handleSimulate('OPTICAL_ANOMALY')}
              className={`p-3.5 rounded-xl border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                activeScenario === 'OPTICAL_ANOMALY'
                  ? 'border-sky-600 bg-sky-100 text-sky-900 font-bold shadow-xs ring-1 ring-sky-500/50'
                  : 'border-sky-200 bg-sky-50/50 hover:bg-sky-50 text-sky-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>☀️</span>
                  <span className="truncate">Silau Optik</span>
                </div>
                <div className="text-[10px] text-sky-700/80 line-clamp-2">
                  Pantulan sinar matahari; udara tetap bersih.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-sky-200 text-[10px] font-mono text-sky-700 font-bold">
                Flame: 1 · 210 PPM
              </div>
            </button>

            {/* Scenario 5: Thermal Overheat */}
            <button
              disabled={isSimulating}
              onClick={() => handleSimulate('THERMAL_STRESS')}
              className={`p-3.5 rounded-xl border text-left transition-all h-full flex flex-col justify-between cursor-pointer ${
                activeScenario === 'THERMAL_STRESS'
                  ? 'border-amber-600 bg-amber-100 text-amber-900 font-bold shadow-xs ring-1 ring-amber-500/50'
                  : 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-800'
              }`}
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>🌡️</span>
                  <span className="truncate">Thermal Stress</span>
                </div>
                <div className="text-[10px] text-amber-700/80 line-clamp-2">
                  Suhu ekstrem memicu risiko kebakaran spontan.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-amber-200 text-[10px] font-mono text-amber-700 font-bold">
                38.6°C · Tanah: 14%
              </div>
            </button>

            {/* Scenario 6: Reset to Live Telemetry */}
            <button
              disabled={isSimulating}
              onClick={() => {
                setActiveScenario('LIVE');
                onToast?.('Mengembalikan tampilan ke Aliran Telemetri Live.');
              }}
              className="p-3.5 rounded-xl border border-[#E4EBE0] bg-white hover:bg-neutral-50 text-[#1B2408] text-left transition-all h-full flex flex-col justify-between cursor-pointer hover:border-[#597C00]"
            >
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5 mb-1 truncate">
                  <span>⚡</span>
                  <span className="truncate">Live Telemetri</span>
                </div>
                <div className="text-[10px] text-[#617253] line-clamp-2">
                  Kembali ke pembacaan langsung dari sensor ESP32.
                </div>
              </div>
              <div className="mt-2.5 pt-2 border-t border-[#E4EBE0]/80 text-[10px] font-mono text-[#597C00] font-semibold">
                Reset Mode
              </div>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

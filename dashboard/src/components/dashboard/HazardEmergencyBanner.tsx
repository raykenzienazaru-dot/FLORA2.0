import React from 'react';
import { TelemetryRecord } from '../../types/dashboard';
import { evaluateSensorFusionHazard } from '../../utils/sensorRules';

interface HazardEmergencyBannerProps {
  latest: TelemetryRecord | null;
  onNavigateToSafety: () => void;
}

export const HazardEmergencyBanner: React.FC<HazardEmergencyBannerProps> = ({
  latest,
  onNavigateToSafety,
}) => {
  const hazard = latest?.hazard_ai || evaluateSensorFusionHazard(latest);

  if (hazard.threatLevel === 'SAFE') {
    return null;
  }

  const isEmergency = hazard.threatLevel === 'EMERGENCY';
  const isCritical = hazard.threatLevel === 'CRITICAL';
  const isWarning = hazard.threatLevel === 'WARNING';

  // Styling based on severity
  const bgGradient = isEmergency
    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white shadow-lg shadow-red-500/25 ring-2 ring-red-400'
    : isCritical
    ? 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white shadow-md shadow-orange-500/20'
    : isWarning
    ? 'bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-600 text-white shadow-md'
    : 'bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-700 text-white shadow-md';

  return (
    <div
      role="alert"
      className={`rounded-2xl p-4 sm:p-5 mb-6 ${bgGradient} transition-all duration-300 animate-fadeIn`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Icon & Message */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30 text-white">
            {isEmergency ? (
              <svg className="w-6 h-6 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 border border-white/40">
                {hazard.threatLevel} HAZARD
              </span>
              <span className="text-xs font-semibold text-white/90">
                Skor Ancaman AI: {hazard.threatScore}%
              </span>
              <span className="text-[11px] bg-black/20 px-2 py-0.5 rounded-md font-mono text-white/90">
                {hazard.crossValidationDetails}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-1">
              {hazard.threatTitle}
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed max-w-3xl mt-0.5 line-clamp-2">
              {hazard.threatDescription}
            </p>
          </div>
        </div>

        {/* Right: Call to action button */}
        <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
          <button
            onClick={onNavigateToSafety}
            className="px-4 py-2.5 rounded-xl bg-white text-[#1B2408] hover:bg-neutral-100 font-bold text-xs sm:text-sm shadow-md transition-all duration-150 flex items-center gap-2 group cursor-pointer"
          >
            <span>Buka Diagnosis AI</span>
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

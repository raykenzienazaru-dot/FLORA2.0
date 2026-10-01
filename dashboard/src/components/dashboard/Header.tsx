import React from 'react';
import { useClock } from '../../hooks/useClock';
import { SystemStatusInfo } from '../../types/dashboard';

interface HeaderProps {
  onRefresh: () => void;
  onOpenMobileMenu?: () => void;
  isRefreshing?: boolean;
  systemStatus?: SystemStatusInfo;
  mqttStatus?: string;
  isStale?: boolean;
  lastTelemetryText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  onOpenMobileMenu,
  isRefreshing,
  systemStatus,
  mqttStatus = 'DISCONNECTED',
  isStale = false,
  lastTelemetryText,
}) => {
  const clock = useClock();

  // Fallback if systemStatus is not provided directly
  const status: SystemStatusInfo = systemStatus || {
    state: mqttStatus === 'CONNECTED' ? (isStale ? 'STALE' : 'LIVE') : 'DISCONNECTED',
    label: mqttStatus === 'CONNECTED' ? (isStale ? 'STALE' : 'LIVE') : 'DISCONNECTED',
    badgeText: mqttStatus === 'CONNECTED' ? (isStale ? 'Telemetry Stale' : 'Live Stream') : 'Disconnected',
    description:
      mqttStatus === 'CONNECTED'
        ? isStale
          ? 'Telemetry stale'
          : 'Live telemetry'
        : 'Trying to reconnect...',
    lastUpdateText: lastTelemetryText ? `Last update: ${lastTelemetryText}` : null,
    secondsAgo: null,
    indicatorColor:
      mqttStatus === 'CONNECTED' && !isStale
        ? 'bg-[#597C00] animate-pulse'
        : mqttStatus === 'CONNECTED' && isStale
        ? 'bg-[#D97706]'
        : 'bg-[#DC2626]',
    reconnectMessage: mqttStatus === 'CONNECTED' ? null : 'Trying to reconnect...',
    isLive: mqttStatus === 'CONNECTED' && !isStale,
    isStale,
  };

  const getStatusDisplayText = () => {
    switch (status.state) {
      case 'LIVE':
        return status.lastUpdateText || 'Live telemetry';
      case 'STALE':
        return status.description || 'Telemetry stale';
      case 'CONNECTED':
        return 'Connection established. Waiting for telemetry.';
      case 'LOADING':
        return 'Connecting to FLORA...';
      case 'DISCONNECTED':
        return 'Disconnected · Trying to reconnect...';
      case 'ERROR':
        return status.description || 'Connection error';
      default:
        return status.description;
    }
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 mb-6 border-b border-flora-soft-white/30">
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg bg-flora-card border border-flora-soft-white/40 text-flora-text hover:bg-flora-soft-white text-lg font-bold cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            ☰
          </button>
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-flora-primary uppercase flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
              </svg>
              <span>FLORA 2.0</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-flora-text mt-1 tracking-tight">
            Environmental Status
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
        {/* Status Badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-flora-card border border-flora-soft-white/40 text-xs"
          title={status.description}
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${status.indicatorColor}`}
          />
          <span className="font-bold text-flora-text text-[11px] uppercase tracking-wider">
            {status.state}
          </span>
          <span className="text-[11px] text-flora-text-secondary font-mono border-l border-flora-soft-white/30 pl-2 hidden sm:inline-block max-w-[200px] truncate">
            {getStatusDisplayText()}
          </span>
        </div>

        {/* Clock */}
        <span className="hidden md:inline-block px-3 py-1.5 rounded-lg bg-flora-card border border-flora-soft-white/40 text-xs font-medium text-flora-text font-mono">
          {clock}
        </span>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-1.5 rounded-lg bg-flora-primary hover:bg-flora-primary/90 text-white text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span className={isRefreshing ? 'animate-spin inline-block' : ''}>↻</span>
          <span className="hidden sm:inline">{isRefreshing ? 'Syncing' : 'Refresh'}</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { SystemStatusInfo } from '../../types/dashboard';

interface SidebarProps {
  systemState: string;
  systemStatus?: SystemStatusInfo;
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    id: 'hazard-safety',
    label: 'AI Safety & Fire',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
      </svg>
    ),
  },
  {
    id: 'analysis',
    label: 'AI Analysis',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'cameraCapture',
    label: 'AI Vision',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" />
      </svg>
    ),
  },
  {
    id: 'device-control',
    label: 'Scanner Control',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8" />
        <line x1="4" y1="20" x2="21" y2="3" />
        <polyline points="21 16 21 21 16 21" />
        <line x1="15" y1="15" x2="21" y2="21" />
        <line x1="4" y1="4" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    id: 'treatment',
    label: 'Treatment & Advice',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 5-4 9-9 9s-9-4-9-9a9 9 0 0 1 9-9z" />
        <path d="M12 6v12M8 10l4-4 4 4" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History & Trends',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: 'devices',
    label: 'System Health',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
        <line x1="6" y1="6" x2="6.01" y2="6" />
        <line x1="6" y1="18" x2="6.01" y2="18" />
      </svg>
    ),
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  systemState,
  systemStatus,
  activeSection,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}) => {
  const isOnline = systemStatus
    ? systemStatus.isLive
    : systemState.toLowerCase().includes('active') || systemState.toLowerCase().includes('live');

  const navContent = (
    <div className="flex flex-col h-full p-4 lg:p-6 text-flora-soft-white">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-flora-forest/20">
        <div className="w-9 h-9 rounded-lg bg-flora-primary text-white flex items-center justify-center border border-flora-accent/30 shrink-0">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
          </svg>
        </div>
        <div className="min-w-0">
          <span className="block text-xs font-bold tracking-widest text-flora-accent uppercase">
            FLORA 2.0
          </span>
          <span className="block text-xs font-medium text-flora-soft-white/90 truncate">
            Plant Monitoring System
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 overflow-y-auto">
        <span className="text-[10px] font-bold text-flora-accent/80 uppercase tracking-wider px-3 mb-3 block">
          Navigation
        </span>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-flora-primary text-white shadow-sm'
                    : 'text-flora-soft-white/80 hover:text-white hover:bg-flora-forest/20'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-flora-accent/70'}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status at Bottom */}
      <div className="pt-6 border-t border-flora-forest/20 shrink-0">
        <div className="bg-flora-dark-surface p-4 rounded-lg border border-flora-forest/40 flex items-center gap-3">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              systemStatus
                ? systemStatus.indicatorColor
                : isOnline
                ? 'bg-flora-primary shadow-sm'
                : 'bg-orange-500'
            }`}
          />
          <div className="min-w-0 flex-1">
            <span className="block text-[10px] text-flora-accent/80 font-semibold uppercase tracking-wider">
              System Status
            </span>
            <span className="block text-xs font-bold text-white uppercase tracking-tight mt-0.5 truncate">
              {systemStatus ? systemStatus.state : systemState}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] h-screen sticky top-0 shrink-0 bg-flora-dark-surface flex-col border-r border-flora-forest/20 z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden flex"
          onClick={onCloseMobile}
        >
          <div
            className="w-[260px] h-full bg-flora-dark-surface flex flex-col z-50 animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-flora-forest/20">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-flora-accent">✦</span>
                <span>Menu</span>
              </span>
              <button
                onClick={onCloseMobile}
                className="text-flora-soft-white/70 hover:text-white p-1 rounded-md text-sm"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {navContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

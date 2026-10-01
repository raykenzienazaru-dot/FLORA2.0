import React, { useState, useMemo } from 'react';
import { TelemetryRecord, WateringEvent } from '../../types/dashboard';

interface SmartWateringPanelProps {
  latest: TelemetryRecord | null;
  onWatered: (note?: string) => Promise<WateringEvent | void>;
  wateringEvents?: WateringEvent[];
  lastWateringEvent?: WateringEvent | null;
}

export const SmartWateringPanel: React.FC<SmartWateringPanelProps> = ({
  latest,
  onWatered,
  wateringEvents,
  lastWateringEvent,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ title: string; subtitle: string } | null>(null);
  const [localEvents, setLocalEvents] = useState<WateringEvent[]>([]);

  // 1. Current Irrigation Condition derived strictly from actual telemetry
  const condition = useMemo(() => {
    if (!latest) {
      return {
        title: 'Awaiting telemetry data',
        description: 'Waiting for sensor readings to assess irrigation condition.',
      };
    }

    const moisture = Number(latest.soil_moisture);
    const status = latest.watering_status || '';

    if (status === 'URGENT_CHECK' || (!isNaN(moisture) && moisture < 20)) {
      return {
        title: 'Attention needed',
        description:
          latest.watering_description ||
          'Very low soil moisture detected. Check the plant promptly.',
      };
    }
    if (status === 'WATERING_RECOMMENDED' || (!isNaN(moisture) && moisture < 30)) {
      return {
        title: 'Check watering',
        description:
          latest.watering_description ||
          'Low soil moisture detected. Check the plant and consider watering.',
      };
    }
    if (status === 'TOO_WET' || (!isNaN(moisture) && moisture > 80)) {
      return {
        title: 'Soil is saturated',
        description:
          latest.watering_description ||
          'High soil moisture detected. Defer watering to avoid over-saturation.',
      };
    }
    if (status === 'MONITOR') {
      return {
        title: 'Monitoring moisture',
        description:
          latest.watering_description ||
          'Single low reading detected. Monitoring next telemetry cycle.',
      };
    }

    return {
      title: 'No watering needed',
      description:
        latest.watering_description ||
        'Soil moisture is currently sufficient based on the latest reading.',
    };
  }, [latest]);

  // 2. Aggregate real events without duplicating or inventing data
  const allEvents = useMemo(() => {
    const combined = [...localEvents];
    const existingIds = new Set(localEvents.map((e) => e.id));

    if (wateringEvents && Array.isArray(wateringEvents)) {
      for (const ev of wateringEvents) {
        if (!existingIds.has(ev.id)) {
          combined.push(ev);
        }
      }
    } else if (lastWateringEvent && !existingIds.has(lastWateringEvent.id)) {
      combined.push(lastWateringEvent);
    }

    return combined.sort((a, b) => {
      const timeA = Date.parse(a.timestamp) || a.id;
      const timeB = Date.parse(b.timestamp) || b.id;
      return timeB - timeA;
    });
  }, [wateringEvents, lastWateringEvent, localEvents]);

  const latestEvent = allEvents[0] || null;
  const recentHistory = allEvents.slice(0, 5);

  const formatEventTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { full: isoString, timeOnly: isoString };
      const timeOnly = d.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const full = isToday
        ? `Today, ${timeOnly}`
        : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeOnly}`;
      return { full, timeOnly };
    } catch {
      return { full: isoString, timeOnly: isoString };
    }
  };

  const handleWaterClick = async () => {
    try {
      setIsSubmitting(true);
      const res = await onWatered('Manual watering recorded from console');
      const newEvent: WateringEvent =
        res && res.id
          ? res
          : {
              id: Date.now(),
              timestamp: new Date().toISOString(),
              soil_before: latest?.soil_moisture ?? null,
              note: 'Manual watering recorded from console',
            };
      setLocalEvents((prev) => [newEvent, ...prev.filter((e) => e.id !== newEvent.id)]);
      setNotification({
        title: 'Manual irrigation recorded',
        subtitle: 'Saved as a watering event. No pump command was sent.',
      });
    } catch {
      setNotification({
        title: 'Could not record manual irrigation',
        subtitle: 'Please check connection to FLORA service.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const moistureVal = latest?.soil_moisture;
  const hasMoisture = moistureVal !== undefined && moistureVal !== null && !isNaN(Number(moistureVal));

  return (
    <section className="bg-flora-card p-6 flex flex-col justify-between border border-flora-soft-white/40 rounded-lg h-full">
      <div>
        {/* Header */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-flora-primary uppercase tracking-widest block">
              Smart Watering
            </span>
            {hasMoisture && (
              <span className="text-[11px] font-mono text-flora-text-secondary">
                Soil: <strong className="text-flora-text">{Number(moistureVal).toFixed(0)}%</strong>
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-flora-text capitalize">
            {condition.title}
          </h2>
          <p className="text-xs text-flora-text-secondary mt-1 leading-relaxed">
            {condition.description}
          </p>
        </div>

        {/* Last Watering */}
        {latestEvent ? (
          <div className="bg-flora-soft-white/50 border border-flora-soft-white/50 rounded-lg p-3.5 my-3.5">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-flora-text-secondary">
                Last Manual Watering
              </span>
              <span className="text-[10px] font-semibold text-flora-primary bg-flora-soft-white px-2 py-0.5 rounded border border-flora-soft-white/60">
                Recorded
              </span>
            </div>
            <div className="text-sm font-bold text-flora-text">
              {formatEventTime(latestEvent.timestamp).full}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-flora-text-secondary mt-1 font-mono">
              <span>Manual Log</span>
            </div>
          </div>
        ) : (
          <div className="bg-flora-soft-white/30 border border-flora-soft-white/40 rounded-lg p-3.5 my-3.5 text-xs text-flora-text-secondary">
            <span className="text-[10px] font-bold uppercase tracking-wider block mb-0.5">
              Last Manual Watering
            </span>
            <span className="text-[11px] italic">
              No irrigation recorded yet.
            </span>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className="bg-green-50 border border-green-200 text-green-900 p-3 rounded-lg mb-3 flex items-start justify-between gap-2 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="font-bold text-sm leading-none mt-0.5">✓</span>
              <div>
                <span className="font-bold text-xs block">{notification.title}</span>
                <span className="text-[11px] opacity-90 block mt-0.5">
                  {notification.subtitle}
                </span>
              </div>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-green-900/60 hover:text-green-900 px-1 font-bold cursor-pointer"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        {/* Water Button */}
        <button
          onClick={handleWaterClick}
          disabled={isSubmitting}
          className="w-full py-2.5 px-4 rounded-lg bg-flora-primary hover:bg-flora-primary/90 text-white font-semibold text-xs transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>💧</span>
          <span>{isSubmitting ? 'Recording...' : 'Record Manual Watering'}</span>
        </button>

        {/* Recent Activity */}
        {recentHistory.length > 0 ? (
          <div className="mt-4 pt-3 border-t border-flora-soft-white/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-flora-text-secondary block mb-2">
              Recent Activity
            </span>
            <div className="space-y-1.5 font-mono text-xs">
              {recentHistory.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between py-1.5 px-2 rounded bg-flora-soft-white/30 hover:bg-flora-soft-white/50 transition-colors"
                >
                  <span className="font-medium text-flora-text">
                    {formatEventTime(ev.timestamp).timeOnly}
                  </span>
                  <span className="text-flora-text-secondary">Manual log</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-flora-soft-white/30">
            <span className="text-[10px] font-bold uppercase tracking-wider text-flora-text-secondary block mb-1">
              Recent Activity
            </span>
            <p className="text-[11px] text-flora-text-secondary italic m-0">
              No history yet.
            </p>
          </div>
        )}
      </div>

      {/* Auto Watering Note */}
      <div className="mt-4 pt-3 border-t border-flora-soft-white/30">
        <span className="text-[10px] font-bold uppercase tracking-wider text-flora-text-secondary block mb-1">
          Automatic Control
        </span>
        <p className="text-[11px] text-flora-text-secondary m-0">
          Connect pump to enable automatic irrigation scheduling.
        </p>
      </div>
    </section>
  );
};

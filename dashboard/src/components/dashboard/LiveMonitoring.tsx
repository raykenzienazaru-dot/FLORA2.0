import React from 'react';
import { TelemetryRecord, ThresholdConfig } from '../../types/dashboard';
import { formatTime } from '../../utils/formatters';
import {
  interpretTemperature,
  interpretHumidity,
  interpretSoil,
  interpretMq135,
  interpretFlame,
  MetricInterpretation,
} from '../../utils/sensorRules';

interface LiveMonitoringProps {
  latest: TelemetryRecord | null;
  config?: Partial<ThresholdConfig>;
}

interface SensorCardProps {
  title: string;
  icon: React.ReactNode;
  metric: MetricInterpretation;
  updatedText: string;
  badgeExtra?: string;
  isAlertPulsing?: boolean;
}

const SensorCard: React.FC<SensorCardProps> = ({
  title,
  icon,
  metric,
  updatedText,
  badgeExtra,
  isAlertPulsing,
}) => {
  return (
    <article
      className={`bg-flora-card p-5 flex flex-col justify-between h-full border rounded-lg transition-all ${
        isAlertPulsing ? 'border-red-200 ring-1 ring-red-100' : 'border-flora-soft-white/40'
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-4 gap-2">
          <div className="flex items-center gap-2.5">
            <span
              className={`p-2 rounded-md flex items-center justify-center border ${
                isAlertPulsing
                  ? 'bg-red-50 text-red-600 border-red-100'
                  : 'bg-flora-soft-white text-flora-primary border-flora-soft-white/60'
              }`}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-flora-text-secondary uppercase tracking-wider block truncate">
                {title}
              </span>
              {badgeExtra && (
                <span className="text-[9px] font-semibold text-flora-text-muted mt-0.5 block">
                  {badgeExtra}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="my-3 flex items-baseline gap-1.5">
          <span
            className={`text-2xl font-bold font-mono tracking-tight ${
              isAlertPulsing ? 'text-red-700' : 'text-flora-text'
            }`}
          >
            {metric.valueFormatted}
          </span>
          <span className="text-sm font-semibold text-flora-text-secondary font-sans">
            {metric.unit}
          </span>
        </div>

        <p className="text-xs text-flora-text-secondary leading-relaxed min-h-[32px] line-clamp-2">
          {metric.explanation}
        </p>
      </div>

      <div className="pt-4 border-t border-flora-soft-white/40 flex justify-between items-center text-[10px] gap-2">
        <span className="font-semibold text-flora-primary px-2 py-0.5 rounded bg-flora-soft-white/50 whitespace-nowrap">
          {metric.reference}
        </span>
        <span className="font-mono text-flora-text-muted whitespace-nowrap">
          {updatedText}
        </span>
      </div>
    </article>
  );
};

export const LiveMonitoring: React.FC<LiveMonitoringProps> = ({ latest, config }) => {
  const updatedText = latest?.timestamp ? `Updated ${formatTime(latest.timestamp)}` : 'Waiting data';

  const tempMetric = interpretTemperature(latest?.temperature, config);
  const humMetric = interpretHumidity(latest?.humidity, config);
  const soilMetric = interpretSoil(latest?.soil_moisture, config);
  const mq135Metric = interpretMq135(latest?.mq135_ppm, latest?.mq135_raw, config);
  const flameMetric = interpretFlame(latest?.flame_detected, latest?.flame_raw);

  const isFlameAlert = flameMetric.flameStatus === 'FIRE_DETECTED';
  const isGasAlert = mq135Metric.aqiStatus === 'HAZARDOUS' || mq135Metric.aqiStatus === 'POOR';

  return (
    <section id="monitoring" className="mt-8">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div>
          <span className="text-[10px] font-bold text-flora-primary uppercase tracking-widest block mb-1">
            Live Stream
          </span>
          <h2 className="text-xl font-bold text-flora-text tracking-tight">
            Live Telemetry &amp; Microclimate
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {/* Tier 1: Microclimate */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SensorCard
            title="Temperature"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            }
            metric={tempMetric}
            updatedText={updatedText}
            badgeExtra="DHT22"
          />

          <SensorCard
            title="Humidity"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            }
            metric={humMetric}
            updatedText={updatedText}
            badgeExtra="DHT22"
          />

          <SensorCard
            title="Soil Moisture"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22v-9" />
                <path d="M9 10a3 3 0 0 1 6 0c0 2-3 5-3 5s-3-3-3-5z" />
                <path d="M4 19a8 8 0 0 1 16 0" />
              </svg>
            }
            metric={soilMetric}
            updatedText={updatedText}
            badgeExtra="Capacitive v1.2"
          />
        </div>

        {/* Tier 2: Safety & Air Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SensorCard
            title="Air Quality (MQ-135)"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
              </svg>
            }
            metric={mq135Metric}
            updatedText={updatedText}
            badgeExtra="MQ-135 Gas & Smoke"
            isAlertPulsing={isGasAlert}
          />

          <SensorCard
            title="Flame Detection"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            }
            metric={flameMetric}
            updatedText={updatedText}
            badgeExtra="Infrared Sensor"
            isAlertPulsing={isFlameAlert}
          />
        </div>
      </div>
    </section>
  );
};

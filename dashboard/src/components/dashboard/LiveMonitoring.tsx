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
      className={`flora-card p-4 sm:p-5 flex flex-col justify-between h-full transition-all duration-200 hover:border-[#9DB312] hover:shadow-md ${
        isAlertPulsing ? 'border-red-400 bg-red-50/20 ring-2 ring-red-400/30' : ''
      }`}
    >
      <div>
        {/* Header with Semantic Icon & Status Badge */}
        <div className="flex justify-between items-center mb-3 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold border shrink-0 shadow-xs ${
                isAlertPulsing
                  ? 'bg-red-100 text-red-700 border-red-200 animate-pulse'
                  : 'bg-[#F4F7F2] text-[#597C00] border-[#E4EBE0]'
              }`}
            >
              {icon}
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-[#617253] uppercase tracking-wider block truncate">
                {title}
              </span>
              {badgeExtra && (
                <span className="text-[9px] font-extrabold text-[#597C00] bg-[#EAF4E8] px-1.5 py-0.5 rounded tracking-tight inline-block whitespace-nowrap">
                  {badgeExtra}
                </span>
              )}
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 shadow-xs uppercase tracking-wide shrink-0 whitespace-nowrap ${
              isAlertPulsing ? 'animate-bounce' : ''
            }`}
            style={{
              backgroundColor: metric.statusColor.bg,
              color: metric.statusColor.text,
              borderColor: metric.statusColor.border,
            }}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAlertPulsing ? 'animate-ping' : ''}`}
              style={{ backgroundColor: metric.statusColor.dot }}
            />
            {metric.statusLabel}
          </span>
        </div>

        {/* Large Value & Unit */}
        <div className="my-2.5 flex items-baseline gap-1.5">
          <span
            className={`text-2xl sm:text-3xl font-bold font-tabular tracking-tight ${
              isAlertPulsing ? 'text-red-700' : 'text-[#1B2408]'
            }`}
          >
            {metric.valueFormatted}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#617253] font-display">
            {metric.unit}
          </span>
        </div>

        {/* Human-Readable Agronomic & Safety Interpretation */}
        <p className="text-xs text-[#617253] leading-relaxed my-1.5 min-h-[36px] line-clamp-2">
          {metric.explanation}
        </p>
      </div>

      {/* Target Range Reference & Timestamp */}
      <div className="pt-3 border-t border-[#E4EBE0] flex justify-between items-center text-[10px] gap-2 flex-wrap">
        <span className="font-semibold text-[#597C00] bg-[#F4F7F2] px-2 py-0.5 rounded-md border border-[#E4EBE0] whitespace-nowrap">
          {metric.reference}
        </span>
        <span className="font-tabular text-[9px] text-[#617253] whitespace-nowrap">
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
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
              Telemetry Stream
            </span>
            <span className="text-[9px] font-extrabold bg-[#597C00] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
              FLORA 2.0 (5 Sensors)
            </span>
          </div>
          <h2 className="text-lg font-bold text-[#1B2408] tracking-tight font-display">
            Live Telemetry: Mikroklimat & Keselamatan
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF4E8] border border-[#C4E1BF] text-xs font-semibold text-[#22531A]">
          <span className="w-2 h-2 rounded-full bg-[#597C00] animate-pulse" />
          <span>Realtime MQTT Stream</span>
        </div>
      </div>

      {/* Balanced 2-Tier Grid: Clean, Roomy & Consistent */}
      <div className="space-y-3.5 sm:space-y-4">
        {/* Tier 1: Microclimate & Agronomy Sensors (3 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 items-stretch">
          {/* Sensor 1: Suhu DHT22 */}
          <SensorCard
            title="Suhu Udara"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
              </svg>
            }
            metric={tempMetric}
            updatedText={updatedText}
            badgeExtra="DHT22"
          />

          {/* Sensor 2: Kelembapan DHT22 */}
          <SensorCard
            title="Kelembapan"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            }
            metric={humMetric}
            updatedText={updatedText}
            badgeExtra="DHT22"
          />

          {/* Sensor 3: Tanah Kapasitif v1.2 */}
          <SensorCard
            title="Kadar Air Tanah"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22v-9" />
                <path d="M9 10a3 3 0 0 1 6 0c0 2-3 5-3 5s-3-3-3-5z" />
                <path d="M4 19a8 8 0 0 1 16 0" />
              </svg>
            }
            metric={soilMetric}
            updatedText={updatedText}
            badgeExtra="Kapasitif v1.2"
          />
        </div>

        {/* Tier 2: FLORA 2.0 Safety & Fire Defense Sensors (2 Columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 items-stretch">
          {/* Sensor 4: Gas & Asap MQ-135 */}
          <SensorCard
            title="Kualitas Gas & Asap"
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

          {/* Sensor 5: Deteksi Api Flame Sensor */}
          <SensorCard
            title="Detektor Nyala Api"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
              </svg>
            }
            metric={flameMetric}
            updatedText={updatedText}
            badgeExtra="Infrared IR Sensor"
            isAlertPulsing={isFlameAlert}
          />
        </div>
      </div>
    </section>
  );
};

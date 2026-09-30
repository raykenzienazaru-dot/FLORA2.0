import React from 'react';
import { TelemetryRecord, MqttStatus, SystemStatusInfo } from '../../types/dashboard';

interface DeviceHealthSectionProps {
  latest: TelemetryRecord | null;
  mqttStatus?: MqttStatus;
  wsStatus?: 'connecting' | 'connected' | 'disconnected';
  systemStatus?: SystemStatusInfo;
}

export const DeviceHealthSection: React.FC<DeviceHealthSectionProps> = ({
  latest,
  mqttStatus = 'DISCONNECTED',
  wsStatus = 'connecting',
  systemStatus,
}) => {
  const isOnline = systemStatus
    ? systemStatus.isLive
    : latest?.timestamp
    ? Date.now() - Date.parse(latest.timestamp) <= 15000
    : false;

  // 1. ESP32 Main Node
  const esp32Status = !latest
    ? wsStatus === 'connecting' ? 'CONNECTING' : 'UNKNOWN'
    : isOnline ? 'CONNECTED' : 'DISCONNECTED';
  const esp32Mac = latest?.esp32_mac || 'UNKNOWN';

  // 2. ESP32-CAM Node
  const camStatus = !latest
    ? 'UNKNOWN'
    : latest.vision_connected && isOnline
    ? 'CONNECTED'
    : isOnline
    ? 'STANDBY / DISCONNECTED'
    : 'DISCONNECTED';
  const camMac = latest?.esp32cam_mac || 'UNKNOWN';

  // 3. MQTT Broker
  const mqttText = mqttStatus === 'CONNECTED'
    ? 'CONNECTED'
    : mqttStatus === 'RECONNECTING'
    ? 'CONNECTING'
    : 'DISCONNECTED';

  // 4. WebSocket Stream
  const wsText = wsStatus === 'connected'
    ? 'CONNECTED'
    : wsStatus === 'connecting'
    ? 'CONNECTING'
    : 'DISCONNECTED';

  // 5. ESP-NOW Link
  const espNowStatus = !latest
    ? 'UNKNOWN'
    : latest.vision_connected && isOnline
    ? 'ACTIVE'
    : latest.wifi_channel
    ? `STANDBY (CH ${latest.wifi_channel})`
    : 'UNKNOWN';

  // 6. DHT22
  const dhtStatus = !latest
    ? 'UNKNOWN'
    : isOnline && latest.temperature !== undefined && latest.humidity !== undefined
    ? 'STREAMING'
    : isOnline
    ? 'UNKNOWN'
    : 'OFFLINE';

  // 7. Soil Sensor
  const soilStatus = !latest
    ? 'UNKNOWN'
    : isOnline && latest.soil_moisture !== undefined
    ? 'STREAMING'
    : isOnline
    ? 'UNKNOWN'
    : 'OFFLINE';

  // 8. MQ-135 Gas & Smoke
  const mqStatus = !latest
    ? 'UNKNOWN'
    : isOnline && (latest.mq135_ppm !== undefined || latest.mq135_raw !== undefined)
    ? 'STREAMING'
    : isOnline
    ? 'ONLINE (STANDBY)'
    : 'OFFLINE';

  // 9. Optical Flame Sensor
  const flameStatus = !latest
    ? 'UNKNOWN'
    : isOnline && latest.flame_detected !== undefined
    ? latest.flame_detected ? 'FIRE DETECTED' : 'STREAMING (CLEAR)'
    : isOnline
    ? 'ONLINE (STANDBY)'
    : 'OFFLINE';

  // 10. Motor / Carriage
  const motorStatus = 'READY (NO FEEDBACK)';

  // 11. Water Pump Relay
  const pumpStatus = 'READY (RELAY STANDBY)';

  // 12. Limit Switches
  const leftText = latest?.limit_left === true
    ? 'ACTIVE'
    : latest?.limit_left === false
    ? 'CLEAR'
    : 'UNKNOWN';
  const rightText = latest?.limit_right === true
    ? 'ACTIVE'
    : latest?.limit_right === false
    ? 'CLEAR'
    : 'UNKNOWN';

  const getDotClass = (status: string) => {
    switch (status) {
      case 'CONNECTED':
      case 'STREAMING':
      case 'STREAMING (CLEAR)':
      case 'ACTIVE':
        return 'bg-[#367C29]';
      case 'CONNECTING':
      case 'ONLINE (STANDBY)':
      case 'READY (NO FEEDBACK)':
      case 'READY (RELAY STANDBY)':
        return 'bg-[#D97706]';
      case 'FIRE DETECTED':
      case 'DISCONNECTED':
      case 'OFFLINE':
        return 'bg-[#DC2626]';
      default:
        return 'bg-[#617253]';
    }
  };

  const devices = [
    {
      label: 'ESP32 Main Node',
      status: esp32Status,
      detail: `MAC: ${esp32Mac}`,
    },
    {
      label: 'ESP32-CAM Node',
      status: camStatus,
      detail: `MAC: ${camMac}`,
    },
    {
      label: 'MQTT Broker',
      status: mqttText,
      detail: 'TLS Transport Pipeline',
    },
    {
      label: 'WebSocket Stream',
      status: wsText,
      detail: 'Client-Server Live Channel',
    },
    {
      label: 'ESP-NOW Mesh Link',
      status: espNowStatus,
      detail: 'Inter-Board Wireless Mesh',
    },
    {
      label: 'DHT22 Sensor',
      status: dhtStatus,
      detail: 'Temperature & Air Humidity',
    },
    {
      label: 'Soil Capacitive Probe',
      status: soilStatus,
      detail: 'Kapasitif v1.2 Analog ADC',
    },
    {
      label: 'MQ-135 Gas & Smoke',
      status: mqStatus,
      detail: latest?.mq135_ppm ? `${latest.mq135_ppm} PPM · CO2/VOC/Smoke` : 'Chemical Sniffer Sensor',
    },
    {
      label: 'Optical Flame Sensor',
      status: flameStatus,
      detail: '760–1100 nm IR Phototransistor',
    },
    {
      label: 'Scanner Motor Drive',
      status: motorStatus,
      detail: 'L298N Carriage Actuator',
    },
    {
      label: 'Irrigation Pump Relay',
      status: pumpStatus,
      detail: '5V Optocoupler Solenoid/Pump',
    },
  ];

  return (
    <section id="devices" className="mt-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-[#597C00] uppercase tracking-widest block">
            Infrastructure Status
          </span>
          <h2 className="text-lg font-bold text-[#1B2408] font-display">
            System &amp; Hardware Health Topology
          </h2>
        </div>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
            systemStatus?.state === 'LIVE'
              ? 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]'
              : systemStatus?.state === 'STALE'
              ? 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]'
              : isOnline && mqttStatus === 'CONNECTED'
              ? 'bg-[#EAF4E8] text-[#22531A] border-[#C4E1BF]'
              : 'bg-[#FEF7E8] text-[#8A570C] border-[#FDE3B5]'
          }`}
        >
          {systemStatus
            ? systemStatus.state === 'LIVE'
              ? 'Telemetry Stream Active'
              : systemStatus.state === 'STALE'
              ? 'Telemetry Stale'
              : systemStatus.badgeText
            : isOnline && mqttStatus === 'CONNECTED'
            ? 'Telemetry Stream Active'
            : 'Degraded Telemetry'}
        </span>
      </div>

      {/* Perfectly balanced 12-Card Grid (3 rows x 4 columns on desktop, 4x3 on tablet, 6x2 on mobile) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 items-stretch">
        {devices.map((dev) => (
          <article key={dev.label} className="flora-card p-4 shadow-xs h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-1.5 gap-2">
                <span className="text-[10px] font-bold text-[#617253] uppercase tracking-wider truncate">
                  {dev.label}
                </span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${getDotClass(dev.status)}`} />
              </div>
              <span className={`text-sm font-bold block font-display ${
                dev.status === 'FIRE DETECTED' ? 'text-red-600 animate-pulse' : 'text-[#1B2408]'
              }`}>
                {dev.status}
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#617253] block mt-2 pt-2 border-t border-[#E4EBE0]/60 truncate">
              {dev.detail}
            </span>
          </article>
        ))}

        {/* 12th Card: Endstop Limit Switches */}
        <article className="flora-card p-4 shadow-xs h-full flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1.5 gap-2">
              <span className="text-[10px] font-bold text-[#617253] uppercase tracking-wider truncate">
                Limit Switches
              </span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${leftText === 'ACTIVE' || rightText === 'ACTIVE' ? 'bg-[#DC2626]' : 'bg-[#367C29]'}`} />
            </div>
            <div className="flex items-center gap-2 text-sm font-bold font-display">
              <span className={leftText === 'ACTIVE' ? 'text-[#DC2626]' : leftText === 'CLEAR' ? 'text-[#22531A]' : 'text-[#617253]'}>
                L: {leftText}
              </span>
              <span className="text-[#617253]/40">|</span>
              <span className={rightText === 'ACTIVE' ? 'text-[#DC2626]' : rightText === 'CLEAR' ? 'text-[#22531A]' : 'text-[#617253]'}>
                R: {rightText}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-mono text-[#617253] block mt-2 pt-2 border-t border-[#E4EBE0]/60 truncate">
            Endstop Safety Interlock
          </span>
        </article>
      </div>
    </section>
  );
};

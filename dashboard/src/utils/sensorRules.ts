import {
  TelemetryRecord,
  ThresholdConfig,
  AirQualityStatus,
  FlameSensorStatus,
  SensorFusionAnalysis,
} from '../types/dashboard';

export interface MetricInterpretation {
  valueFormatted: string;
  unit: string;
  status: 'OPTIMAL' | 'MODERATE' | 'ALERT' | 'ATTENTION';
  statusLabel: string;
  statusColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  explanation: string;
  reference: string;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  soilDry: 30,
  soilVeryDry: 20,
  soilWet: 80,
  tempHigh: 35,
  humidityLow: 45,
  humidityHigh: 80,
  consecutive: 3,
};

export function interpretTemperature(
  temp: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (temp === undefined || temp === null || isNaN(Number(temp))) {
    return {
      valueFormatted: '—',
      unit: '°C',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan sensor suhu DHT22.',
      reference: 'Target: 22.0 – 28.0 °C',
    };
  }

  const t = Number(temp);
  const tempHigh = cfg.tempHigh ?? 35;

  if (t < 18) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'MODERATE',
      statusLabel: 'Sejuk / Rendah',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Suhu lingkungan di bawah kisaran optimal. Laju metabolisme tanaman melambat.',
      reference: 'Target: 22.0 – 28.0 °C',
    };
  }

  if (t <= 28) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Suhu berada pada rentang ideal untuk fotosintesis dan pertumbuhan daun.',
      reference: 'Target: 22.0 – 28.0 °C',
    };
  }

  if (t < tempHigh) {
    return {
      valueFormatted: t.toFixed(1),
      unit: '°C',
      status: 'MODERATE',
      statusLabel: 'Hangat',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Suhu di atas target normal. Pantau kelembapan tanah agar akar tidak dehidrasi.',
      reference: `Target: 22–28 °C (Batas: ${tempHigh} °C)`,
    };
  }

  return {
    valueFormatted: t.toFixed(1),
    unit: '°C',
    status: 'ALERT',
    statusLabel: 'Stres Panas',
    statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
    explanation: 'Suhu melebihi ambang batas aman. Risiko penguapan berlebih dan kelayuan daun.',
    reference: `Batas aman: ≤ ${tempHigh} °C`,
  };
}

export function interpretHumidity(
  hum: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (hum === undefined || hum === null || isNaN(Number(hum))) {
    return {
      valueFormatted: '—',
      unit: '%',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan kelembapan udara DHT22.',
      reference: 'Target: 55 – 75 %',
    };
  }

  const h = Number(hum);
  const humLow = cfg.humidityLow ?? 45;
  const humHigh = cfg.humidityHigh ?? 80;

  if (h < humLow) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Udara Kering',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Udara kering memicu penguapan air daun lebih cepat dari normal.',
      reference: `Batas bawah: ≥ ${humLow} %`,
    };
  }

  if (h <= 75) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Kelembapan udara seimbang, mendukung transpirasi stabil tanaman.',
      reference: 'Target: 55 – 75 %',
    };
  }

  if (h <= humHigh) {
    return {
      valueFormatted: h.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Meningkat',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Kelembapan udara meningkat. Jaga sirkulasi udara kanopi tetap lancar.',
      reference: `Batas atas: ≤ ${humHigh} %`,
    };
  }

  return {
    valueFormatted: h.toFixed(1),
    unit: '%',
    status: 'ALERT',
    statusLabel: 'Sangat Lembap',
    statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
    explanation: 'Udara jenuh berpotensi memicu kondensasi air pada daun dan spora jamur.',
    reference: `Batas aman: ≤ ${humHigh} %`,
  };
}

export function interpretSoil(
  soil: number | undefined | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): MetricInterpretation {
  if (soil === undefined || soil === null || isNaN(Number(soil))) {
    return {
      valueFormatted: '—',
      unit: '%',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu pembacaan sensor kelembapan tanah.',
      reference: 'Target: 30 – 80 %',
    };
  }

  const s = Number(soil);
  const soilDry = cfg.soilDry ?? 30;
  const soilVeryDry = cfg.soilVeryDry ?? 20;
  const soilWet = cfg.soilWet ?? 80;

  if (s < soilVeryDry) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'ALERT',
      statusLabel: 'Kritis Kering',
      statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
      explanation: 'Kadar air tanah kritis di bawah 20%. Segera lakukan pengecekan dan penyiraman.',
      reference: `Ambang kritis: < ${soilVeryDry} %`,
    };
  }

  if (s < soilDry) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'MODERATE',
      statusLabel: 'Mulai Kering',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Kadar air tanah menurun di bawah target ideal. Pertimbangkan penyiraman.',
      reference: `Ambang kering: < ${soilDry} %`,
    };
  }

  if (s <= soilWet) {
    return {
      valueFormatted: s.toFixed(1),
      unit: '%',
      status: 'OPTIMAL',
      statusLabel: 'Optimal',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Kadar air zona perakaran mencukupi kebutuhan hidrasi tanaman.',
      reference: `Target: ${soilDry}.0 – ${soilWet}.0 %`,
    };
  }

  return {
    valueFormatted: s.toFixed(1),
    unit: '%',
    status: 'MODERATE',
    statusLabel: 'Sangat Basah',
    statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
    explanation: 'Media tanam sangat basah. Tunda penyiraman berikutnya untuk mencegah busuk akar.',
    reference: `Ambang basah: > ${soilWet} %`,
  };
}

export interface PlantPillars {
  environment: {
    status: 'Optimal' | 'Warm' | 'Cool' | 'Heat Stress' | 'Unknown';
    detail: string;
    isNormal: boolean;
  };
  soil: {
    status: 'Optimal' | 'Needs Water' | 'Critically Dry' | 'Saturated' | 'Unknown';
    detail: string;
    isNormal: boolean;
  };
  aiRisk: {
    status: 'Low' | 'Moderate' | 'High' | 'Unknown';
    detail: string;
    confidence: number | null;
  };
  aiVision: {
    status: 'Healthy' | 'Powdery' | 'Rust' | 'Standby' | 'Unknown';
    detail: string;
    dominantProb: number | null;
  };
  overallAssessment: string;
  hasEnoughData: boolean;
}

export function evaluatePlantPillars(latest: TelemetryRecord | null): PlantPillars {
  if (!latest) {
    return {
      environment: { status: 'Unknown', detail: 'Awaiting sensor stream', isNormal: false },
      soil: { status: 'Unknown', detail: 'Awaiting sensor stream', isNormal: false },
      aiRisk: { status: 'Unknown', detail: 'Awaiting inference', confidence: null },
      aiVision: { status: 'Unknown', detail: 'Awaiting optical data', dominantProb: null },
      overallAssessment: 'Not enough data for an overall assessment.',
      hasEnoughData: false,
    };
  }

  const hasTemp = latest.temperature !== undefined && latest.temperature !== null && !isNaN(Number(latest.temperature));
  const hasHum = latest.humidity !== undefined && latest.humidity !== null && !isNaN(Number(latest.humidity));
  const hasSoil = latest.soil_moisture !== undefined && latest.soil_moisture !== null && !isNaN(Number(latest.soil_moisture));

  if (!hasTemp || !hasHum || !hasSoil) {
    return {
      environment: { status: 'Unknown', detail: 'Incomplete telemetry', isNormal: false },
      soil: { status: 'Unknown', detail: 'Incomplete telemetry', isNormal: false },
      aiRisk: { status: 'Unknown', detail: 'Awaiting full sensor data', confidence: null },
      aiVision: { status: 'Unknown', detail: 'Awaiting optical stream', dominantProb: null },
      overallAssessment: 'Not enough data for an overall assessment.',
      hasEnoughData: false,
    };
  }

  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const s = Number(latest.soil_moisture);

  // 1. Environment Pillar
  let envStatus: 'Optimal' | 'Warm' | 'Cool' | 'Heat Stress' = 'Optimal';
  let envDetail = `${t.toFixed(1)}°C · ${h.toFixed(0)}% RH`;
  let envNormal = true;
  if (t >= 35) {
    envStatus = 'Heat Stress';
    envNormal = false;
  } else if (t > 28) {
    envStatus = 'Warm';
    envNormal = false;
  } else if (t < 18) {
    envStatus = 'Cool';
    envNormal = false;
  }

  // 2. Soil Pillar
  let soilStatus: 'Optimal' | 'Needs Water' | 'Critically Dry' | 'Saturated' = 'Optimal';
  let soilDetail = `${s.toFixed(1)}% moisture`;
  let soilNormal = true;
  if (s < 20) {
    soilStatus = 'Critically Dry';
    soilNormal = false;
  } else if (s < 30) {
    soilStatus = 'Needs Water';
    soilNormal = false;
  } else if (s > 80) {
    soilStatus = 'Saturated';
    soilNormal = false;
  }

  // 3. AI Risk Pillar
  const riskStr = (latest.sensor_risk || 'Moderate').toLowerCase();
  let riskStatus: 'Low' | 'Moderate' | 'High' = 'Moderate';
  if (riskStr.includes('low')) riskStatus = 'Low';
  else if (riskStr.includes('high')) riskStatus = 'High';
  const conf = latest.sensor_confidence !== undefined ? Number(latest.sensor_confidence) : null;
  const riskDetail = conf ? `${riskStatus} Risk (${conf.toFixed(1)}%)` : `${riskStatus} Risk`;

  // 4. AI Vision Pillar
  const isVisionConnected = Boolean(latest.vision_connected);
  let visionStatus: 'Healthy' | 'Powdery' | 'Rust' | 'Standby' = 'Standby';
  let dominantProb: number | null = null;
  if (isVisionConnected) {
    const rawPred = (latest.vision_prediction || 'Healthy').toLowerCase();
    if (rawPred.includes('powdery')) visionStatus = 'Powdery';
    else if (rawPred.includes('rust')) visionStatus = 'Rust';
    else visionStatus = 'Healthy';

    dominantProb = Math.max(
      Number(latest.vision_healthy || 0),
      Number(latest.vision_powdery || 0),
      Number(latest.vision_rust || 0)
    );
  }
  const visionDetail = isVisionConnected
    ? `${visionStatus}${dominantProb ? ` (${dominantProb.toFixed(0)}%)` : ''}`
    : 'Camera Standby';

  // Overall Botanical Synthesis (Honest, factual synthesis without fake scores)
  let overall = '';
  const issues: string[] = [];
  if (soilStatus === 'Critically Dry') issues.push('critically dry soil (<20%) requiring immediate watering');
  else if (soilStatus === 'Needs Water') issues.push('low soil moisture (<30%) that may need watering');
  else if (soilStatus === 'Saturated') issues.push('saturated soil moisture (>80%)');

  if (envStatus === 'Heat Stress') issues.push('elevated temperature causing heat stress (≥35°C)');
  else if (envStatus === 'Warm') issues.push('warm ambient temperature (>28°C)');
  else if (envStatus === 'Cool') issues.push('cool ambient temperature (<18°C)');

  if (visionStatus === 'Rust') issues.push('visual indication matching Rust fungal pattern');
  else if (visionStatus === 'Powdery') issues.push('visual indication matching Powdery Mildew pattern');

  if (issues.length === 0) {
    overall = 'Plant microclimate, soil moisture, and leaf condition are currently stable within optimal target ranges.';
  } else {
    overall = `Environmental conditions need attention, mainly due to ${issues.join(' and ')}.`;
  }

  return {
    environment: { status: envStatus, detail: envDetail, isNormal: envNormal },
    soil: { status: soilStatus, detail: soilDetail, isNormal: soilNormal },
    aiRisk: { status: riskStatus, detail: riskDetail, confidence: conf },
    aiVision: { status: visionStatus, detail: visionDetail, dominantProb },
    overallAssessment: overall,
    hasEnoughData: true,
  };
}

export interface SystemAlertInfo {
  severity: 'CRITICAL' | 'WARNING' | 'NORMAL' | 'AWAITING';
  title: string;
  description: string;
  actionText?: string;
  actionTarget?: string;
}

export function evaluateSystemAlert(
  latest: TelemetryRecord | null,
  mqttStatus?: string
): SystemAlertInfo {
  if (mqttStatus && mqttStatus !== 'CONNECTED') {
    return {
      severity: 'CRITICAL',
      title: 'MQTT Broker Disconnected',
      description: 'Hubungan ke broker MQTT terputus. Data telemetri realtime dijeda hingga tersambung kembali.',
      actionText: 'Periksa Koneksi',
      actionTarget: 'devices',
    };
  }

  if (!latest) {
    return {
      severity: 'AWAITING',
      title: 'Menunggu Telemetri Sistem',
      description: 'Menunggu transmisi data pertama dari ESP32 untuk evaluasi kondisi tanaman.',
    };
  }

  const s = Number(latest.soil_moisture);
  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const risk = (latest.sensor_risk || '').toLowerCase();
  const vision = (latest.vision_prediction || '').toLowerCase();

  // TOP PRIORITY: FLORA 2.0 AI Multi-Sensor Fire & Gas Hazard
  if (latest?.hazard_ai) {
    if (latest.hazard_ai.threatLevel === 'EMERGENCY') {
      return {
        severity: 'CRITICAL',
        title: latest.hazard_ai.threatTitle,
        description: latest.hazard_ai.threatDescription,
        actionText: 'Tindakan Darurat & Fusi AI',
        actionTarget: 'hazard-safety',
      };
    }
    if (latest.hazard_ai.threatLevel === 'CRITICAL') {
      return {
        severity: 'CRITICAL',
        title: latest.hazard_ai.threatTitle,
        description: latest.hazard_ai.threatDescription,
        actionText: 'Inspeksi Bahaya Gas AI',
        actionTarget: 'hazard-safety',
      };
    }
    if (latest.hazard_ai.threatLevel === 'WARNING') {
      return {
        severity: 'WARNING',
        title: latest.hazard_ai.threatTitle,
        description: latest.hazard_ai.threatDescription,
        actionText: 'Periksa Fusi Sensor',
        actionTarget: 'hazard-safety',
      };
    }
  }

  // CRITICAL Conditions
  if (s < 20) {
    return {
      severity: 'CRITICAL',
      title: 'Kadar Air Tanah Kritis Rendah',
      description: `Kelembapan tanah saat ini ${s.toFixed(1)}% (di bawah batas kritis 20%). Media tanam butuh hidrasi segera.`,
      actionText: 'Lihat Rekomendasi Siram',
      actionTarget: 'treatment',
    };
  }

  if (t >= 35) {
    return {
      severity: 'CRITICAL',
      title: 'Peringatan Stres Panas Lingkungan',
      description: `Suhu terdeteksi ${t.toFixed(1)}°C (melebihi batas aman 35°C). Penguapan berlebih dapat memicu layu.`,
      actionText: 'Periksa Sensor',
      actionTarget: 'monitoring',
    };
  }

  if (risk.includes('high') && (vision.includes('rust') || vision.includes('powdery'))) {
    return {
      severity: 'CRITICAL',
      title: 'Risiko Mikroklimat Tinggi & Indikasi Penyakit Daun',
      description: `Model mendeteksi risiko mikroklimat tinggi disertai indikasi visual pola ${vision.toUpperCase()}.`,
      actionText: 'Inspeksi Analisis AI',
      actionTarget: 'analysis',
    };
  }

  // WARNING Conditions
  if (s < 30) {
    return {
      severity: 'WARNING',
      title: 'Kadar Air Tanah Mulai Menurun',
      description: `Kelembapan tanah ${s.toFixed(1)}% (di bawah target 30%). Pertimbangkan pengecekan media tanam dan penyiraman.`,
      actionText: 'Buka Rekomendasi',
      actionTarget: 'treatment',
    };
  }

  if (vision.includes('rust')) {
    return {
      severity: 'WARNING',
      title: 'Indikasi Pola Visual Karat (Rust) Ditemukan',
      description: 'Kamera mendeteksi pola visual menyerupai karat daun. Lakukan inspeksi fisik kanopi.',
      actionText: 'Periksa AI Vision',
      actionTarget: 'analysis',
    };
  }

  if (vision.includes('powdery')) {
    return {
      severity: 'WARNING',
      title: 'Indikasi Pola Visual Jamur Tepung (Powdery) Ditemukan',
      description: 'Kamera mendeteksi pola bercak keputihan pada daun. Evaluasi ventilasi udara sekitar tanaman.',
      actionText: 'Periksa AI Vision',
      actionTarget: 'analysis',
    };
  }

  if (t > 28) {
    return {
      severity: 'WARNING',
      title: 'Suhu Lingkungan Hangat di Atas Target',
      description: `Suhu berada pada ${t.toFixed(1)}°C (target optimal: 22–28°C). Pantau kecukupan air perakaran.`,
      actionText: 'Pantau Sensor',
      actionTarget: 'monitoring',
    };
  }

  if (h < 45 || h > 80) {
    return {
      severity: 'WARNING',
      title: h < 45 ? 'Kelembapan Udara Rendah' : 'Kelembapan Udara Sangat Tinggi',
      description: `Kelembapan udara terukur ${h.toFixed(1)}% di luar rentang ideal 45–75%.`,
      actionText: 'Pantau Sensor',
      actionTarget: 'monitoring',
    };
  }

  // NORMAL Condition
  return {
    severity: 'NORMAL',
    title: 'Kondisi Tanaman & Mikroklimat Stabil',
    description: 'Semua parameter sensor tanah, suhu, kelembapan, dan analisis visual berada dalam kisaran normal.',
  };
}

export function explainEnvironmentalRisk(latest: TelemetryRecord | null): {
  reasons: string[];
  actions: string[];
} {
  if (!latest) {
    return {
      reasons: ['Menunggu telemetri sensor dari ESP32.'],
      actions: ['Pastikan ESP32 terhubung dan mempublikasikan data sensor.'],
    };
  }

  const reasons: string[] = [];
  const actions: string[] = [];

  const t = Number(latest.temperature);
  const h = Number(latest.humidity);
  const s = Number(latest.soil_moisture);

  // Soil analysis
  if (s < 20) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) kritis di bawah 20%, menyebabkan tanaman mengalami defisit air parah.`);
    actions.push('Lakukan penyiraman manual secukupnya untuk mengembalikan kelembapan zona perakaran.');
  } else if (s < 30) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) berada di bawah target ideal 30%.`);
    actions.push('Periksa kelembapan media tanam dan siram jika tanah terasa kering saat disentuh.');
  } else if (s > 80) {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) sangat tinggi, berpotensi membatasi aerasi perakaran.`);
    actions.push('Tunda penyiraman berikutnya dan pastikan lubang drainase pot tidak tersumbat.');
  } else {
    reasons.push(`Kadar air tanah (${s.toFixed(1)}%) berada dalam rentang ideal (30–80%).`);
  }

  // Temperature analysis
  if (t >= 35) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) melampaui batas aman 35°C (kondisi stres panas).`);
    actions.push('Pindahkan tanaman ke area lebih teduh atau tingkatkan sirkulasi udara di sekitar pot.');
  } else if (t > 28) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) berada di atas rentang target (22–28°C).`);
    actions.push('Pantau ketersediaan air agar laju transpirasi daun tetap terkompensasi.');
  } else if (t < 18) {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) di bawah rentang optimal tanaman.`);
  } else {
    reasons.push(`Suhu udara (${t.toFixed(1)}°C) berada dalam kisaran optimal fotosintesis.`);
  }

  // Humidity analysis
  if (h > 80) {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) jenuh, memicu risiko tinggi perkecambahan spora patogen jamur.`);
    actions.push('Pastikan sirkulasi udara di sekitar tanaman lancar dan hindari menyiram daun.');
  } else if (h < 45) {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) rendah, meningkatkan penguapan stomata daun.`);
  } else {
    reasons.push(`Kelembapan udara (${h.toFixed(1)}%) stabil mendukung transpirasi alami.`);
  }

  if (actions.length === 0) {
    actions.push('Lanjutkan pemantauan rutin berkala; seluruh parameter mikroklimat stabil.');
  }

  return { reasons, actions };
}

export function explainVisionClassification(latest: TelemetryRecord | null): {
  interpretation: string;
  why: string;
  whatToDo: string;
} {
  if (!latest || !latest.vision_connected) {
    return {
      interpretation: 'Menunggu transmisi inferensi optik dari kamera ESP32-CAM.',
      why: 'Node kamera sedang dalam mode siaga atau belum ada frame yang diklasifikasikan via ESP-NOW.',
      whatToDo: 'Pastikan modul ESP32-CAM aktif dan berada pada channel nirkabel yang sama.',
    };
  }

  const pred = (latest.vision_prediction || 'Healthy').toLowerCase();

  if (pred.includes('rust')) {
    return {
      interpretation: 'Terdeteksi indikasi pola visual penyakit Karat Daun (Rust).',
      why: 'Pola visual kanopi daun memiliki bercak warna kecokelatan yang cocok dengan kelas model Karat (Rust).',
      whatToDo: 'Inspeksi fisik sisi bawah daun yang dicurigai. Jaga daun tetap kering dan pisahkan tanaman bila bintik meluas.',
    };
  }

  if (pred.includes('powdery')) {
    return {
      interpretation: 'Terdeteksi indikasi pola visual Jamur Tepung (Powdery Mildew).',
      why: 'Pola visual daun memiliki area keputihan menyerupai lapisan tepung yang cocok dengan kelas model Powdery.',
      whatToDo: 'Periksa daun bergejala, pangkas bila parah, dan tingkatkan sirkulasi udara di sekitar kanopi.',
    };
  }

  return {
    interpretation: 'Tidak ditemukan indikasi visual penyakit pada kanopi daun.',
    why: 'Pola tekstur dan warna daun terdeteksi seragam dan cocok dengan kelas daun sehat (Healthy).',
    whatToDo: 'Lanjutkan perawatan dan pemantauan berkala tanpa intervensi kimiawi.',
  };
}

// ======================================================
// FLORA 2.0: MQ-135 SENSOR INTERPRETATION
// ======================================================

export interface Mq135Interpretation extends MetricInterpretation {
  aqiStatus: AirQualityStatus;
  primaryGas: string;
}

export function interpretMq135(
  ppm: number | undefined | null,
  _raw?: number | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): Mq135Interpretation {
  const warnPpm = cfg.mq135WarningPpm ?? 600;
  const hazardPpm = cfg.mq135HazardPpm ?? 1000;

  if (ppm === undefined || ppm === null || isNaN(Number(ppm))) {
    return {
      valueFormatted: '—',
      unit: 'PPM',
      status: 'ATTENTION',
      statusLabel: 'No Data',
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu transmisi pembacaan sensor kualitas udara MQ-135.',
      reference: 'Target udara bersih: < 350 PPM',
      aqiStatus: 'GOOD',
      primaryGas: 'Udara Bersih',
    };
  }

  const p = Number(ppm);

  if (p < 350) {
    return {
      valueFormatted: p.toFixed(0),
      unit: 'PPM',
      status: 'OPTIMAL',
      statusLabel: 'Bersih',
      statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
      explanation: 'Kualitas udara sangat baik. Kadar gas dan partikel dalam batas normal.',
      reference: 'Target: < 350 PPM',
      aqiStatus: 'EXCELLENT',
      primaryGas: 'Atmosfer Alami',
    };
  }

  if (p <= warnPpm) {
    return {
      valueFormatted: p.toFixed(0),
      unit: 'PPM',
      status: 'MODERATE',
      statusLabel: 'Sedang',
      statusColor: { bg: '#FEF7E8', text: '#8A570C', border: '#FDE3B5', dot: '#D97706' },
      explanation: 'Peningkatan konsentrasi gas ringan/uap terdeteksi. Disarankan ventilasi.',
      reference: `Batas: ${warnPpm} PPM`,
      aqiStatus: 'MODERATE',
      primaryGas: 'CO2 / VOC Ringan',
    };
  }

  if (p <= hazardPpm) {
    return {
      valueFormatted: p.toFixed(0),
      unit: 'PPM',
      status: 'ALERT',
      statusLabel: 'Tinggi',
      statusColor: { bg: '#FFF1E5', text: '#C05621', border: '#FBD38D', dot: '#DD6B20' },
      explanation: 'Konsentrasi gas tinggi atau asap pekat terdeteksi! Waspadai emisi pembakaran.',
      reference: `Ambang: > ${hazardPpm} PPM`,
      aqiStatus: 'POOR',
      primaryGas: 'Asap / Gas Polutan',
    };
  }

  return {
    valueFormatted: p.toFixed(0),
    unit: 'PPM',
    status: 'ALERT',
    statusLabel: 'Kritis',
    statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
    explanation: 'Bahaya kritis! Konsentrasi gas beracun/asap pekat melampaui batas aman biologis.',
    reference: `Batas: > ${hazardPpm} PPM`,
    aqiStatus: 'HAZARDOUS',
    primaryGas: 'Gas Beracun / Asap Tebal',
  };
}

// ======================================================
// FLORA 2.0: FLAME SENSOR INTERPRETATION
// ======================================================

export interface FlameInterpretation extends MetricInterpretation {
  flameStatus: FlameSensorStatus;
}

export function interpretFlame(
  detected: boolean | undefined | null,
  raw?: number | null
): FlameInterpretation {
  const isDetected = detected === true || (raw !== undefined && raw !== null && raw > 0 && raw < 1500);

  if (detected === undefined && raw === undefined) {
    return {
      valueFormatted: '—',
      unit: 'Titik Api',
      status: 'ATTENTION',
      statusLabel: 'Standby',
      statusColor: { bg: '#F4F7F2', text: '#617253', border: '#E4EBE0', dot: '#617253' },
      explanation: 'Menunggu transmisi pembacaan Flame Sensor optik inframerah.',
      reference: 'Target: Bebas nyala api',
      flameStatus: 'SAFE',
    };
  }

  if (isDetected) {
    return {
      valueFormatted: '1',
      unit: 'Titik Api Aktif',
      status: 'ALERT',
      statusLabel: 'Terdeteksi',
      statusColor: { bg: '#FEEAEA', text: '#961C1C', border: '#FCCECE', dot: '#DC2626' },
      explanation: 'Sensor optik inframerah mendeteksi radiasi spektrum nyala api pada kanopi!',
      reference: 'Status: Api Aktif',
      flameStatus: 'FIRE_DETECTED',
    };
  }

  return {
    valueFormatted: '0',
    unit: 'Titik Api',
    status: 'OPTIMAL',
    statusLabel: 'Aman',
    statusColor: { bg: '#EAF4E8', text: '#22531A', border: '#C4E1BF', dot: '#367C29' },
    explanation: 'Tidak ada radiasi inframerah dari nyala api terbuka yang tertangkap sensor.',
    reference: 'Target: Bebas nyala api',
    flameStatus: 'SAFE',
  };
}

// ======================================================
// FLORA 2.0: COLLABORATIVE AI LOGIC & SENSOR FUSION ENGINE
// (Rule-Based & Expert Sensor Cross-Validation)
// ======================================================

export function evaluateSensorFusionHazard(
  record: Partial<TelemetryRecord> | null,
  cfg: Partial<ThresholdConfig> = DEFAULT_THRESHOLDS
): SensorFusionAnalysis {
  const nowTs = record?.timestamp || new Date().toISOString();

  if (!record) {
    return {
      threatLevel: 'SAFE',
      threatScore: 0,
      threatTitle: 'Sistem Siaga (Standby)',
      threatDescription: 'Menunggu aliran data telemetry sensor MQ-135 dan Flame untuk inisialisasi AI Logic.',
      causeAnalysis: 'Belum ada data sensor yang masuk untuk dievaluasi.',
      crossValidationStatus: 'ALL_CLEAR',
      crossValidationDetails: 'Sistem siap memproses fusi sensor real-time.',
      sensorCorrelationIndex: 100,
      factors: ['Menunggu sinyal MQTT atau demonstrasi telemetry'],
      immediateActions: ['Pastikan konektivitas ESP32 terhubung'],
      systemResponses: ['Status pengawasan keselamatan: Aktif'],
      flameAgreement: false,
      gasAgreement: false,
      recommendedInspection: 'Pemeriksaan rutin modul hardware.',
      timestamp: nowTs,
    };
  }

  const flameTriggered = record.flame_detected === true || (record.flame_raw !== undefined && record.flame_raw > 0 && record.flame_raw < 1500);
  const mqPpm = Number(record.mq135_ppm ?? 250);
  const temp = Number(record.temperature ?? 26);
  const hum = Number(record.humidity ?? 60);
  const soil = Number(record.soil_moisture ?? 55);

  const warnPpm = cfg.mq135WarningPpm ?? 600;
  const hazardPpm = cfg.mq135HazardPpm ?? 1000;
  const gasWarning = mqPpm >= warnPpm;
  const gasHazard = mqPpm >= hazardPpm;

  // ----------------------------------------------------
  // SKENARIO 1: CRITICAL FIRE EMERGENCY (DUAL CONFIRMATION)
  // Api Terdeteksi + Asap/Gas Tinggi Terkonfirmasi
  // ----------------------------------------------------
  if (flameTriggered && gasWarning) {
    return {
      threatLevel: 'EMERGENCY',
      threatScore: Math.min(100, Math.round(92 + (mqPpm / hazardPpm) * 8)),
      threatTitle: 'DARURAT: KEBAKARAN AKTIF TERKONFIRMASI (FIRE EMERGENCY)',
      threatDescription: `Sinergi sensor valid! Flame Sensor mendeteksi lidah api terbuka dan MQ-135 mengonfirmasi lonjakan gas pembakaran/asap pekat (${mqPpm.toFixed(0)} PPM).`,
      causeAnalysis: 'Deteksi simultan antara radiasi optik inframerah nyala api dan emisi gas karbon/asap pembakaran. AI memastikan ini adalah kebakaran nyata (Bukan false positive optik).',
      crossValidationStatus: 'CONFIRMED_HAZARD',
      crossValidationDetails: 'Sensor Api [AKTIF] + Sensor Gas MQ-135 [TINGGI] saling mengonfirmasi 100% adanya api nyata.',
      sensorCorrelationIndex: 99,
      factors: [
        'Sensor Api Inframerah memicu status aktif kebakaran',
        `Sensor MQ-135 mendeteksi lonjakan asap/gas pembakaran (${mqPpm.toFixed(0)} PPM)`,
        temp >= 35 ? `Suhu lingkungan melonjak tinggi (${temp.toFixed(1)}°C) mendukung penyebaran api` : 'Potensi api lokal yang baru membesar',
      ],
      immediateActions: [
        'SEGERA matikan saklar listrik utama / adaptor catu daya FLORA dan area tanam.',
        'Gunakan alat pemadam kebakaran (APAR jenis CO2, Foam, atau serbuk kimia kering) pada titik api.',
        'Lakukan evakuasi personil segera dan hubungi unit Pemadam Kebakaran terdekat.',
        'Jauhkan botol pupuk cair, alkohol, dan media tanam kering dari radius api.',
      ],
      systemResponses: [
        'MENGHENTIKAN otomatis pergerakan motor rel scanner ke posisi netral.',
        'MENGIRIMKAN instruksi darurat pemotretan snapshot ESP32-CAM untuk rekaman visual insiden.',
        'MENGAKTIFKAN sirine audio dan banner visual darurat di dashboard.',
      ],
      flameAgreement: true,
      gasAgreement: true,
      recommendedInspection: 'Inspeksi keselamatan menyeluruh setelah api dipadamkan total.',
      timestamp: nowTs,
    };
  }

  // ----------------------------------------------------
  // SKENARIO 2: SMOLDERING FIRE / TOXIC GAS & SMOKE HAZARD
  // Asap/Gas Tinggi Tanpa Nyala Api Terbuka
  // ----------------------------------------------------
  if (!flameTriggered && gasWarning) {
    const isCritical = gasHazard || mqPpm > 900;
    return {
      threatLevel: isCritical ? 'CRITICAL' : 'WARNING',
      threatScore: Math.min(94, Math.round(72 + ((mqPpm - warnPpm) / (hazardPpm - warnPpm || 1)) * 22)),
      threatTitle: isCritical ? 'BAHAYA ASAP PEKAT & KEBOCORAN GAS BERACUN' : 'PERINGATAN: KONSENTRASI GAS & POLUSI UDARA TINGGI',
      threatDescription: `Sensor MQ-135 mendeteksi konsentrasi gas berbahaya (${mqPpm.toFixed(0)} PPM) tanpa adanya nyala api terbuka dari Flame Sensor.`,
      causeAnalysis: 'AI mengidentifikasi potensi pembakaran bara tersembunyi (smoldering) pada media tanam/sekam, kabel korsleting yang meleleh tanpa lidah api, atau kebocoran gas berbahaya (amonia/CO2/VOC).',
      crossValidationStatus: 'SMOLDERING_SUSPECTED',
      crossValidationDetails: 'Sensor Api [AMAN] vs Sensor MQ-135 [TERPICU]. Kondisi khas bara tertutup atau kontaminasi udara luar.',
      sensorCorrelationIndex: 86,
      factors: [
        `Partikel gas/asap terdeteksi pada tingkat signifikan (${mqPpm.toFixed(0)} PPM)`,
        'Tidak ada radiasi nyala api terbuka pada sudut pandang Flame Sensor',
        soil < 20 ? 'Media tanam sangat kering, rentan menjadi media bara terpendam' : 'Kelembapan media normal',
      ],
      immediateActions: [
        'Buka jendela dan nyalakan exhaust fan darurat untuk sirkulasi pembuangan gas.',
        'Gunakan masker pelindung respirator (N95 / filter gas) sebelum masuk ke area tanaman.',
        'Periksa jalur kabel adaptor daya ESP32 dan modul motor driver L298N dari bau sangit atau komponen panas.',
        'Siramkan air secara terarah jika dicurigai terdapat bara terpendam pada media tanam sekam.',
      ],
      systemResponses: [
        'Mengaktifkan notifikasi bahaya gas pada dashboard sistem.',
        'Merekam anomali peningkatan PPM ke dalam log riwayat.',
      ],
      flameAgreement: false,
      gasAgreement: true,
      recommendedInspection: 'Periksa fisik seluruh perkabelan dan permukaan media tanam dengan segera.',
      timestamp: nowTs,
    };
  }

  // ----------------------------------------------------
  // SKENARIO 3: OPTICAL FLICKER / SUNLIGHT ANOMALY / FALSE ALARM
  // Flame Sensor Terpicu, Tetapi Udara Bersih & Normal
  // ----------------------------------------------------
  if (flameTriggered && !gasWarning && temp < 36) {
    return {
      threatLevel: 'ADVISORY',
      threatScore: 42,
      threatTitle: 'WASPADA: ANOMALI OPTIK / PANTULAN CAHAYA MATAHARI',
      threatDescription: `Flame Sensor terpicu aktif, namun sensor MQ-135 mendeteksi kualitas udara tetap bersih (${mqPpm.toFixed(0)} PPM) dan suhu normal (${temp.toFixed(1)}°C).`,
      causeAnalysis: 'AI mendeteksi anomali asimetris sensor. Sensor api inframerah sangat sensitif terhadap pantulan sinar matahari langsung, lampu halogen, atau percikan korek api sesaat tanpa pembakaran lanjutan.',
      crossValidationStatus: 'OPTICAL_FALSE_ALARM',
      crossValidationDetails: 'Sensor Api [AKTIF] tapi Sensor Gas MQ-135 [BERSIH]. Kemungkinan besar false alarm optik cahaya.',
      sensorCorrelationIndex: 38,
      factors: [
        'Sensor optik mendeteksi radiasi inframerah',
        `Kualitas udara bersih tanpa jejak partikel asap pembakaran (${mqPpm.toFixed(0)} PPM)`,
        `Suhu ruangan dalam batas normal (${temp.toFixed(1)}°C)`,
      ],
      immediateActions: [
        'Periksa tangkapan kamera kanopi (ESP32-CAM) untuk verifikasi visual langsung.',
        'Pastikan posisi probe Flame Sensor tidak langsung menghadap sinar matahari terik atau lampu pijar.',
        'Bersihkan debu atau minyak pada optik sensor api.',
      ],
      systemResponses: [
        'Menahan pengaktifan alarm evakuasi darurat guna mencegah kepanikan false positive.',
        'Menyarankan operator melakukan verifikasi visual secara cepat.',
      ],
      flameAgreement: true,
      gasAgreement: false,
      recommendedInspection: 'Verifikasi visual kanopi tanaman dan posisikan tudung pelindung sensor api.',
      timestamp: nowTs,
    };
  }

  // ----------------------------------------------------
  // SKENARIO 4: THERMAL COMBUSTION RISK
  // Suhu Ekstrem + Tanah Sangat Kering + Gas Sedikit Meningkat
  // ----------------------------------------------------
  if (temp >= 36 && soil <= 20 && mqPpm >= 380) {
    return {
      threatLevel: 'WARNING',
      threatScore: 68,
      threatTitle: 'PERINGATAN: RISIKO PEMBAKARAN SPONTAN & STRES TERMAL',
      threatDescription: `Suhu sangat tinggi (${temp.toFixed(1)}°C) dan media tanam sangat kering (${soil.toFixed(1)}%) disertai kenaikan gas organik (${mqPpm.toFixed(0)} PPM).`,
      causeAnalysis: 'Akumulasi panas ekstrem dalam ruang tertutup mempercepat pengeringan daun dan biomassa. Kondisi ini sangat rawan memicu pembakaran spontan jika terpapar percikan komponen elektrik.',
      crossValidationStatus: 'THERMAL_STRESS',
      crossValidationDetails: 'Suhu Kritis + Tanah Dehidrasi + Gas Meningkat. Risiko awal sebelum timbulnya api.',
      sensorCorrelationIndex: 72,
      factors: [
        `Suhu udara melampaui batas aman fisiologis (${temp.toFixed(1)}°C)`,
        `Kelembapan media tanam kritis (${soil.toFixed(1)}%)`,
        `Gas organik dan uap terakumulasi (${mqPpm.toFixed(0)} PPM)`,
      ],
      immediateActions: [
        'Lakukan penyiraman air secara bertahap untuk mendinginkan media perakaran tanaman.',
        'Aktifkan naungan / paranet serta sirkulasi pendingin udara.',
        'Jauhkan sumber panas dan periksa kabel listrik dari potensi overheat.',
      ],
      systemResponses: [
        'Mengusulkan siklus penyiraman darurat pendinginan.',
        'Memperpendek interval pemantauan sensor ke 15 menit.',
      ],
      flameAgreement: false,
      gasAgreement: false,
      recommendedInspection: 'Inspeksi suhu perangkat dan lakukan pendinginan lingkungan segera.',
      timestamp: nowTs,
    };
  }

  // ----------------------------------------------------
  // SKENARIO 5: ALL CLEAR & SECURE GREENHOUSE OPERATION
  // ----------------------------------------------------
  return {
    threatLevel: 'SAFE',
    threatScore: Math.min(10, Math.max(2, Math.round((mqPpm / 350) * 8))),
    threatTitle: 'KONDISI AMAN & TERKENDALI (ALL CLEAR)',
    threatDescription: `Sensor Flame dan MQ-135 saling memvalidasi bahwa lingkungan aman. Tidak ada api dan kualitas udara bersih (${mqPpm.toFixed(0)} PPM).`,
    causeAnalysis: 'Parameter keselamatan fisik dan kimia beroperasi pada batas optimal yang ideal untuk fotosintesis dan pertumbuhan tanaman.',
    crossValidationStatus: 'ALL_CLEAR',
    crossValidationDetails: 'Sensor Api [AMAN] + Sensor Gas [BERSIH]. Sinergi pengawasan keselamatan berjalan optimal.',
    sensorCorrelationIndex: 100,
    factors: [
      'Tidak ada deteksi lidah api atau radiasi inframerah anomali',
      `Kadar gas dan partikel udara berada pada zona optimal (${mqPpm.toFixed(0)} PPM)`,
      `Suhu (${temp.toFixed(1)}°C) dan kelembapan (${hum.toFixed(0)}%) seimbang`,
    ],
    immediateActions: [
      'Lanjutkan jadwal pemantauan mikroklimat rutin.',
      'Jaga kebersihan fisik permukaan sensor MQ-135 dan Flame Sensor.',
    ],
    systemResponses: [
      'Sistem keselamatan FLORA 2.0 aktif dalam status siaga siaga protektif.',
    ],
    flameAgreement: false,
    gasAgreement: false,
    recommendedInspection: 'Pemeriksaan rutin berkala mingguan.',
    timestamp: nowTs,
  };
}

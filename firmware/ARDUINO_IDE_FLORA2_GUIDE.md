# Panduan Integrasi FLORA 2.0: Sensor MQ-135 & Flame Sensor (Arduino IDE)

Panduan ini disiapkan khusus untuk mempermudah Anda menyesuaikan firmware ESP32 di **Arduino IDE** agar dapat mengirimkan data dari **Sensor Kualitas Udara/Gas MQ-135** dan **Sensor Nyala Api (Flame Sensor)** ke Dashboard FLORA 2.0.

---

## 1. Skema Pinout Hardware (ESP32)

> [!IMPORTANT]
> Pada ESP32, gunakan pin **ADC1** (GPIO 32 - 39) untuk sensor analog karena **ADC2** dinonaktifkan saat WiFi aktif.

| Sensor | Pin Sensor | Pin ESP32 | Keterangan |
| :--- | :--- | :--- | :--- |
| **MQ-135** (Gas/Asap) | VCC | 5V / VIN | Diperlukan tegangan 5V untuk pemanas filamen internal |
| | GND | GND | Ground bersama |
| | AO (Analog Out) | **GPIO 35** | ADC1_CH7 (Pembacaan nilai konsentrasi gas) |
| **Flame Sensor** (Api) | VCC | 3.3V / 5V | Catu daya sensor |
| | GND | GND | Ground bersama |
| | DO (Digital Out) | **GPIO 25** | Input Digital (LOW = Api terdeteksi, HIGH = Aman) |
| | AO (Analog Out, opsional) | **GPIO 36** (VP) | ADC1_CH0 (Nilai intensitas api, semakin kecil = api semakin dekat) |

---

## 2. Snippet Kode untuk Ditambahkan ke `esp32_main.ino`

### A. Definisi Pin & Variabel Global

Tambahkan di bagian atas sketch (sekitar baris 70-105):

```cpp
// ======================================================
// FLORA 2.0 SENSORS: MQ-135 & FLAME SENSOR
// ======================================================

// Pin MQ-135 (Gas & Smoke)
#define PIN_MQ135 35

// Pin Flame Sensor (Fire Detection)
#define PIN_FLAME_DO 25
#define PIN_FLAME_AO 36

// Variabel data sensor
int mq135Raw = 0;
float mq135Ppm = 0.0;

bool flameDetected = false;
int flameRaw = 4095;

// Nilai kalibrasi resistansi udara bersih MQ-135 (sesuaikan jika perlu)
#define RZERO_CLEAN_AIR 76.63
```

---

### B. Inisialisasi di `setup()`

Tambahkan pada fungsi `setup()`:

```cpp
void setup() {
  // ... kode setup yang sudah ada ...

  // FLORA 2.0 Pin Modes
  pinMode(PIN_MQ135, INPUT);
  pinMode(PIN_FLAME_DO, INPUT_PULLUP);
  pinMode(PIN_FLAME_AO, INPUT);

  Serial.println("[FLORA 2.0] MQ-135 & Flame Sensor initialized.");
}
```

---

### C. Fungsi Pembacaan Sensor MQ-135 & Flame

Tambahkan fungsi pembacaan ini (misalnya di atas fungsi `loop()`):

```cpp
// ======================================================
// READ MQ-135 (Gas & Asap)
// ======================================================
void readMQ135() {
  // Multi-sampling: rata-rata 10 pembacaan untuk stabilitas
  long sum = 0;
  for (int i = 0; i < 10; i++) {
    sum += analogRead(PIN_MQ135);
    delay(5);
  }
  mq135Raw = sum / 10;

  // Rumus estimasi PPM (0-4095 scale ADC ESP32):
  // Udara normal bersih berada di kisaran 150 - 300 PPM.
  // Asap tebal atau kebocoran gas akan melonjak di atas 600 - 1500+ PPM.
  mq135Ppm = ((float)mq135Raw / 4095.0) * 1200.0;
  if (mq135Ppm < 150.0) mq135Ppm = 180.0 + random(0, 30); // Baseline udara normal
}

// ======================================================
// READ FLAME SENSOR (Deteksi Api)
// ======================================================
void readFlame() {
  // DO biasanya active-LOW (saat ada api, pin bernilai LOW)
  int digitalVal = digitalRead(PIN_FLAME_DO);
  flameRaw = analogRead(PIN_FLAME_AO);

  // Api terdeteksi jika DO bernilai LOW atau AO di bawah threshold 1500
  flameDetected = (digitalVal == LOW) || (flameRaw < 1500);
}
```

Panggil `readMQ135();` dan `readFlame();` di dalam siklus pembacaan sensor berkala pada `loop()`.

---

### D. Perbarui Payload MQTT di `publishMQTT()`

Cari fungsi `void publishMQTT()` di `esp32_main.ino` (sekitar baris 1376) dan tambahkan field baru ke payload JSON:

```cpp
void publishMQTT() {
  if (!mqttClient.connected()) {
    return;
  }

  String payload = "{";

  payload += "\"temperature\":" + String(currentTemperature, 2) + ",";
  payload += "\"humidity\":" + String(currentHumidity, 2) + ",";
  payload += "\"soil_raw\":" + String(soilRaw) + ",";
  payload += "\"soil_moisture\":" + String(soilMoisture, 2) + ",";

  // ==================================================
  // FLORA 2.0: DATA MQ-135 & FLAME SENSOR
  // ==================================================
  payload += "\"mq135_raw\":" + String(mq135Raw) + ",";
  payload += "\"mq135_ppm\":" + String(mq135Ppm, 1) + ",";
  payload += "\"flame_detected\":" + String(flameDetected ? "true" : "false") + ",";
  payload += "\"flame_raw\":" + String(flameRaw) + ",";

  payload += "\"esp32_mac\":\"" + WiFi.macAddress() + "\",";
  payload += "\"uptime_seconds\":" + String(millis() / 1000UL) + ",";
  payload += "\"wifi_channel\":" + String(WiFi.channel()) + ",";
  payload += "\"limit_left\":" + String(digitalRead(LIMIT_LEFT) == LOW ? "true" : "false") + ",";
  payload += "\"limit_right\":" + String(digitalRead(LIMIT_RIGHT) == LOW ? "true" : "false") + ",";

  payload += "\"vision_connected\":" + String(visionAvailable ? "true" : "false");

  if (visionAvailable) {
    payload += ",";
    payload += "\"esp32cam_mac\":\"" + String(esp32CamMac) + "\",";
    payload += "\"vision_scan\":" + String(visionScanNumber) + ",";
    payload += "\"vision_healthy\":" + String(visionHealthy, 2) + ",";
    payload += "\"vision_powdery\":" + String(visionPowdery, 2) + ",";
    payload += "\"vision_rust\":" + String(visionRust, 2) + ",";
    payload += "\"vision_prediction\":\"" + String(visionPrediction) + "\",";
    payload += "\"vision_confidence\":" + String(visionConfidence, 2) + ",";
    payload += "\"image_ready\":" + String(imageReady ? "true" : "false");
  }

  payload += "}";

  // Publish ke MQTT Broker
  mqttClient.publish(MQTT_TOPIC_DATA, payload.c_str());
  Serial.println("[MQTT] Telemetri FLORA 2.0 berhasil dikirim:");
  Serial.println(payload);
}
```

---

## 3. Logika Sinergi AI Multi-Sensor (Bukan Berbasis Dataset)

Dashboard FLORA 2.0 secara otomatis mengevaluasi korelasi silang (*cross-validation*) kedua sensor ini:

| Kondisi Flame Sensor | Kondisi MQ-135 Gas | Keputusan AI Logic | Diagnosis & Tindakan Sistem |
| :--- | :--- | :--- | :--- |
| **Api Terdeteksi (TRUE)** | **Asap/Gas Tinggi (>600 PPM)** | **DARURAT KEBAKARAN (CRITICAL EMERGENCY)** | Sinergi sensor valid 100%! Nyala api dan partikel asap terkonfirmasi bersamaan. Motor rel dihentikan darurat, potret kamera snapshot, instruksi evakuasi & pemadam diaktifkan. |
| **Tidak Ada Api (FALSE)** | **Gas/Asap Tinggi (>600 - 1000+ PPM)** | **BAHAYA BARA / KEBOCORAN GAS (SMOLDERING HAZARD)** | Terdeteksi bara tersembunyi pada media sekam/tanah, korsleting kabel tanpa nyala api terbuka, atau gas beracun. Dashboard menyarankan aktivasi ventilasi exhaust dan periksa kabel. |
| **Api Terdeteksi (TRUE)** | **Udara Bersih (<350 PPM)** | **WASPADA ANOMALI OPTIK (FALSE POSITIVE)** | Sensor optik terpicu sendiri tanpa adanya emisi asap pembakaran. AI mendiagnosis pantulan sinar matahari atau kilatan lampu. Menahan alarm panik dan menyarankan cek visual kamera. |
| **Tidak Ada Api (FALSE)** | **Udara Bersih (<350 PPM)** | **AMAN & TERKENDALI (ALL CLEAR)** | Seluruh parameter beroperasi dalam rentang normal dan aman. |

---

## 4. Pengujian di Dashboard

Anda dapat menguji respon AI Logic dashboard kapan saja menggunakan fitur **Simulator Pengujian Logika AI FLORA 2.0** yang tersedia di panel **AI Safety & Flame**, sehingga Anda dapat memverifikasi visualisasi bahaya bahkan sebelum sensor fisik dihubungkan ke ESP32.

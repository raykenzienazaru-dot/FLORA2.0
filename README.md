# FLORA 2.0 — Smart Plant Monitoring & AI Hazard Safety System

**FLORA 2.0** adalah sistem pemantauan tanaman cerdas dan keselamatan lingkungan mikroklimat generasi kedua berbasis ESP32, ESP32-CAM, sensor mikroklimat (DHT22, Soil Capacitive), sensor keselamatan (MQ-135 Gas & Smoke, Flame Sensor IR), ESP-NOW Mesh, MQTT, dan Dashboard Web interaktif dengan **AI Sensor Fusion Rule-Based Logic**.

---

## 🌟 Fitur Utama FLORA 2.0

1. **5-Sensor Telemetry Stream Realtime:**
   - **Suhu Udara (DHT22):** Monitoring suhu mikroklimat kanopi (°C).
   - **Kelembapan Udara (DHT22):** Kelembapan relatif (% RH).
   - **Kadar Air Tanah (Kapasitif v1.2):** Analog ADC monitoring kelembapan substrat akar.
   - **Kualitas Gas & Asap (MQ-135):** Deteksi konsentrasi gas berbahaya, asap rokok, CO2, dan partikel VOC (PPM).
   - **Detektor Nyala Api (Optical Flame Sensor IR):** Deteksi radiasi nyala api pada spektrum 760–1100 nm.

2. **AI Hazard Sensor Fusion Logic (Non-Dataset Rule-Based):**
   - **Mutual Cross-Validation Matrix:** Sinergi dan verifikasi silang antara sensor gas/asap MQ-135 dan sensor api optik IR untuk menolak *false positive* (misal: pantulan cahaya matahari) dan mengonfirmasi bahaya nyata.
   - **Skenario Deteksi Bahaya Cerdas:**
     - **Api + Asap (Kebakaran Nyata):** *CRITICAL EMERGENCY* (Sirene darurat, isolasi aktuator).
     - **Asap Saja (Smoldering):** *HIGH RISK* (Bara sekam / korsleting kabel tanpa lidah api).
     - **Api Tanpa Asap (Silau Matahari):** *OPTICAL ADVISORY* (Anomali optik tertolak, tidak memicu alarm palsu).
     - **Overheat & Dehidrasi:** *WARNING* (Pencegahan pembakaran spontan).
     - **Normal & Aman:** Kondisi mikroklimat optimal.
   - **Interactive Hazard Simulator Bench:** 6 tombol simulasi terintegrasi di dashboard untuk pengujian AI Logic tanpa membakar sensor fisik.

3. **Software AI Vision & Agronomic Decision Support:**
   - Klasifikasi kanopi daun (Healthy, Powdery Mildew, Leaf Rust) via ESP32-CAM & ESP-NOW.
   - Algoritma rekomendasi penyiraman cerdas berbasis status kadar air tanah aktual.

4. **Sistem Topology & Kontrol Aktuator:**
   - Kontrol manual carriage scanner optik (L298N Motor Driver) dengan interlock limit switch keamanan.
   - Topology status perangkat keras 12-node simetris.

---

## 📁 Struktur Proyek

- `dashboard/` — Dashboard frontend Vite + React + TypeScript dan server backend Node.js / Express / WebSocket.
- `firmware/`
  - `ARDUINO_IDE_FLORA2_GUIDE.md` — Panduan lengkap pinout wiring, skrip sampling C++, dan format payload JSON untuk Arduino IDE.
  - `esp32_main/` — Firmware ESP32 utama.
  - `esp32_cam/` — Firmware ESP32-CAM AI Vision.

---

## 🚀 Cara Menjalankan Dashboard

```bash
# 1. Masuk ke direktori dashboard
cd dashboard

# 2. Install dependensi
npm install

# 3. Jalankan server backend telemetri & AI Logic
node server.js

# 4. Di terminal baru, jalankan frontend Vite
npm run dev
```

Buka browser di `http://localhost:5173` untuk melihat dashboard FLORA 2.0.

---

## 🔒 Catatan Keamanan & Kalibrasi

- Pembacaan sensor MQ-135 memerlukan waktu preheating awal sekitar 2–3 menit untuk akurasi optimal.
- Logika AI Fusi dirancang untuk memprioritaskan keselamatan tanaman dan pengguna dengan prinsip *fail-safe*.

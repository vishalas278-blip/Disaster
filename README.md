# STORMGUARD AI ⛈️
### Early Convective Genesis, Nowcasting & Hyperlocal Impact Intelligence Platform
**Smart India Hackathon (SIH 2026) — Software-First Preliminary Prototype**

---

## 🛰️ 1. Executive Summary & Problem Statement

**SIH Problem Statement**: *Convective-scale nowcasting for Thunderstorms, Severe Hail & Cloudbursts.*

Traditional Doppler Weather Radars (DWR) and numerical weather prediction models (NWP) typically warn of thunderstorms only **after** deep convective cores have already formed ($\ge 45\text{ dBZ}$ radar reflectivity echo).

**STORMGUARD AI** introduces an **Early Convective Genesis & Nowcasting** intelligence system that detects incipient pre-convective triggers **15 to 45 minutes prior to explosive storm cell development**:
- **Thermodynamic Column Instability**: Surface-based CAPE surge ($>2500\text{ J/kg}$) & Lifted Index ($<-5\text{ K}$).
- **Cap Inversion Erosion**: Rapid depletion of Convective Inhibition ($\text{CIN} < 20\text{ J/kg}$).
- **Mesoscale Moisture Convergence**: High Precipitable Water ($\text{TPW} > 50\text{ mm}$) & boundary layer Relative Humidity ($>75\%$).
- **Kinematic Updraft Acceleration**: Vertical velocity growth ($>15\text{ m/s}$) & 0–3km bulk shear.
- **Pre-Echo Cloud Growth**: Rapid satellite infrared cloud-top cooling ($\Delta T < -10^\circ\text{C}/15\text{m}$).

---

## 🚫 2. Zero External API Keys & 100% Offline Demonstration

This prototype is **100% self-contained** and designed to run completely offline on a standard laptop without requiring any third-party API keys:
- ❌ **No Google Maps API Key**
- ❌ **No Mapbox API Key**
- ❌ **No OpenWeather / External Weather API Key**
- ❌ **No OpenAI / Gemini / Claude API Key**
- ❌ **No internet connection needed during presentation**

---

## 🗺️ 3. Built-In Meteorological GIS Radar Map

The application features an **in-built interactive SVG/Canvas GIS meteorological radar map** designed for scientific clarity:
- **Tactical Coordinate Grid**: Lat/Lon reference lines with degree labels and tactical scale.
- **Regional Geographic Boundaries**: Outlines of districts (Delhi NCT, Gurugram, Noida, Ghaziabad, Faridabad, Yamuna River corridor).
- **Simulated Radar Reflectivity Fields**: Multi-band Gaussian radial gradients:
  - **LOW (25–35 dBZ)**: Green (`#10b981`)
  - **WATCH (35–48 dBZ)**: Yellow (`#f59e0b`)
  - **WARNING (48–58 dBZ)**: Orange/Red (`#ef4444`)
  - **SEVERE (58–68+ dBZ)**: Magenta (`#d946ef`)
- **Incipient Convective Genesis Hotspots**: Animated pulsing concentric rings highlighting the pre-storm genesis trigger zone.
- **AI Trajectory Vectors**: Animated vector paths connecting time steps with arrival countdowns ($T_0 \to T_{+15} \to T_{+30} \to T_{+45} \to T_{+60}$).
- **Ground Weather Stations (AWS)**: IMD Safdarjung, IGI Airport Met, Noida AWS, CyberCity AWS with live hover readouts.
- **Interactive Click-to-Probe**: Click anywhere on the map to place an atmospheric crosshair and compute local risk and arrival countdown!

---

## 🧠 4. Local AI Engine & Deterministic Demonstration Scenarios

### Machine Learning Model Architecture
- **Model**: Multi-Tree Gradient-Boosted Decision Ensemble (`ConvectiveGenesisEnsembleClassifier`).
- **Input Features (14 parameters)**: CAPE, CIN, Lifted Index, K-Index, TPW, Surface Temp, RH, Dew Point Depression, Pressure Tendency (3h), Updraft Helicity, Vertical Velocity, Wind Shear, Reflectivity Gradient, Cloud Top Cooling Rate.
- **XAI Feature Attributions**: Quantitative contribution scores for every physical parameter.

### Calibrated Deterministic Demonstration Scenario (NCR Cloudburst)
| Timestep | Display Time | Convective Genesis % | Thunderstorm % | Severe Hail % | Cloudburst % | Threat Level |
|---|---|---|---|---|---|---|
| **$T_0$** | 14:00 IST | **45.0%** | **42.0%** | **18.0%** | **22.0%** | `WATCH` |
| **$T_{+15}$** | 14:15 IST | **61.0%** | **57.0%** | **25.0%** | **34.0%** | `WATCH` |
| **$T_{+30}$** | 14:30 IST | **72.0%** | **71.0%** | **34.0%** | **49.0%** | `WARNING` |
| **$T_{+45}$** | 14:45 IST | **81.0%** | **82.0%** | **42.0%** | **63.0%** | `SEVERE` |
| **$T_{+60}$** | 15:00 IST | **88.0%** | **89.0%** | **54.0%** | **76.0%** | `SEVERE` |

---

## 🚀 5. How to Start and Run the Prototype

### Option A: Standard Dev Server
```bash
# 1. Start FastAPI Backend (Terminal 1)
.\python_env\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# 2. Start Vite Frontend (Terminal 2)
cd frontend
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Option B: Standalone Model Training & Prediction
```bash
# Train ML model
.\python_env\python.exe ml/train.py

# Run standalone CLI inference
.\python_env\python.exe ml/predict.py --scenario severe
```

### Option C: Run Automated System Verification Test
```bash
.\python_env\python.exe test_system.py
```

---

## 🎬 6. Demonstration Workflow for College Presentation

1. **Open Dashboard (`http://localhost:5173`)**:
   - Point out **`LOCAL AI ENGINE ONLINE`** and **`● DEMO MODE`** in the header.
   - Note the immediate load with **Zero API Keys**.
2. **Observe Incipient Genesis ($T_0$)**:
   - Highlight the pulsing **Incipient Convective Genesis Zone** over SW NCR on the map before the radar storm core has fully developed.
   - Explain the 3 Hazard Risk Cards: Thunderstorm 42%, Hail 18%, Cloudburst 22%.
3. **Play Spatiotemporal Forecast**:
   - Click **`▶ PLAY FORECAST`** on the bottom timeline.
   - Watch the animated trajectory vector progress through $T_{+15} \to T_{+30} \to T_{+45} \to T_{+60}$.
   - Note how the threat banner transitions from `WATCH` $\to$ `WARNING` $\to$ `SEVERE CLOUDBURST ALERT`.
4. **Explainable AI (XAI)**:
   - Review the **"Why This Warning?"** bar chart showing the primary physical drivers (Radar Reflectivity Growth, CAPE Instability, CIN Cap Erosion, Updraft Velocity).
5. **Interactive Map Probe & AI Probe**:
   - Click on the map to place a crosshair and show hyperlocal risk and arrival countdown.
   - Click **`AI Probe`** in the header, adjust CAPE and CIN sliders, and click **`Run Convective Genesis Inference`** to demonstrate instant local ML prediction.

---

## 📜 7. Scientific Disclaimer
*Prototype demonstration using simulated meteorological data for Smart India Hackathon 2026. Not an operational weather warning service.*

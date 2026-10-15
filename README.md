# EPIC-Hour ⚡
### Epidemic Prediction & Immediate Crisis Hour

[![Google AI Builder Cup](https://img.shields.io/badge/Google%20AI%20Builder%20Cup-2026-4285F4?logo=google)](https://googleaibuilder.com)
[![Track](https://img.shields.io/badge/Track-Sustainability%20%26%20Social%20Impact-34A853)](.)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5-EA4335?logo=google)](https://ai.google.dev)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20FastAPI%20%2B%20GCP-blue)](.)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

> **The only system that transforms disaster SOS triage into an epidemiological outbreak radar — zero hardware, 100% cloud-native.**

---

## The Problem: Two Deadly Waves, One Broken Response

Climate disasters kill in two phases — and no existing tool spans both:

| Wave | Timeframe | Crisis | Gap |
|---|---|---|---|
| **Wave 1** | Hours 0–48 | Rescue chaos, multilingual SOS floods, duplicate dispatches, missed medical emergencies | Apps stop when water recedes |
| **Wave 2** | Days 3–14 | Cholera, leptospirosis, dengue erupt silently as sewage contaminates water lines | Hospitals detect outbreaks 10 days too late |

**EPIC-Hour bridges both waves in a single causal intelligence pipeline.**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT 19 COMMAND CENTER                     │
│  TimeHorizonSlider │ MultimodalIngestDrawer │ EpidemicCard      │
│  @vis.gl/react-google-maps + deck.gl HeatmapLayer               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│              FASTAPI (Python 3.11) on Cloud Run                  │
│  /sos/ingest  /sos/active  /surveillance/pulse  /demo/simulate  │
└──────┬──────────────────┬──────────────────┬────────────────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌────────▼──────────────────┐
│ Gemini      │  │ text-          │  │ Gemini 2.5 Pro             │
│ 2.5 Flash   │  │ embedding-004  │  │ Spatio-temporal            │
│ Triage +    │  │ Cosine dedup   │  │ Epidemic Reasoning +       │
│ Audio       │  │ engine         │  │ Function Calling           │
└──────┬──────┘  └────────┬──────┘  └────────┬──────────────────┘
       └──────────────────┴──────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────────┐
│              CLOUD FIRESTORE (Native Mode)                        │
│   sos_tickets  │  pharmacy_pulses  │  outbreak_alerts            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Two-Phase Engine

### Phase 1 — Acute Triage (Hours 0–48)

1. **Multilingual SOS Ingestion** — Voice/text in Tamil, Hindi, Hinglish, Tanglish, English via browser `MediaRecorder` API
2. **Gemini 2.5 Flash Structured Extraction** — Single call → strict JSON: location, `urgency_score` (1–10), `vulnerability_tags`, `resources_needed`, `environmental_hazard_logged`
3. **Semantic De-duplication** — `text-embedding-004` 768-dim vectors; cosine ≥ 0.85 + distance < 300m → merge ticket, boost urgency
4. **Autonomous Micro-Matching** — Nearest volunteer/NGO/pharmacy within 2 km auto-assigned via GeoPoint queries

### Phase 2 — Outbreak Radar (Days 3–14)

> **Key insight:** Phase 1 `environmental_hazard_logged` fields (`SEWAGE_OVERFLOW`, `STAGNANT_FLOODWATER`) persist as a **baseline bio-risk map** after rescue completes.

1. **Pharmacy/ASHA Micro-Pulse** — 10-second voice/text from local pharmacists ("sold 65 ORS packs, Doxycycline out of stock")
2. **Spatio-Temporal Correlation** — Gemini 2.5 Pro cross-references Ward hazard nodes (Phase 1) + OTC medication spikes (Phase 2) + Open-Meteo humidity
3. **Outbreak Alert** — `risk_probability`, `suspected_pathogen_class`, `causal_chain_reasoning`, auto-drafted `municipal_action_order`

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 (Vite) + Tailwind CSS |
| **Maps** | `@vis.gl/react-google-maps` + `deck.gl` HeatmapLayer |
| **Backend** | Python 3.11 + FastAPI (async) |
| **AI — Triage** | `gemini-2.5-flash` (structured output + audio) |
| **AI — Dedup** | `text-embedding-004` (cosine similarity) |
| **AI — Epidemiology** | `gemini-2.5-pro` (function calling) |
| **Database** | Cloud Firestore (Native Mode + GeoPoint) |
| **Compute** | Cloud Run (backend) + Firebase Hosting (frontend) |
| **Geocoding** | Google Maps Geocoding API |
| **Weather** | Open-Meteo (zero-key REST) |

---

## Data Schemas

### SOS Ticket (Phase 1)
```json
{
  "ticket_id": "SOS-2026-0891",
  "raw_input": "Velachery 4th main, 72yr old grandpa needs dialysis, sewage mixing in water!",
  "language_detected": "en-IN (Tanglish)",
  "location": { "lat": 12.9756, "lng": 80.2207, "ward_id": "WARD_14" },
  "triage": {
    "urgency_score": 9.6,
    "category": "MEDICAL_EVACUATION",
    "vulnerability_tags": ["ELDERLY", "DIALYSIS_DEPENDENT"],
    "resources_needed": ["BOAT", "MEDICAL_TRANSPORT"],
    "environmental_hazard_logged": ["SEWAGE_OVERFLOW", "STAGNANT_FLOODWATER"]
  },
  "deduplication": { "duplicate_count": 4, "similarity_score": 0.94 },
  "status": "MATCHED",
  "assigned_volunteer_id": "VOL-104"
}
```

### Pharmacy Pulse (Phase 2)
```json
{
  "pulse_id": "PHARM-2026-441",
  "facility_name": "MedPlus Velachery Main",
  "location": { "lat": 12.9762, "lng": 80.2215, "ward_id": "WARD_14" },
  "extracted_signals": {
    "symptom_clusters": ["ACUTE_DIARRHEA", "HIGH_FEVER", "VOMITING"],
    "medications_spiking": ["ORS_PACKETS", "DOXYCYCLINE", "CIPROFLOXACIN"],
    "estimated_patient_count": 65,
    "stockout_warning": ["ORS_PACKETS"]
  }
}
```

### Outbreak Alert (Phase 2 Output)
```json
{
  "alert_id": "EPI-2026-09",
  "ward_id": "WARD_14",
  "risk_probability": 0.89,
  "suspected_pathogen_class": "Waterborne Bacterial (Cholera / Acute Gastroenteritis)",
  "causal_chain_reasoning": "9 SEWAGE_OVERFLOW reports in Ward 14 (Oct 15) + 340% ORS & Doxycycline spike across 3 pharmacies within 600m (Oct 19).",
  "recommended_municipal_actions": [
    "Deploy mobile chlorination tanker — 4th Main Road, Velachery",
    "Restock ORS & IV fluids at Ward 14 UPHC",
    "Broadcast boiled-water alert to Ward 14 residents"
  ]
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/sos/ingest` | Text/audio → Gemini triage → geocode → dedup → Firestore → volunteer match |
| `GET` | `/api/v1/sos/active` | All active Phase 1 pins + volunteer assignments |
| `POST` | `/api/v1/surveillance/pulse` | Pharmacist voice/text → symptom extraction → Phase 2 correlation |
| `GET` | `/api/v1/surveillance/heatmap` | GeoJSON: Phase 1 hazard zones + Phase 2 symptom intensity |
| `POST` | `/api/v1/demo/simulate-day` | `{"day": 1}` or `{"day": 5}` — loads mock data for live demo |

---

## Project Structure

```
epic-hour/
├── frontend/                    # React 19 + Vite
│   └── src/
│       ├── components/
│       │   ├── TimeHorizonSlider.jsx
│       │   ├── MultimodalIngestDrawer.jsx
│       │   ├── EpidemicReasoningCard.jsx
│       │   └── EpicHourMap.jsx
│       ├── hooks/
│       │   └── useMediaRecorder.js
│       └── App.jsx
│
├── backend/                     # FastAPI + Python 3.11
│   ├── main.py
│   ├── models/
│   │   ├── sos_schema.py
│   │   └── surveillance_schema.py
│   ├── services/
│   │   ├── gemini_flash.py      # Triage + audio
│   │   ├── gemini_pro.py        # Epidemic reasoning + function calling
│   │   ├── embeddings.py        # text-embedding-004 dedup
│   │   └── geocoding.py
│   └── data/
│       └── mock_dataset.json    # 20 SOS + 15 pharmacy logs
│
├── infrastructure/
│   ├── Dockerfile
│   ├── cloudbuild.yaml
│   └── firebase.json
│
├── README.md
└── CLAUDE.md
```

---

## Quickstart

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env   # add GEMINI_API_KEY, GOOGLE_MAPS_API_KEY, FIREBASE credentials
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # add VITE_GOOGLE_MAPS_API_KEY, VITE_API_URL
npm run dev
```

### Demo Mode (No API Keys Needed for Mock Run)
```bash
# Load Day 1 mock data
curl -X POST http://localhost:8000/api/v1/demo/simulate-day -H "Content-Type: application/json" -d '{"day": 1}'
# Fast-forward to outbreak scenario
curl -X POST http://localhost:8000/api/v1/demo/simulate-day -H "Content-Type: application/json" -d '{"day": 5}'
```

---

## What Makes This Different

| Capability | What Exists Today | EPIC-Hour Advantage |
|---|---|---|
| **Hazard-to-Pathogen Memory** | SOS apps archive data after rescue | Phase 1 `environmental_hazard_logged` seeds Phase 2 risk maps |
| **Vernacular Micro-Pulse Surveillance** | Requires ERP pharmacy integration | 10-second voice note → structured epidemiological telemetry |
| **Causal Reasoning** | Black-box probability scores | Gemini 2.5 Pro explains the causal chain + drafts municipal order |

---

## Google AI Builder Cup Alignment

| Criterion | EPIC-Hour Delivery |
|---|---|
| **Strengthening Resilience** | Real-time volunteer dispatch cuts rescue bottlenecks in Wave 1 |
| **Supporting Communities** | Vernacular voice input — any literacy level, any regional language |
| **Informed Decision-Making** | Causal reasoning cards give municipal officers actionable intelligence |
| **Google Ecosystem Depth** | 3 Gemini models + Maps + Geocoding + Cloud Run + Firestore |

---

## License

MIT © 2026 EPIC-Hour Team


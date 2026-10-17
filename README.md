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

## Multi-Actor Role Architecture (3 Portals)

To ensure authenticity, safety, and operational usability, the application separates disaster response into three distinct role-based portals:

1. **Citizen Emergency SOS Portal (`CitizenSOSPortal.jsx`)**:
   - Frictionless, zero-login emergency reporting for stranded citizens or bystanders.
   - Multimodal vernacular Voice Recording (`MediaRecorder` base64 audio) + Text input + 1-Click Demo Scenarios.
   - Live 768-dim Semantic De-duplication status ("Merged with nearby ticket — Urgency boosted"), auto-assigned volunteer ETA, and AI-generated safety guidance.

2. **Verified Medical Shop & Healthcare Portal (`PharmacyPulsePortal.jsx`)**:
   - Authenticated portal for neighborhood pharmacies (MedPlus, Apollo, Jan Aushadhi) and ASHA/clinic workers.
   - Enforces verified `facility_id` and `license_token` validation to reject malicious or poisoned data.
   - **Hybrid Input**: Supports vernacular voice/text notes alongside structured **1-Tap OTC Spike Steppers** (ORS Packets, Doxycycline, Paracetamol, Ciprofloxacin, IV Fluids), stockout toggles, and presenting patient counts.
   - Collects strictly aggregate syndromic/OTC velocity (zero patient PII).

3. **Municipal Command Center (`CommandCenter.jsx`)**:
   - Geospatial operations dashboard for municipal disaster commanders and public health officers.
   - Interactive `<TimeHorizonSlider />` (Phase 1 Acute Rescue ↔ Phase 2 Bio-Surveillance Radar).
   - Tactical `<EpicHourMap />` displaying persisted hazard anchors, rescue squads, and pharmacy pulse telemetry.
   - `<EpidemicReasoningCard />` with Gemini 2.5 Pro causal reasoning graph and **Human-in-the-Loop** approval buttons for municipal containment protocols.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     REACT 19 CIVIC PLATFORM                     │
│  CitizenSOSPortal │ PharmacyPulsePortal │ CommandCenter         │
│  TimeHorizonSlider │ EpicHourMap │ EpidemicReasoningCard        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS REST API
┌────────────────────────────▼────────────────────────────────────┐
│              FASTAPI (Python 3.11) on Cloud Run                  │
│  /sos/ingest  /sos/active  /surveillance/pulse  /state          │
│  /action/approve  /auth/login  /demo/simulate-day               │
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
│     STATE STORE: FIRESTORE (Cloud) / IN-MEMORY MOCK (Local)     │
│   sos_tickets  │  pharmacy_pulses  │  outbreak_alerts            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Two-Phase Engine

### Phase 1 — Acute Disaster Triage (Hours 0–48)

1. **Multilingual SOS Ingestion** — Voice/text in Tamil, Hindi, Hinglish, Tanglish, English via browser `MediaRecorder` API.
2. **Gemini 2.5 Flash Structured Extraction** — Single call → strict JSON: location, `urgency_score` (1–10), `vulnerability_tags`, `resources_needed`, and `environmental_hazard_logged`.
3. **Semantic De-duplication** — `text-embedding-004` 768-dim vectors; cosine similarity ≥ 0.85 + Haversine distance < 300m → merge duplicate ticket, boost urgency, eliminate duplicate pins.
4. **Autonomous Volunteer Micro-Matching** — Nearest volunteer/NGO response squad auto-assigned with ETA calculation.

**Reporting Flow**:

Citizen Ingest (Audio/Text + Address)
                │
                ▼
1. Multilingual Triage (Gemini 2.5 Flash) ─── Extracts Urgency (1-10), Vulnerabilities & Hazards
                │
                ▼
2. Geocoding Engine ──────────────────────── Resolves "4th Main Road" to GPS [12.9756, 80.2207]
                │
                ▼
3. PII Hashing ───────────────────────────── SHA-256 phone hash
                │
                ▼
4. 768-dim Semantic De-duplication ───────── text-embedding-004 + Haversine distance (<300m)
                ├── [If Duplicate]: Merges ticket, boosts urgency (+0.3), no new map clutter
                └── [If Unique]: Assigns Ticket ID (e.g. SOS-2026-F89A)
                │
                ▼
5. Autonomous Micro-Matching ─────────────── Auto-assigns nearest volunteer squad & calculates ETA
                │
                ▼
          State Store Persistence


### Phase 2 — Outbreak Early Warning Radar (Days 3–14)

> **Key Architectural Insight:** Phase 1 `environmental_hazard_logged` tags (`SEWAGE_OVERFLOW`, `STAGNANT_FLOODWATER`, `CONTAMINATED_WELL`) **persist into Phase 2 as bio-risk anchors** after floodwaters recede.

1. **Pharmacy/ASHA Micro-Pulse** — 10-second voice note + 1-Tap OTC counters from verified neighborhood pharmacies.
2. **Spatio-Temporal Correlation** — Gemini 2.5 Pro cross-references Ward hazard anchors (Phase 1) + OTC medication spikes (Phase 2) + Open-Meteo weather telemetry (humidity/temperature).
3. **Outbreak Containment Proposals** — `risk_probability`, `suspected_pathogen_class`, `causal_chain_reasoning`, and Human-in-the-Loop municipal action orders (mobile chlorination, medical restock, boiled-water alerts).

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 (Vite) + Tailwind CSS + Leaflet (`react-leaflet`) + Lucide Icons |
| **Backend** | Python 3.11 + FastAPI (async, Cloud Run ready) |
| **AI — Triage** | `gemini-2.5-flash` (multimodal audio & multilingual text, strict JSON schema) |
| **AI — Dedup** | `text-embedding-004` (768-dim semantic vectors + Haversine distance) |
| **AI — Epidemiology** | `gemini-2.5-pro` (spatio-temporal correlation & function calling) |
| **Database** | Cloud Firestore (Native Mode) with stateful in-memory fallback |
| **Weather Telemetry** | Open-Meteo API (live humidity and temperature) |

---

## API Contract (`/api/v1/`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/state` | Unified state: active tickets, verified pharmacies, pulses, weather, outbreak alert |
| `POST` | `/api/v1/sos/ingest` | Multimodal SOS ingest → Gemini Flash triage → geocode → dedup → volunteer match |
| `GET` | `/api/v1/sos/active` | All active Phase 1 emergency tickets |
| `GET` | `/api/v1/facilities/verified` | List of verified pharmacies & healthcare clinics |
| `POST` | `/api/v1/surveillance/pulse` | Authenticated pharmacy OTC telemetry → Gemini Flash extraction → Pro outbreak correlation |
| `GET` | `/api/v1/surveillance/heatmap` | GeoJSON FeatureCollection for tactical map layers (hazards & pulses) |
| `POST` | `/api/v1/action/approve` | Human-in-the-Loop authorization for Gemini-proposed municipal containment actions |
| `POST` | `/api/v1/auth/login` | Role-based authentication (Pharmacy partner or Municipal officer) |
| `POST` | `/api/v1/demo/simulate-day` | Idempotent simulation switcher (`{"day": 1}` Acute Flood or `{"day": 5}` Outbreak Surge) |

---

## Project Structure

```
EpicHour/
├── frontend/                    # React 19 + Vite + Tailwind CSS
│   └── src/
│       ├── components/
│       │   ├── AppHeader.jsx             # Official Civic Header & Role Switcher
│       │   ├── CitizenSOSPortal.jsx      # Portal 1: Voice/Text SOS + Semantic Merge
│       │   ├── PharmacyPulsePortal.jsx   # Portal 2: Verified Pharmacy OTC Steppers + Voice
│       │   ├── CommandCenter.jsx         # Portal 3: Municipal Operations Dashboard
│       │   ├── TimeHorizonSlider.jsx     # Phase 1 (0-48h) ↔ Phase 2 (3-14d) Switcher
│       │   ├── EpicHourMap.jsx           # Leaflet Tactical Map (Hazards, Pulses, Squads)
│       │   ├── EpidemicReasoningCard.jsx # Causal Reasoning & Action Approval
│       │   └── LoginModal.jsx            # RBAC Authentication Modal
│       ├── hooks/
│       │   └── useMediaRecorder.js       # Base64 browser audio recording
│       ├── services/
│       │   └── api.js                    # Axios API client
│       └── App.jsx                       # Root application container
│
├── backend/                     # FastAPI + Python 3.11
│   ├── main.py                  # API endpoints, CORS, pipeline orchestration
│   ├── models/
│   │   ├── auth_schema.py       # RBAC login request/response schemas
│   │   ├── sos_schema.py        # SOSTicket, TriageExtraction, Location schemas
│   │   └── surveillance_schema.py # PharmacyPulse, OutbreakAlert, MunicipalAction
│   ├── services/
│   │   ├── gemini_flash.py      # Multimodal triage & pharmacy extraction
│   │   ├── gemini_pro.py        # Spatio-temporal outbreak correlation & action planning
│   │   ├── embeddings.py        # text-embedding-004 cosine deduplication
│   │   ├── geocoding.py         # Address geocoding & Open-Meteo weather fetch
│   │   └── state_store.py       # Firestore repository with in-memory fallback
│   └── data/
│       └── mock_dataset.json    # Rich Ward 14 (Velachery) Day 1 & Day 5 dataset
│
├── .gitignore
├── README.md
└── CLAUDE.md
```

---

## Quickstart

### 1. Backend (FastAPI on Port 8000)
```powershell
cd backend
python -m pip install -r requirements.txt
python main.py
```
> *API interactive Swagger docs will be available at:* `http://localhost:8000/docs`

### 2. Frontend (React 19 Vite on Port 5173)
```powershell
cd frontend
npm install
npm run dev
```
> *Application UI will be available at:* `http://localhost:5173`

### 3. Dual-Mode Demo (Zero Configuration Required)
The application is pre-configured with **Resilient Dual-Mode Execution**:
- If `GEMINI_API_KEY` is present in `backend/.env`, it uses live Google GenAI models (`gemini-2.5-flash`, `text-embedding-004`, `gemini-2.5-pro`).
- If no API key is configured or offline, deterministic NLP and epidemiological algorithms automatically take over, ensuring **100% demo uptime without crashes**.
- Click **"Simulate Day 1"** (Acute Flood) or **"Simulate Day 5"** (Outbreak Surge) directly in the UI to demonstrate both phases of crisis management.

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


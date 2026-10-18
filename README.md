# EPIC-Hour
### Epidemic Prediction & Immediate Crisis Hour
> **A Two-Act Crisis Intelligence Platform Bridging Acute Disaster Rescue and Post-Flood Epidemic Outbreak Surveillance**

---

## 1. Executive Summary

Climate disasters claim lives in two distinct, sequential waves:
- **Wave 1 (Hours 0–48 — Acute Rescue):** Multilingual citizen SOS panic, emergency call overload, duplicate rescue dispatches, and life-critical physical bottlenecks (elderly patients, dialysis needs, roof strandings).
- **Wave 2 (Days 3–14 — Post-Disaster Epidemics):** Submerged sewage networks and contaminated groundwater quietly incubate waterborne pathogens (cholera, acute gastroenteritis, leptospirosis). Hospitals only notice when inpatient wards overflow 10 days too late.

Existing disaster tools are disconnected: rescue trackers archive their data as soon as floodwaters recede, while municipal public health systems operate in silos.

**EPIC-Hour connects both phases into a unified, causal intelligence pipeline.** Environmental hazards logged during Phase 1 acute rescues are preserved as **upstream bio-hazard anchors**. When neighborhood pharmacies log over-the-counter (OTC) medication rushes in Phase 2, the causal engine cross-references the historical breach coordinates with live syndromic spikes to predict waterborne outbreaks up to 10 days before hospital admission spikes.

---

## 2. End-to-End System Workflow

```
                                  ACT 1: ACUTE DISASTER RESCUE (HOURS 0–48)
┌────────────────────────┐      ┌───────────────────────────┐      ┌──────────────────────────────┐
│  Citizen Emergency SOS │ ───► │  Gemini 2.5 Flash Triage  │ ───► │ 768-dim Semantic Dedup Engine│
│  • Voice note (Tamil/  │      │  • Urgency Score (1–10)   │      │ • text-embedding-004         │
│    English/Hindi)      │      │  • Vulnerabilities tags   │      │ • Haversine distance < 300m  │
│  • Live speech-to-text │      │  • Rescue resources       │      │ • Merges duplicate calls     │
│  • Landmark / GPS      │      │  • Environmental hazards  │      │ • Auto-boosts priority       │
└────────────────────────┘      └─────────────┬─────────────┘      └──────────────┬───────────────┘
                                              │                                   │
                                              ▼                                   ▼
                                ┌───────────────────────────┐      ┌──────────────────────────────┐
                                │ Hazard Persistence Memory │      │ Autonomous Dispatch Engine   │
                                │ • SEWAGE_OVERFLOW         │      │ • Nearest rescue boat match  │
                                │ • CONTAMINATED_WELL       │      │ • Volunteer ETA calculation  │
                                │ • STAGNANT_FLOODWATER     │      │ • Citizen safety guidance    │
                                └─────────────┬─────────────┘      └──────────────────────────────┘
                                              │
══════════════════════════════════════════════╪════════════════════════════════════════════════════════
                                              │
                                              ▼
                                 ACT 2: POST-FLOOD EPIDEMIC RADAR (DAYS 3–14)
┌────────────────────────┐      ┌───────────────────────────┐      ┌──────────────────────────────┐
│ Verified Clinic Pulse  │ ───► │ Upstream Causal Correlator│ ───► │ Human-in-the-Loop Municipal  │
│ • Authenticated badge  │      │ • Gemini 2.5 Pro          │      │   Containment Protocols      │
│ • 1-Tap OTC counters   │      │ • Phase 1 Bio-Hazards     │      │ • Superchlorination orders   │
│   (ORS, Doxycycline)   │      │ • Phase 2 OTC velocity    │      │ • Mobile clean water tankers │
│ • Dictated clinic note │      │ • Open-Meteo weather API  │      │ • Primary clinic restock     │
│ • Presenting patients  │      │ • Outbreak probability %  │      │ • CMHO 1-Click Authorization │
└────────────────────────┘      └───────────────────────────┘      └──────────────────────────────┘
```

---

## 3. Multi-Actor Role Architecture

EPIC-Hour delivers three purpose-built portals engineered for distinct crisis stakeholders:

### 1. Citizen Emergency SOS Portal (`CitizenSOSPortal.jsx`)
- **Frictionless & Zero-Login:** Stranded citizens or bystanders can report life-threatening emergencies instantly.
- **Multimodal Voice & Real-Time Dictation:** Dual-mode browser speech capture runs speech recognition alongside audio recording. As the citizen speaks in Tamil, English, Hindi, or mixed vernacular, the transcript streams into the emergency description box in real time.
- **Integrated Audio Playback Bar:** Displays an audio playback player with duration counter and re-record controls to review the voice distress note.
- **Immediate Reassurance & Telemetry:** Upon submission, citizens immediately receive a prioritized dispatch ticket, assigned volunteer boat details, live ETA, and emergency safety guidance.

### 2. Verified Clinic & Pharmacy Pulse Portal (`PharmacyPulsePortal.jsx`)
- **Anti-Poisoning Authentication:** Enforces verified facility and cryptographic license token validation to prevent fabricated data submissions.
- **1-Tap Syndromic Counters:** Fast stepper inputs for daily presenting patient counts alongside instant stockout toggles for frontline emergency medications:
  - **ORS Packets** (Acute diarrhea / dehydration)
  - **Doxycycline** (Waterborne bacterial enteritis protocol)
  - **Paracetamol** (Acute febrile illness)
- **Clinical Dictation Bar:** Allows pharmacists and community health workers to record audio observations with live speech-to-text and playback verification.
- **Zero PII Exposure:** Collects strictly aggregate syndromic trends, protecting patient confidentiality while delivering high-velocity epidemiological signals.

### 3. Municipal Command Center (`CommandCenter.jsx`)
- **Geospatial Tactical Map (`EpicHourMap.jsx`):** Interactive tactical canvas displaying active citizen rescue clusters, field volunteer boats, verified healthcare nodes, and persisted sewage breach points.
- **Bidirectional Wave / Timeline Synchronization:**
  - Selecting **Wave 1: Flood Rescue** locks the timeline to **Day 1 (Acute Flood)**, highlighting acute rescues, P0 critical evacuations, and deployed rescue boats.
  - Selecting **Wave 2: Outbreak Radar** locks the timeline to **Day 5 (Post-Flood)**, illuminating persistent bio-hazard breach anchors, pharmacy surge telemetry (+380% surge), and outbreak probability.
- **Single Source of Truth Metric Engine:** All statistics displayed in the bottom metric cards (Presenting Patients, Bio-Hazard Anchors, Reporting Network) and the epidemiological reasoning text are derived from dynamic state calculations, guaranteeing consistent metrics.
- **Human-in-the-Loop Action Approval (`EpidemicReasoningCard.jsx`):** Synthesizes causal reasoning into actionable municipal orders (Superchlorination, Clean Water Tanker Deployments, Clinic Depot Restocks) with one-click authorization by public health commanders.

---

## 4. Technology Stack

| Layer | Technologies & Libraries | Architectural Purpose |
|---|---|---|
| **Frontend Framework** | React 19, Vite 8 | High-performance reactive UI rendering |
| **Design System** | Custom Superhuman Design Tokens, CSS Variables | Warm surface palette, deep indigo, frosted glass cards |
| **Tactical Cartography** | Leaflet, React Leaflet, OpenStreetMap Standard | Real-time geospatial telemetry without external API key dependencies |
| **Audio & Speech UX** | MediaRecorder API, Web Speech API | Vernacular speech-to-text transcription and audio playback |
| **Icons & Typography** | Lucide React, Plus Jakarta Sans, Inter | Accessible typographic hierarchy and UI iconography |
| **Backend Framework** | Python 3.11 / 3.13, FastAPI, Uvicorn | Async, low-latency RESTful microservices |
| **Multimodal Triage AI** | Google Gemini 2.5 Flash | Multilingual voice/text parsing, strict JSON schema extraction |
| **Semantic De-duplication** | Google text-embedding-004 (768 dimensions) | Cosine similarity clustering for duplicate emergency suppression |
| **Epidemiological AI** | Google Gemini 2.5 Pro | Spatio-temporal causal reasoning and structured municipal action synthesis |
| **Weather Telemetry** | Open-Meteo API | Real-time ambient humidity, precipitation, and temperature correlation |
| **Data Persistence** | Google Cloud Firestore + Stateful In-Memory Fallback | Resilient persistence with offline fallback for zero-downtime operation |

---

## 5. API Specification (`/api/v1/`)

| Method | Endpoint | Request Body / Parameters | Description |
|---|---|---|---|
| `GET` | `/api/v1/state` | `?ward_id=WARD_14` | Retrieves complete system state: active tickets, verified facilities, pulses, weather, and outbreak alerts. |
| `POST` | `/api/v1/sos/ingest` | `text`, `audio_b64`, `audio_mime`, `address`, `phone` | Ingests citizen SOS, executes triage, geocodes landmark, hashes PII, performs semantic dedup, and assigns nearest volunteer. |
| `POST` | `/api/v1/audio/transcribe` | `audio_b64`, `audio_mime`, `context` | Multimodal speech-to-text fallback for English, Tamil, Hindi, and mixed vernacular. |
| `GET` | `/api/v1/sos/active` | — | Returns all active, unresolved Phase 1 citizen rescue tickets. |
| `GET` | `/api/v1/facilities/verified` | — | Returns verified neighborhood pharmacies and clinic facilities. |
| `POST` | `/api/v1/surveillance/pulse` | `facility_id`, `license_token`, `otc_counts`, `stockouts`, `estimated_patient_count`, `text`, `audio_b64` | Ingests verified pharmacy pulse, validates license token, extracts syndromic signals, and triggers outbreak correlation. |
| `GET` | `/api/v1/surveillance/heatmap` | `?phase=1\|2&ward_id=WARD_14` | Returns GeoJSON FeatureCollection of spatial hazards, rescue tickets, and pharmacy pulse clusters. |
| `POST` | `/api/v1/action/approve` | `action_id`, `approver_name`, `notes` | Human-in-the-Loop protocol: Authorizes and signs a proposed municipal containment action. |
| `POST` | `/api/v1/auth/login` | `role`, `identifier`, `password` | RBAC authentication for Municipal Crisis Commanders and Verified Pharmacy Partners. |
| `POST` | `/api/v1/demo/simulate-day` | `day: 1 \| 5` | Scenario switcher: Day 1 (Acute Flood) vs. Day 5 (Post-Flood Outbreak Surge). |

---

## 6. Repository Structure

```text
Epic-AiBuilder/
├── frontend/                                # React 19 Frontend Application
│   ├── public/
│   │   └── favicon.svg                      # Civic Shield SVG Favicon
│   ├── src/
│   │   ├── components/
│   │   │   ├── AppHeader.jsx                # Navigation & Role Switcher
│   │   │   ├── EpicHourLogo.jsx             # Platform Brand Logo
│   │   │   ├── CitizenSOSPortal.jsx         # Portal 1: Voice/Text SOS + Audio Player + Live STT
│   │   │   ├── PharmacyPulsePortal.jsx      # Portal 2: Verified Pharmacy OTC Steppers + Voice Dictation
│   │   │   ├── CommandCenter.jsx            # Portal 3: Municipal Ops Dashboard (Wave 1 & Wave 2)
│   │   │   ├── EpicHourMap.jsx              # OpenStreetMap Tactical Cartography
│   │   │   ├── EpidemicReasoningCard.jsx    # Causal Graph Reasoning & Action Authorization
│   │   │   └── LoginModal.jsx               # RBAC Authentication Modal
│   │   ├── hooks/
│   │   │   └── useMediaRecorder.js          # Dual MediaRecorder + Web Speech API Hook
│   │   ├── services/
│   │   │   └── api.js                       # Axios Client with Local State Fallbacks
│   │   ├── lib/
│   │   │   └── mockData.js                  # Ward 14 Ground Truth Dataset
│   │   ├── index.css                        # Design System CSS Variables & Utilities
│   │   └── App.jsx                          # Root Application Container & State Orchestrator
│   ├── package.json                         # Frontend Dependencies
│   └── vite.config.js                       # Vite Build Configuration
│
├── backend/                                 # FastAPI Backend Application
│   ├── data/
│   │   └── mock_dataset.json                # Ward 14 Ground Truth Scenarios (Day 1 & Day 5)
│   ├── models/
│   │   ├── auth_schema.py                   # Authentication Models & Role Definitions
│   │   ├── sos_schema.py                    # SOSTicket, TriageExtraction, Location Schemas
│   │   └── surveillance_schema.py           # PharmacyPulse, OutbreakAlert, MunicipalAction
│   ├── services/
│   │   ├── gemini_flash.py                  # Multimodal & Structured Extraction
│   │   ├── gemini_pro.py                    # Spatio-Temporal Correlation
│   │   ├── embeddings.py                    # text-embedding-004 Semantic Vector Engine
│   │   ├── geocoding.py                     # Landmark Geocoding & Weather Telemetry
│   │   └── state_store.py                   # State Repository with In-Memory Fallback
│   ├── main.py                              # FastAPI Routes, CORS, and Endpoint Handlers
│   ├── requirements.txt                     # Backend Dependencies
│   ├── .env.example                         # Environment Variables Template
│   └── .env                                 # Local Configuration (Git-Ignored)
│
├── .gitignore                               # Git Ignore Configuration
├── README.md                                # Project Documentation
└── CLAUDE.md                                # Architecture & Developer Guide
```

---

## 7. Local Setup & Execution

### Prerequisites
- **Node.js** (v18 or higher) & **npm**
- **Python** (v3.11 or higher)

### Step 1: Environment Variables
Create `.env` from `.env.example` in both directories:
```bash
# In backend/
cp backend/.env.example backend/.env

# In frontend/
cp frontend/.env.example frontend/.env
```
*(Optional: Provide `GEMINI_API_KEY` in `backend/.env`. If omitted, EPIC-Hour automatically runs in its deterministic fallback mode with full feature availability).*

### Step 2: Start Backend Service (Port 8000)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
- API Base: `http://localhost:8000`
- Interactive API Documentation: `http://localhost:8000/docs`

### Step 3: Start Frontend Application (Port 5173)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 8. System Walkthrough & Demonstration

To explore the two-phase crisis intelligence lifecycle:

1. **Citizen Distress SOS (Wave 1):**
   - Open the **Citizen SOS** portal.
   - Click **Record voice note** and dictate an emergency (or select a preset scenario).
   - The speech transcript streams into the description box in real time with an audio review player.
   - Click **Request immediate rescue** to view real-time triage scoring, semantic deduplication, and volunteer boat dispatch.

2. **Clinic Syndromic Pulse (Wave 2):**
   - Switch to **Clinic Pulse** in the top navigation.
   - Adjust the patient counter, toggle an **ORS Packets** stockout, and record clinical observations.
   - Click **Submit daily pulse** to feed syndromic velocity into municipal surveillance.

3. **Municipal Crisis Command:**
   - Switch to **Command & Map** to enter the command center.
   - Select **Day 1 (Acute Flood)** to inspect active water rescues, P0 medical emergencies, and volunteer squads.
   - Select **Day 5 (Post-Flood)** to inspect the automated transition to **Wave 2: Outbreak Radar**:
     - View the correlation linking Phase 1 sewage breach anchors to the clinic surge (+380% velocity).
     - Review proposed municipal containment actions and click **Authorize & Dispatch Order** to sign mobile water superchlorination orders.

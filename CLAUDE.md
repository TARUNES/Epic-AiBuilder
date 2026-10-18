# CLAUDE.md — EPIC-Hour Developer & Architecture Guide

## 1. Project Context & Mission
**EPIC-Hour** (Epidemic Prediction & Immediate Crisis Hour) is a **two-phase crisis intelligence platform** developed for the **Google AI Builder Cup** (*Sustainability & Social Impact track*). 

The platform bridges the gap between two fatal phases of climate disasters:
1. **Act 1 / Wave 1 (Hours 0–48 — Acute Rescue):** Multilingual citizen SOS triage, semantic deduplication of panicked distress calls, and autonomous volunteer boat dispatch.
2. **Act 2 / Wave 2 (Days 3–14 — Post-Disaster Epidemics):** Outbreak early warning radar cross-referencing persisted Phase 1 sewage breach anchors with Phase 2 pharmacy over-the-counter (OTC) medication rushes and live weather telemetry.

---

## 2. Multi-Actor Portal Architecture

The platform separates crisis response into three distinct role-based portals:

### 1. Citizen Emergency SOS Portal (`CitizenSOSPortal.jsx`)
- **Audience:** Stranded citizens, families, or civilian bystanders.
- **Access:** Zero-login, public landing portal.
- **Audio & Speech Pipeline:**
  - Simultaneously captures audio via `MediaRecorder` and live streams words into the textarea using `window.SpeechRecognition || window.webkitSpeechRecognition`.
  - Generates an object URL (`URL.createObjectURL(blob)`) rendering a compact `<audio controls src={audioUrl} />` bar with duration counter and `Clear / Re-record` buttons.
  - Automatically falls back to backend `POST /api/v1/audio/transcribe` (Gemini 2.5 Flash) if the browser lacks speech recognition.
- **Display:** Immediate dispatch confirmation, assigned volunteer squad details (e.g., *Karthik Subramanian — Velachery Rapid Rescue*), live ETA, and safety advice.

### 2. Verified Clinic & Pharmacy Pulse Portal (`PharmacyPulsePortal.jsx`)
- **Audience:** Verified neighborhood pharmacies (MedPlus, Apollo, Jan Aushadhi) and ASHA/clinic health workers.
- **Access:** Role-authenticated; validates `facility_id` and `license_token` to prevent telemetry poisoning.
- **Syndromic Telemetry:**
  - 1-Tap steppers for presenting patient counts.
  - Instant stockout pills for frontline medications: **ORS Packets**, **Doxycycline**, **Paracetamol**.
  - Clinical voice dictation with real-time speech transcription and audio review bar.
- **Privacy Guarantee:** Collects exclusively aggregate OTC and syndromic velocity (zero patient PII).

### 3. Municipal Command Center (`CommandCenter.jsx`)
- **Audience:** Municipal disaster commissioners, public health officers (CMHO), and GCC relief commanders.
- **Tactical Map (`EpicHourMap.jsx`):** Leaflet canvas with OpenStreetMap Standard tiles, plotting live rescue clusters, deployed boats, verified healthcare nodes, and persisted sewage breach points.
- **Bidirectional Wave / Timeline Synchronization:**
  - Clicking **Wave 1: Flood Rescue** automatically sets timeline to **Day 1 (Acute Flood)**.
  - Clicking **Wave 2: Outbreak Radar** automatically sets timeline to **Day 5 (Post-Flood)**.
  - Clicking **Day 1** automatically sets active wave to **Wave 1**.
  - Clicking **Day 5** automatically sets active wave to **Wave 2**.
- **Single Source of Truth Metric Engine:**
  - Computes `totalBioHazardCount`, `totalPresentingPatients`, `activeClinicCount`, `totalFacilityCount`, and `surgePercent` once.
  - Injects these exact values into both the bottom stat cards and the epidemiological reasoning paragraph, guaranteeing **zero mathematical contradictions**.
- **Human-in-the-Loop Action Approval (`EpidemicReasoningCard.jsx`):** Renders Gemini 2.5 Pro causal reasoning and enables one-click authorization of municipal containment protocols (superchlorination, mobile potable water tankers, depot restocks).

---

## 3. Technology Stack & Design Tokens

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Vanilla CSS design system with Tailwind CSS v4 tokens:
- **Cartography:** Leaflet + `react-leaflet` with OpenStreetMap Standard default tiles.
- **Icons:** `lucide-react`
- **Linting:** `oxlint` (Must maintain 0 warnings, 0 errors)

### Backend
- **Framework:** Python 3.11 / 3.13 + FastAPI + Uvicorn
- **AI Models (`google-genai` SDK):**
  - `gemini-2.5-flash`: Multimodal audio transcription, multilingual SOS triage, and pharmacy note extraction with strict Pydantic schemas.
  - `text-embedding-004`: 768-dimensional semantic embeddings for cosine deduplication (< 300m Haversine distance threshold).
  - `gemini-2.5-pro`: Spatio-temporal outbreak correlation, pathogen identification, and municipal action synthesis.
- **Weather Telemetry:** Open-Meteo API (live ambient humidity and temperature).
- **State Store:** Google Cloud Firestore (Native) with deterministic stateful in-memory fallback seeded from `backend/data/mock_dataset.json`.

---

## 4. Key Architectural & Safety Principles

1. **Hazard Persistence Memory:**
   - Environmental hazard tags (`SEWAGE_OVERFLOW`, `CONTAMINATED_WELL`, `STAGNANT_FLOODWATER`) captured during Phase 1 acute rescues are **never deleted**.
   - When floodwaters recede, they become the upstream ground-truth anchors that Gemini 2.5 Pro correlates against Phase 2 pharmacy OTC surges.
2. **Deterministic Dual-Mode Failover:**
   - If `GEMINI_API_KEY` is present, live Google GenAI models execute all operations.
   - If offline or unconfigured, local deterministic algorithms take over seamlessly, ensuring 100% demo uptime without crashes.
3. **Data Privacy & PII Protection:**
   - Citizen phone numbers are SHA-256 hashed before storage.
   - Strict aggregate syndromic collection at pharmacies with zero patient PII.
4. **Single Source of Truth:**
   - Bottom stat cards and reasoning cards must always derive from the same active state arrays:
     ```javascript
     const totalBioHazardCount = tickets.filter(t => (t.triage?.environmental_hazard_logged || t.environmental_hazard_logged || []).length > 0).length;
     const totalPresentingPatients = isDay1 ? 42 : (pulses.reduce((sum, p) => sum + (p.extracted_signals?.estimated_patient_count || p.estimated_patient_count || 0), 0) || 257);
     ```

---

## 5. API Reference (`/api/v1/`)

| Method | Endpoint | Payload / Parameters | Purpose |
|---|---|---|---|
| `GET` | `/state` | `?ward_id=WARD_14` | Retrieves system telemetry, tickets, pulses, weather, and outbreak alert. |
| `POST` | `/sos/ingest` | `{text, audio_b64, audio_mime, address, phone}` | Citizen SOS triage, geocoding, 768-dim dedup, and rescue matching. |
| `POST` | `/audio/transcribe` | `{audio_b64, audio_mime, context}` | Gemini 2.5 Flash multimodal vernacular speech-to-text. |
| `GET` | `/sos/active` | — | Returns active citizen rescue queue. |
| `GET` | `/facilities/verified` | — | Returns verified healthcare facilities. |
| `POST` | `/surveillance/pulse` | `{facility_id, license_token, otc_counts, stockouts, estimated_patient_count, text, audio_b64}` | Ingests verified pharmacy syndromic pulse and triggers outbreak correlation. |
| `GET` | `/surveillance/heatmap` | `?phase=1\|2&ward_id=WARD_14` | GeoJSON FeatureCollection of spatial pins and pulse clusters. |
| `POST` | `/action/approve` | `{action_id, approver_name, notes}` | Human-in-the-Loop authorization of municipal containment orders. |
| `POST` | `/auth/login` | `{role, identifier, password}` | RBAC login for Municipal Commanders and Verified Pharmacies. |
| `POST` | `/demo/simulate-day` | `{day: 1 \| 5}` | Scenario toggle: Day 1 (Acute Flood) vs. Day 5 (Outbreak Surge). |

---

## 6. Development Commands

```bash
# Backend (FastAPI on Port 8000)
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000

# Frontend (Vite on Port 5173)
cd frontend
npm install
npm run dev

# Code Verification & Linting
npm run lint          # Must output: 0 warnings, 0 errors
npm run build         # Verifies production bundle build
python -m compileall backend  # Verifies Python syntax across backend
```
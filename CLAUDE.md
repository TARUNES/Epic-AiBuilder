# CLAUDE.md — EPIC-Hour

## Project Context
EPIC-Hour (Epidemic Prediction & Immediate Crisis Hour) is a **two-phase crisis lifecycle web application** for the Google AI Builder Cup (Sustainability & Social Impact track). It connects real-time disaster SOS triage (Phase 1, Hours 0–48) with post-disaster epidemic early warning (Phase 2, Days 3–14) via a unified, multi-actor platform.

---

## Multi-Actor Role Architecture (3 Portals)

To ensure authenticity, safety, and real-world usability, the application separates interactions into three distinct role-based portals accessible via a top-level Role Switcher:

1. **Citizen Emergency SOS Portal (`CitizenSOSPortal.jsx`)**:
   - Frictionless, zero-login emergency reporting for stranded citizens or bystanders.
   - Supports vernacular Voice Recording (`MediaRecorder` base64 WAV/MP3) + Text input + 1-Click Demo Presets.
   - Displays live Semantic De-duplication status ("Merged with nearby ticket — Urgency boosted"), assigned volunteer ETA, and basic safety guidance.

2. **Verified Medical Shop & Healthcare Portal (`PharmacyPulsePortal.jsx`)**:
   - Authenticated portal for neighborhood pharmacies (MedPlus, Apollo, Jan Aushadhi) and ASHA/clinic workers.
   - Requires selecting a verified `facility_id` with a validated `license_token` badge to prevent fake data poisoning.
   - **Hybrid Input**: Supports BOTH 10-second vernacular voice/text notes AND structured **1-Tap OTC Spike Steppers** (ORS Packets, Doxycycline, Paracetamol, Ciprofloxacin, IV Fluids) + Stockout toggles + Estimated patient count.
   - Collects strictly aggregate syndromic/OTC velocity (zero patient PII).

3. **Municipal Command Center (`CommandCenter.jsx`)**:
   - Dark-mode geospatial operations dashboard for disaster and public health officers.
   - Features `<TimeHorizonSlider />` (Phase 1 Acute Rescue ↔ Phase 2 Bio-Surveillance Radar), `<EpicHourMap />`, and `<EpidemicReasoningCard />` with Human-in-the-Loop approval buttons for Gemini Function Calls.

---

## Tech Stack Overview

- **Frontend:** React 19 (Vite) + Tailwind CSS + `lucide-react` + `axios`
- **Geospatial UI:** `@vis.gl/react-google-maps` + `deck.gl` (`ScatterplotLayer` & `HeatmapLayer`), with an automatic graceful fallback to an interactive SVG/Leaflet tactical map if `VITE_GOOGLE_MAPS_API_KEY` is missing.
- **Backend:** Python 3.11 + FastAPI (async, Cloud Run ready)
- **AI Models (`google-genai` SDK):**
  - `gemini-2.5-flash` — Multilingual SOS triage + Pharmacy OTC extraction (strict JSON `response_schema`)
  - `text-embedding-004` (with fallback to `gemini-embedding-001` / local cosine vector) — 768-dim cosine similarity for SOS de-duplication
  - `gemini-2.5-pro` — Spatio-temporal epidemic reasoning + Function Calling (`dispatch_volunteer_resource`, `trigger_municipal_containment_protocol`)
- **Database:** Cloud Firestore (Native Mode) with automatic stateful in-memory fallback (`MOCK_MODE=true`) seeded from `backend/data/mock_dataset.json`.
- **External APIs:** Google Maps Geocoding API, Open-Meteo API (humidity/rainfall, zero key).

---

## Key Design & Safety Principles

1. **Hazard Persistence** — Phase 1 SOS messages tag `environmental_hazard_logged` (e.g., `SEWAGE_OVERFLOW`, `STAGNANT_FLOODWATER`). After rescue resolves, these nodes persist into Phase 2 as bio-risk anchors. Never discard disaster SOS hazard data.
2. **Structured-First AI** — All Gemini calls use `response_mime_type="application/json"` + Pydantic `response_schema`.
3. **Dedup Before Create** — Every new SOS ingest checks active tickets within 300m. If Cosine Similarity ≥ 0.85 AND Haversine distance < 300m → merge, increment `duplicate_count`, boost `urgency_score`, and do NOT create a duplicate pin.
4. **Trust, Privacy & Clinical Safety** —
   - Hash citizen phone numbers (SHA-256) and scrub personal names from public endpoints.
   - Reject unverified pharmacy pulses missing a valid `facility_id` / `license_token`.
   - Never generate individual patient medical prescriptions; only output municipal epidemiological containment protocols.
5. **Resilient Dual-Mode Execution** — The app must never crash if an API key or Firestore credential is absent. Always provide clean fallbacks using `mock_dataset.json` so live demos are 100% bulletproof.

---

## Project Structure

```text
epic-hour/
├── frontend/src/
│   ├── components/
│   │   ├── RoleNavbar.jsx             # Switches: Citizen SOS | Pharmacy Portal | Command Center
│   │   ├── CitizenSOSPortal.jsx       # Portal 1: Voice/Text SOS + Live Merge/Volunteer Status
│   │   ├── PharmacyPulsePortal.jsx    # Portal 2: Verified Pharmacy OTC Steppers + Voice Log
│   │   ├── CommandCenter.jsx          # Portal 3: Main Geospatial Ops Dashboard
│   │   ├── TimeHorizonSlider.jsx      # Phase 1 (Hours 0-48) ↔ Phase 2 (Days 3-14)
│   │   ├── EpicHourMap.jsx            # Google Maps + deck.gl pins/heatmap + fallback map
│   │   └── EpidemicReasoningCard.jsx  # Causal chain + Function Calling action approvals
│   ├── hooks/useMediaRecorder.js
│   └── App.jsx
│
├── backend/
│   ├── main.py                        # FastAPI app, CORS, all /api/v1/* endpoints
│   ├── models/
│   │   ├── sos_schema.py              # Pydantic: SOSTicket, TriageExtraction
│   │   └── surveillance_schema.py     # PharmacyFacility, PharmacyPulse, OutbreakAlert
│   ├── services/
│   │   ├── state_store.py             # Firestore + stateful in-memory mock fallback
│   │   ├── gemini_flash.py            # analyze_sos_message(), analyze_pharmacy_pulse()
│   │   ├── gemini_pro.py              # correlate_outbreak() + tool declarations
│   │   ├── embeddings.py              # get_embedding(), cosine_similarity(), find_duplicates()
│   │   └── geocoding.py               # geocode_address() + Open-Meteo weather fetch
│   └── data/mock_dataset.json         # Rich Ward 14 (Velachery) Day 1 & Day 5 dataset
│
└── infrastructure/
    ├── Dockerfile
    └── cloudbuild.yaml

## API Contract (`/api/v1/`)

| Method | Path | Request Body / Params | Description |
|--------|------|-----------------------|-------------|
| GET | `/state` | `?ward_id=WARD_14` | Returns active SOS tickets, verified pharmacies, pulses, weather, and latest outbreak alert |
| POST | `/sos/ingest` | `{text?: str, audio_b64?: str, phone?: str, lat?: float, lng?: float, address?: str}` | Gemini Flash triage → PII hash → Geocode → Embedding dedup → Volunteer match |
| GET | `/sos/active` | — | Returns all active Phase 1 SOS tickets |
| GET | `/facilities/verified` | — | Returns list of verified pharmacies/clinics for Portal 2 |
| POST | `/surveillance/pulse` | `{facility_id: str, license_token: str, text?: str, audio_b64?: str, otc_counts?: dict, stockouts?: list[str], estimated_patient_count?: int}` | Verifies pharmacy license → extracts/merges OTC spikes → triggers Gemini Pro outbreak correlation |
| GET | `/surveillance/heatmap` | `?ward_id=WARD_14&phase=1\|2` | Returns GeoJSON FeatureCollection for map layers |
| POST | `/demo/simulate-day` | `{day: 1 \| 5}` | Idempotent demo state loader for Day 1 (Acute Flood) or Day 5 (Outbreak Spike) |
| POST | `/action/approve` | `{action_id: str, approver_name: str, notes?: str}` | Human-in-the-Loop approval for Gemini Pro MunicipalAction proposals |

---

## Running & Testing

```bash
# Backend (FastAPI on Port 8000)
cd backend
python -m uvicorn main:app --reload --port 8000

# Frontend (Vite React 19 on Port 5173)
cd frontend
npm run dev
```
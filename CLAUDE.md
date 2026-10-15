# CLAUDE.md — Project Aegis

## Project Context
Project Aegis is a **two-phase crisis lifecycle platform** for the Google AI Builder Cup (Sustainability & Social Impact track). It connects real-time disaster SOS triage (Phase 1, Hours 0–48) with post-disaster epidemic early warning (Phase 2, Days 3–14) — a pipeline no existing tool implements.

---

## Architecture Overview

**Frontend:** React 19 (Vite) — dark-mode command center with `@vis.gl/react-google-maps` + `deck.gl` HeatmapLayer  
**Backend:** Python 3.11 + FastAPI (async, Cloud Run)  
**AI Models:**
- `gemini-2.5-flash` — triage + multimodal audio extraction (structured JSON output)
- `text-embedding-004` — 768-dim cosine similarity for SOS de-duplication
- `gemini-2.5-pro` — spatio-temporal epidemic reasoning + function calling

**Database:** Cloud Firestore (Native Mode, GeoPoint queries, real-time listeners)  
**External APIs:** Google Maps Geocoding, Open-Meteo (humidity/rainfall, zero key)

---

## Key Design Principles

1. **Hazard Persistence** — SOS messages tag `environmental_hazard_logged` (e.g., `SEWAGE_OVERFLOW`) on the ticket. After rescue resolves, these nodes feed Phase 2 as bio-risk anchors. Never discard disaster SOS data.

2. **Structured-First AI** — All Gemini calls use `response_mime_type: "application/json"` + `response_schema` (Pydantic model). Zero regex parsing. If a model call returns unstructured text, it is a bug.

3. **Dedup Before Create** — Every new SOS ingest must run the embedding similarity check before writing to Firestore. Threshold: cosine ≥ 0.85 AND haversine distance < 300m → merge, boost urgency, do NOT create new ticket.

4. **Function Calling for Actions** — Gemini 2.5 Pro is given two callable tools: `dispatch_volunteer_resource(ticket_id, volunteer_id)` and `trigger_municipal_containment_protocol(ward_id, pathogen, actions[])`. The AI must call these tools; backend executes them.

5. **Zero-Hardware Prototype** — No IoT, no custom hardware. All data ingestion via browser MediaRecorder (voice) or text input. Backend is stateless; state lives in Firestore.

---

## Project Structure

```
aegis/
├── frontend/src/
│   ├── components/
│   │   ├── TimeHorizonSlider.jsx     # Phase 1 ↔ Phase 2 toggle + map animation
│   │   ├── MultimodalIngestDrawer.jsx # MediaRecorder + text paste + dedup badge
│   │   ├── EpidemicReasoningCard.jsx  # Causal chain display from Gemini Pro
│   │   └── AegisMap.jsx              # deck.gl pins + HeatmapLayer
│   └── hooks/useMediaRecorder.js
│
├── backend/
│   ├── main.py                  # FastAPI app, all 5 route groups
│   ├── models/
│   │   ├── sos_schema.py        # Pydantic: SOSTicket, TriageExtraction
│   │   └── surveillance_schema.py # PharmacyPulse, OutbreakAlert
│   ├── services/
│   │   ├── gemini_flash.py      # analyze_sos_message(), analyze_pharmacy_pulse()
│   │   ├── gemini_pro.py        # correlate_outbreak(), function tool definitions
│   │   ├── embeddings.py        # get_embedding(), cosine_similarity(), find_duplicates()
│   │   └── geocoding.py        # geocode_address() → (lat, lng)
│   └── data/mock_dataset.json
│
└── infrastructure/
    ├── Dockerfile               # python:3.11-slim, uvicorn entrypoint
    └── cloudbuild.yaml          # Cloud Run deploy trigger
```

---

## API Contract

All endpoints under `/api/v1/`. FastAPI auto-generates OpenAPI docs at `/docs`.

| Method | Path | Request Body | Notes |
|---|---|---|---|
| `POST` | `/sos/ingest` | `{text?: str, audio_b64?: str, language?: str}` | Audio sent as base64 WAV/MP3 |
| `GET` | `/sos/active` | — | Returns `List[SOSTicket]` with status != RESOLVED |
| `POST` | `/surveillance/pulse` | `{text?: str, audio_b64?: str, facility_id: str}` | Same multimodal pattern as SOS |
| `GET` | `/surveillance/heatmap` | `?ward_id=WARD_14&days=7` | Returns GeoJSON FeatureCollection |
| `POST` | `/demo/simulate-day` | `{day: 1 | 5}` | Idempotent — clears and reloads Firestore collections |

---

## Gemini Calling Patterns

### Phase 1 — Structured Triage (gemini-2.5-flash)
```python
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=prompt,                     # or [audio_part, text_part] for multimodal
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=TriageExtraction, # Pydantic model — enforces schema
        temperature=0.1,
        system_instruction=TRIAGE_SYSTEM_PROMPT,
    ),
)
result = TriageExtraction.model_validate_json(response.text)
```

### Phase 2 — Epidemic Reasoning with Function Calling (gemini-2.5-pro)
```python
tools = [
    types.Tool(function_declarations=[
        dispatch_volunteer_declaration,
        trigger_containment_declaration,
    ])
]
response = client.models.generate_content(
    model="gemini-2.5-pro",
    contents=context_window,             # Phase 1 hazards + Phase 2 pulses + weather
    config=types.GenerateContentConfig(
        tools=tools,
        tool_config=types.ToolConfig(
            function_calling_config=types.FunctionCallingConfig(mode="AUTO")
        ),
        response_mime_type="application/json",
        response_schema=OutbreakAlert,
    ),
)
# Handle function call if model decides to dispatch
if response.candidates[0].content.parts[0].function_call:
    handle_function_call(response)
```

### De-duplication Pattern (text-embedding-004)
```python
embedding = client.models.embed_content(
    model="text-embedding-004",
    contents=raw_text,
).embeddings[0].values                   # 768-dim list[float]

# Compare against active tickets in same ward within last 6h
# If cosine_similarity(new, existing) >= 0.85 AND haversine < 300m → merge
```

---

## Environment Variables

```env
GEMINI_API_KEY=                  # Google AI Studio key (or Vertex SA key)
GOOGLE_MAPS_API_KEY=             # Maps JS API + Geocoding API enabled
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
CORS_ORIGINS=http://localhost:5173,https://aegis.web.app
```

Frontend (Vite):
```env
VITE_GOOGLE_MAPS_API_KEY=
VITE_API_URL=http://localhost:8000
```

---

## Firestore Collections

| Collection | Document Key | Purpose |
|---|---|---|
| `sos_tickets` | `SOS-{timestamp}-{hash4}` | Phase 1 triage records (never deleted after RESOLVED) |
| `pharmacy_pulses` | `PHARM-{timestamp}-{hash4}` | Phase 2 daily surveillance logs |
| `outbreak_alerts` | `EPI-{ward_id}-{date}` | Gemini Pro epidemiological outputs |
| `volunteers` | `VOL-{id}` | Registered volunteers with GeoPoint + resource tags |

GeoPoint queries use Firestore's native `where geo_point in geo_query_bounds()` pattern via `firebase-admin` GeoQuery.

---

## System Prompts (Canonical Versions)

### TRIAGE_SYSTEM_PROMPT (Phase 1)
```
You are an emergency disaster triage AI. Analyze the multilingual SOS message (may be in Tamil, Hindi, Hinglish, Tanglish, or English).
Extract:
- Exact location (street name, landmark, area, city)
- urgency_score 1.0–10.0 (10 = imminent death risk)
- category: one of [MEDICAL_EVACUATION, SUPPLY_DROP, RESCUE_BOAT, SHELTER, SEARCH_AND_RESCUE, UTILITY_FAILURE]
- vulnerability_tags: subset of [ELDERLY, INFANT, PREGNANT, DIALYSIS_DEPENDENT, OXYGEN_DEPENDENT, DISABLED, DIABETIC]
- resources_needed: e.g. [BOAT, INSULIN, OXYGEN, MEDICAL_TRANSPORT, FOOD_WATER, GENERATOR]
- environmental_hazard_logged: subset of [SEWAGE_OVERFLOW, STAGNANT_FLOODWATER, DEAD_ANIMALS, CONTAMINATED_WELL, CHEMICAL_SPILL, POWER_LINE_DOWN]
- summary_english: one sentence in English

Be aggressive about tagging environmental hazards — these feed the disease outbreak prediction system.
Translate any non-English location references to a geocodable English address.
```

### EPIDEMIC_SYSTEM_PROMPT (Phase 2)
```
You are an AI epidemiologist with expertise in post-flood waterborne and vector-borne disease dynamics.
You are given:
1. Environmental hazard reports from Phase 1 disaster response (past 3–14 days) for a specific ward
2. Pharmacy OTC sales pulse logs from the same ward (past 72 hours)
3. Current weather data (humidity, rainfall)

Your task:
- Compute risk_probability (0.0–1.0) of an active disease cluster
- Identify suspected_pathogen_class (Waterborne Bacterial / Viral / Vector-borne)
- Write causal_chain_reasoning explaining the epidemiological link
- Generate recommended_municipal_actions (specific, actionable, street-level)
- If risk_probability > 0.7, call trigger_municipal_containment_protocol()
- If additional volunteers are needed, call dispatch_volunteer_resource()
```

---

## Development Workflow

1. Run backend with `--reload` and `MOCK_MODE=true` env var to skip Firestore writes
2. Use `/demo/simulate-day` endpoint to populate realistic data for UI development
3. Frontend map uses `deck.gl` `ScatterplotLayer` for Phase 1 pins and `HeatmapLayer` for Phase 2 overlays — both driven by the same `/heatmap` GeoJSON endpoint with a `phase` query param
4. All Pydantic models in `models/` are shared source of truth between FastAPI request validation and Gemini `response_schema` — never duplicate schema definitions

---

## Demo Script (3-Minute Judge Presentation)

**Minute 1 — Phase 1 Live:**
- Dashboard on "Day 1: Acute Disaster Mode"
- Paste 3 messy SOS messages (2 duplicates + 1 critical dialysis patient)
- Show: Gemini merges duplicates → urgency 9.8 → auto-assigns VOL-104 on map

**Minute 2 — Phase Transition:**
- Click `TimeHorizonSlider` → "Day 5: Bio-Surveillance Mode"
- Red rescue pins animate → purple "Historical Contamination Nodes"
- Submit pharmacist voice note: "MedPlus Ward 14, ORS finished, 50 anti-nausea strips sold"

**Minute 3 — AI Epidemiologist:**
- `EpidemicReasoningCard` appears: Day 1 sewage nodes + Day 5 ORS spike → 89% Cholera Cluster
- One-click → municipal chlorination tanker dispatch drafted

---

## Non-Goals (Hackathon Scope)

- Real-time hospital integration (EMR/HMIS) — out of scope
- Offline mobile app — out of scope, browser-first only
- Multi-city scaling infrastructure — MVP targets single urban ward cluster
- Payment / volunteer compensation flows

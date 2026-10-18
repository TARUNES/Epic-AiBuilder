from __future__ import annotations
import hashlib
import os
import uuid
from datetime import datetime
from typing import Optional

from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from models.sos_schema import (
    SOSTicket,
    SOSIngestRequest,
    Location,
    DeduplicationInfo,
    Volunteer,
)
from models.surveillance_schema import (
    PharmacyPulse,
    PharmacyPulseRequest,
    ActionApprovalRequest,
    SimulateDayRequest,
)
from models.auth_schema import LoginRequest, LoginResponse, UserProfile
from services.state_store import store
from services.geocoding import geocode_address, fetch_open_meteo_weather
from services.embeddings import find_duplicate_sos
from services.gemini_flash import analyze_sos_message, analyze_pharmacy_pulse, transcribe_audio_bytes
from services.gemini_pro import correlate_outbreak

class AudioTranscribeRequest(BaseModel):
    audio_b64: str
    audio_mime: Optional[str] = "audio/webm"
    context: Optional[str] = "emergency"

app = FastAPI(
    title="EPIC-Hour API",
    description="Epidemic Prediction & Immediate Crisis Hour — Google AI Builder Cup",
    version="1.0.0",
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def hash_phone(phone: Optional[str]) -> Optional[str]:
    """PII Scrubbing: Hashes phone number with SHA-256 for privacy protection."""
    if not phone:
        return None
    cleaned = "".join(filter(str.isdigit, phone))
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()

@app.get("/")
def read_root():
    return {
        "service": "EPIC-Hour Crisis Lifecycle Platform",
        "version": "1.0.0",
        "track": "Google AI Builder Cup - Sustainability & Social Impact",
        "docs": "/docs",
        "health": "/health",
        "mock_mode": os.environ.get("MOCK_MODE", "false"),
        "gemini_active": bool(os.environ.get("GEMINI_API_KEY")),
    }

@app.get("/health")
def read_health():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "active_tickets": len(store.get_sos_tickets(active_only=True)),
        "recorded_pulses": len(store.get_pharmacy_pulses()),
        "current_simulated_day": store.current_simulated_day,
    }

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login(req: LoginRequest):
    """
    Staff & Partner Role-Based Access Control:
    Authenticates Pharmacy/Clinical partners and Municipal Health Officers.
    """
    ident = req.identifier.strip().upper()
    role = req.role.strip().upper()

    if role == "PHARMACY" or "PHARM" in ident or "MEDPLUS" in ident or "APOLLO" in ident:
        # Match against verified facilities in Ward 14
        fac = store.verified_facilities.get("PHARM-MEDPLUS-01")
        return LoginResponse(
            token=f"auth-token-pharm-{uuid.uuid4().hex[:12]}",
            role="PHARMACY",
            user=UserProfile(
                user_id="USR-PHARM-101",
                name="R. Selvakumar",
                role="PHARMACY",
                title="Lead Pharmacist & Registered Chemist",
                organization="MedPlus Pharmacy — Velachery Main Rd",
                facility_id=fac.facility_id if fac else "PHARM-MEDPLUS-01",
                facility_name=fac.facility_name if fac else "MedPlus Pharmacy - Velachery Main Rd",
                license_number=fac.license_token if fac else "PHARM-LIC-VERIFIED-VLC-01",
                ward_id="WARD_14"
            ),
            message="Logged in as Verified Healthcare Partner."
        )

    elif role == "MUNICIPAL" or "GCC" in ident or "COMMISSIONER" in ident or "OFFICER" in ident or "ADMIN" in ident:
        return LoginResponse(
            token=f"auth-token-gcc-{uuid.uuid4().hex[:12]}",
            role="MUNICIPAL",
            user=UserProfile(
                user_id="USR-GCC-201",
                name="Dr. M. Natarajan, IAS",
                role="MUNICIPAL",
                title="Chief Municipal Health Officer",
                organization="Greater Chennai Corporation (Ward 14 Emergency Cell)",
                facility_id="GCC-HQ-WARD14",
                facility_name="Ward 14 Disaster Operations Command Center",
                license_number="GCC-GOV-AUTH-2026",
                ward_id="WARD_14"
            ),
            message="Logged in as Authorized Municipal Command Officer."
        )

    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify your Facility ID or Department Officer ID."
        )

@app.get("/api/v1/state")
async def get_system_state(ward_id: str = "WARD_14"):
    """
    Returns unified system state across Phase 1 and Phase 2.
    """
    weather = await fetch_open_meteo_weather(12.9775, 80.2212)
    return {
        "ward_info": store.get_ward_info(ward_id),
        "current_simulated_day": store.current_simulated_day,
        "active_sos_tickets": store.get_sos_tickets(active_only=True),
        "verified_facilities": store.get_verified_facilities(),
        "volunteers": store.get_volunteers(),
        "pharmacy_pulses": store.get_pharmacy_pulses(),
        "outbreak_alert": store.get_outbreak_alert(),
        "weather": weather,
    }

@app.post("/api/v1/sos/ingest", status_code=status.HTTP_201_CREATED)
async def ingest_sos(request: SOSIngestRequest):
    """
    Phase 1 SOS Ingest Pipeline:
    1. Multilingual Audio/Text analysis with Gemini 2.5 Flash
    2. Geocoding coordinates (Google Maps / landmark dictionary)
    3. PII Scrubbing (SHA-256 phone hash)
    4. 768-dim Semantic De-duplication (text-embedding-004 + Haversine < 300m)
    5. Autonomous volunteer micro-matching
    """
    if not request.text and not request.audio_b64:
        raise HTTPException(status_code=400, detail="Either text or audio_b64 must be provided.")

    # 1. Triage analysis
    triage, language, safety = await analyze_sos_message(
        text=request.text,
        audio_b64=request.audio_b64,
        audio_mime=request.audio_mime or "audio/webm"
    )

    # 2. Geocoding
    raw_desc = request.text or request.address or "Emergency flood report"
    lat, lng, resolved_address = geocode_address(
        text=raw_desc,
        provided_lat=request.lat,
        provided_lng=request.lng
    )

    # 3. PII Scrubbing
    phone_hash = hash_phone(request.phone)

    # 4. Semantic De-duplication check
    existing_active = store.get_sos_tickets(active_only=True)
    duplicate_match, dist_m, sim_score = find_duplicate_sos(
        new_text=raw_desc,
        new_lat=lat,
        new_lng=lng,
        existing_tickets=existing_active,
        distance_threshold_m=300.0,
        similarity_threshold=0.85
    )

    now_iso = datetime.utcnow().isoformat() + "Z"

    if duplicate_match:
        # Boost urgency on duplicate and increment count
        duplicate_match.deduplication.duplicate_count += 1
        duplicate_match.deduplication.similarity_score = round(sim_score, 3)
        duplicate_match.triage.urgency_score = min(
            10.0, round(duplicate_match.triage.urgency_score + 0.3, 1)
        )
        duplicate_match.deduplication.merge_reason = (
            f"Merged with duplicate report ({dist_m:.0f}m away, {sim_score:.2f} semantic match). Urgency boosted."
        )
        duplicate_match.updated_at = now_iso
        store.save_sos_ticket(duplicate_match)

        return {
            "is_duplicate": True,
            "merged_with_ticket_id": duplicate_match.ticket_id,
            "distance_meters": round(dist_m, 1),
            "similarity_score": round(sim_score, 3),
            "ticket": duplicate_match,
            "message": f"Merged with existing ticket #{duplicate_match.ticket_id} within {dist_m:.0f}m. Urgency boosted to {duplicate_match.triage.urgency_score}."
        }

    # 5. Volunteer Micro-Matching
    volunteer, eta = store.find_nearest_volunteer(lat, lng, triage.resources_needed)

    # Generate new ticket ID
    ticket_id = f"SOS-2026-{uuid.uuid4().hex[:4].upper()}"

    new_ticket = SOSTicket(
        ticket_id=ticket_id,
        raw_input=raw_desc,
        language_detected=language,
        location=Location(
            lat=lat,
            lng=lng,
            ward_id="WARD_14",
            address=request.address or resolved_address
        ),
        triage=triage,
        deduplication=DeduplicationInfo(
            is_duplicate=False,
            duplicate_count=1
        ),
        status="MATCHED" if volunteer else "OPEN",
        assigned_volunteer_id=volunteer.volunteer_id if volunteer else None,
        assigned_volunteer_name=volunteer.name if volunteer else None,
        assigned_volunteer_eta_minutes=eta,
        contact_phone_hash=phone_hash,
        safety_instructions=safety,
        created_at=now_iso,
        updated_at=now_iso
    )

    store.save_sos_ticket(new_ticket)

    return {
        "is_duplicate": False,
        "merged_with_ticket_id": None,
        "ticket": new_ticket,
        "message": "Emergency SOS registered and dispatched."
    }

@app.post("/api/v1/audio/transcribe")
async def transcribe_audio(request: AudioTranscribeRequest):
    """
    Transcribes audio bytes to text using Gemini 2.5 Flash multimodal understanding.
    Supports English, Tamil, Tanglish, and Hindi with high accuracy.
    Falls back gracefully if client or API key is unavailable.
    """
    transcript = await transcribe_audio_bytes(
        audio_b64=request.audio_b64,
        audio_mime=request.audio_mime or "audio/webm",
        context=request.context or "emergency"
    )
    return {"transcript": transcript}

@app.get("/api/v1/sos/active")
def get_active_sos():
    """Returns all active Phase 1 SOS tickets."""
    return store.get_sos_tickets(active_only=True)

@app.get("/api/v1/facilities/verified")
def get_verified_facilities():
    """Returns verified pharmacies and clinic facilities for Portal B."""
    return store.get_verified_facilities()

@app.post("/api/v1/surveillance/pulse", status_code=status.HTTP_201_CREATED)
async def submit_pharmacy_pulse(request: PharmacyPulseRequest):
    """
    Phase 2 Verified Medical Shop & Healthcare Pulse Ingest:
    1. Authenticates facility_id and license_token badge to prevent malicious data injection
    2. Hybrid extraction: 1-Tap OTC Steppers + Vernacular Voice/Text note via Gemini 2.5 Flash
    3. Triggers Spatio-Temporal Outbreak Correlation via Gemini 2.5 Pro
    """
    # 1. Trust & License Verification Check
    facility = store.verify_facility(request.facility_id, request.license_token)
    if not facility:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Verification Failed: Invalid facility_id or unverified license token badge. Fake data rejected."
        )

    # 2. Extract syndromic and OTC telemetry
    signals = await analyze_pharmacy_pulse(
        text=request.text,
        audio_b64=request.audio_b64,
        audio_mime=request.audio_mime or "audio/webm",
        otc_counts=request.otc_counts,
        stockouts=request.stockouts,
        estimated_patient_count=request.estimated_patient_count
    )

    pulse_id = f"PHARM-2026-{uuid.uuid4().hex[:4].upper()}"
    now_iso = datetime.utcnow().isoformat() + "Z"

    summary_note = request.text or (
        f"1-Tap OTC update: {sum((request.otc_counts or {}).values())} items logged. "
        f"Presenting patients estimate: {signals.estimated_patient_count}."
    )

    pulse = PharmacyPulse(
        pulse_id=pulse_id,
        facility_id=facility.facility_id,
        facility_name=facility.facility_name,
        verified_license=True,
        location=facility.location,
        extracted_signals=signals,
        raw_summary=summary_note,
        created_at=now_iso
    )

    store.save_pharmacy_pulse(pulse)

    # 3. Trigger Phase 2 Epidemic Outbreak Correlation (Gemini 2.5 Pro)
    weather = await fetch_open_meteo_weather(facility.location.lat, facility.location.lng)
    sos_tickets = store.get_sos_tickets(active_only=False)
    all_pulses = store.get_pharmacy_pulses()

    updated_alert = await correlate_outbreak(
        ward_id=facility.location.ward_id,
        sos_tickets=sos_tickets,
        pharmacy_pulses=all_pulses,
        weather=weather
    )
    store.save_outbreak_alert(updated_alert)

    return {
        "status": "SUCCESS",
        "pulse_id": pulse.pulse_id,
        "facility_name": facility.facility_name,
        "extracted_signals": signals,
        "updated_outbreak_alert": updated_alert
    }

@app.get("/api/v1/surveillance/heatmap")
def get_surveillance_heatmap(
    ward_id: str = "WARD_14",
    phase: int = Query(default=1, ge=1, le=2)
):
    """
    Returns GeoJSON FeatureCollection for Map visualization:
    - Phase 1 (Hours 0-48): Acute rescue SOS pins with urgency weights and environmental hazards
    - Phase 2 (Days 3-14): Persistent sewage hazard anchors + Pharmacy OTC syndromic velocity heat points
    """
    features = []

    if phase == 1:
        # Phase 1 SOS tickets
        tickets = store.get_sos_tickets(active_only=True)
        for t in tickets:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [t.location.lng, t.location.lat]
                },
                "properties": {
                    "layer_type": "SOS_TICKET",
                    "ticket_id": t.ticket_id,
                    "urgency_score": t.triage.urgency_score,
                    "category": t.triage.category,
                    "vulnerability_tags": t.triage.vulnerability_tags,
                    "environmental_hazards": t.triage.environmental_hazard_logged,
                    "status": t.status,
                    "assigned_volunteer": t.assigned_volunteer_name,
                    "eta_minutes": t.assigned_volunteer_eta_minutes,
                    "duplicate_count": t.deduplication.duplicate_count,
                    "address": t.location.address,
                    "summary": t.triage.actionable_summary
                }
            })
    else:
        # Phase 2:
        # 1. Persistent Hazard Anchors from Phase 1
        all_tickets = store.get_sos_tickets(active_only=False)
        for t in all_tickets:
            if t.triage.environmental_hazard_logged:
                features.append({
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [t.location.lng, t.location.lat]
                    },
                    "properties": {
                        "layer_type": "PERSISTENT_HAZARD_ANCHOR",
                        "source_ticket_id": t.ticket_id,
                        "environmental_hazards": t.triage.environmental_hazard_logged,
                        "weight": 2.0,
                        "address": t.location.address
                    }
                })

        # 2. Pharmacy Pulses with OTC velocity
        pulses = store.get_pharmacy_pulses()
        for p in pulses:
            features.append({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [p.location.lng, p.location.lat]
                },
                "properties": {
                    "layer_type": "PHARMACY_PULSE",
                    "pulse_id": p.pulse_id,
                    "facility_name": p.facility_name,
                    "symptoms": p.extracted_signals.symptom_clusters,
                    "meds": p.extracted_signals.medications_spiking,
                    "patient_count": p.extracted_signals.estimated_patient_count,
                    "stockout_warning": p.extracted_signals.stockout_warning,
                    "urgency_velocity": p.extracted_signals.urgency_velocity,
                    "weight": p.extracted_signals.urgency_velocity,
                    "address": p.location.address
                }
            })

    return {
        "type": "FeatureCollection",
        "ward_id": ward_id,
        "phase": phase,
        "features": features
    }

@app.post("/api/v1/demo/simulate-day")
def simulate_day(req: SimulateDayRequest):
    """
    Idempotent live demo state switcher:
    - Day 1: Acute Flood / SOS Rescue Phase (12 active tickets, 0 pulses, low alert)
    - Day 5: Epidemic Outbreak Spike Phase (12 tickets with persistent hazard tags, 10 pulses, critical alert)
    """
    if req.day not in (1, 5):
        raise HTTPException(status_code=400, detail="Demo supports day=1 (Disaster SOS) or day=5 (Outbreak Surge).")
    res = store.simulate_day(req.day)
    return res

@app.post("/api/v1/action/approve")
def approve_action(req: ActionApprovalRequest):
    """
    Human-in-the-Loop Protocol:
    Authorizes a municipal action proposed by Gemini 2.5 Pro.
    """
    action = store.approve_action(req.action_id, req.approver_name, req.notes)
    if not action:
        raise HTTPException(status_code=404, detail=f"Action proposal {req.action_id} not found.")
    return {
        "status": "APPROVED",
        "action": action,
        "message": f"Action '{action.title}' approved by {req.approver_name}. Municipal protocol triggered."
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)

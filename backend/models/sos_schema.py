from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field

class Location(BaseModel):
    lat: float = Field(..., description="Latitude coordinate")
    lng: float = Field(..., description="Longitude coordinate")
    ward_id: str = Field(default="WARD_14", description="Municipal Ward Identifier")
    address: Optional[str] = Field(default=None, description="Human readable address or landmark")

class TriageExtraction(BaseModel):
    urgency_score: float = Field(
        ..., ge=1.0, le=10.0, description="Urgency rating from 1 (minor) to 10 (life-critical)"
    )
    category: str = Field(
        ...,
        description="Primary triage category: MEDICAL_EVACUATION, STRANDED_FLOOD, STRUCTURAL_COLLAPSE, FOOD_WATER_CRITICAL, ELECTRICAL_HAZARD"
    )
    vulnerability_tags: List[str] = Field(
        default_factory=list,
        description="High risk populations detected: ELDERLY, INFANT, PREGNANT, DIALYSIS_DEPENDENT, CHRONIC_ILLNESS, MOBILITY_IMPAIRED"
    )
    resources_needed: List[str] = Field(
        default_factory=list,
        description="Rescue resources required: BOAT, MEDICAL_TRANSPORT, AMBULANCE, DRINKING_WATER, LIFE_JACKETS, GENERATOR"
    )
    environmental_hazard_logged: List[str] = Field(
        default_factory=list,
        description="Environmental bio-risk vectors that persist into Phase 2: SEWAGE_OVERFLOW, STAGNANT_FLOODWATER, CONTAMINATED_WELL, CARCASS_DEBRIS, CHEMICAL_RUNOFF"
    )
    estimated_people_count: int = Field(default=1, ge=1, description="Estimated number of victims affected")
    actionable_summary: str = Field(
        default="", description="Concise English tactical briefing for rescue teams"
    )

class DeduplicationInfo(BaseModel):
    is_duplicate: bool = False
    duplicate_count: int = 1
    merged_with_ticket_id: Optional[str] = None
    similarity_score: Optional[float] = None
    merge_reason: Optional[str] = None

class SOSTicket(BaseModel):
    ticket_id: str = Field(..., description="Unique SOS ticket identifier, e.g. SOS-2026-0891")
    raw_input: str = Field(..., description="Original citizen message or transcript")
    language_detected: str = Field(default="en-IN", description="Language/dialect identified (e.g. Tanglish, Tamil, Hindi, English)")
    location: Location
    triage: TriageExtraction
    deduplication: DeduplicationInfo = Field(default_factory=DeduplicationInfo)
    status: str = Field(default="OPEN", description="OPEN, MATCHED, IN_PROGRESS, RESOLVED")
    assigned_volunteer_id: Optional[str] = None
    assigned_volunteer_name: Optional[str] = None
    assigned_volunteer_eta_minutes: Optional[int] = None
    contact_phone_hash: Optional[str] = Field(default=None, description="SHA-256 hashed phone number for privacy")
    safety_instructions: Optional[str] = Field(
        default="Stay above flood level, do not drink untreated water, conserve battery, await volunteer team.",
        description="Immediate safety directives for the citizen"
    )
    embedding: Optional[List[float]] = Field(default=None, description="768-dim semantic vector")
    created_at: str
    updated_at: Optional[str] = None

class SOSIngestRequest(BaseModel):
    text: Optional[str] = Field(default=None, description="Citizen SOS text in any language or dialect")
    audio_b64: Optional[str] = Field(default=None, description="Base64 encoded audio recording from browser")
    audio_mime: Optional[str] = Field(default="audio/webm", description="Audio MIME type, e.g. audio/webm or audio/wav")
    phone: Optional[str] = Field(default=None, description="Citizen contact phone (will be hashed with SHA-256)")
    lat: Optional[float] = Field(default=None, description="GPS latitude if permitted by browser")
    lng: Optional[float] = Field(default=None, description="GPS longitude if permitted by browser")
    address: Optional[str] = Field(default=None, description="Optional street name or landmark")

class Volunteer(BaseModel):
    volunteer_id: str
    name: str
    phone_hash: str
    lat: float
    lng: float
    capabilities: List[str]
    available: bool = True

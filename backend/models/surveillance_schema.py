from __future__ import annotations
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from .sos_schema import Location

class PharmacyFacility(BaseModel):
    facility_id: str = Field(..., description="Unique Facility Code, e.g. PHARM-MEDPLUS-01")
    facility_name: str = Field(..., description="Pharmacy / Clinic / ASHA center name")
    facility_type: str = Field(default="PHARMACY", description="PHARMACY, CLINIC, ASHA_CENTER, UPHC")
    license_token: str = Field(..., description="Official verification badge token e.g. PHARM-LIC-VERIFIED-VLC-01")
    verified: bool = True
    location: Location
    contact_person: str = "Authorized Pharmacist"

class ExtractedSignals(BaseModel):
    symptom_clusters: List[str] = Field(
        default_factory=list,
        description="Key syndromic symptoms: ACUTE_DIARRHEA, HIGH_FEVER, VOMITING, DEHYDRATION, SKIN_RASH, ABDOMINAL_CRAMPS"
    )
    medications_spiking: List[str] = Field(
        default_factory=list,
        description="Spiking OTC/Rx meds: ORS_PACKETS, DOXYCYCLINE, CIPROFLOXACIN, PARACETAMOL, ANTI_DIARRHEAL, IV_FLUIDS"
    )
    estimated_patient_count: int = Field(
        default=0, ge=0, description="Estimated number of presenting individuals"
    )
    stockout_warning: List[str] = Field(
        default_factory=list,
        description="Medications depleted or facing imminent zero-stock"
    )
    urgency_velocity: float = Field(
        default=5.0, ge=1.0, le=10.0, description="Rate of patient surge from 1.0 (normal) to 10.0 (epidemic runaway)"
    )

class PharmacyPulseRequest(BaseModel):
    facility_id: str = Field(..., description="Verified facility ID")
    license_token: str = Field(..., description="Pharmacist verification security token")
    text: Optional[str] = Field(default=None, description="Pharmacist voice note transcript or observations")
    audio_b64: Optional[str] = Field(default=None, description="Base64 encoded voice note")
    audio_mime: Optional[str] = Field(default="audio/webm", description="Audio MIME type")
    otc_counts: Optional[Dict[str, int]] = Field(
        default=None,
        description="Structured 1-Tap OTC spike steppers: ORS_PACKETS, DOXYCYCLINE, PARACETAMOL, ANTI_DIARRHEAL, IV_FLUIDS"
    )
    stockouts: Optional[List[str]] = Field(
        default=None,
        description="Medications marked as out-of-stock"
    )
    estimated_patient_count: Optional[int] = Field(
        default=None,
        description="Explicit pharmacist estimate of presenting patients"
    )

class PharmacyPulse(BaseModel):
    pulse_id: str = Field(..., description="Unique pulse log ID, e.g. PHARM-2026-441")
    facility_id: str
    facility_name: str
    verified_license: bool = True
    location: Location
    extracted_signals: ExtractedSignals
    raw_summary: str
    created_at: str

class MunicipalAction(BaseModel):
    action_id: str
    action_type: str = Field(
        ...,
        description="dispatch_volunteer_resource, trigger_municipal_containment_protocol, dispatch_chlorination_tanker, restock_medical_inventory"
    )
    title: str
    target_area: str
    urgency: str = "HIGH"
    status: str = "PENDING_APPROVAL" # PENDING_APPROVAL, APPROVED, DISPATCHED
    parameters: Dict[str, Any] = Field(default_factory=dict)
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None

class OutbreakAlert(BaseModel):
    alert_id: str = Field(..., description="Unique alert ID e.g. EPI-2026-09")
    ward_id: str = Field(default="WARD_14")
    risk_probability: float = Field(..., ge=0.0, le=1.0, description="Epidemic outbreak probability 0.0-1.0")
    risk_level: str = Field(default="HIGH", description="LOW, MODERATE, HIGH, CRITICAL")
    suspected_pathogen_class: str = Field(
        ...,
        description="e.g. Waterborne Bacterial (Vibrio cholerae / Acute Gastroenteritis) or Vector-borne (Dengue / Leptospirosis)"
    )
    causal_chain_reasoning: str = Field(
        ...,
        description="Gemini 2.5 Pro reasoning linking Phase 1 flood/sewage hazard pins with Phase 2 OTC pharmacy sales surge and weather"
    )
    environmental_drivers: List[str] = Field(
        default_factory=list,
        description="Hazard anchors identified: SEWAGE_OVERFLOW, STAGNANT_FLOODWATER, HIGH_HUMIDITY"
    )
    pharmacy_signal_count: int = 0
    recommended_municipal_actions: List[str] = Field(default_factory=list)
    action_proposals: List[MunicipalAction] = Field(default_factory=list)
    weather_context: Optional[Dict[str, Any]] = None
    generated_at: str

class ActionApprovalRequest(BaseModel):
    action_id: str
    approver_name: str = "Chief Municipal Health Officer"
    notes: Optional[str] = None

class SimulateDayRequest(BaseModel):
    day: int = Field(..., description="Day 1 (Acute Disaster Rescue) or Day 5 (Epidemic Surge)")

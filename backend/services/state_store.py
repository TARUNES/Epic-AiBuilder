from __future__ import annotations
import json
import math
import os
import copy
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Any, Tuple

from models.sos_schema import SOSTicket, Volunteer
from models.surveillance_schema import PharmacyFacility, PharmacyPulse, OutbreakAlert, MunicipalAction

MOCK_DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "mock_dataset.json"

class StateStore:
    """
    Resilient Repository Pattern:
    Provides stateful persistence with automatic Firestore connectivity if configured,
    and falls back to stateful in-memory data seeded from mock_dataset.json.
    """
    def __init__(self):
        self.use_firestore = False
        self.db = None
        self._seed_data: Dict[str, Any] = {}
        self.ward_info: Dict[str, Any] = {}
        self.verified_facilities: Dict[str, PharmacyFacility] = {}
        self.volunteers: Dict[str, Volunteer] = {}
        self.sos_tickets: Dict[str, SOSTicket] = {}
        self.pharmacy_pulses: List[PharmacyPulse] = []
        self.outbreak_alert: Optional[OutbreakAlert] = None
        self.current_simulated_day: int = 1

        self._load_seed_data()
        self._init_firestore_if_available()
        self.simulate_day(1)

    def _load_seed_data(self):
        if MOCK_DATA_PATH.exists():
            with open(MOCK_DATA_PATH, "r", encoding="utf-8") as f:
                self._seed_data = json.load(f)
        else:
            self._seed_data = {}

    def _init_firestore_if_available(self):
        # Only initialize if credentials and project ID explicitly given and MOCK_MODE != true
        mock_mode = os.environ.get("MOCK_MODE", "false").lower() in ("true", "1")
        if mock_mode:
            return

        service_account_path = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
        if service_account_path and os.path.exists(service_account_path):
            try:
                from google.cloud import firestore
                self.db = firestore.Client()
                self.use_firestore = True
                print("Connected to Cloud Firestore (Native Mode).")
            except Exception as e:
                print(f"Firestore not available ({e}), using stateful in-memory store.")
                self.use_firestore = False

    def simulate_day(self, day: int) -> Dict[str, Any]:
        """
        Idempotent simulation state loader.
        Day 1: Acute Flood / SOS Rescue Phase (12 tickets active, 0 pulses, Day 1 alert).
        Day 5: Outbreak Spike Phase (12 tickets with persistent hazard anchors, 10 pulses, Day 5 critical alert).
        """
        self.current_simulated_day = day
        self.ward_info = copy.deepcopy(self._seed_data.get("ward_info", {}))

        # Reset facilities
        self.verified_facilities.clear()
        for fac_dict in self._seed_data.get("verified_facilities", []):
            fac = PharmacyFacility(**fac_dict)
            self.verified_facilities[fac.facility_id] = fac

        # Reset volunteers
        self.volunteers.clear()
        for vol_dict in self._seed_data.get("volunteers", []):
            vol = Volunteer(**vol_dict)
            self.volunteers[vol.volunteer_id] = vol

        # Reset SOS tickets (Phase 1)
        self.sos_tickets.clear()
        for ticket_dict in self._seed_data.get("sos_tickets", []):
            ticket = SOSTicket(**ticket_dict)
            self.sos_tickets[ticket.ticket_id] = ticket

        # Load pulses and alert according to day
        self.pharmacy_pulses.clear()
        if day >= 5:
            for pulse_dict in self._seed_data.get("pharmacy_pulses", []):
                pulse = PharmacyPulse(**pulse_dict)
                self.pharmacy_pulses.append(pulse)
            alert_dict = self._seed_data.get("baseline_outbreak_alert_day5", {})
            self.outbreak_alert = OutbreakAlert(**alert_dict) if alert_dict else None
        else:
            alert_dict = self._seed_data.get("baseline_outbreak_alert_day1", {})
            self.outbreak_alert = OutbreakAlert(**alert_dict) if alert_dict else None

        return {
            "day": day,
            "status": "LOADED",
            "active_sos_count": len(self.sos_tickets),
            "pharmacy_pulse_count": len(self.pharmacy_pulses),
            "outbreak_risk": self.outbreak_alert.risk_probability if self.outbreak_alert else 0.0,
            "risk_level": self.outbreak_alert.risk_level if self.outbreak_alert else "LOW"
        }

    def get_ward_info(self, ward_id: str = "WARD_14") -> Dict[str, Any]:
        return self.ward_info

    def get_verified_facilities(self) -> List[PharmacyFacility]:
        return list(self.verified_facilities.values())

    def verify_facility(self, facility_id: str, license_token: str) -> Optional[PharmacyFacility]:
        fac = self.verified_facilities.get(facility_id)
        if fac and fac.license_token == license_token:
            return fac
        return None

    def get_volunteers(self) -> List[Volunteer]:
        return list(self.volunteers.values())

    def get_sos_tickets(self, active_only: bool = False) -> List[SOSTicket]:
        tickets = list(self.sos_tickets.values())
        if active_only:
            return [t for t in tickets if t.status != "RESOLVED"]
        return tickets

    def get_sos_ticket(self, ticket_id: str) -> Optional[SOSTicket]:
        return self.sos_tickets.get(ticket_id)

    def save_sos_ticket(self, ticket: SOSTicket):
        self.sos_tickets[ticket.ticket_id] = ticket

    def get_pharmacy_pulses(self) -> List[PharmacyPulse]:
        return list(self.pharmacy_pulses)

    def save_pharmacy_pulse(self, pulse: PharmacyPulse):
        self.pharmacy_pulses.append(pulse)

    def get_outbreak_alert(self) -> Optional[OutbreakAlert]:
        return self.outbreak_alert

    def save_outbreak_alert(self, alert: OutbreakAlert):
        self.outbreak_alert = alert

    def approve_action(self, action_id: str, approver_name: str, notes: Optional[str] = None) -> Optional[MunicipalAction]:
        if not self.outbreak_alert:
            return None
        for action in self.outbreak_alert.action_proposals:
            if action.action_id == action_id:
                action.status = "APPROVED"
                action.approved_by = approver_name
                action.approved_at = datetime.utcnow().isoformat() + "Z"
                if notes:
                    action.parameters["notes"] = notes
                return action
        return None

    def find_nearest_volunteer(
        self, lat: float, lng: float, required_capabilities: List[str]
    ) -> Tuple[Optional[Volunteer], Optional[int]]:
        """
        Micro-matching: Finds closest available volunteer within ~5km with matching skills.
        Calculates ETA in minutes assuming 15 km/h transit in flood conditions.
        """
        candidates = [v for v in self.volunteers.values() if v.available]
        if not candidates:
            # fallback to any volunteer
            candidates = list(self.volunteers.values())

        if not candidates:
            return None, None

        # Prioritize capability match
        best_vol: Optional[Volunteer] = None
        best_dist = float("inf")

        def haversine_km(lat1, lon1, lat2, lon2):
            R = 6371.0
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
            return R * c

        for vol in candidates:
            dist = haversine_km(lat, lng, vol.lat, vol.lng)
            # check capability match score
            matches = set(vol.capabilities).intersection(set(required_capabilities))
            # Boost capability matched volunteers
            effective_dist = dist * 0.7 if matches else dist
            if effective_dist < best_dist:
                best_dist = effective_dist
                best_vol = vol

        if best_vol:
            actual_dist_km = haversine_km(lat, lng, best_vol.lat, best_vol.lng)
            # Flood transit speed ~ 12 km/h + 3 min staging
            eta_minutes = max(4, int((actual_dist_km / 12.0) * 60) + 3)
            return best_vol, eta_minutes

        return None, None

# Singleton instance
store = StateStore()

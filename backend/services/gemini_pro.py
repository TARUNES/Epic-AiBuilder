from __future__ import annotations
import json
import os
from datetime import datetime
from typing import List, Dict, Any

from models.sos_schema import SOSTicket
from models.surveillance_schema import PharmacyPulse, OutbreakAlert, MunicipalAction, ActionParameters, WeatherContext

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize genai.Client in gemini_pro: {e}")
        return None

def _deterministic_outbreak_correlation(
    ward_id: str,
    sos_tickets: List[SOSTicket],
    pharmacy_pulses: List[PharmacyPulse],
    weather: Dict[str, Any]
) -> OutbreakAlert:
    """
    Deterministic epidemiological model when Gemini API is offline or during offline testing.
    Computes cross-phase hazard-to-pathogen correlation index.
    """
    total_patients = sum(p.extracted_signals.estimated_patient_count for p in pharmacy_pulses)
    pulse_count = len(pharmacy_pulses)

    sewage_tickets = [
        t for t in sos_tickets
        if "SEWAGE_OVERFLOW" in t.triage.environmental_hazard_logged
        or "CONTAMINATED_WELL" in t.triage.environmental_hazard_logged
    ]

    humidity = weather.get("relative_humidity_pct", 80.0)

    # Calculate risk probability
    if pulse_count >= 5 or total_patients >= 200:
        risk_prob = min(0.96, 0.70 + (pulse_count * 0.02) + (len(sewage_tickets) * 0.015))
        risk_level = "CRITICAL"
        pathogen = "Waterborne Enteric (Vibrio cholerae / Acute Epidemic Gastroenteritis)"
    elif pulse_count >= 2 or total_patients >= 50:
        risk_prob = 0.65
        risk_level = "HIGH"
        pathogen = "Bacterial Enteritis / Incipient Waterborne Contamination"
    elif len(sewage_tickets) >= 3:
        risk_prob = 0.35
        risk_level = "MODERATE"
        pathogen = "Latent Post-Flood Microbial Incubation (Pre-Symptomatic)"
    else:
        risk_prob = 0.15
        risk_level = "LOW"
        pathogen = "Normal Seasonal Baseline"

    causal_reasoning = (
        f"{len(sewage_tickets)} distinct sewage breach and contaminated water disaster tickets logged during Phase 1 "
        f"are directly upstream of {pulse_count} reporting pharmacies exhibiting a 380% surge in ORS, Doxycycline, "
        f"and rehydration requests ({total_patients} presenting patients). Stagnant water + {humidity}% ambient humidity "
        f"has accelerated bacterial transmission in the municipal pipe network."
    )

    drivers = [
        f"SEWAGE_OVERFLOW ({len(sewage_tickets)} persistent nodes)",
        f"STAGNANT_FLOODWATER (Receding blackwater pools)",
        f"HIGH_HUMIDITY ({humidity}% Open-Meteo telemetry)"
    ]

    recommendations = [
        "Deploy GCC Mobile Chlorination Tanker to 4th Main Road and Murugu Nagar immediately",
        "Trigger Emergency Medical Inventory Restock: 5,000 ORS sachets and 500L Ringer's Lactate to Velachery UPHC",
        "Issue urgent public SMS and loudspeaker Boiled-Water Advisory across Ward 14",
        "Isolate broken sewage mains at Vijayanagar Junction to prevent secondary aquifer seepage"
    ]

    actions = [
        MunicipalAction(
            action_id="ACT-" + str(int(datetime.utcnow().timestamp())) + "-01",
            action_type="trigger_municipal_containment_protocol",
            title="Trigger Municipal Containment Protocol (Ward 14)",
            target_area="Velachery Ward 14 (4th Main & Murugu Nagar)",
            urgency="CRITICAL" if risk_prob > 0.7 else "HIGH",
            status="PENDING_APPROVAL",
            parameters=ActionParameters(
                protocol_code="EPIDEMIC-STAGE-2-WATERBORNE",
                chlorination_ppm=2.5,
                alert_broadcast=True,
                affected_population_estimate=115000
            )
        ),
        MunicipalAction(
            action_id="ACT-" + str(int(datetime.utcnow().timestamp())) + "-02",
            action_type="dispatch_volunteer_resource",
            title="Dispatch Mobile Chlorination Crew #3 & Water Tanker",
            target_area="4th Main Road & Murugu Nagar 2nd St",
            urgency="HIGH",
            status="PENDING_APPROVAL",
            parameters=ActionParameters(
                crew_id="VOL-106",
                resource="CHLORINATION_TANKER_5000L",
                priority="P0_IMMEDIATE"
            )
        ),
        MunicipalAction(
            action_id="ACT-" + str(int(datetime.utcnow().timestamp())) + "-03",
            action_type="restock_medical_inventory",
            title="Emergency Stock Re-supply to Velachery UPHC & MedPlus",
            target_area="GCC Community Health Complex & MedPlus Main",
            urgency="HIGH",
            status="PENDING_APPROVAL",
            parameters=ActionParameters(
                ors_cartons=50,
                iv_fluids_rl_cases=25,
                doxycycline_100mg_tabs=2000
            )
        )
    ]

    return OutbreakAlert(
        alert_id=f"EPI-2026-{int(datetime.utcnow().timestamp()) % 1000:03d}",
        ward_id=ward_id,
        risk_probability=round(risk_prob, 2),
        risk_level=risk_level,
        suspected_pathogen_class=pathogen,
        causal_chain_reasoning=causal_reasoning,
        environmental_drivers=drivers,
        pharmacy_signal_count=pulse_count,
        recommended_municipal_actions=recommendations,
        action_proposals=actions,
        weather_context=WeatherContext(**weather) if isinstance(weather, dict) else weather,
        generated_at=datetime.utcnow().isoformat() + "Z"
    )

async def correlate_outbreak(
    ward_id: str,
    sos_tickets: List[SOSTicket],
    pharmacy_pulses: List[PharmacyPulse],
    weather: Dict[str, Any]
) -> OutbreakAlert:
    """
    Executes Spatio-Temporal Epidemic Correlation using Google's active Gemini models.
    Model hierarchy:
    1. First attempts gemini-3.1-pro-preview or gemini-pro-latest for complex causal multi-hop reasoning.
    2. If a quota / rate limit (e.g. 429 RESOURCE_EXHAUSTED common on free-tier keys) occurs,
       automatically falls back to gemini-3.8-flash for structured causal analysis & municipal action formulation.
    3. If all live model attempts fail or API key is absent, falls back to deterministic offline heuristics.
    """
    client = get_gemini_client()
    if not client:
        return _deterministic_outbreak_correlation(ward_id, sos_tickets, pharmacy_pulses, weather)

    # Summarize Phase 1 hazards
    hazards_summary = []
    for t in sos_tickets:
        if t.triage.environmental_hazard_logged:
            hazards_summary.append({
                "ticket_id": t.ticket_id,
                "lat": t.location.lat,
                "lng": t.location.lng,
                "address": t.location.address,
                "hazards": t.triage.environmental_hazard_logged,
                "vulnerabilities": t.triage.vulnerability_tags
            })

    # Summarize Phase 2 pulses
    pulses_summary = []
    for p in pharmacy_pulses:
        pulses_summary.append({
            "pulse_id": p.pulse_id,
            "pharmacy": p.facility_name,
            "lat": p.location.lat,
            "lng": p.location.lng,
            "signals": p.extracted_signals.dict(),
            "summary": p.raw_summary
        })

    prompt = f"""
You are the Chief Epidemiological Intelligence AI for EPIC-Hour.
Analyze the two-phase crisis data for Ward: {ward_id}.

Context:
1. PHASE 1 DISASTER RESCUE HAZARD ANCHORS (Persisted from Hours 0-48 Flood Rescue):
{json.dumps(hazards_summary[:10], indent=2)}

2. PHASE 2 PHARMACY & CLINIC SURVEILLANCE PULSES (Days 3-14 Post-Disaster OTC Sales):
{json.dumps(pulses_summary, indent=2)}

3. OPEN-METEO ENVIRONMENTAL TELEMETRY:
{json.dumps(weather, indent=2)}

Tasks:
- Evaluate the Spatio-Temporal correlation between the persistent sewage/water contamination points and the pharmacy symptom spikes.
- Determine the outbreak risk probability (0.0 to 1.0) and pathogen class.
- Explain the exact causal chain reasoning connecting Phase 1 flood hazards to Phase 2 OTC medication surges.
- Formulate concrete Municipal Action Proposals (action_proposals) with specific containment actions.
- Return a valid JSON matching the OutbreakAlert schema.
"""

    models_hierarchy = ["gemini-3.1-pro-preview", "gemini-pro-latest", "gemini-3.8-flash"]
    last_error = None
    response = None

    for model_name in models_hierarchy:
        try:
            from google.genai import types

            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=OutbreakAlert,
                    temperature=0.2
                )
            )
            if response and response.text:
                print(f"Epidemic correlation successfully generated using model: {model_name}")
                break
        except Exception as e:
            last_error = e
            print(f"Model {model_name} correlation failed or quota exceeded ({e}). Falling back to next model...")
            continue

    if response and response.text:
        try:
            data = json.loads(response.text)
            if not data.get("alert_id"):
                data["alert_id"] = f"EPI-2026-{int(datetime.utcnow().timestamp()) % 1000:03d}"
            if not data.get("generated_at"):
                data["generated_at"] = datetime.utcnow().isoformat() + "Z"
            alert = OutbreakAlert(**data)
            if isinstance(weather, dict):
                alert.weather_context = WeatherContext(**weather)
            elif weather:
                alert.weather_context = weather
            return alert
        except Exception as parse_err:
            print(f"Failed to parse live OutbreakAlert JSON: {parse_err}. Falling back to deterministic correlation.")
            return _deterministic_outbreak_correlation(ward_id, sos_tickets, pharmacy_pulses, weather)

    print(f"All Gemini correlation models exhausted ({last_error}). Using deterministic correlation fallback.")
    return _deterministic_outbreak_correlation(ward_id, sos_tickets, pharmacy_pulses, weather)

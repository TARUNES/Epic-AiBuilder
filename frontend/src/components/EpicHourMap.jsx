import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, 
  LifeBuoy, 
  Droplets, 
  X,
  MapPin,
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Ward 14 Velachery Canonical Center
const VELACHERY_CENTER = [12.9756, 80.2207];

const HAZARD_NAMES = {
  SEWAGE_OVERFLOW: 'Sewage Overflow Breach',
  STAGNANT_FLOODWATER: 'Stagnant Floodwater Pool',
  CONTAMINATED_WELL: 'Contaminated Well / Sump',
  CARCASS_DEBRIS: 'Animal / Biological Debris',
  POWER_GRID_FAIL: 'Submerged Transformer Hazard'
};

const CATEGORY_NAMES = {
  MEDICAL_EVACUATION: 'Medical Evacuation',
  STRANDED_FLOOD: 'Stranded Flood Rescue',
  FOOD_WATER_CRITICAL: 'Potable Water & Food Crisis',
  STRUCTURAL_COLLAPSE: 'Structural Collapse',
  ELECTRICAL_HAZARD: 'Electrical Grid Hazard'
};

export default function EpicHourMap({
  phase = 1,
  tickets = [],
  facilities = [],
  volunteers = [],
  pulses = [],
  onSelectTicket = null
}) {
  // Layer toggles
  const [showHazards, setShowHazards] = useState(phase === 2);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(phase === 1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [prevPhase, setPrevPhase] = useState(phase);

  // Sync layer toggles automatically when phase changes without cascading renders
  if (phase !== prevPhase) {
    setPrevPhase(phase);
    setShowVolunteers(phase === 1);
    setShowHazards(phase === 2);
    setShowFacilities(true);
    setSelectedItem(null);
  }

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const hazardNodes = useMemo(() => {
    return tickets.filter(
      (t) => t.triage?.environmental_hazard_logged?.length > 0
    );
  }, [tickets]);

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-2xl overflow-hidden border border-black/[0.08] shadow-sm bg-[#f2f0eb] flex flex-col">
      
      {/* Top Map Controls Overlay */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge: Location & Mode Badge */}
        <div className="pointer-events-auto superhuman-glass-card px-3.5 py-1.5 flex items-center gap-2 text-xs text-[#292827]">
          <div className="w-2.5 h-2.5 rounded-full bg-[#027e6f] animate-pulse" />
          <span className="font-semibold text-[#292827]">Active Operational Grid</span>
          <span className="text-[#73736e] font-normal hidden sm:inline">
            · {phase === 1 ? `${tickets.length} Rescue Incidents` : `${pulses.length} Clinic Pulses`}
          </span>
        </div>

        {/* Right Controls: Only clean Bio-Hazards and Clinics layer toggles */}
        <div className="pointer-events-auto superhuman-glass-card p-1 flex items-center gap-1.5 text-xs">
          
          {/* Layer: Bio-Hazards */}
          <button
            type="button"
            onClick={() => setShowHazards(!showHazards)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              showHazards 
                ? 'superhuman-pill-active !py-1 !px-2.5 shadow-xs' 
                : 'text-[#73736e] hover:text-[#292827]'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-[#b070c0]" />
            <span>Bio-Hazards</span>
          </button>

          {/* Layer: Clinics */}
          <button
            type="button"
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              showFacilities 
                ? 'superhuman-pill-active !py-1 !px-2.5 shadow-xs' 
                : 'text-[#73736e] hover:text-[#292827]'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-[#027e6f]" />
            <span>Clinics</span>
          </button>

          {/* Layer: Responders (Phase 1 focus) */}
          {phase === 1 && (
            <button
              type="button"
              onClick={() => setShowVolunteers(!showVolunteers)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                showVolunteers 
                  ? 'superhuman-pill-active !py-1 !px-2.5 shadow-xs' 
                  : 'text-[#73736e] hover:text-[#292827]'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-[#6ba5e8]" />
              <span>Responders</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Container using OpenStreetMap Standard */}
      <MapContainer
        key="osm-standard-map"
        center={VELACHERY_CENTER}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* PHASE 1: Active Rescue Incident Markers */}
        {phase === 1 &&
          tickets.map((t) => {
            const urgency = t.triage?.urgency_score || 5;
            const isCritical = urgency >= 9.0;
            const fillColor = isCritical ? '#dc2626' : urgency >= 7.5 ? '#d97706' : '#1b1938';

            return (
              <CircleMarker
                key={t.ticket_id}
                center={[t.location.lat, t.location.lng]}
                radius={isCritical ? 11 : 8}
                pathOptions={{
                  fillColor: fillColor,
                  fillOpacity: 0.9,
                  color: '#ffffff',
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedItem({ type: 'SOS_TICKET', data: t });
                    if (onSelectTicket) onSelectTicket(t);
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -6]} opacity={0.95}>
                  <div className="text-xs font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#292827]">#{t.ticket_id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800">
                        P{urgency}/10
                      </span>
                    </div>
                    <div className="font-medium text-[#73736e] mt-0.5">
                      {CATEGORY_NAMES[t.triage?.category] || t.triage?.category}
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}

        {/* Persistent Hazard Anchors (Both Phases, toggleable) */}
        {showHazards &&
          hazardNodes.map((t) => (
            <React.Fragment key={`hazard-${t.ticket_id}`}>
              <Circle
                center={[t.location.lat, t.location.lng]}
                radius={160}
                pathOptions={{
                  color: '#b070c0',
                  fillColor: '#d4c7ff',
                  fillOpacity: 0.35,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
              <CircleMarker
                center={[t.location.lat, t.location.lng]}
                radius={7}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#8a4ea8',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'HAZARD', data: t }),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-xs font-sans">
                    <span className="text-[10px] font-bold text-[#8a4ea8] block uppercase">
                      Bio-Hazard Anchor
                    </span>
                    <span className="font-semibold text-[#292827]">
                      {t.triage?.environmental_hazard_logged?.map((h) => HAZARD_NAMES[h] || h).join(', ')}
                    </span>
                  </div>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          ))}

        {/* PHASE 2: Pharmacy Daily Surveillance Clusters */}
        {phase === 2 &&
          pulses.map((p) => {
            const patientCount = p.extracted_signals?.estimated_patient_count || 10;
            const radius = Math.min(26, Math.max(10, Math.floor(patientCount / 3)));

            return (
              <React.Fragment key={`pulse-${p.pulse_id}`}>
                <Circle
                  center={[p.location.lat, p.location.lng]}
                  radius={radius * 12}
                  pathOptions={{
                    color: '#e11d48',
                    fillColor: '#f43f5e',
                    fillOpacity: 0.2,
                    weight: 1.5,
                  }}
                />
                <CircleMarker
                  center={[p.location.lat, p.location.lng]}
                  radius={radius}
                  pathOptions={{
                    color: '#ffffff',
                    fillColor: '#e11d48',
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedItem({ type: 'PHARMACY_PULSE', data: p }),
                  }}
                >
                  <Tooltip direction="top" offset={[0, -8]}>
                    <div className="text-xs font-sans">
                      <span className="font-bold text-[#292827] block">{p.facility_name}</span>
                      <div className="text-[11px] font-semibold text-rose-700 mt-0.5">
                        {p.extracted_signals?.estimated_patient_count} presenting patients
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              </React.Fragment>
            );
          })}

        {/* Verified Pharmacies & Clinics */}
        {showFacilities &&
          facilities.map((fac) => (
            <CircleMarker
              key={fac.facility_id}
              center={[fac.location.lat, fac.location.lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#027e6f',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setSelectedItem({ type: 'FACILITY', data: fac }),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-semibold text-[#292827] block">{fac.facility_name}</span>
                  <span className="text-[10px] text-[#027e6f]">Verified Healthcare Partner</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}

        {/* Volunteer Rescue Units (Phase 1) */}
        {phase === 1 && showVolunteers &&
          volunteers.map((vol) => (
            <CircleMarker
              key={vol.volunteer_id}
              center={[vol.lat, vol.lng]}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: '#1b1938',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setSelectedItem({ type: 'VOLUNTEER', data: vol }),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-semibold text-[#292827] block">{vol.name}</span>
                  <span className="text-[10px] text-[#73736e]">Field Rescue Unit</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="bg-[#f2f0eb] border-t border-black/[0.06] px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-[#73736e] gap-2">
        <div className="flex items-center gap-4">
          {phase === 1 ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span className="text-[#292827] font-medium">P0 Evacuation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-[#292827] font-medium">Flood Rescue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1b1938]" />
                <span className="text-[#292827] font-medium">Rescue Unit</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-[#292827] font-medium">Medication Surge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8a4ea8]" />
                <span className="text-[#292827] font-medium">Sewage Breach Anchor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#027e6f]" />
                <span className="text-[#292827] font-medium">Verified Clinic</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-[#73736e]">
          OpenStreetMap Standard · Live Geospatial Grid
        </div>
      </div>

      {/* Clean Slide-in Detail Drawer on Right */}
      {selectedItem && (
        <div className="absolute top-14 right-3.5 bottom-12 w-80 z-[1050] superhuman-glass-card !bg-white/95 p-4 shadow-xl text-xs space-y-3 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between border-b border-black/[0.08] pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-[#73736e] uppercase tracking-wider block">
                  {selectedItem.type.replace('_', ' ')}
                </span>
                <span className="font-semibold text-[#292827] text-sm">
                  {selectedItem.type === 'SOS_TICKET' && `Incident #${selectedItem.data.ticket_id}`}
                  {selectedItem.type === 'PHARMACY_PULSE' && selectedItem.data.facility_name}
                  {selectedItem.type === 'FACILITY' && selectedItem.data.facility_name}
                  {selectedItem.type === 'HAZARD' && 'Persisted Bio-Hazard Breach'}
                  {selectedItem.type === 'VOLUNTEER' && selectedItem.data.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded-lg text-[#73736e] hover:text-[#292827] hover:bg-black/[0.05] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedItem.type === 'SOS_TICKET' && (
              <div className="space-y-2.5 text-[#292827]">
                <div className="flex items-center justify-between">
                  <span className="text-[#73736e]">Urgency Priority</span>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                    selectedItem.data.triage?.urgency_score >= 9.0 
                      ? 'bg-rose-100 text-rose-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedItem.data.triage?.urgency_score} / 10
                  </span>
                </div>
                <div>
                  <span className="text-[#73736e] block mb-0.5">Category</span>
                  <span className="px-2 py-0.5 bg-[#f2f0eb] text-[#292827] rounded font-medium inline-block">
                    {CATEGORY_NAMES[selectedItem.data.triage?.category] || selectedItem.data.triage?.category}
                  </span>
                </div>
                <div className="p-2.5 bg-[#f7f5f2] rounded-xl border border-black/[0.06] text-[#292827] text-xs">
                  "{selectedItem.data.raw_input}"
                </div>
                <div className="flex items-center gap-1.5 text-[#73736e] text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#73736e] shrink-0" />
                  <span>{selectedItem.data.location?.address}</span>
                </div>
                {selectedItem.data.assigned_volunteer_name && (
                  <div className="p-2.5 bg-[#d4c7ff]/30 border border-[#d4c7ff] rounded-xl text-[#1b1938]">
                    <div className="flex items-center gap-1 font-semibold">
                      <LifeBuoy className="w-3.5 h-3.5 text-[#1b1938]" />
                      <span>{selectedItem.data.assigned_volunteer_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-[#1b1938]/80 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA ~{selectedItem.data.assigned_volunteer_eta_minutes} mins</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === 'HAZARD' && (
              <div className="space-y-2.5 text-[#292827]">
                <div className="p-2.5 bg-[#d4c7ff]/30 border border-[#d4c7ff] rounded-xl text-[#1b1938]">
                  <div className="font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#b070c0]" />
                    <span>Active Hazard Log</span>
                  </div>
                  <p className="text-xs text-[#292827] mt-1">
                    {selectedItem.data.triage?.environmental_hazard_logged?.map((h) => HAZARD_NAMES[h] || h).join(', ')}
                  </p>
                </div>
                <div className="text-[11px] text-[#73736e] space-y-1">
                  <div>Originating SOS: #{selectedItem.data.ticket_id}</div>
                  <div>Location: {selectedItem.data.location?.address}</div>
                </div>
              </div>
            )}

            {selectedItem.type === 'PHARMACY_PULSE' && (
              <div className="space-y-2.5 text-[#292827]">
                <div className="flex items-center justify-between">
                  <span className="text-[#73736e]">Presenting Patients (24h)</span>
                  <strong className="text-rose-600 text-sm">
                    {selectedItem.data.extracted_signals?.estimated_patient_count}
                  </strong>
                </div>
                <div>
                  <span className="text-[#73736e] block mb-1">Spiking Medications</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedItem.data.extracted_signals?.medications_spiking?.map((med) => (
                      <span key={med} className="px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-semibold text-[10px]">
                        {med}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedItem.data.extracted_signals?.stockout_warning?.length > 0 && (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
                    <strong className="block text-[10px] uppercase font-bold text-amber-700">Stockout Reported</strong>
                    {selectedItem.data.extracted_signals.stockout_warning.join(', ')}
                  </div>
                )}
                <div className="p-2 bg-[#f7f5f2] rounded-lg text-[#73736e] text-xs">
                  {selectedItem.data.raw_summary}
                </div>
              </div>
            )}

            {selectedItem.type === 'FACILITY' && (
              <div className="space-y-2 text-[#292827]">
                <div className="flex items-center gap-1.5 text-[#027e6f] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#027e6f]" />
                  <span>Verified Healthcare Node</span>
                </div>
                <div className="text-[#73736e] text-xs">
                  {selectedItem.data.location?.address}
                </div>
                <div className="text-[11px] text-[#73736e]">
                  Contact: {selectedItem.data.contact_person}
                </div>
              </div>
            )}

            {selectedItem.type === 'VOLUNTEER' && (
              <div className="space-y-2 text-[#292827]">
                <div className="flex items-center justify-between">
                  <span className="text-[#73736e]">Capabilities</span>
                  <span className="font-mono text-[10px] font-bold bg-[#d4c7ff]/40 text-[#1b1938] px-2 py-0.5 rounded">
                    {selectedItem.data.capabilities}
                  </span>
                </div>
                <div className="text-xs text-[#73736e]">
                  Status: <strong className={selectedItem.data.available ? 'text-[#027e6f]' : 'text-[#73736e]'}>
                    {selectedItem.data.available ? 'Ready for Deployment' : 'Active on Field'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-black/[0.08] text-[10px] text-[#73736e] text-center">
            Press ESC or click map to close
          </div>
        </div>
      )}

    </div>
  );
}

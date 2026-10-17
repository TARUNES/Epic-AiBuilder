import React, { useState, useMemo, useEffect } from 'react';
import { 
  Store, 
  LifeBuoy, 
  Droplets, 
  X,
  Layers,
  MapPin,
  AlertTriangle,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { MAP_PROVIDERS, DEFAULT_PROVIDER, getMapProvider } from '../lib/mapProviders';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const VELACHERY_CENTER = [12.9775, 80.2212];

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
  provider = DEFAULT_PROVIDER,
  onSelectTicket
}) {
  const [selectedProvider, setSelectedProvider] = useState(provider);
  const [showProviderMenu, setShowProviderMenu] = useState(false);

  // Phase-aware intelligent layer defaults:
  // Phase 1 (Flood/Acute): Volunteers & SOS tickets front-and-center, hazards secondary
  // Phase 2 (Surveillance): Hazard anchors & Pharmacy syndromic pulses front-and-center
  const [showHazards, setShowHazards] = useState(phase === 2);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showVolunteers, setShowVolunteers] = useState(phase === 1);
  const [selectedItem, setSelectedItem] = useState(null);

  // Sync layer toggles automatically when phase changes
  useEffect(() => {
    if (phase === 1) {
      setShowVolunteers(true);
      setShowHazards(false);
      setShowFacilities(true);
    } else {
      setShowVolunteers(false);
      setShowHazards(true);
      setShowFacilities(true);
    }
    setSelectedItem(null);
  }, [phase]);

  // Close drawer on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedItem(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTileConfig = useMemo(() => {
    return getMapProvider(selectedProvider);
  }, [selectedProvider]);

  const hazardNodes = useMemo(() => {
    return tickets.filter(
      (t) => t.triage?.environmental_hazard_logged?.length > 0
    );
  }, [tickets]);

  return (
    <div className="relative w-full h-[540px] sm:h-[600px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 flex flex-col">
      
      {/* Top Map Controls Overlay */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Left Badge: Ward Location & Mode Badge */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <span className="font-extrabold text-slate-900">Ward 14 Velachery</span>
          <span className="text-slate-500 font-medium hidden sm:inline">
            · {phase === 1 ? `${tickets.length} Rescue Incidents` : `${pulses.length} Clinic Pulses`}
          </span>
        </div>

        {/* Right Controls: Tile Provider Switcher & Clean Layer Toggles */}
        <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-slate-200 shadow-sm text-xs">
          
          {/* Provider Selection Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProviderMenu(!showProviderMenu)}
              title="Change Map Tile Provider"
              className="px-2.5 py-1 rounded-lg font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center gap-1 border border-transparent hover:border-slate-200"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">{currentTileConfig.name.split(' ')[0]}</span>
            </button>

            {showProviderMenu && (
              <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-lg py-1 z-[1100] text-xs">
                <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  OpenStreetMap Layers
                </div>
                {Object.values(MAP_PROVIDERS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProvider(p.id);
                      setShowProviderMenu(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 font-medium flex items-center justify-between hover:bg-slate-50 ${
                      selectedProvider === p.id ? 'text-blue-700 bg-blue-50/60 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <span>{p.name}</span>
                    {selectedProvider === p.id && <span className="text-blue-600 text-[10px]">●</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-4 bg-slate-200 mx-0.5" />

          {/* Layer: Hazards */}
          <button
            type="button"
            onClick={() => setShowHazards(!showHazards)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              showHazards 
                ? 'bg-purple-50 text-purple-800 border border-purple-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Bio-Hazards</span>
          </button>

          {/* Layer: Healthcare Partners */}
          <button
            type="button"
            onClick={() => setShowFacilities(!showFacilities)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
              showFacilities 
                ? 'bg-teal-50 text-teal-800 border border-teal-200' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5 text-teal-600" />
            <span className="hidden sm:inline">Clinics</span>
          </button>

          {/* Layer: Responders (Phase 1 focus) */}
          {phase === 1 && (
            <button
              type="button"
              onClick={() => setShowVolunteers(!showVolunteers)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                showVolunteers 
                  ? 'bg-blue-50 text-blue-800 border border-blue-200' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Responders</span>
            </button>
          )}
        </div>
      </div>

      {/* Map Container using Provider-Agnostic Tile Adapter */}
      <MapContainer
        key={currentTileConfig.id}
        center={VELACHERY_CENTER}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          key={currentTileConfig.url}
          attribution={currentTileConfig.attribution}
          url={currentTileConfig.url}
          maxZoom={currentTileConfig.maxZoom}
          subdomains={currentTileConfig.subdomains}
        />

        {/* PHASE 1: Active Rescue Incident Markers */}
        {phase === 1 &&
          tickets.map((t) => {
            const urgency = t.triage?.urgency_score || 5;
            const isCritical = urgency >= 9.0;
            const fillColor = isCritical ? '#dc2626' : urgency >= 7.5 ? '#d97706' : '#2563eb';

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
                      <span className="font-bold text-slate-900">#{t.ticket_id}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800">
                        P{urgency}/10
                      </span>
                    </div>
                    <div className="font-semibold text-slate-700 mt-0.5">
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
                  color: '#9333ea',
                  fillColor: '#a855f7',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
              <CircleMarker
                center={[t.location.lat, t.location.lng]}
                radius={7}
                pathOptions={{
                  color: '#ffffff',
                  fillColor: '#7e22ce',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedItem({ type: 'HAZARD', data: t }),
                }}
              >
                <Tooltip direction="top" offset={[0, -6]}>
                  <div className="text-xs font-sans">
                    <span className="text-[10px] font-bold text-purple-700 block uppercase">
                      Bio-Hazard Anchor
                    </span>
                    <span className="font-bold text-slate-900">
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
                      <span className="font-bold text-slate-900 block">{p.facility_name}</span>
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
                fillColor: '#059669',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setSelectedItem({ type: 'FACILITY', data: fac }),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-bold text-slate-900 block">{fac.facility_name}</span>
                  <span className="text-[10px] text-slate-500">Verified Healthcare Partner</span>
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
                fillColor: '#2563eb',
                fillOpacity: 0.95,
                weight: 1.5,
              }}
              eventHandlers={{
                click: () => setSelectedItem({ type: 'VOLUNTEER', data: vol }),
              }}
            >
              <Tooltip direction="bottom" offset={[0, 6]}>
                <div className="text-xs font-sans">
                  <span className="font-bold text-slate-900 block">{vol.name}</span>
                  <span className="text-[10px] text-slate-500">Rescue Squad</span>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Map Legend */}
      <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-4">
          {phase === 1 ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
                <span>P0 Evacuation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Flood Rescue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Rescue Unit</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Medication Surge</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-700" />
                <span>Sewage Breach Anchor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Verified Clinic</span>
              </div>
            </>
          )}
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          {currentTileConfig.name} · Velachery Ward 14
        </div>
      </div>

      {/* Clean Slide-in Detail Drawer on Right */}
      {selectedItem && (
        <div className="absolute top-14 right-3.5 bottom-12 w-80 z-[1050] bg-white/95 backdrop-blur-md rounded-2xl border border-slate-300 p-4 shadow-xl text-xs space-y-3 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-3">
            <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {selectedItem.type.replace('_', ' ')}
                </span>
                <span className="font-extrabold text-slate-900 text-sm">
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedItem.type === 'SOS_TICKET' && (
              <div className="space-y-2.5 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Urgency Priority</span>
                  <span className={`px-2 py-0.5 rounded font-bold font-mono text-[11px] ${
                    selectedItem.data.triage?.urgency_score >= 9.0 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedItem.data.triage?.urgency_score} / 10
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-0.5">Category</span>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium inline-block">
                    {CATEGORY_NAMES[selectedItem.data.triage?.category] || selectedItem.data.triage?.category}
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-800 text-xs">
                  "{selectedItem.data.raw_input}"
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedItem.data.location?.address}</span>
                </div>
                {selectedItem.data.assigned_volunteer_name && (
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                    <div className="flex items-center gap-1 font-bold">
                      <LifeBuoy className="w-3.5 h-3.5 text-blue-600" />
                      <span>{selectedItem.data.assigned_volunteer_name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-blue-700 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA ~{selectedItem.data.assigned_volunteer_eta_minutes} mins</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedItem.type === 'HAZARD' && (
              <div className="space-y-2.5 text-slate-700">
                <div className="p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900">
                  <div className="font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-purple-600" />
                    <span>Active Hazard Log</span>
                  </div>
                  <p className="text-xs text-purple-800 mt-1">
                    {selectedItem.data.triage?.environmental_hazard_logged?.map((h) => HAZARD_NAMES[h] || h).join(', ')}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 space-y-1">
                  <div>Originating SOS: #{selectedItem.data.ticket_id}</div>
                  <div>Location: {selectedItem.data.location?.address}</div>
                </div>
              </div>
            )}

            {selectedItem.type === 'PHARMACY_PULSE' && (
              <div className="space-y-2.5 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-500">Presenting Patients (24h)</span>
                  <strong className="text-rose-600 text-sm">
                    {selectedItem.data.extracted_signals?.estimated_patient_count}
                  </strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-500 block mb-1">Spiking Medications</span>
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
                <div className="p-2 bg-slate-50 rounded-lg text-slate-600 text-xs">
                  {selectedItem.data.raw_summary}
                </div>
              </div>
            )}

            {selectedItem.type === 'FACILITY' && (
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified Healthcare Node</span>
                </div>
                <div className="text-slate-600 text-xs">
                  {selectedItem.data.location?.address}
                </div>
                <div className="text-[11px] text-slate-500">
                  Contact: {selectedItem.data.contact_person}
                </div>
              </div>
            )}

            {selectedItem.type === 'VOLUNTEER' && (
              <div className="space-y-2 text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Capabilities</span>
                  <span className="font-mono text-[10px] font-bold bg-blue-50 text-blue-800 px-2 py-0.5 rounded">
                    {selectedItem.data.capabilities}
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Status: <strong className={selectedItem.data.available ? 'text-emerald-600' : 'text-slate-500'}>
                    {selectedItem.data.available ? 'Ready for Deployment' : 'Active on Field'}
                  </strong>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Press ESC or click map to close
          </div>
        </div>
      )}

    </div>
  );
}

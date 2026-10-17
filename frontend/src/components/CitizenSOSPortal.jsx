import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  AlertCircle, 
  Clock, 
  UserCheck, 
  MapPin, 
  ShieldCheck, 
  Droplets, 
  CheckCircle,
  RefreshCw,
  Phone,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const SAMPLE_SCENARIOS = [
  {
    category: 'Dialysis & Medical',
    label: '4th Main Dialysis Emergency',
    text: 'Velachery 4th main road, house #18. Water entered 1st floor. 72-year-old grandfather requires urgent dialysis. Sewage pipe burst and mixing with stagnant floodwater.',
    address: '18, 4th Main Road, Velachery'
  },
  {
    category: 'Stranded Flood',
    label: 'Bypass Road Rooftop Rescue',
    text: 'Bypass road near Vijayanagar arch, 5 people stranded on terrace including 2 pregnant women. Water is 5 feet deep with sewage backflow.',
    address: 'Bypass Road, near Vijayanagar Arch, Velachery'
  },
  {
    category: 'Pediatric Care',
    label: '100ft Road Infant High Fever',
    text: '8-month-old infant running 104 fever with shivering at 100ft road near baby shop. Floodwater 3 feet high, road inaccessible by standard vehicle.',
    address: '100ft Road near Baby Care, Velachery West'
  },
  {
    category: 'Drinking Water',
    label: 'Murugu Nagar Well Contamination',
    text: 'Murugu Nagar 2nd street, flood runoff entered community drinking well. Water is visibly contaminated with drain backflow. 15 families without potable water.',
    address: 'Murugu Nagar 2nd St, Velachery'
  }
];

const HAZARD_LABELS = {
  SEWAGE_OVERFLOW: 'Sewage Overflow',
  STAGNANT_FLOODWATER: 'Stagnant Floodwater',
  CONTAMINATED_WELL: 'Contaminated Drinking Water',
  CARCASS_DEBRIS: 'Animal / Biological Debris',
  POWER_GRID_FAIL: 'Submerged Electrical Grid'
};

const CATEGORY_LABELS = {
  MEDICAL_EVACUATION: 'Emergency Medical Evacuation',
  STRANDED_FLOOD: 'Stranded / Flood Rescue',
  FOOD_WATER_CRITICAL: 'Potable Water & Food Crisis',
  STRUCTURAL_COLLAPSE: 'Structural Collapse / Trauma',
  ELECTRICAL_HAZARD: 'Severe Electrical / Grid Hazard'
};

export default function CitizenSOSPortal({ onTicketCreated }) {
  const [inputText, setInputText] = useState('');
  const [address, setAddress] = useState('4th Main Road, Velachery');
  const [phoneNumber, setPhoneNumber] = useState('9840123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const {
    isRecording,
    recordingTime,
    audioBase64,
    audioMime,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder();

  const handleScenarioSelect = (scenario) => {
    setInputText(scenario.text);
    setAddress(scenario.address);
    resetRecording();
    setIngestResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText && !audioBase64) {
      setSubmitError('Please record a voice message or type the emergency details.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        text: inputText || undefined,
        audio_b64: audioBase64 || undefined,
        audio_mime: audioMime,
        address: address || undefined,
        phone: phoneNumber || undefined
      };

      const result = await api.ingestSOS(payload);
      setIngestResult(result);
      if (onTicketCreated) {
        onTicketCreated(result.ticket);
      }
    } catch (err) {
      console.error('SOS Ingest failed:', err);
      setSubmitError(err.response?.data?.detail || 'Unable to submit emergency dispatch. Please contact helpline 1070.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Civic Emergency Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-md">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                Disaster Response Active
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Emergency Dispatch & Volunteer Routing
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
              Emergency SOS Reporting
            </h1>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
              If you or someone nearby is trapped, in medical danger, or stranded by floodwaters, report below. 
              You can speak in Tamil, Tanglish, Hindi, or English, or type your location. Reports are verified and routed to the nearest rescue team.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 sm:text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wide">
              Data Protection
            </span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 justify-end mt-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Protected Emergency Channel
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form: Reporting Card */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Subtle Testing Helper Dropdown/Pills */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Sample Emergency Scenarios (For Testing)
              </span>
              <span className="text-[11px] text-slate-500">Tap to load details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_SCENARIOS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleScenarioSelect(s)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all text-xs group"
                >
                  <div className="font-semibold text-slate-800 group-hover:text-blue-600">
                    {s.label}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                    {s.text}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-5">
            
            {/* Voice Audio Recording */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Mic className="w-4 h-4 text-red-600" />
                  Voice Emergency Note (Tamil / Tanglish / Hindi / English)
                </span>
                {isRecording && (
                  <span className="text-xs font-mono font-bold text-red-600 flex items-center gap-1 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Recording: {recordingTime}s
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
                  >
                    <Mic className="w-4 h-4" />
                    Record Voice Message
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <MicOff className="w-4 h-4" />
                    Finish Recording ({recordingTime}s)
                  </button>
                )}

                {audioBase64 && (
                  <button
                    type="button"
                    onClick={resetRecording}
                    className="px-3 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-medium"
                    title="Re-record"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}
              </div>

              {audioBase64 && (
                <div className="mt-3 flex items-center justify-between text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800">
                  <span className="flex items-center gap-1.5 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Voice message attached
                  </span>
                  <span className="text-[11px] text-emerald-600 font-mono">Ready to send</span>
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Emergency Details & Trapped Conditions
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe what happened: e.g. Velachery 4th main road, house #18. Water entered 1st floor. Elderly dialysis patient needs immediate rescue..."
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 transition-all"
              />
            </div>

            {/* Location & Contact Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Street / Landmark Location
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 4th Main Road, Velachery"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9840123456"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
                />
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Routing to Nearest Rescue Unit...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Dispatch Emergency SOS Now
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Live Status & Assigned Team */}
        <div className="lg:col-span-5 space-y-5">
          {ingestResult ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* De-duplication Banner */}
              {ingestResult.is_duplicate ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Merged with Active Incident #{ingestResult.merged_with_ticket_id}
                  </div>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    A neighbor or bystander in your immediate vicinity ({ingestResult.distance_meters}m away) has also reported this emergency. Your report has been combined to elevate response urgency.
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs font-medium text-amber-900 bg-amber-100/60 px-3 py-1.5 rounded-lg border border-amber-300">
                    <span>Incident Urgency: <strong>{ingestResult.ticket.triage.urgency_score} / 10</strong></span>
                    <span>Reports Combined: <strong>{ingestResult.ticket.deduplication.duplicate_count}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-xs">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Incident Ticket Registered #{ingestResult.ticket.ticket_id}
                  </div>
                  <p className="text-xs text-emerald-800">
                    Your emergency request has been received by GCC Disaster Operations and assigned to a rescue unit.
                  </p>
                </div>
              )}

              {/* Triage & Volunteer Assignment Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                
                {/* Urgency & Category */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Triage Classification
                    </span>
                    <span className="text-xs font-bold text-slate-900 mt-0.5 block">
                      {CATEGORY_LABELS[ingestResult.ticket.triage.category] || ingestResult.ticket.triage.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Priority Level
                    </span>
                    <span className="text-lg font-black text-red-600">
                      {ingestResult.ticket.triage.urgency_score} / 10
                    </span>
                  </div>
                </div>

                {/* Assigned Rescue Unit */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide block">
                          Assigned Response Team
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {ingestResult.ticket.assigned_volunteer_name || 'Routing Nearest Available Rescue Crew...'}
                        </span>
                      </div>
                    </div>
                    {ingestResult.ticket.assigned_volunteer_eta_minutes && (
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Est. Arrival</span>
                        <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          {ingestResult.ticket.assigned_volunteer_eta_minutes} mins
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Persisted Environmental Hazard Indicators */}
                {ingestResult.ticket.triage.environmental_hazard_logged?.length > 0 && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <span className="text-[10px] font-bold text-purple-900 uppercase tracking-wide block mb-1.5 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-purple-600" />
                      Environmental Hazards Logged
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ingestResult.ticket.triage.environmental_hazard_logged.map((h, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white text-purple-800 border border-purple-200 shadow-2xs"
                        >
                          {HAZARD_LABELS[h] || h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Immediate Safety Directives */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
                    Immediate Citizen Safety Directives
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {ingestResult.ticket.safety_instructions}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Idle Placeholder */
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-4 shadow-xs">
              <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Ready for Emergency Dispatch
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  Enter your address and trapped conditions or tap a sample scenario to simulate live triage and rescue team routing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

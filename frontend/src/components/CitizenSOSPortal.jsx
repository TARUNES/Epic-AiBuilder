import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  CheckCircle, 
  MapPin, 
  Phone, 
  Radio, 
  ArrowRight,
  Volume2,
  RotateCcw
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const QUICK_PRESETS = [
  {
    title: 'Medical & Dialysis',
    text: 'South Sector 4th Main Road, #18. 72-year-old grandfather requires urgent dialysis. Water 4 feet high, sewage pipe burst and mixing with stagnant water.',
    address: '18, 4th Main Road, South Sector'
  },
  {
    title: 'Stranded on Terrace',
    text: 'Bypass road near Vijayanagar Arch. 5 people stranded on terrace including pregnant mother. Water 5 feet deep.',
    address: 'Bypass Road, Vijayanagar Arch, South Sector'
  },
  {
    title: 'Drinking Water Contaminated',
    text: 'Murugu Nagar 2nd St. Flood runoff contaminated community well with sewage. 15 families need clean drinking water.',
    address: 'Murugu Nagar 2nd St, Central Sector'
  }
];

export default function CitizenSOSPortal({ onTicketCreated }) {
  const [inputText, setInputText] = useState('');
  const [address, setAddress] = useState('4th Main Road, South Sector');
  const [phoneNumber, setPhoneNumber] = useState('9840123456');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);

  const {
    isRecording,
    recordingTime,
    audioBase64,
    audioUrl,
    audioMime,
    isTranscribing,
    startRecording,
    stopRecording,
    resetRecording
  } = useMediaRecorder();

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording({
        context: 'emergency',
        onTranscript: (liveText) => {
          if (liveText) {
            setInputText(liveText);
          }
        }
      });
    }
  };

  const handlePresetSelect = (preset) => {
    setInputText(preset.text);
    setAddress(preset.address);
    resetRecording();
    setIngestResult(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    let textToSend = inputText.trim();
    if (!textToSend && !audioBase64) {
      textToSend = `Emergency rescue requested at ${address || 'Ward 14, Velachery'}. Water levels rising, family requires immediate evacuation dispatch.`;
      setInputText(textToSend);
    }

    setIsSubmitting(true);

    try {
      const payload = {
        text: textToSend || undefined,
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const remainder = sec % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="w-full space-y-10">
      
      {/* 1. HERO SECTION: Dreamy multi-stop gradient wash + Floating Glass Card */}
      <section className="relative w-full rounded-3xl superhuman-hero-canvas p-6 sm:p-10 lg:p-16 overflow-hidden shadow-sm">
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          
          {/* Top telemetry pills - High Contrast Frosted Glass */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs shadow-xs"
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#1b1938',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
              }}
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Regional Emergency Response Network</span>
            </span>

            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs shadow-xs"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                color: '#1b1938',
                border: '1px solid rgba(255, 255, 255, 0.8)',
                fontWeight: 600,
              }}
            >
              <Phone className="w-3.5 h-3.5 text-[#1b1938]" />
              <span>Helpline 1070</span>
            </span>
          </div>

          {/* Superhuman Display Headline */}
          <div className="space-y-3 max-w-2xl">
            <h1 className="superhuman-headline">
              Immediate rescue & medical triage
            </h1>
            <p className="text-base sm:text-lg text-[#292827] font-normal leading-relaxed max-w-xl">
              Stranded or need critical medical help? Speak naturally in Tamil, English, or Hindi, or type your address. We dispatch directly to the nearest rescue boat.
            </p>
          </div>

          {/* Floating Glass UI Card showcasing live AI triage & workspace telemetry */}
          <div className="superhuman-glass-card p-5 sm:p-6 max-w-xl space-y-4">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#027e6f] animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1b1938]">
                  Live Dispatch Telemetry
                </span>
              </div>
              <span className="text-xs font-semibold text-[#027e6f] bg-emerald-50 px-2 py-0.5 rounded-md">
                Active Standby
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2.5 rounded-xl bg-white/60 border border-white/80">
                <span className="text-[10px] font-semibold text-[#73736e] uppercase block">Response Units</span>
                <span className="font-mono text-xl font-bold text-[#1b1938]">4 Boats</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-white/80">
                <span className="text-[10px] font-semibold text-[#73736e] uppercase block">Average ETA</span>
                <span className="font-mono text-xl font-bold text-[#027e6f]">~8 Mins</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-white/80">
                <span className="text-[10px] font-semibold text-[#73736e] uppercase block">Triage Status</span>
                <span className="font-mono text-xl font-bold text-[#b070c0]">Instant Priority</span>
              </div>
            </div>

            <div className="text-[11px] text-[#73736e] flex items-center justify-between">
              <span>● Automatic duplicate detection & address normalization</span>
              <span>Live GPS / Auto-Zone Detection</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CALM MAIN CONTENT SECTION (Below Hero on #f7f5f2) */}
      <section className="max-w-2xl mx-auto space-y-6">
        
        <div className="superhuman-card p-6 sm:p-8 space-y-6">
          
          {/* Voice Recording Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white border border-black/[0.06] shadow-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <div className="text-sm font-semibold text-[#292827]">
                {isRecording ? `Recording voice note... (${formatSeconds(recordingTime)})` : 'Speak your emergency in any language'}
              </div>
              <div className="text-xs text-[#73736e]">
                {isRecording 
                  ? 'Streaming live transcription into description box below...' 
                  : 'Speak in Tamil, Hindi, or English — location and medical urgency are prioritized automatically.'}
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleRecording}
              className={`h-11 px-5 rounded-xl flex items-center gap-2 font-medium text-xs transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-rose-600 text-white animate-pulse shadow-md' 
                  : 'bg-[#d4c7ff] text-[#1b1938] hover:bg-[#c6b4fc] font-semibold'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Stop & Attach' : 'Record voice note'}</span>
            </button>
          </div>

          {/* Compact Audio Playback Bar (Shown after recording finishes) */}
          {audioUrl && (
            <div className="p-4 rounded-xl bg-white border border-black/[0.08] shadow-xs space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-[#1b1938]" />
                  <span className="text-xs font-semibold text-[#1b1938]">Voice Note Attached</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {recordingTime > 0 ? `${formatSeconds(recordingTime)} recorded` : 'Audio note recorded'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetRecording}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear / Re-record</span>
                </button>
              </div>

              <audio controls src={audioUrl} className="w-full h-9 rounded-lg focus:outline-none" />
            </div>
          )}

          {/* Real-time Transcription Status Indicator */}
          {isTranscribing && (
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#1b1938] px-3.5 py-2.5 rounded-xl bg-[#d4c7ff]/30 border border-[#b070c0]/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#353088] animate-ping" />
              <span>Transcribing voice note via Gemini 2.5 Flash multimodal speech-to-text...</span>
            </div>
          )}

          {/* Emergency Description Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#73736e]">
                Describe the situation or emergency
              </label>
              {isRecording && (
                <span className="text-[11px] font-mono text-rose-600 animate-pulse font-semibold">
                  ● Live Speech-to-Text streaming
                </span>
              )}
            </div>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 4 people stuck on terrace near Vijayanagar Arch. Water 5 feet deep, elderly family member requires insulin."
              className="w-full superhuman-input text-sm"
            />
          </div>

          {/* Landmark & Callback Phone Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#73736e] mb-1.5">
                Location or landmark
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street or building landmark"
                  className="w-full superhuman-input !pl-9 text-xs"
                />
                <MapPin className="w-3.5 h-3.5 text-[#73736e] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#73736e] mb-1.5">
                Callback mobile number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="10-digit mobile number"
                  className="w-full superhuman-input !pl-9 text-xs"
                />
                <Phone className="w-3.5 h-3.5 text-[#73736e] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Primary CTA Button: Always full-opacity rich deep indigo #1b1938 with crisp white text */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full superhuman-btn-primary !opacity-100 hover:!opacity-95"
              style={{
                background: '#1b1938',
                color: '#ffffff',
                opacity: 1,
              }}
            >
              <span className="text-white font-medium text-sm">
                {isSubmitting ? 'Routing to nearest rescue boat...' : 'Request immediate rescue'}
              </span>
              <span className="superhuman-arrow-chip">
                <ArrowRight className="w-4 h-4 text-white" />
              </span>
            </button>
          </div>

          {/* Quick Presets for Demo Testing */}
          <div className="pt-4 border-t border-black/[0.06] space-y-2">
            <div className="text-[11px] font-semibold text-[#73736e] text-center">
              Or test an authentic Chennai flood scenario:
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePresetSelect(p)}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#d4c7ff]/40 text-xs text-[#292827] border border-black/[0.06] transition-all cursor-pointer font-medium"
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 3. Confirmation & Assigned Squad Result */}
        {ingestResult && (
          <div className="superhuman-glass-card p-6 sm:p-8 space-y-4 border-emerald-200 bg-emerald-50/70 animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-[#027e6f]">
              <CheckCircle className="w-5 h-5 text-[#027e6f]" />
              <span className="font-semibold text-base text-[#292827]">Emergency Dispatch Confirmed</span>
            </div>

            <div className="space-y-2 text-sm text-[#292827]">
              <p>
                Your dispatch ticket <strong className="font-mono text-[#1b1938]">#{ingestResult.ticket?.ticket_id}</strong> has been prioritized.
              </p>
              {ingestResult.assigned_volunteer && (
                <div className="p-4 rounded-xl bg-white border border-black/[0.06] flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs text-[#73736e]">Assigned Rescue Squad</div>
                    <div className="text-sm font-semibold text-[#292827] mt-0.5">
                      {ingestResult.assigned_volunteer.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-[#73736e]">Estimated Arrival</div>
                    <div className="text-sm font-mono text-[#027e6f] font-bold mt-0.5">
                      ~{ingestResult.assigned_volunteer.eta_minutes} mins
                    </div>
                  </div>
                </div>
              )}
              <div className="text-xs text-[#73736e] pt-1">
                Stay on the highest dry surface. Turn off main circuit breaker. Emergency helpline: <strong>1070</strong>.
              </div>
            </div>
          </div>
        )}

      </section>

    </div>
  );
}

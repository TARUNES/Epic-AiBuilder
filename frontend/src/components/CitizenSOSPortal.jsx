import React, { useState } from 'react';
import { 
  Mic, 
  MicOff, 
  Send, 
  Clock, 
  CheckCircle,
  MapPin,
  LifeBuoy,
  AlertCircle
} from 'lucide-react';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { api } from '../services/api';

const QUICK_PRESETS = [
  {
    title: 'Medical & Dialysis',
    text: 'Velachery 4th Main Road, #18. 72-year-old grandfather requires urgent dialysis. Water 4 feet high, sewage mixing into ground floor.',
    address: '18, 4th Main Road, Velachery'
  },
  {
    title: 'Stranded on Terrace',
    text: 'Bypass road near Vijayanagar Arch. 5 people stranded on terrace including pregnant mother. Water 5 feet deep.',
    address: 'Bypass Road, Vijayanagar Arch, Velachery'
  },
  {
    title: 'Drinking Water Contaminated',
    text: 'Murugu Nagar 2nd St. Flood runoff contaminated community well with sewage. 15 families need clean drinking water.',
    address: 'Murugu Nagar 2nd St, Velachery'
  }
];

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

  const handlePresetSelect = (preset) => {
    setInputText(preset.text);
    setAddress(preset.address);
    resetRecording();
    setIngestResult(null);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputText && !audioBase64) {
      setSubmitError('Please speak into the microphone or write your emergency.');
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
      setSubmitError('Unable to connect. Emergency helpline: 1070.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 text-[#ededf3]">
      
      {/* Calm, Serene Hero Header */}
      <div className="space-y-2 text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#9bb4e633] text-xs font-light text-[#9bb4e6]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5266eb]" />
          <span>Immediate Rescue Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-normal text-[#ededf3] tracking-tight">
          Emergency assistance
        </h1>
        <p className="text-sm text-[#c3c3cc] font-light leading-relaxed">
          Stranded or need medical help? Speak in Tamil, Hindi, or English, or write your address. We route directly to nearby rescue boats.
        </p>
      </div>

      {/* Main Reporting Capsule Panel */}
      <div className="mercury-panel p-6 sm:p-8 space-y-6">
        
        {/* Voice Recording Capsule */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)]">
          <div className="space-y-0.5 text-center sm:text-left">
            <div className="text-sm font-medium text-[#ededf3]">
              {isRecording ? `Recording voice note... (${recordingTime}s)` : 'Speak your emergency'}
            </div>
            <div className="text-xs text-[#afb4cd] font-light">
              Tap mic to speak naturally in any language
            </div>
          </div>

          <button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            className={`h-11 px-6 rounded-full flex items-center gap-2 font-medium text-xs transition-all ${
              isRecording 
                ? 'bg-[#fc92b4] text-[#171721] animate-pulse' 
                : 'bg-[#5266eb] hover:bg-[#4354d0] text-white'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{isRecording ? 'Stop & Attach' : 'Record voice note'}</span>
          </button>
        </div>

        {/* Text Input & Location Capsule */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-light text-[#afb4cd] mb-1.5">
              Describe the emergency
            </label>
            <textarea
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="e.g. 4 people stuck on rooftop, water rising fast. Elderly person needs insulin."
              className="w-full p-4 rounded-xl bg-[#171721] border border-[rgba(175,180,205,0.15)] text-sm text-[#ededf3] placeholder:text-[#afb4cd]/50 focus:border-[#5266eb] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-light text-[#afb4cd] mb-1.5">
                Location or landmark
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street or building name"
                  className="w-full h-11 pl-9 pr-3 rounded-full bg-[#171721] border border-[rgba(175,180,205,0.15)] text-xs text-[#ededf3] placeholder:text-[#afb4cd]/50 focus:border-[#5266eb] focus:outline-none"
                />
                <MapPin className="w-3.5 h-3.5 text-[#afb4cd] absolute left-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-light text-[#afb4cd] mb-1.5">
                Callback phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full h-11 px-4 rounded-full bg-[#171721] border border-[rgba(175,180,205,0.15)] text-xs text-[#ededf3] placeholder:text-[#afb4cd]/50 focus:border-[#5266eb] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {submitError && (
          <div className="p-3 rounded-xl bg-[#fc92b4]/10 border border-[#fc92b4]/30 text-xs text-[#fc92b4] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full mercury-btn-primary h-12 text-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Routing to rescue team...</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Request immediate rescue</span>
            </>
          )}
        </button>

        {/* Minimal Presets for Quick Testing */}
        <div className="pt-4 border-t border-[rgba(175,180,205,0.1)]">
          <div className="text-[11px] font-light text-[#afb4cd] mb-2 text-center">
            Or select a quick situation to test:
          </div>
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePresetSelect(p)}
                className="px-3 py-1.5 rounded-full bg-[#272735] hover:bg-[#9bb4e633] text-xs text-[#c3c3cc] hover:text-[#ededf3] transition-all"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Confirmation & Assigned Rescue Squad Result */}
      {ingestResult && (
        <div className="mercury-panel p-6 sm:p-8 space-y-4 border-[#5266eb]/40 bg-[#1e1e2a] animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5 text-[#5266eb]">
            <CheckCircle className="w-5 h-5 text-[#5266eb]" />
            <span className="font-normal text-base text-[#ededf3]">Help is on the way</span>
          </div>

          <div className="space-y-2 text-sm text-[#c3c3cc] font-light">
            <p>
              Your dispatch ticket <strong className="text-[#ededf3] font-mono">#{ingestResult.ticket?.ticket_id}</strong> is active.
            </p>
            {ingestResult.assigned_volunteer && (
              <div className="p-4 rounded-xl bg-[#272735] border border-[rgba(175,180,205,0.15)] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#afb4cd]">Assigned Response Squad</div>
                  <div className="text-sm font-medium text-[#ededf3] mt-0.5">
                    {ingestResult.assigned_volunteer.name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#afb4cd]">Estimated arrival</div>
                  <div className="text-sm font-mono text-[#5266eb] font-medium mt-0.5">
                    ~{ingestResult.assigned_volunteer.eta_minutes} mins
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

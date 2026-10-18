import React from 'react';

export function EpicHourLogo({ 
  size = 36, 
  showText = true, 
  subtitle = "Two-Act Crisis Intelligence",
  className = ""
}) {
  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Unified Geometric Shield + Wave-to-Pulse Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        {/* Outer Civic Shield Base with Deep Indigo */}
        <path
          d="M24 3L7 9.5V22.5C7 33.4 14.2 42.9 24 46C33.8 42.9 41 33.4 41 22.5V9.5L24 3Z"
          fill="#1b1938"
        />
        {/* Subtle Inner Shield Border */}
        <path
          d="M24 5.5L9.5 11V22.5C9.5 31.8 15.6 40.1 24 43C32.4 40.1 38.5 31.8 38.5 22.5V11L24 5.5Z"
          stroke="#4640ad"
          strokeWidth="1.2"
        />
        {/* Phase 1 (Flood Wave) transitioning into Phase 2 (Clinical ECG Pulse) */}
        <path
          d="M11 26C13.2 23.2 15.8 23.2 18 26C19.5 27.8 20.8 27.5 21.8 25L24.5 15L28 32L31.2 21.5L33 25H37"
          stroke="url(#waveToPulseGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Live Telemetry Pulse Node */}
        <circle cx="37" cy="25" r="2.5" fill="#e11d48" />
        <defs>
          <linearGradient id="waveToPulseGrad" x1="11" y1="24" x2="37" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ba5e8" />   {/* Wave 1: Flood Triage Blue */}
            <stop offset="50%" stopColor="#027e6f" />  {/* Bridge: Superhuman Teal */}
            <stop offset="100%" stopColor="#b070c0" /> {/* Wave 2: Epidemic Purple */}
          </linearGradient>
        </defs>
      </svg>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-[#292827]">
              EPIC<span className="text-[#b070c0]">-</span>Hour
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d4c7ff]/40 text-[#1b1938]">
              Civic Ops
            </span>
          </div>
          {subtitle && (
            <span className="text-[11px] font-medium text-[#73736e] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default EpicHourLogo;

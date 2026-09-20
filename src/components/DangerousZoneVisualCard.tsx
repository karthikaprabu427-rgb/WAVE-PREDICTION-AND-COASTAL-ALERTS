import React, { useState } from 'react';
import {
  AlertTriangle,
  Waves,
  Wind,
  ShieldAlert,
  Clock,
  Radio,
  Compass,
  Eye,
  Info,
  Layers,
  Thermometer,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { OceanCondition } from '../types';

interface DangerousZoneVisualCardProps {
  station: OceanCondition;
  isExtreme?: boolean;
  compact?: boolean;
  className?: string;
  prediction?: any;
}

export const DangerousZoneVisualCard: React.FC<DangerousZoneVisualCardProps> = ({
  station,
  isExtreme = false,
  compact = false,
  className = '',
  prediction,
}) => {
  const [activeVisualMode, setActiveVisualMode] = useState<'surge' | 'radar' | 'inundation'>('surge');

  const isLive = station.dataStatus === 'LIVE_DATA';
  const isSimulated = station.dataStatus === 'SIMULATED' || (!isLive && !station.dataSource?.includes('Open-Meteo'));
  const dataSource = station.dataSource || (isLive ? 'Open-Meteo Marine & Weather Service' : 'Simulated Oceanographic Physics Model');

  const waveHeight = station.waveHeight;
  const windSpeed = station.windSpeed;
  const riskLabel = isExtreme ? 'EXTREME' : 'HIGH';

  // Format alert timestamp
  const alertTime = station.lastUpdated
    ? new Date(station.lastUpdated).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : new Date().toLocaleTimeString();

  return (
    <div
      className={`rounded-2xl overflow-hidden border ${
        isExtreme
          ? 'bg-slate-950/95 border-red-500/60 shadow-[0_0_30px_rgba(239,68,68,0.25)]'
          : 'bg-slate-950/90 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
      } ${className}`}
    >
      {/* Visual Header Tabs */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-white/10 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${isExtreme ? 'text-red-400' : 'text-amber-400'}`} />
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            {isExtreme ? '🚨 Extreme Coastal Danger Zone' : '⚠️ High Coastal Hazard Advisory'}
          </span>
        </div>

        {/* Visual Mode Selector */}
        <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveVisualMode('surge')}
            className={`px-2 py-0.5 rounded transition ${
              activeVisualMode === 'surge'
                ? 'bg-red-500/30 text-red-300 font-semibold border border-red-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Wave Surge
          </button>
          <button
            type="button"
            onClick={() => setActiveVisualMode('radar')}
            className={`px-2 py-0.5 rounded transition ${
              activeVisualMode === 'radar'
                ? 'bg-cyan-500/30 text-cyan-300 font-semibold border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Marine Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveVisualMode('inundation')}
            className={`px-2 py-0.5 rounded transition ${
              activeVisualMode === 'inundation'
                ? 'bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inundation
          </button>
        </div>
      </div>

      {/* DANGEROUS ZONE IMAGE / VISUAL REPRESENTATION */}
      <div className="relative w-full h-48 sm:h-56 bg-slate-950 overflow-hidden border-b border-white/10 select-none">
        {activeVisualMode === 'surge' && (
          /* High swell & breaking storm surge illustration */
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#080e1a" />
                <stop offset="50%" stopColor="#1e1b2e" />
                <stop offset="100%" stopColor="#2c151c" />
              </linearGradient>
              <linearGradient id="waveFront" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.9" />
                <stop offset="60%" stopColor="#0369a1" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#082f49" />
              </linearGradient>
              <linearGradient id="surgeDanger" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.95" />
              </linearGradient>
              <pattern id="rainPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <line x1="0" y1="0" x2="10" y2="20" stroke="#94a3b8" strokeWidth="0.8" strokeOpacity="0.35" />
              </pattern>
            </defs>

            {/* Dark Storm Sky */}
            <rect width="600" height="240" fill="url(#skyGrad)" />
            <rect width="600" height="240" fill="url(#rainPattern)" />

            {/* Distant Lightning Bolt */}
            <path d="M 460 10 L 440 60 L 452 65 L 430 115" stroke="#fef08a" strokeWidth="2" fill="none" opacity="0.85" filter="drop-shadow(0 0 8px #eab308)" />

            {/* Storm Clouds */}
            <path d="M 50 40 Q 120 15 200 45 Q 280 10 360 40 Q 450 15 540 45 L 600 0 L 0 0 Z" fill="#0f172a" opacity="0.85" />
            <path d="M 0 60 Q 80 35 170 65 Q 260 30 380 70 Q 480 40 600 65 L 600 0 L 0 0 Z" fill="#1e293b" opacity="0.65" />

            {/* Shoreline Beach Slope on the right */}
            <path d="M 420 240 L 600 130 L 600 240 Z" fill="#451a03" opacity="0.8" />
            <path d="M 440 240 L 600 145 L 600 240 Z" fill="#78350f" opacity="0.5" />

            {/* Dual Red Marine Warning Flags (Gale / Storm Warning) on the Beach */}
            <line x1="530" y1="110" x2="530" y2="180" stroke="#cbd5e1" strokeWidth="3" />
            <polygon points="530,115 570,127 530,140" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            <polygon points="530,145 570,157 530,170" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" />
            {/* Black square centers denoting Extreme Hurricane Force */}
            <rect x="540" y="122" width="10" height="10" fill="#0f172a" />
            <rect x="540" y="152" width="10" height="10" fill="#0f172a" />

            {/* Background Dangerous Swell Wave */}
            <path d="M 0 160 Q 90 90 190 145 T 380 135 T 600 155 L 600 240 L 0 240 Z" fill="url(#surgeDanger)" opacity="0.6" />

            {/* Massive Breaker Wave Crest (Hs) */}
            <path d="M 0 185 Q 120 70 240 140 Q 360 85 480 170 L 600 190 L 600 240 L 0 240 Z" fill="url(#waveFront)" />

            {/* Whitecap Foam & Breaker Spray */}
            <path d="M 80 125 Q 120 70 160 110 Q 200 80 240 140" stroke="#f8fafc" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" filter="drop-shadow(0 0 6px #ffffff)" />
            <path d="M 280 120 Q 330 80 370 125 Q 420 90 470 160" stroke="#f8fafc" strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />

            {/* Sea Foam Bubbles */}
            <circle cx="130" cy="95" r="3.5" fill="#f8fafc" opacity="0.8" />
            <circle cx="155" cy="80" r="2.5" fill="#f8fafc" opacity="0.7" />
            <circle cx="340" cy="90" r="3" fill="#f8fafc" opacity="0.8" />
            <circle cx="370" cy="110" r="4" fill="#f8fafc" opacity="0.85" />
            <circle cx="430" cy="130" r="5" fill="#f8fafc" opacity="0.9" />

            {/* Dangerous Surf Warning Waterline Zone */}
            <line x1="0" y1="215" x2="600" y2="215" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="8 6" />
            <text x="15" y="210" fill="#fca5a5" fontSize="11" fontWeight="bold" fontFamily="monospace">DANGER: SURF ZONE INUNDATION &amp; RIP CURRENTS</text>

            {/* Wave Height Dimension Arrow */}
            <line x1="220" y1="95" x2="220" y2="215" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />
            <text x="230" y="155" fill="#38bdf8" fontSize="13" fontWeight="bold" fontFamily="monospace">
              Hs = {waveHeight.toFixed(1)}m
            </text>
          </svg>
        )}

        {activeVisualMode === 'radar' && (
          /* Marine Doppler Radar Reflectivity Hazard Sweep */
          <div className="relative w-full h-full flex items-center justify-center bg-[#010814]">
            <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
              <defs>
                <radialGradient id="radarSweep" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.4" />
                  <stop offset="90%" stopColor="#ef4444" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#b91c1c" stopOpacity="0.95" />
                </radialGradient>
              </defs>

              {/* Radar concentric rings */}
              <circle cx="300" cy="120" r="30" stroke="#0ea5e9" strokeWidth="1" fill="none" opacity="0.3" />
              <circle cx="300" cy="120" r="65" stroke="#0ea5e9" strokeWidth="1" fill="none" opacity="0.3" />
              <circle cx="300" cy="120" r="105" stroke="#0ea5e9" strokeWidth="1.2" fill="none" opacity="0.4" />
              <circle cx="300" cy="120" r="145" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.6" />

              {/* Crosshair Axes */}
              <line x1="300" y1="0" x2="300" y2="240" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#0ea5e9" strokeWidth="1" opacity="0.3" />

              {/* Squall Doppler Blob near station */}
              <ellipse cx="320" cy="110" rx="90" ry="55" fill="url(#radarSweep)" opacity="0.85" />
              <ellipse cx="340" cy="105" rx="55" ry="32" fill="#ef4444" opacity="0.85" />
              <ellipse cx="345" cy="102" rx="30" ry="18" fill="#b91c1c" opacity="0.95" />

              {/* Radar Rotating Needle */}
              <line x1="300" y1="120" x2="480" y2="40" stroke="#38bdf8" strokeWidth="2.5" opacity="0.9" />

              {/* Target Location Pulse Marker */}
              <circle cx="300" cy="120" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
              <circle cx="300" cy="120" r="14" stroke="#ef4444" strokeWidth="2" fill="none" opacity="0.8" />
              <text x="315" y="135" fill="#f8fafc" fontSize="12" fontWeight="bold" fontFamily="monospace">
                TARGET: {station.stationName.toUpperCase()}
              </text>
              <text x="315" y="150" fill="#fca5a5" fontSize="10" fontFamily="monospace">
                REFLECTIVITY: 55+ dBZ (SEVERE SWELL)
              </text>
            </svg>
          </div>
        )}

        {activeVisualMode === 'inundation' && (
          /* Coastal Inundation Cross-Section Hazard Diagram */
          <svg className="w-full h-full" viewBox="0 0 600 240" preserveAspectRatio="none">
            <rect width="600" height="240" fill="#091424" />

            {/* Sea Floor & Shoreline cross section */}
            <path d="M 0 190 Q 200 190 350 160 T 520 70 L 600 65 L 600 240 L 0 240 Z" fill="#1e293b" />
            <path d="M 350 160 L 520 70 L 600 65 L 600 80 L 520 85 L 350 170 Z" fill="#78350f" opacity="0.8" />

            {/* Normal High Tide Line */}
            <line x1="0" y1="160" x2="350" y2="160" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" opacity="0.7" />
            <text x="10" y="155" fill="#38bdf8" fontSize="10" fontFamily="monospace">Mean High Water Level</text>

            {/* Storm Surge Inundation Level */}
            <path d="M 0 115 Q 180 80 320 120 Q 420 85 480 75 L 600 70 L 600 160 L 0 160 Z" fill="#ef4444" opacity="0.4" />
            <line x1="0" y1="115" x2="480" y2="75" stroke="#ef4444" strokeWidth="2.5" />
            <text x="10" y="105" fill="#ef4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
              EXTREME SURGE FLOOD LIMIT: +{(waveHeight * 0.75).toFixed(1)}m
            </text>

            {/* Hazard Area Highlight on Land */}
            <rect x="470" y="60" width="130" height="60" fill="#ef4444" opacity="0.25" />
            <text x="480" y="90" fill="#fecaca" fontSize="11" fontWeight="bold">ZONE OF IMMEDIATE</text>
            <text x="480" y="105" fill="#fecaca" fontSize="11" fontWeight="bold">EVACUATION</text>
          </svg>
        )}

        {/* MANDATORY DISCLAIMER LABEL (Requirement 6) */}
        <div className="absolute bottom-2.5 right-3 bg-slate-950/85 backdrop-blur-md border border-amber-500/40 px-3 py-1 rounded-lg text-[11px] text-amber-300 font-medium shadow-lg flex items-center gap-1.5 z-10">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Illustrative image – not a live photograph.</span>
        </div>

        {/* Live Condition Tag Overlaid on Visual */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2 z-10">
          <div className="px-2.5 py-1 rounded-lg bg-slate-950/90 border border-white/20 backdrop-blur-md flex items-center gap-1.5 text-xs text-slate-100 font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${isExtreme ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`}></span>
            <span>{station.stationName}</span>
          </div>

          <div className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/60 text-red-300 font-mono text-xs font-bold">
            Hs {waveHeight.toFixed(1)}m | Wind {windSpeed.toFixed(0)} km/h
          </div>
        </div>
      </div>

      {/* DANGEROUS ZONE DATA & SAFETY INSTRUCTIONS (Requirement 5) */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Core Meteorological & Ocean Conditions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-cyan-400" /> Wave Height
            </span>
            <span className="text-base font-bold font-mono text-cyan-300">{waveHeight.toFixed(2)} m</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-amber-400" /> Wind Velocity
            </span>
            <span className="text-base font-bold font-mono text-amber-300">
              {windSpeed.toFixed(0)} km/h ({station.windDirection || 'N'})
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Wave Period
            </span>
            <span className="text-base font-bold font-mono text-sky-300">{station.wavePeriod?.toFixed(1)} s</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-white/5">
            <span className="text-slate-400 block text-[11px] flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-purple-400" /> Barometer
            </span>
            <span className="text-base font-bold font-mono text-purple-300">{station.pressure?.toFixed(1)} hPa</span>
          </div>
        </div>

        {/* Reason for Warning */}
        <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs space-y-1">
          <div className="font-bold text-red-300 flex items-center gap-1.5 uppercase text-[11px]">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Reason for {riskLabel} Hazard Warning:
          </div>
          <p className="text-slate-300 leading-relaxed">
            {prediction?.explanation ||
              `Severe breaking swells with significant wave heights of ${waveHeight.toFixed(1)}m and sustained winds of ${windSpeed.toFixed(0)} km/h are causing violent shore break, dangerous undertow currents, and coastal wash-over along ${station.stationName}.`}
          </p>
        </div>

        {/* Mandatory Safety Instructions */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs space-y-2">
          <div className="font-bold text-slate-100 flex items-center gap-1.5 uppercase text-[11px]">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            Mandatory Coastal Safety Directives:
          </div>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li className="font-medium text-red-300">
              <strong>Avoid the shoreline and beaches immediately:</strong> Danger of sudden rogue waves and strong rip currents.
            </li>
            <li>
              <strong>Do not enter the sea:</strong> Swimming, surfing, recreational boating, and offshore angling are strictly prohibited.
            </li>
            <li>
              <strong>Small Craft Advisory:</strong> Fishing trawlers and harbor vessels must remain moored in sheltered port basins.
            </li>
            <li>
              <strong>Follow official instructions:</strong> Adhere to coastal police, disaster management (NDRF/IMD), and maritime authorities.
            </li>
          </ul>
        </div>

        {/* Provenance & Generation Meta */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>Data Source:</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded border ${
                isLive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              }`}
            >
              {isLive ? 'LIVE DATA' : 'DEMO / SIMULATED'} ({dataSource})
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span>Generated:</span>
            <span className="text-slate-300">{alertTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

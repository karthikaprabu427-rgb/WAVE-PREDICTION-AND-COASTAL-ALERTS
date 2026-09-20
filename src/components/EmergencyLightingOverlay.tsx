import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  Volume2,
  VolumeX,
  CheckCircle2,
  ExternalLink,
  Waves,
  Wind,
} from 'lucide-react';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';

export const EmergencyLightingOverlay: React.FC = () => {
  const {
    activeRiskLevel,
    isHighRisk,
    isExtremeRisk,
    emergencyStation,
    isMuted,
    isAudioBlocked,
    isAcknowledged,
    enableAudio,
    toggleMute,
    acknowledgeAlert,
    openAlertModal,
  } = useEmergencyAlert();

  // If normal or low risk, do not render overlay
  if (!isHighRisk && !isExtremeRisk) {
    return null;
  }

  const isExtreme = isExtremeRisk;
  const locationName = emergencyStation?.stationName || 'Coastal Sector';
  const waveHeight = emergencyStation?.waveHeight?.toFixed(1) || '3.5';
  const windSpeed = emergencyStation?.windSpeed?.toFixed(0) || '45';
  const isLive = emergencyStation?.dataStatus === 'LIVE_DATA';

  return (
    <>
      {/* 1. Subtle vs Prominent Animated Red Lighting Perimeter (Requirement 2) */}
      <div
        className={`fixed inset-0 pointer-events-none z-[80] transition-opacity duration-700 ${
          isExtreme
            ? 'border-[4px] sm:border-[6px] border-red-600/70 shadow-[inset_0_0_80px_rgba(239,68,68,0.35)] animate-pulse'
            : 'border-[2px] sm:border-[3px] border-red-500/40 shadow-[inset_0_0_40px_rgba(239,68,68,0.18)]'
        }`}
      />

      {/* 2. Top Emergency Warning Banner (Fixed at top of screen) */}
      <aside aria-label="Coastal Emergency Warning Banner" className="sticky top-0 z-[85] w-full shadow-2xl">
        <div
          className={`w-full px-4 py-2.5 sm:py-3 transition-colors ${
            isExtreme
              ? 'bg-gradient-to-r from-red-950 via-red-900 to-red-950 border-b-2 border-red-500 text-white'
              : 'bg-gradient-to-r from-slate-950 via-red-950/80 to-slate-950 border-b border-red-600/60 text-slate-100'
          }`}
        >
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Left: Icon & Alert Statement */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div
                className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                  isExtreme ? 'bg-red-600 text-white animate-bounce' : 'bg-red-500/20 text-red-400'
                }`}
              >
                {isExtreme ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase tracking-widest ${
                      isExtreme ? 'bg-red-600 text-white' : 'bg-orange-500 text-slate-950'
                    }`}
                  >
                    {isExtreme ? '🚨 EXTREME HAZARD' : '⚠️ HIGH RISK WARNING'}
                  </span>
                  <span className="text-xs font-bold text-slate-200 truncate">{locationName}</span>
                  {!isLive && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                      DEMO SIMULATION
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 hidden sm:block truncate mt-0.5">
                  Dangerous breaking seas: Wave Height <strong className="text-cyan-300 font-mono">{waveHeight}m</strong>, Wind <strong className="text-amber-300 font-mono">{windSpeed} km/h</strong>. Shoreline evacuation directive in effect.
                </p>
              </div>
            </div>

            {/* Right: Audio Status & Quick Controls */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
              {/* If browser autoplay blocked audio */}
              {isAudioBlocked && (
                <button
                  type="button"
                  onClick={enableAudio}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md animate-pulse"
                >
                  <Volume2 size={14} />
                  <span>Enable Radio Audio</span>
                </button>
              )}

              {/* Mute/Unmute */}
              <button
                id="btn-emergency-banner-mute"
                type="button"
                onClick={toggleMute}
                className="px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/10 text-xs font-semibold text-slate-200 transition flex items-center gap-1.5"
                title={isMuted ? 'Unmute Voice Radio' : 'Mute Voice Radio'}
              >
                {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} className="text-emerald-400" />}
                <span className="hidden lg:inline">{isMuted ? 'Unmute' : 'Mute'}</span>
              </button>

              {/* View Full Visuals Modal */}
              <button
                id="btn-emergency-banner-view"
                type="button"
                onClick={openAlertModal}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/20 text-xs font-bold text-white transition flex items-center gap-1.5"
              >
                <span>Details &amp; Radar</span>
              </button>

              {/* Acknowledge Button */}
              {!isAcknowledged && (
                <button
                  id="btn-emergency-banner-ack"
                  type="button"
                  onClick={acknowledgeAlert}
                  className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider transition shadow-lg flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Acknowledge</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

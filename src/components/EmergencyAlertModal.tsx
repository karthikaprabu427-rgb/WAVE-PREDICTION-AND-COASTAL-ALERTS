import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShieldAlert,
  Waves,
  Wind,
  X,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Radio,
  Play,
  Square,
  Globe,
} from 'lucide-react';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import {
  EMERGENCY_LANGUAGES,
  LANGUAGE_ORDER,
  EmergencyLanguageKey,
  getFiveLanguageHighRiskBroadcasts,
} from '../utils/coastalVoiceBroadcast';
import { DangerousZoneVisualCard } from './DangerousZoneVisualCard';

export const EmergencyAlertModal: React.FC = () => {
  const {
    isModalOpen,
    activeRiskLevel,
    emergencyStation,
    isMuted,
    isAudioBlocked,
    enableAudio,
    toggleMute,
    acknowledgeAlert,
    closeAlertModal,
    voiceState,
    playVoiceAnnouncement,
    playHighRiskRegionalBroadcast,
    stopVoiceAnnouncement,
    testVoiceAnnouncement,
    broadcastAll5Languages,
    setVoiceLanguage,
  } = useEmergencyAlert();

  const [showDetailedVisuals, setShowDetailedVisuals] = useState<boolean>(true);

  if (!isModalOpen || !emergencyStation) return null;

  const isExtreme = activeRiskLevel === 'CRITICAL';
  const locationName = emergencyStation.stationName || 'Coastal Sector';
  const waveHeight = emergencyStation.waveHeight || 3.8;
  const windSpeed = emergencyStation.windSpeed || 45;
  const isLive = emergencyStation.dataStatus === 'LIVE_DATA';

  const selectedLangConfig = voiceState.selectedLanguage
    ? EMERGENCY_LANGUAGES[voiceState.selectedLanguage]
    : null;
  const speakingLangConfig = voiceState.currentSpeakingLanguage
    ? EMERGENCY_LANGUAGES[voiceState.currentSpeakingLanguage]
    : selectedLangConfig;

  const regionalBroadcasts = useMemo(
    () => getFiveLanguageHighRiskBroadcasts(locationName),
    [locationName]
  );
  const activeLangKey = voiceState.currentSpeakingLanguage || voiceState.selectedLanguage;
  const activeRegionalBroadcast = regionalBroadcasts.find((b) => b.lang === activeLangKey);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-2xl rounded-3xl overflow-hidden border shadow-2xl transition-all ${
          isExtreme
            ? 'bg-slate-950 border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] ring-2 ring-red-500/50'
            : 'bg-slate-950 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] ring-1 ring-amber-500/40'
        }`}
      >
        {/* Animated Emergency Top Bar */}
        <div
          className={`px-5 py-3.5 flex items-center justify-between text-white ${
            isExtreme
              ? 'bg-gradient-to-r from-red-600 via-rose-700 to-red-600 animate-pulse'
              : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase block text-white/90">
                COASTAL EMERGENCY ANNOUNCEMENT
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight font-heading">
                {isExtreme ? 'EXTREME RISK DETECTED' : 'HIGH RISK DETECTED'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute/Unmute quick toggle button */}
            <button
              id="btn-modal-toggle-mute"
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-xl bg-black/30 hover:bg-black/50 text-white transition flex items-center gap-1.5 text-xs font-semibold"
              title={isMuted ? 'Unmute Voice Announcement' : 'Mute Voice Announcement'}
            >
              {isMuted ? <VolumeX size={16} className="text-red-300" /> : <Volume2 size={16} className="text-emerald-300" />}
              <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Unmuted'}</span>
            </button>

            {/* Close / Dismiss */}
            <button
              id="btn-modal-close"
              type="button"
              onClick={closeAlertModal}
              className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
              title="Close Dialog"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Audio Blocked Fallback (Requirement 6: Tap Play Announcement to start the emergency broadcast) */}
          {(isAudioBlocked || voiceState.autoplayBlocked) && (
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <VolumeX size={16} className="text-amber-400 shrink-0" />
                <span className="font-semibold text-amber-100">
                  Tap Play Announcement to start the emergency broadcast.
                </span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  await enableAudio();
                  await playVoiceAnnouncement();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition shrink-0 shadow-md flex items-center gap-1"
              >
                <Play size={13} className="fill-current" />
                Play Announcement
              </button>
            </div>
          )}

          {/* Core Warning Facts Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <MapPin size={13} className="text-cyan-400" /> Location
              </span>
              <span className="text-base font-bold text-slate-100 block truncate">{locationName}</span>
              <span className="text-[10px] text-slate-400 block font-mono">{emergencyStation.region || 'Coastline'}</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Waves size={13} className="text-cyan-400" /> Significant Wave Height
              </span>
              <span className="text-xl font-black font-mono text-cyan-300 block">{waveHeight.toFixed(1)} m</span>
              <span className="text-[10px] text-red-400 font-semibold block">Severe swell surge</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 block flex items-center gap-1">
                <Wind size={13} className="text-amber-400" /> Sustained Wind Speed
              </span>
              <span className="text-xl font-black font-mono text-amber-300 block">
                {windSpeed.toFixed(0)} <span className="text-xs font-normal">km/h</span>
              </span>
              <span className="text-[10px] text-amber-400 font-semibold block">Gale force winds</span>
            </div>
          </div>

          {/* Risk Level Badge & Status */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Risk Level:</span>
              <span
                className={`px-3 py-0.5 rounded-full font-black text-xs font-mono tracking-wider uppercase ${
                  isExtreme ? 'bg-red-500 text-slate-950 animate-pulse' : 'bg-orange-500 text-slate-950'
                }`}
              >
                {isExtreme ? 'EXTREME RISK' : 'HIGH RISK'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">Announcement Status:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded font-mono ${
                  voiceState.status === 'Broadcasting…'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {voiceState.status}
              </span>
            </div>
          </div>

          {/* Recommended Safety Action */}
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 space-y-2.5">
            <h3 className="text-xs font-black text-red-300 uppercase tracking-wide flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-400 shrink-0" />
              RECOMMENDED SAFETY ACTION
            </h3>
            <p className="text-xs sm:text-sm font-semibold text-red-100 leading-relaxed">
              Stay away from the shoreline and follow official safety instructions. Please do not enter the sea or go
              near the coastal area during this high-risk period.
            </p>
          </div>

          {/* Coastal Radio Broadcast Voice Control Console */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/40 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <Radio size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-cyan-200 uppercase tracking-wide">
                    📻 COASTAL EMERGENCY BROADCAST
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Spoken voice announcement in 5 regional languages
                  </p>
                </div>
              </div>

              {/* Current Selected Language Pill */}
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[11px] font-mono font-bold">
                {selectedLangConfig.flag} {selectedLangConfig.label}
              </span>
            </div>

            {/* 5 Language Selector Buttons */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-mono block">Select Broadcast Language:</span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {LANGUAGE_ORDER.map((langKey) => {
                  const cfg = EMERGENCY_LANGUAGES[langKey];
                  const isSelected = voiceState.selectedLanguage === langKey;
                  const isSpeakingThis = voiceState.currentSpeakingLanguage === langKey && voiceState.isBroadcasting;
                  return (
                    <button
                      key={langKey}
                      type="button"
                      onClick={() => setVoiceLanguage(langKey)}
                      className={`p-2 rounded-xl border text-left transition text-xs ${
                        isSpeakingThis
                          ? 'bg-red-500/20 border-red-400 text-white animate-pulse'
                          : isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400'
                          : 'bg-black/40 border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className="block font-bold truncate">
                        {cfg.flag} {cfg.nativeName}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-mono">{cfg.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spoken Text Script Box */}
            <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 uppercase block font-bold">
                {speakingLangConfig
                  ? `Spoken Broadcast Message (${speakingLangConfig.name}):`
                  : 'Spoken Broadcast Message (No Language Selected):'}
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                {voiceState.currentBroadcastText
                  ? `"${voiceState.currentBroadcastText}"`
                  : activeRegionalBroadcast
                  ? `"${activeRegionalBroadcast.text}"`
                  : speakingLangConfig
                  ? `"${speakingLangConfig.message}"`
                  : 'Select a language above (Tamil, English, Telugu, Hindi, or Malayalam) to review script and play voice.'}
              </p>
              {activeRegionalBroadcast?.phoneticText && activeRegionalBroadcast.lang !== 'en' && (
                <p className="text-[10px] text-slate-400 font-mono">
                  Phonetic: {activeRegionalBroadcast.phoneticText}
                </p>
              )}
            </div>

            {/* Radio Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {/* Play Announcement */}
              <button
                type="button"
                onClick={async () => {
                  if (!voiceState.selectedLanguage) return;
                  await enableAudio();
                  await playHighRiskRegionalBroadcast(voiceState.selectedLanguage, locationName);
                }}
                disabled={voiceState.isBroadcasting || !voiceState.selectedLanguage}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${
                  voiceState.isBroadcasting || !voiceState.selectedLanguage
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black'
                }`}
              >
                <Play size={13} className="fill-current" />
                <span>Play</span>
              </button>

              {/* Stop Announcement */}
              <button
                type="button"
                onClick={stopVoiceAnnouncement}
                disabled={!voiceState.isBroadcasting}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  voiceState.isBroadcasting
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-500'
                    : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Square size={12} className="fill-current" />
                <span>Stop</span>
              </button>

              {/* Test Voice */}
              <button
                type="button"
                onClick={async () => {
                  await enableAudio();
                  await testVoiceAnnouncement(voiceState.selectedLanguage);
                }}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-1.5"
              >
                <Volume2 size={13} />
                <span>Test Voice</span>
              </button>

              {/* Broadcast in All 5 Languages */}
              <button
                type="button"
                onClick={async () => {
                  await enableAudio();
                  await broadcastAll5Languages(locationName);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  voiceState.isAllLanguagesActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-500 hover:to-orange-500 border-amber-500/40'
                }`}
              >
                <Radio size={13} />
                <span className="truncate">All 5 Langs</span>
              </button>
            </div>
          </div>

          {/* Visual Danger Zone Section Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowDetailedVisuals(!showDetailedVisuals)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white transition"
            >
              <span className="font-bold flex items-center gap-2">
                <span>🌊</span> Dangerous Zone Imagery &amp; Simulation Information
              </span>
              {showDetailedVisuals ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showDetailedVisuals && (
              <div className="mt-3">
                <DangerousZoneVisualCard station={emergencyStation} isExtreme={isExtreme} />
              </div>
            )}
          </div>
        </div>

        {/* Modal Action Buttons: Mute Sound & Acknowledge Alert */}
        <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="btn-modal-mute"
              type="button"
              onClick={toggleMute}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                isMuted
                  ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                  : 'bg-red-950/60 border-red-700 text-red-300 hover:bg-red-900/80'
              }`}
            >
              {isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{isMuted ? 'UNMUTE VOICE' : 'MUTE VOICE'}</span>
            </button>
          </div>

          <button
            id="btn-modal-acknowledge"
            type="button"
            onClick={acknowledgeAlert}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-extrabold text-xs tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 ${
              isExtreme
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/30'
            }`}
          >
            <CheckCircle2 size={16} />
            <span>ACKNOWLEDGE ALERT</span>
          </button>
        </div>
      </div>
    </div>
  );
};

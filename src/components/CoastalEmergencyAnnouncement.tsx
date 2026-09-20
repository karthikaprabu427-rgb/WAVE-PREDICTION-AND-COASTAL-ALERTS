import React, { useState, useMemo, useEffect } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Play,
  Square,
  Sparkles,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Waves,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AudioWaveform,
  Globe,
  Headphones,
} from 'lucide-react';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { useOceanData } from '../context/OceanDataContext';
import {
  EMERGENCY_LANGUAGES,
  LANGUAGE_ORDER,
  EmergencyLanguageKey,
  getFiveLanguageHighRiskBroadcasts,
  coastalVoiceBroadcast,
} from '../utils/coastalVoiceBroadcast';

interface CoastalEmergencyAnnouncementProps {
  forceVisible?: boolean;
}

export const CoastalEmergencyAnnouncement: React.FC<CoastalEmergencyAnnouncementProps> = ({
  forceVisible = false,
}) => {
  const {
    activeRiskLevel,
    isHighRisk,
    isExtremeRisk,
    emergencyStation,
    isMuted,
    toggleMute,
    voiceState,
    playVoiceAnnouncement,
    playHighRiskRegionalBroadcast,
    stopVoiceAnnouncement,
    testVoiceAnnouncement,
    broadcastAll5Languages,
    setVoiceLanguage,
    enableAudio,
  } = useEmergencyAlert();

  const { selectedStation, activePrediction } = useOceanData();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [lastUserAction, setLastUserAction] = useState<string>('');

  const isHazardActive = isHighRisk || isExtremeRisk;

  // If no hazard is active and not forced visible, return null (or render a compact standby pill)
  if (!isHazardActive && !forceVisible) {
    return null;
  }

  const activeStn = emergencyStation || selectedStation;
  const locationName = activeStn?.stationName || 'Marina Beach Coastal Corridor';
  const locationRegion = activeStn?.region || 'Coastline Sector';
  const currentWaveHeight = activeStn?.waveHeight || 3.4;

  // Predicted wave height: from activePrediction if available, or estimated based on swell escalation
  const predictedWaveHeight = activePrediction?.predictedWaveHeight
    ? activePrediction.predictedWaveHeight
    : isExtremeRisk
    ? Math.max(4.5, currentWaveHeight * 1.25)
    : Math.max(3.2, currentWaveHeight * 1.15);

  const alertTime =
    voiceState.lastAnnouncementTime ||
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

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

  // Pre-load all 5 emergency broadcast audio streams into memory to eliminate any silence or delay
  useEffect(() => {
    coastalVoiceBroadcast.preloadBroadcasts(regionalBroadcasts);
  }, [regionalBroadcasts]);

  const activeLangKey = voiceState.currentSpeakingLanguage || voiceState.selectedLanguage;
  const activeRegionalBroadcast = regionalBroadcasts.find((b) => b.lang === activeLangKey);

  const handlePlayAnnouncement = async () => {
    if (!voiceState.selectedLanguage) {
      setLastUserAction('Please select a broadcast language first');
      return;
    }
    setLastUserAction(`Manual Announcement Started (${selectedLangConfig?.name}) for ${locationName}`);
    await enableAudio();
    await playHighRiskRegionalBroadcast(voiceState.selectedLanguage, locationName);
  };

  const handleStopAnnouncement = () => {
    setLastUserAction('Announcement Halted');
    stopVoiceAnnouncement();
  };

  const handleTestVoice = async () => {
    if (!voiceState.selectedLanguage) {
      setLastUserAction('Please select a broadcast language first');
      return;
    }
    setLastUserAction(`Voice Engine Test Running (${selectedLangConfig?.name})`);
    await enableAudio();
    await testVoiceAnnouncement(voiceState.selectedLanguage);
  };

  const handleBroadcastAll = async () => {
    setLastUserAction(`All 5 Regional Languages Sequential Broadcast Started for ${locationName}`);
    await enableAudio();
    await broadcastAll5Languages(locationName);
  };

  return (
    <div
      id="coastal-emergency-announcement-panel"
      className={`rounded-3xl border transition-all duration-300 shadow-2xl overflow-hidden relative ${
        isExtremeRisk
          ? 'bg-gradient-to-b from-red-950/80 via-slate-950 to-slate-950 border-red-500/60 shadow-[0_0_50px_rgba(239,68,68,0.35)] ring-2 ring-red-500/40'
          : isHighRisk
          ? 'bg-gradient-to-b from-amber-950/80 via-slate-950 to-slate-950 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40'
          : 'bg-gradient-to-b from-cyan-950/80 via-slate-950 to-slate-950 border-cyan-500/40 shadow-xl'
      }`}
    >
      {/* Background Radio Transmission Radar Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* 1. Header Bar: Radio Transmission & Status */}
      <div
        className={`px-5 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isExtremeRisk
            ? 'bg-red-950/70 border-red-500/30'
            : isHighRisk
            ? 'bg-amber-950/60 border-amber-500/30'
            : 'bg-cyan-950/60 border-cyan-500/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl border shadow-inner flex items-center justify-center shrink-0 ${
              isExtremeRisk
                ? 'bg-red-500/20 border-red-400 text-red-400 animate-pulse'
                : isHighRisk
                ? 'bg-amber-500/20 border-amber-400 text-amber-400 animate-pulse'
                : 'bg-cyan-500/20 border-cyan-400 text-cyan-400'
            }`}
          >
            <Radio className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-black/40 border border-white/10 text-slate-300">
                📻 COASTAL EMERGENCY BROADCAST
              </span>
              {voiceState.isBroadcasting && (
                <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE ON-AIR
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white flex items-center gap-2 mt-0.5">
              COASTAL EMERGENCY ANNOUNCEMENT
            </h2>
          </div>
        </div>

        {/* Top Controls: Status pill & Audio Mute / Expand Toggle */}
        <div className="flex items-center gap-2">
          {/* Status Indicator */}
          <div
            className={`px-3 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
              voiceState.status === 'Broadcasting…'
                ? 'bg-red-500/20 border-red-500 text-red-300 animate-pulse'
                : voiceState.status === 'Broadcast Completed'
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : voiceState.status === 'Voice unavailable'
                ? 'bg-slate-800 border-slate-700 text-slate-400'
                : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                voiceState.status === 'Broadcasting…'
                  ? 'bg-red-400 animate-ping'
                  : voiceState.status === 'Broadcast Completed'
                  ? 'bg-emerald-400'
                  : 'bg-cyan-400'
              }`}
            />
            <span>Status: {voiceState.status}</span>
          </div>

          {/* Mute Voice Audio */}
          <button
            id="btn-announcement-toggle-mute"
            type="button"
            onClick={toggleMute}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
              isMuted
                ? 'bg-red-950/50 border-red-500 text-red-300 hover:bg-red-900/60'
                : 'bg-slate-900/80 border-slate-700 text-slate-200 hover:bg-slate-800'
            }`}
            title={isMuted ? 'Unmute Spoken Voice Announcement' : 'Mute Spoken Voice Announcement'}
          >
            {isMuted ? <VolumeX size={16} className="text-red-400" /> : <Volume2 size={16} className="text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Unmuted'}</span>
          </button>

          {/* Expand/Collapse */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 hover:bg-slate-800 text-slate-300 transition"
            title={isExpanded ? 'Collapse Announcement' : 'Expand Announcement'}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Autoplay Blocked Banner (Browser Audio Autoplay Handling) */}
      {voiceState.autoplayBlocked && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 p-3 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <VolumeX className="w-5 h-5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-100 text-sm">
              Tap Play Announcement to start the emergency broadcast.
            </span>
          </div>
          <button
            type="button"
            onClick={handlePlayAnnouncement}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 transition shadow-lg shrink-0 flex items-center gap-1.5"
          >
            <Play size={14} className="fill-current" />
            Start Voice Broadcast
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-6">
          {/* 1. Mandatory Data Grid: Risk Level, Wave Height, Predicted Wave Height, Location, Alert Time */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. Current Risk Level */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Current Risk Level
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono tracking-wider uppercase inline-block ${
                    isExtremeRisk
                      ? 'bg-red-500 text-slate-950 animate-pulse'
                      : isHighRisk
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-cyan-500 text-slate-950'
                  }`}
                >
                  {isExtremeRisk ? 'EXTREME RISK' : isHighRisk ? 'HIGH RISK' : activeRiskLevel}
                </span>
              </div>
            </div>

            {/* 2. Wave Height */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Waves size={13} className="text-cyan-400" /> Wave Height (Hs)
              </span>
              <span className="text-2xl font-black font-mono text-cyan-300 block">
                {currentWaveHeight.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">m</span>
              </span>
            </div>

            {/* 3. Predicted Wave Height */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles size={13} className="text-sky-400" /> Predicted Wave Height
              </span>
              <span className="text-2xl font-black font-mono text-sky-300 block">
                {predictedWaveHeight.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400 font-sans">m</span>
              </span>
            </div>

            {/* 4. Affected Location */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <MapPin size={13} className="text-amber-400" /> Location
              </span>
              <span className="text-sm font-bold text-slate-100 block truncate" title={locationName}>
                {locationName}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">{locationRegion}</span>
            </div>

            {/* 5. Alert Time */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center gap-1">
                <Clock size={13} className="text-emerald-400" /> Alert Time
              </span>
              <span className="text-base font-bold font-mono text-emerald-300 block">{alertTime}</span>
              <span className="text-[10px] text-slate-400 font-mono block">Real-time Telemetry</span>
            </div>
          </div>

          {/* 2. Recommended Safety Action Card */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isExtremeRisk
                ? 'bg-red-950/40 border-red-500/40 text-red-100'
                : 'bg-amber-950/40 border-amber-500/40 text-amber-100'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                isExtremeRisk ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}
            >
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-amber-400 block">
                RECOMMENDED SAFETY ACTION
              </span>
              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                Stay away from the shoreline and follow official safety instructions. Please do not enter the sea or go
                near the coastal area during this high-risk period. Move to higher ground inland immediately.
              </p>
            </div>
          </div>

          {/* 3. Coastal Radio Broadcast Audio Console */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-4 shadow-inner">
            {/* Console Subheader */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Headphones className="w-5 h-5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                    Multi-Language Radio Voice Broadcast System
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Female Voice
                    </span>
                    <span className="text-[11px] text-cyan-300 font-mono bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md">
                      Slow &amp; Clear Articulation
                    </span>
                    <span className="text-[11px] text-amber-300 font-mono bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-400" />
                      Authentic Native Slang (இயல்பான பேச்சு / వాడుక భాష / സാധാരണ ശൈലി)
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Selected Language Pill */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Selected Language:</span>
                <span className="px-2.5 py-1 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 font-bold font-mono">
                  {selectedLangConfig
                    ? `${selectedLangConfig.flag} ${selectedLangConfig.label}`
                    : 'None Selected (Choose Below)'}
                </span>
              </div>
            </div>

            {/* Error or voice unavailable message pill */}
            {voiceState.errorMessage && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400 shrink-0" />
                <span>{voiceState.errorMessage}</span>
              </div>
            )}

            {/* 5 Language Buttons Selector */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
                <Globe size={14} className="text-cyan-400" />
                Select Emergency Broadcast Language (5 Options):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {LANGUAGE_ORDER.map((langKey) => {
                  const cfg = EMERGENCY_LANGUAGES[langKey];
                  const isSelected = voiceState.selectedLanguage === langKey;
                  const isSpeakingThis = voiceState.currentSpeakingLanguage === langKey && voiceState.isBroadcasting;

                  return (
                    <button
                      key={langKey}
                      id={`btn-select-lang-${langKey}`}
                      type="button"
                      onClick={() => setVoiceLanguage(langKey)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                        isSpeakingThis
                          ? 'bg-red-500/20 border-red-400 text-white ring-2 ring-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
                          : isSelected
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 shadow-md ring-1 ring-cyan-400'
                          : 'bg-slate-950/60 border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base">{cfg.flag}</span>
                        {isSpeakingThis ? (
                          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                        ) : isSelected ? (
                          <CheckCircle2 size={14} className="text-cyan-400" />
                        ) : null}
                      </div>
                      <div className="mt-1">
                        <span className="text-xs font-bold block">{cfg.nativeName}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">{cfg.name}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Spoken Announcement Text Display Card */}
            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Volume2 size={14} />
                  {speakingLangConfig
                    ? `Voice Script (${speakingLangConfig.name} – ${speakingLangConfig.nativeName}):`
                    : 'Voice Script (No Language Selected):'}
                </span>
                {voiceState.isBroadcasting && (
                  <span className="text-[10px] font-mono text-red-400 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    Transmitting Over Beach Speakers &amp; Radio Net
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-100 leading-relaxed font-sans italic p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                {voiceState.currentBroadcastText
                  ? `"${voiceState.currentBroadcastText}"`
                  : activeRegionalBroadcast
                  ? `"${activeRegionalBroadcast.text}"`
                  : speakingLangConfig
                  ? `"${speakingLangConfig.message}"`
                  : 'Please select one of the 5 emergency broadcast languages above (Tamil, English, Telugu, Hindi, or Malayalam) to review the script and start voice transmission.'}
              </p>
              {activeRegionalBroadcast?.phoneticText && activeRegionalBroadcast.lang !== 'en' && (
                <p className="text-[11px] text-slate-400 font-mono">
                  Phonetic: {activeRegionalBroadcast.phoneticText}
                </p>
              )}
            </div>

            {/* Radio Broadcast Control Action Buttons (Requirement 5) */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* 1. Play Announcement Button */}
              <button
                id="btn-broadcast-play"
                type="button"
                onClick={handlePlayAnnouncement}
                disabled={voiceState.isBroadcasting}
                className={`flex-1 sm:flex-initial px-5 py-3 rounded-2xl font-black text-xs tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 ${
                  voiceState.isBroadcasting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : isExtremeRisk
                    ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold shadow-cyan-500/30'
                }`}
              >
                <Play size={15} className="fill-current" />
                <span>Play Announcement</span>
              </button>

              {/* 2. Stop Announcement Button */}
              <button
                id="btn-broadcast-stop"
                type="button"
                onClick={handleStopAnnouncement}
                disabled={!voiceState.isBroadcasting}
                className={`px-4 py-3 rounded-2xl font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2 border ${
                  voiceState.isBroadcasting
                    ? 'bg-red-600 hover:bg-red-500 text-white border-red-500 shadow-lg shadow-red-600/20'
                    : 'bg-slate-900/60 border-white/10 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Square size={14} className="fill-current" />
                <span>Stop Announcement</span>
              </button>

              {/* 3. Test Voice Button */}
              <button
                id="btn-broadcast-test-voice"
                type="button"
                onClick={handleTestVoice}
                className="px-4 py-3 rounded-2xl font-bold text-xs tracking-wider uppercase bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Volume2 size={15} />
                <span>Test Voice</span>
              </button>

              {/* 4. Broadcast in All 5 Languages Button */}
              <button
                id="btn-broadcast-all-5-languages"
                type="button"
                onClick={handleBroadcastAll}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase transition shadow-xl flex items-center justify-center gap-2 border ${
                  voiceState.isAllLanguagesActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                    : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-500/50'
                }`}
              >
                <Radio size={15} />
                <span>Broadcast in All 5 Languages</span>
              </button>
            </div>

            {/* Stepper indicator if All 5 Languages Broadcast is active */}
            {voiceState.isAllLanguagesActive && (
              <div className="p-3 rounded-xl bg-black/40 border border-amber-500/40 space-y-2 animate-fadeIn">
                <div className="flex items-center justify-between text-xs text-amber-300 font-bold font-mono">
                  <span>5-Language Sequential Relay in Progress</span>
                  <span>Step {voiceState.currentLanguageIndex + 1} of 5</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {LANGUAGE_ORDER.map((lKey, idx) => {
                    const cfg = EMERGENCY_LANGUAGES[lKey];
                    const isDone = idx < voiceState.currentLanguageIndex;
                    const isCurrent = idx === voiceState.currentLanguageIndex;
                    return (
                      <div
                        key={lKey}
                        className={`p-1.5 rounded-lg border text-center text-[10px] font-mono font-bold transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                            : isDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-900 text-slate-500 border-white/5'
                        }`}
                      >
                        {cfg.flag} {cfg.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

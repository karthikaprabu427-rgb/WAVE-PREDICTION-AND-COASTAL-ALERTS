import React, { useState } from 'react';
import {
  Radio,
  Volume2,
  VolumeX,
  Square,
  SkipForward,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { usePublicAnnouncer } from '../context/PublicAnnouncerContext';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { emergencyAudio } from '../utils/emergencyAudio';
import { coastalVoiceBroadcast, localizeCoastalLocation } from '../utils/coastalVoiceBroadcast';

export const LiveRadioBroadcastBanner: React.FC = () => {
  const {
    isBroadcasting,
    isSpeaking,
    lineByLineStatus,
    stopBroadcast,
    skipToNextLanguage,
    startAllLanguagesBroadcast,
  } = usePublicAnnouncer();

  const { activeRiskLevel, emergencyStation } = useEmergencyAlert();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isBroadcasting && !lineByLineStatus) {
    return null;
  }

  const languagesList = [
    { id: 'ta', label: 'தமிழ்', name: 'Tamil', flag: '🇮🇳' },
    { id: 'en', label: 'English', name: 'English', flag: '🌐' },
    { id: 'te', label: 'తెలుగు', name: 'Telugu', flag: '🇮🇳' },
    { id: 'hi', label: 'हिन्दी', name: 'Hindi', flag: '🇮🇳' },
    { id: 'ml', label: 'മലയാളം', name: 'Malayalam', flag: '🇮🇳' },
  ];

  const currentIndex = lineByLineStatus?.currentIndex ?? 0;
  const currentLang = lineByLineStatus?.currentLang ?? 'ta';
  const currentText = lineByLineStatus?.currentText ?? '';
  const rawLocation = lineByLineStatus?.location || emergencyStation?.stationName || 'Marina Beach Coastal Region';
  const location = localizeCoastalLocation(rawLocation, currentLang as any).native;

  const handleRestart = async () => {
    await emergencyAudio.unlock();
    await startAllLanguagesBroadcast({
      location,
      hazardType: activeRiskLevel === 'CRITICAL' ? 'TSUNAMI' : 'HIGH_WAVE',
      playAudioOutLoud: true,
    });
  };

  const handleForcePlayVoice = async () => {
    await emergencyAudio.unlock();
    await coastalVoiceBroadcast.unlockUserGesture();
    const targetLang = (lineByLineStatus?.currentLang as any) || 'en';
    await coastalVoiceBroadcast.playEmergencyAnnouncement(targetLang);
  };

  // Ultra-compact minimized floating top bar
  if (isMinimized) {
    return (
      <aside
        id="live-coastal-radio-top-bar-minimized"
        aria-label="Coastal Emergency Radio Broadcast (Minimized)"
        className="sticky top-0 z-50 w-full bg-slate-950/95 border-b border-red-500/60 px-3 sm:px-6 py-1.5 shadow-md backdrop-blur-xl flex items-center justify-between gap-2 text-white text-xs"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-mono font-bold text-red-300 uppercase tracking-wider text-[10px] shrink-0">
            VHF 16
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="font-semibold text-cyan-300 truncate max-w-[140px] sm:max-w-[260px]">
            {location}
          </span>
          <span className="text-amber-300 font-mono text-[11px] font-bold shrink-0">
            ({currentIndex + 1}/5 {languagesList[currentIndex]?.name})
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-radio-force-play-min"
            type="button"
            onClick={handleForcePlayVoice}
            className="px-2 py-0.5 rounded-md bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/50 transition flex items-center gap-1 text-[11px]"
            title="Play voice speaker audio"
          >
            <Volume2 size={12} className={isSpeaking ? 'animate-pulse text-cyan-400' : ''} />
            <span className="hidden sm:inline">Play Voice</span>
          </button>

          <button
            id="btn-radio-maximize"
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-md bg-slate-800 text-slate-300 hover:text-white transition"
            title="Expand radio broadcast controls"
          >
            <ChevronDown size={13} />
          </button>

          <button
            id="btn-radio-silence-min"
            type="button"
            onClick={stopBroadcast}
            className="p-1 rounded-md bg-red-600/30 text-red-300 hover:bg-red-600/50 transition"
            title="Silence radio"
          >
            <Square size={11} />
          </button>
        </div>
      </aside>
    );
  }

  // Standard Compact Top Option Bar (Takes minimal vertical space, never disturbs the screen)
  return (
    <aside
      id="live-coastal-radio-top-bar"
      aria-label="Coastal Emergency Radio Broadcast Top Option"
      className="sticky top-0 z-50 w-full bg-slate-950/95 border-b-2 border-red-500 shadow-[0_4px_25px_rgba(0,0,0,0.85)] backdrop-blur-2xl px-3 sm:px-6 py-2 text-white transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        {/* Left: Radio Station & Region Identity */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-600 text-white shadow-md shadow-red-600/50 shrink-0">
              <Radio size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-[10px] font-mono font-extrabold text-red-300 uppercase tracking-widest">
                  COASTAL RADIO BROADCAST • VHF 16
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-200 font-semibold">
                <MapPin size={11} className="text-cyan-400" />
                <span className="text-cyan-300 font-bold truncate max-w-[180px] sm:max-w-[260px]">{location}</span>
                <span className="text-slate-400 text-[11px]">• High Risk Notice</span>
              </div>
            </div>
          </div>

          {/* Quick Mobile Controls */}
          <div className="flex items-center gap-1.5 md:hidden">
            <button
              id="btn-radio-force-play-mobile"
              type="button"
              onClick={handleForcePlayVoice}
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1"
              title="Play Voice Audio"
            >
              <Volume2 size={13} className={isSpeaking ? 'animate-pulse' : ''} />
              <span className="text-[10px]">Play Voice</span>
            </button>
            <button
              id="btn-radio-skip-mobile"
              type="button"
              onClick={skipToNextLanguage}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-bold transition"
              title="Next Language"
            >
              <SkipForward size={13} />
            </button>
            <button
              id="btn-radio-stop-mobile"
              type="button"
              onClick={stopBroadcast}
              className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-bold transition"
              title="Stop Broadcast"
            >
              <Square size={12} />
            </button>
          </div>
        </div>

        {/* Center: Language Pills & Spoken Line Preview */}
        <div className="flex-1 max-w-2xl flex flex-col gap-1 md:px-4">
          {/* 5 Languages Progress Stepper */}
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
            {languagesList.map((lang, idx) => {
              const isCurrent = idx === currentIndex && isBroadcasting;
              const isFinished = idx < currentIndex;
              return (
                <div
                  key={lang.id}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-red-600/40 border-red-400 text-white ring-1 ring-red-400 animate-pulse'
                      : isFinished
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px]">{lang.flag}</span>
                  <span>{lang.label}</span>
                  {isCurrent && <Volume2 size={11} className="text-amber-300 animate-bounce" />}
                  {isFinished && <span className="text-emerald-400 text-[9px]">✓</span>}
                </div>
              );
            })}
          </div>

          {/* Spoken Text Ticker */}
          <div className="flex items-center gap-2 text-xs bg-slate-900/70 border border-slate-800 rounded-lg px-2.5 py-1">
            <span className="text-amber-300 font-mono font-bold text-[10px] uppercase shrink-0">
              Line {currentIndex + 1}/5 ({languagesList[currentIndex]?.name}):
            </span>
            <p className="text-slate-100 font-medium truncate text-[11px] sm:text-xs">
              {currentText || 'Broadcasting warning to stay away from the ocean today...'}
            </p>
          </div>
        </div>

        {/* Right: Audio Control Actions */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0">
          <button
            id="btn-radio-force-play"
            type="button"
            onClick={handleForcePlayVoice}
            className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
            title="Hear speaker announcement out loud"
          >
            <Volume2 size={13} className={isSpeaking ? 'animate-pulse' : ''} />
            <span>{isSpeaking ? 'Speaking...' : 'Play Voice'}</span>
          </button>

          <button
            id="btn-radio-skip-lang"
            type="button"
            onClick={skipToNextLanguage}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1 border border-slate-700"
            title="Skip to next regional language line"
          >
            <SkipForward size={13} />
            <span className="hidden lg:inline">Next</span>
          </button>

          <button
            id="btn-radio-restart"
            type="button"
            onClick={handleRestart}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold transition flex items-center gap-1 border border-slate-700"
            title="Replay from line 1"
          >
            <RotateCcw size={12} />
          </button>

          <button
            id="btn-radio-minimize"
            type="button"
            onClick={() => setIsMinimized(true)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition border border-slate-700"
            title="Minimize top radio bar to floating pill"
          >
            <ChevronUp size={13} />
          </button>

          <button
            id="btn-radio-stop"
            type="button"
            onClick={stopBroadcast}
            className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm shadow-red-600/30"
            title="Silence Broadcast"
          >
            <Square size={11} />
            <span>Stop</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

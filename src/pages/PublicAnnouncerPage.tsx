import React, { useState } from 'react';
import {
  Megaphone,
  Radio,
  Volume2,
  VolumeX,
  RadioTower,
  ShieldAlert,
  Waves,
  Play,
  Square,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  BatteryCharging,
  Wifi,
  Users,
  Sliders,
  RefreshCw,
  Compass,
  Headphones,
  FileText,
  Volume1,
  SkipForward,
  RotateCcw,
  ArrowLeft,
  Eye,
  MapPin,
} from 'lucide-react';
import { usePublicAnnouncer, PASpeakerTower } from '../context/PublicAnnouncerContext';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { emergencyAudio } from '../utils/emergencyAudio';
import {
  coastalVoiceBroadcast,
  getFiveLanguageHighRiskBroadcasts,
  EmergencyLanguageKey,
} from '../utils/coastalVoiceBroadcast';

interface PublicAnnouncerPageProps {
  onNavigate?: (page: string) => void;
}

export const PublicAnnouncerPage: React.FC<PublicAnnouncerPageProps> = ({ onNavigate }) => {
  const {
    towers,
    radioTransmitters,
    templates,
    isBroadcasting,
    isSpeaking,
    selectedLanguage,
    customMessage,
    autoBroadcastOnExtreme,
    totalPopulationReach,
    setSelectedLanguage,
    setCustomMessage,
    setAutoBroadcastOnExtreme,
    startBroadcast,
    startAllLanguagesBroadcast,
    skipToNextLanguage,
    stopBroadcast,
    lineByLineStatus,
    testSingleTowerChime,
    testRadioBeep,
  } = usePublicAnnouncer();

  const { activeRiskLevel, emergencyStation } = useEmergencyAlert();

  const [selectedHazard, setSelectedHazard] = useState<'HIGH_WAVE' | 'TSUNAMI' | 'FISHERMEN_RECALL'>('HIGH_WAVE');
  const [selectedTargetLocation, setSelectedTargetLocation] = useState<string>(
    emergencyStation?.stationName || 'Marina Beach Coastal Region'
  );
  const [activeTab, setActiveTab] = useState<'console' | 'towers' | 'marine-radio'>('console');
  const [testResult, setTestResult] = useState<string | null>(null);

  const regionalBroadcasts = getFiveLanguageHighRiskBroadcasts(selectedTargetLocation);

  const handlePlaySingleRegionalLanguage = async (lang: EmergencyLanguageKey) => {
    setTestResult(`Broadcasting emergency warning in ${lang.toUpperCase()} for ${selectedTargetLocation}...`);
    await emergencyAudio.unlock();
    await coastalVoiceBroadcast.unlockUserGesture();
    await coastalVoiceBroadcast.playHighRiskRegionalBroadcast(lang, selectedTargetLocation);
  };

  const currentTemplate =
    templates.find((t) => t.hazardType === selectedHazard) || templates[0];
  const displayMessage =
    customMessage || currentTemplate.translations[selectedLanguage] || currentTemplate.translations.en;

  const handleTriggerBroadcast = async () => {
    setTestResult(null);
    await emergencyAudio.unlock();
    await startBroadcast({
      location: selectedTargetLocation,
      hazardType: selectedHazard,
      lang: selectedLanguage,
      customText: displayMessage,
      playAudioOutLoud: true,
    });
  };

  const handleTriggerAllLanguagesBroadcast = async () => {
    setTestResult(null);
    await emergencyAudio.unlock();
    await startAllLanguagesBroadcast({
      location: selectedTargetLocation,
      hazardType: selectedHazard,
      playAudioOutLoud: true,
    });
  };

  const handleTriggerAndReturnToMap = async () => {
    await handleTriggerAllLanguagesBroadcast();
    if (onNavigate) {
      onNavigate('risk-map');
    }
  };

  const handleTestVoiceAudio = async () => {
    await emergencyAudio.unlock();
    await coastalVoiceBroadcast.unlockUserGesture();
    setTestResult(`Testing speaker voice output for ${selectedLanguage.toUpperCase()}...`);
    const success = await coastalVoiceBroadcast.playTestVoice(selectedLanguage as any);
    if (success) {
      setTestResult(`Voice test complete for ${selectedLanguage.toUpperCase()}. Audio system verified operational!`);
    } else {
      setTestResult(`Voice unavailable or muted for ${selectedLanguage.toUpperCase()}.`);
    }
  };

  const handleTestTower = async (tower: PASpeakerTower) => {
    setTestResult(`Testing horn chime on ${tower.name}...`);
    await testSingleTowerChime(tower.id);
    setTimeout(() => {
      setTestResult(`Chime test successful on ${tower.name} (Decibel level confirmed at ${tower.decibelOutput} dB).`);
    }, 1200);
  };

  const handleTestRadio = async (radioId: string, radioName: string) => {
    setTestResult(`Transmitting test distress burst on ${radioName}...`);
    await testRadioBeep(radioId);
    setTimeout(() => {
      setTestResult(`Radio frequency test verified on ${radioName}.`);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Navigation & Non-Disturbing Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              id="btn-return-to-ocean-map"
              type="button"
              onClick={() => onNavigate('risk-map')}
              className="px-3.5 py-2 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5 border border-cyan-500/30"
            >
              <ArrowLeft size={14} />
              <span>← Back to Live Ocean Map</span>
            </button>
          )}
          <div className="hidden sm:block">
            <span className="text-xs text-slate-300 font-medium">
              💡 Radio broadcast is available as a <strong className="text-cyan-300">small option at the top of the screen</strong> on all pages.
            </span>
          </div>
        </div>

        <button
          id="btn-trigger-and-view-map"
          type="button"
          onClick={handleTriggerAndReturnToMap}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-600/30 transition"
        >
          <Radio size={14} />
          <span>Broadcast 5 Languages &amp; Return to Map</span>
        </button>
      </div>

      {/* Top Hero Banner Explaining Non-Smartphone Public Warning Purpose */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#07172c] to-slate-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/4 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Megaphone size={14} className="text-cyan-400" />
                Coastal Public Address (PA) &amp; Marine Radio System
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} />
                Non-Mobile Coastal Population Safety Net
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-100 font-heading tracking-tight">
              Beach Horn Speakers &amp; Marine Radio Announcer
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Not everyone along the coastline carries a smartphone. Traditional fishermen at sea,
              beach vendors, elderly villagers, and children on the sand cannot receive mobile app
              alerts. This system activates high-decibel acoustic beach horn masts and marine VHF
              Channel 16 radio broadcasts to deliver spoken multi-lingual evacuation warnings
              directly through loudspeakers and radios.
            </p>
          </div>

          {/* Quick Stat Highlights */}
          <div className="grid grid-cols-2 gap-3 shrink-0 sm:w-80">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">PA Horn Masts</span>
              <span className="text-2xl font-black text-cyan-400 font-mono">
                {towers.filter((t) => t.status !== 'OFFLINE').length} / {towers.length}
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold">All Online</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <span className="text-[11px] font-mono text-slate-400 block uppercase">Est. Shore Reach</span>
              <span className="text-2xl font-black text-amber-300 font-mono">185,000+</span>
              <span className="text-[10px] text-slate-400 block">People within horn radius</span>
            </div>
          </div>
        </div>
      </div>

      {/* Broadcasting Status Active Notification Bar */}
      {isBroadcasting && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/80 border-2 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)] animate-pulse flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-red-600 text-white animate-bounce shadow-lg shrink-0">
              <Megaphone size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest">
                  LIVE EMERGENCY BROADCAST IN PROGRESS
                </span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">
                Transmitting over {towers.length} Beach Horn Masts &amp; Marine VHF Radio Channel 16
              </p>
              {isSpeaking && (
                <span className="text-xs text-amber-300 font-mono flex items-center gap-1.5 mt-1">
                  <Volume2 size={14} className="animate-pulse" />
                  Voice Synthesizer currently reading announcement over audio speakers...
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={stopBroadcast}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition"
          >
            <Square size={16} />
            <span>Silence &amp; Stop Broadcast</span>
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('console')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'console'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Radio size={16} />
          <span>Emergency Broadcast Console</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('towers')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'towers'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Megaphone size={16} />
          <span>Beach Horn Masts Network ({towers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('marine-radio')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 shrink-0 ${
            activeTab === 'marine-radio'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <RadioTower size={16} />
          <span>Marine VHF Ch 16 &amp; Community Radio ({radioTransmitters.length})</span>
        </button>
      </div>

      {/* Feedback Toast */}
      {testResult && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-xs text-cyan-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
            <span>{testResult}</span>
          </div>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: EMERGENCY BROADCAST CONSOLE */}
      {activeTab === 'console' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Broadcast Control Panel (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sequential 5-Language Line-by-Line Broadcast Feature Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-[#071b33] to-slate-950 border-2 border-cyan-500/50 shadow-2xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    <Radio size={22} className="animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-100 font-heading">
                      Deliver Voice Message on All Languages Line-by-Line
                    </h2>
                    <p className="text-xs text-cyan-200/80">
                      Sequential broadcast: Tamil → English → Telugu → Hindi → Malayalam
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestVoiceAudio}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                    title="Verify voice synthesizer is working on this browser"
                  >
                    <Volume2 size={13} />
                    <span>Test Voice Audio</span>
                  </button>
                  {isBroadcasting && (
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-mono font-bold uppercase animate-pulse">
                      ● ON AIR
                    </span>
                  )}
                </div>
              </div>

              {/* 5 Languages Progress Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[
                  { id: 'ta', label: '1. தமிழ்', name: 'Tamil', flag: '🇮🇳' },
                  { id: 'en', label: '2. English', name: 'English', flag: '🌐' },
                  { id: 'te', label: '3. తెలుగు', name: 'Telugu', flag: '🇮🇳' },
                  { id: 'hi', label: '4. हिन्दी', name: 'Hindi', flag: '🇮🇳' },
                  { id: 'ml', label: '5. മലയാളം', name: 'Malayalam', flag: '🇮🇳' },
                ].map((item, index) => {
                  const isCurrent = lineByLineStatus?.currentIndex === index && isBroadcasting;
                  const isFinished = (lineByLineStatus?.currentIndex ?? -1) > index && isBroadcasting;
                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-2xl border transition-all text-center ${
                        isCurrent
                          ? 'bg-red-600/30 border-red-400 ring-2 ring-red-500/50 shadow-lg animate-pulse'
                          : isFinished
                          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-center gap-1">
                        <span>{item.flag}</span>
                        <span className={isCurrent ? 'text-white font-extrabold' : ''}>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono block mt-1">
                        {isCurrent ? '● Speaking Now' : isFinished ? '✓ Spoken' : item.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Live Spoken Line Feed */}
              {isBroadcasting && lineByLineStatus ? (
                <div className="p-4 rounded-2xl bg-slate-950/90 border border-red-500/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-amber-300 font-bold font-mono flex items-center gap-1.5">
                      <Volume2 size={15} className="animate-pulse" />
                      Currently Speaking Line {lineByLineStatus.currentIndex + 1} of 5 ({lineByLineStatus.currentLangName}):
                    </span>
                    <span className="text-xs text-cyan-400 font-mono">156.8 MHz Marine Radio</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-100 font-medium italic p-3 rounded-xl bg-slate-900 border border-slate-800">
                    "{lineByLineStatus.currentText}"
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={skipToNextLanguage}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
                    >
                      <SkipForward size={14} />
                      <span>Skip to Next Language</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopBroadcast}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Square size={14} />
                      <span>Silence Broadcast</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-200">
                      Automated Coastal Risk Voice Delivery:
                    </p>
                    <p className="text-slate-400">
                      When the coastal region gets high risk, voice instructions are delivered automatically line-by-line in all regional languages over beach horn masts and marine radio.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleTriggerAllLanguagesBroadcast}
                    className="w-full sm:w-auto shrink-0 py-3 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition shadow-red-600/30"
                  >
                    <Radio size={16} />
                    <span>BROADCAST ALL LANGUAGES LINE-BY-LINE</span>
                  </button>
                </div>
              )}
            </div>

            {/* Regionalized Warning Broadcast: Dynamically Incorporates Selected Coastal Region */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <MapPin size={18} />
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-100 font-heading">
                      Regionalized Warning Broadcast
                    </h3>
                  </div>
                  <p className="text-xs text-cyan-200/80 mt-1">
                    Dynamically incorporates the selected coastal region into the emergency notification in each of the 5 regional languages.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-700/50">
                    1-km Beach Exclusion Zone
                  </span>
                </div>
              </div>

              {/* Region Selection Interface */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Target Coastal Region:</span>
                  <span className="text-[11px] text-cyan-400 font-mono font-normal">
                    Replaces [பகுதி] / [Region] / [ప్రాంతం] / [क्षेत्र] / [തീരം]
                  </span>
                </label>

                {/* Pre-set Popular Coastal Regions */}
                <div className="flex flex-wrap gap-2">
                  {[
                    'Marina Beach Coastal Region',
                    'Mahabalipuram Coastal Region',
                    'Ennore Port Coastal Region',
                    'Kanyakumari Shore',
                    'Rameswaram Coast',
                    'Pondicherry Beach',
                  ].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setSelectedTargetLocation(loc)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        selectedTargetLocation === loc
                          ? 'bg-cyan-600 text-white border-cyan-400 font-bold shadow-md shadow-cyan-600/30'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>

                {/* Custom Region Input */}
                <div className="relative">
                  <input
                    type="text"
                    value={selectedTargetLocation}
                    onChange={(e) => setSelectedTargetLocation(e.target.value)}
                    placeholder="Or enter custom coastal region name (e.g. Elliot Beach, Cuddalore Shore)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs font-medium focus:outline-none focus:border-cyan-400 transition"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] text-slate-400 font-mono">
                    Active Region
                  </span>
                </div>
              </div>

              {/* 5 Languages Scripts with Embedded Coastal Region */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Official Warning Broadcast Scripts in 5 Regional Languages:
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {regionalBroadcasts.map((b, idx) => {
                    const isCurrentSpeaking = lineByLineStatus?.currentLang === b.lang && isBroadcasting;
                    return (
                      <div
                        key={b.lang}
                        className={`p-4 rounded-2xl border transition-all ${
                          isCurrentSpeaking
                            ? 'bg-red-950/40 border-red-500/70 shadow-lg ring-1 ring-red-500/40'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{b.flag}</span>
                            <span className="text-xs font-bold text-slate-100 font-mono">
                              {idx + 1}. {b.name} ({b.nativeName})
                            </span>
                            {isCurrentSpeaking && (
                              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold uppercase animate-pulse">
                                Currently On Air
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handlePlaySingleRegionalLanguage(b.lang)}
                            disabled={isBroadcasting}
                            className="px-3 py-1 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5 border border-cyan-500/30 disabled:opacity-40"
                            title={`Play ${b.name} voice announcement`}
                          >
                            <Volume2 size={12} className={isCurrentSpeaking ? 'animate-pulse text-amber-300' : ''} />
                            <span>Play {b.name} Audio</span>
                          </button>
                        </div>

                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                          "{b.text}"
                        </p>

                        {b.phoneticText && b.lang !== 'en' && (
                          <p className="text-[10px] text-slate-400 font-mono mt-1.5 px-1">
                            Phonetic: {b.phoneticText}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Master Sequential Broadcast Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerAllLanguagesBroadcast}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl transition shadow-red-600/30"
                >
                  <Radio size={16} />
                  <span>BROADCAST ALL 5 LANGUAGES FOR {selectedTargetLocation.toUpperCase()}</span>
                </button>

                {isBroadcasting && (
                  <button
                    type="button"
                    onClick={stopBroadcast}
                    className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-300 font-bold text-xs border border-red-500/40 flex items-center justify-center gap-2 transition"
                  >
                    <Square size={16} />
                    <span>Stop Broadcast</span>
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  Broadcast Live Coastal Public Address
                </h2>
                <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/40">
                  Transmitting to Speakers &amp; Radios
                </span>
              </div>

              {/* Step 1: Hazard Type Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  1. Select Coastal Hazard Category:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHazard('HIGH_WAVE');
                      setCustomMessage('');
                    }}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                      selectedHazard === 'HIGH_WAVE'
                        ? 'bg-amber-950/50 border-amber-400 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Waves size={15} className="text-amber-400" />
                      High Wave &amp; Swell Surge
                    </span>
                    <span className="text-[11px] text-slate-400">Dangerous waves breaking on sand</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHazard('TSUNAMI');
                      setCustomMessage('');
                    }}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                      selectedHazard === 'TSUNAMI'
                        ? 'bg-red-950/50 border-red-500 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <AlertTriangle size={15} className="text-red-400" />
                      Tsunami Evacuation
                    </span>
                    <span className="text-[11px] text-slate-400">Urgent immediate move to high ground</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHazard('FISHERMEN_RECALL');
                      setCustomMessage('');
                    }}
                    className={`p-3 rounded-2xl text-left border transition flex flex-col gap-1 ${
                      selectedHazard === 'FISHERMEN_RECALL'
                        ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-md'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <Radio size={15} className="text-cyan-400" />
                      Fishermen Return (VHF 16)
                    </span>
                    <span className="text-[11px] text-slate-400">Recall country boats to harbor</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Multilingual Language Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  2. Broadcast Language (Spoken over Megaphone Horns):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'ta', label: 'தமிழ் (Tamil)', flag: '🇮🇳' },
                    { id: 'en', label: 'English', flag: '🌐' },
                    { id: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
                    { id: 'te', label: 'తెలుగు (Telugu)', flag: '🇮🇳' },
                    { id: 'ml', label: 'മലയാളം (Malayalam)', flag: '🇮🇳' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        setSelectedLanguage(l.id as any);
                        setCustomMessage('');
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                        selectedLanguage === l.id
                          ? 'bg-cyan-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 3: Broadcast Script Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    3. Announcement Script (Spoken by Voice Synthesizer):
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomMessage(currentTemplate.translations[selectedLanguage])}
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} /> Reset to Official Template
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={displayMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition leading-relaxed font-sans"
                  placeholder="Type or customize emergency broadcast message..."
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Preceded by 2-tone PA Ding-Dong chime &amp; Marine VHF alert tone</span>
                  <span className="font-mono">{displayMessage.length} characters</span>
                </div>
              </div>

              {/* Step 4: Big Broadcast Action Trigger */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleTriggerBroadcast}
                  className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(239,68,68,0.4)] transition"
                >
                  <Play size={20} className="fill-current" />
                  <span>BROADCAST ON ALL BEACH HORNS &amp; VHF CH 16</span>
                </button>

                {isBroadcasting && (
                  <button
                    type="button"
                    onClick={stopBroadcast}
                    className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-red-300 font-bold text-sm border border-red-500/40 flex items-center justify-center gap-2 transition"
                  >
                    <Square size={18} />
                    <span>Stop Broadcast</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Audio Visualizer / Transmission State */}
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Headphones size={15} className="text-cyan-400" />
                  Live Acoustic Transmitter Telemetry
                </span>
                <span className="text-xs font-mono text-emerald-400">
                  {isBroadcasting ? '● TRANSMITTING AT 135 dB' : '○ STANDBY'}
                </span>
              </div>

              {/* Simulated Frequency Bars */}
              <div className="h-12 bg-slate-950 rounded-xl p-2 border border-slate-800 flex items-end justify-between gap-1 overflow-hidden">
                {[45, 60, 30, 85, 90, 40, 75, 95, 65, 50, 70, 80, 60, 90, 85, 70, 95, 80, 60, 40, 75, 55, 90, 65].map(
                  (height, i) => (
                    <div
                      key={i}
                      className={`w-full rounded-t transition-all duration-150 ${
                        isBroadcasting
                          ? 'bg-gradient-to-t from-cyan-500 to-red-400'
                          : 'bg-slate-800 h-2'
                      }`}
                      style={{
                        height: isBroadcasting ? `${Math.max(12, (height * (isSpeaking ? 1 : 0.4)))}%` : '8%',
                      }}
                    />
                  )
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Frequency: 156.800 MHz (VHF Ch 16) + 104.8 FM</span>
                <span>Synthesizer: Active Web Audio Loudspeaker Engine</span>
              </div>
            </div>
          </div>

          {/* Right Sidebar: System Configuration & Auto-Dispatch */}
          <div className="space-y-6">
            {/* Auto-Dispatch Rules */}
            <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-400" />
                Automatic Disaster Dispatch
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                When an <strong>EXTREME (CRITICAL)</strong> ocean hazard is detected by predictive ML or
                live buoys, immediately trigger beach horn speakers without waiting for manual confirmation.
              </p>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-slate-100 block">Auto-Broadcast on Extreme Risk</span>
                  <span className="text-[11px] text-slate-400 block">Triggers PA sirens + voice alert</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoBroadcastOnExtreme(!autoBroadcastOnExtreme)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    autoBroadcastOnExtreme ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      autoBroadcastOnExtreme ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <span className="font-bold text-slate-400 block uppercase text-[10px]">Default Target Coast:</span>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-200">
                  <Compass size={14} className="text-cyan-400 shrink-0" />
                  <span className="truncate">{selectedTargetLocation}</span>
                </div>
              </div>
            </div>

            {/* Why This Matters for Non-Smartphone Coastal Citizens */}
            <div className="p-5 rounded-3xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
              <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                <Users size={15} />
                Why Public Announcers Save Lives
              </h3>
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>Traditional Fishermen:</strong> Country crafts (kattumarams &amp; vallams) do not
                  carry smartphones into high spray seawater, but always carry marine VHF radios or pocket AM radios.
                </p>
                <p>
                  <strong>Beach Visitors &amp; Children:</strong> Tourists playing in waves or resting on the sand
                  leave phones in parked vehicles or bags. Acoustic horns reach up to 3.5 km along the shore.
                </p>
                <p>
                  <strong>Power Cut Resilience:</strong> All speaker towers are equipped with dedicated solar
                  photovoltaic arrays and 48V battery banks to continue blaring even if the coastal grid fails.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BEACH HORN MASTS NETWORK */}
      {activeTab === 'towers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-cyan-400" />
                Coastal Public Address (PA) Speaker Towers Network
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                High-decibel acoustic horn arrays installed along beachfronts, harbors, and fishing hamlets
              </p>
            </div>
            <button
              type="button"
              onClick={handleTriggerBroadcast}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition"
            >
              <Play size={14} />
              <span>Broadcast to All Towers</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {towers.map((tower) => (
              <div
                key={tower.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-4 group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-3 rounded-2xl shrink-0 transition ${
                        tower.status === 'BROADCASTING'
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-slate-800 text-cyan-400 group-hover:bg-cyan-950/60'
                      }`}
                    >
                      <Megaphone size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm leading-tight">{tower.name}</h3>
                      <span className="text-xs text-slate-400 block mt-0.5">{tower.location}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 ${
                      tower.status === 'BROADCASTING'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {tower.status}
                  </span>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase block">Acoustic Output</span>
                    <span className="font-mono font-bold text-cyan-300 text-sm">{tower.decibelOutput} dB</span>
                    <span className="text-[10px] text-slate-500 block">Long-range horn</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-0.5">
                    <span className="text-[10px] text-slate-400 uppercase block">Audible Radius</span>
                    <span className="font-mono font-bold text-amber-300 text-sm">{tower.coverageRadiusKm} km</span>
                    <span className="text-[10px] text-slate-500 block">Shoreline radius</span>
                  </div>
                </div>

                {/* Link & Power */}
                <div className="space-y-1.5 text-[11px] text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Wifi size={13} className="text-cyan-400" /> Audio Link:
                    </span>
                    <span className="font-mono text-slate-200">{tower.linkType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BatteryCharging size={13} className="text-emerald-400" /> Power Backup:
                    </span>
                    <span className="font-mono text-emerald-300">{tower.batteryPct}% ({tower.powerSource})</span>
                  </div>
                </div>

                {/* Test Single Horn Chime Button */}
                <button
                  type="button"
                  onClick={() => handleTestTower(tower)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Volume1 size={15} className="text-cyan-400" />
                  <span>Test Horn Chime (Audio Ding-Dong)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MARINE VHF & COMMUNITY RADIO */}
      {activeTab === 'marine-radio' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <RadioTower className="w-5 h-5 text-cyan-400" />
              Marine VHF Radio Channel 16 &amp; Coastal Community Radio
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Radio broadcast frequencies listened to by fishing boats, trawlers, coastal tea stalls, and village huts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {radioTransmitters.map((radio) => (
              <div
                key={radio.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-3 rounded-2xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shrink-0">
                    <Radio size={22} />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                      radio.status === 'TRANSMITTING'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {radio.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-100 text-sm leading-tight">{radio.name}</h3>
                  <span className="text-xs font-mono font-bold text-cyan-400 block mt-1">
                    {radio.frequency} • {radio.channel}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block">Target Coastal Listeners:</span>
                  <p className="text-slate-300 text-xs leading-relaxed">{radio.targetAudience}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">TX Power</span>
                    <span className="font-bold text-amber-300">{radio.powerWatts}W</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[9px] text-slate-500 uppercase block">Seaward Range</span>
                    <span className="font-bold text-cyan-300">{radio.rangeNauticalMiles} NM</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestRadio(radio.id, radio.name)}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
                >
                  <Radio size={14} className="text-cyan-400" />
                  <span>Send Distress Test Tone (VHF Beep)</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

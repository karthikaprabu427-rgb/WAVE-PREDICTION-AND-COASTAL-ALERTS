import React from 'react';
import {
  Megaphone,
  Radio,
  Volume2,
  RadioTower,
  Play,
  Square,
  ArrowRight,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { usePublicAnnouncer } from '../context/PublicAnnouncerContext';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';

interface PublicAnnouncerMiniWidgetProps {
  onNavigate: (page: string) => void;
}

export const PublicAnnouncerMiniWidget: React.FC<PublicAnnouncerMiniWidgetProps> = ({
  onNavigate,
}) => {
  const {
    towers,
    radioTransmitters,
    isBroadcasting,
    isSpeaking,
    startBroadcast,
    startAllLanguagesBroadcast,
    skipToNextLanguage,
    stopBroadcast,
    lineByLineStatus,
    selectedLanguage,
  } = usePublicAnnouncer();

  const { emergencyStation, activeRiskLevel } = useEmergencyAlert();

  const isExtreme = activeRiskLevel === 'CRITICAL';
  const onlineTowers = towers.filter((t) => t.status !== 'OFFLINE').length;
  const locationName = emergencyStation?.stationName || 'Marina Beach Coastal Area';

  return (
    <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 hover:border-cyan-500/30 transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 shrink-0">
            <Radio size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">
                Marine Radio &amp; Beach Horns
              </h3>
              {isBroadcasting && (
                <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-mono font-bold uppercase animate-pulse">
                  ON AIR
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Delivers voice message line-by-line in all languages
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('public-announcer')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          <span>Open Console</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Network Overview Chips */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <RadioTower size={13} className="text-cyan-400" />
            Beach Horns:
          </span>
          <span className="font-bold text-emerald-400">
            {onlineTowers}/{towers.length} Active
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <Radio size={13} className="text-amber-400" />
            VHF Ch 16:
          </span>
          <span className="font-bold text-cyan-300">156.8 MHz</span>
        </div>
      </div>

      {/* Active Broadcast Audio Feedback */}
      {isBroadcasting ? (
        <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-500/50 space-y-2.5 animate-pulse">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-red-300 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              {lineByLineStatus
                ? `Speaking Line ${lineByLineStatus.currentIndex + 1}/5 (${lineByLineStatus.currentLangName})`
                : 'Broadcasting live over marine radio & beach horns'}
            </span>
            <span className="font-mono text-[10px] text-amber-300 bg-black/40 px-2 py-0.5 rounded">
              135 dB
            </span>
          </div>

          {lineByLineStatus && (
            <p className="text-xs text-slate-200 line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-red-900/50">
              "{lineByLineStatus.currentText}"
            </p>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={skipToNextLanguage}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
            >
              Next Language
            </button>
            <button
              type="button"
              onClick={stopBroadcast}
              className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider transition shadow"
            >
              Silence
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() =>
              startAllLanguagesBroadcast({
                location: locationName,
                hazardType: isExtreme ? 'TSUNAMI' : 'HIGH_WAVE',
                playAudioOutLoud: true,
              })
            }
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md"
          >
            <Play size={14} className="fill-current" />
            <span>Broadcast All Languages Line-by-Line</span>
          </button>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { useOceanData } from '../context/OceanDataContext';

export const EmergencyAlertTester: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {
    activeRiskLevel,
    isMuted,
    isAudioBlocked,
    isAcknowledged,
    enableAudio,
    toggleMute,
    acknowledgeAlert,
    openAlertModal,
    triggerSimulatedHazard,
    resolveHazard,
  } = useEmergencyAlert();

  const { selectedStation } = useOceanData();

  const locationName = selectedStation?.stationName || 'Marina Beach';

  return (
    <div className="fixed bottom-5 left-5 z-[75] flex flex-col items-start gap-2">
      {/* Expanded Control Box */}
      {isOpen && (
        <div className="p-4 rounded-2xl bg-slate-950/95 border border-white/20 shadow-2xl backdrop-blur-xl max-w-xs sm:w-80 space-y-3 animate-slideInLeft text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span className="font-bold text-slate-100 uppercase tracking-wide">
                Emergency Alert System
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* Current Status Monitor */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Current Risk:</span>
              <span
                className={`font-black font-mono px-2 py-0.5 rounded text-[10px] ${
                  activeRiskLevel === 'CRITICAL'
                    ? 'bg-red-500 text-slate-950 animate-pulse'
                    : activeRiskLevel === 'HIGH'
                    ? 'bg-orange-500 text-slate-950'
                    : activeRiskLevel === 'MODERATE'
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {activeRiskLevel === 'CRITICAL' ? 'EXTREME' : activeRiskLevel}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-400">Voice Broadcast:</span>
              <button
                type="button"
                onClick={toggleMute}
                className={`font-bold flex items-center gap-1 text-[11px] ${
                  isMuted ? 'text-red-400 hover:text-red-300' : 'text-emerald-400 hover:text-emerald-300'
                }`}
              >
                {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                <span>{isMuted ? 'Muted' : 'Audible'}</span>
              </button>
            </div>

            {isAudioBlocked && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={enableAudio}
                  className="w-full py-1 px-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold hover:bg-amber-500/30 transition text-[11px] flex items-center justify-center gap-1.5"
                >
                  <Volume2 size={13} />
                  <span>Enable Browser Audio</span>
                </button>
              </div>
            )}
          </div>

          {/* Manual Hazard Triggers (Requirement 1, 2, 3, 8) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">
              Trigger Hazard Simulation:
            </span>

            <button
              id="btn-trigger-high-hazard"
              type="button"
              onClick={() => triggerSimulatedHazard('HIGH', locationName, 3.4)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/50 hover:bg-orange-600/40 text-orange-200 font-bold transition flex items-center justify-between"
            >
              <span>Simulate HIGH Risk</span>
              <span className="text-[10px] font-mono text-orange-300">Hs 3.4m | Warning</span>
            </button>

            <button
              id="btn-trigger-extreme-hazard"
              type="button"
              onClick={() => triggerSimulatedHazard('EXTREME', locationName, 4.5)}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600/40 to-rose-600/40 border border-red-500/60 hover:bg-red-600/50 text-red-200 font-black transition flex items-center justify-between shadow-lg shadow-red-500/20 animate-pulse"
            >
              <span>Simulate EXTREME Hazard</span>
              <span className="text-[10px] font-mono text-red-300">Hs 4.5m | Voice Broadcast</span>
            </button>

            <button
              id="btn-resolve-hazard"
              type="button"
              onClick={resolveHazard}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium transition flex items-center justify-center gap-1.5"
            >
              <RotateCcw size={13} />
              <span>Normalize / Resolve Conditions</span>
            </button>
          </div>

          {/* Alert Quick Actions */}
          {(activeRiskLevel === 'HIGH' || activeRiskLevel === 'CRITICAL') && (
            <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
              <button
                type="button"
                onClick={openAlertModal}
                className="flex-1 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] transition"
              >
                Open Modal
              </button>
              {!isAcknowledged && (
                <button
                  type="button"
                  onClick={acknowledgeAlert}
                  className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] transition"
                >
                  Acknowledge
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Toggle Pill Button */}
      <button
        id="btn-toggle-emergency-tester"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-2 rounded-2xl border shadow-xl backdrop-blur-xl flex items-center gap-2 transition-transform hover:scale-105 ${
          activeRiskLevel === 'CRITICAL'
            ? 'bg-red-600 text-white border-red-400 shadow-red-600/50 animate-pulse'
            : activeRiskLevel === 'HIGH'
            ? 'bg-orange-600 text-white border-orange-400 shadow-orange-600/40'
            : 'bg-slate-900/90 text-slate-200 border-white/15 hover:bg-slate-800'
        }`}
      >
        <span className="text-base">{activeRiskLevel === 'CRITICAL' ? '🚨' : activeRiskLevel === 'HIGH' ? '⚠️' : '🚨'}</span>
        <span className="text-xs font-bold font-mono">
          {activeRiskLevel === 'CRITICAL'
            ? 'EXTREME HAZARD'
            : activeRiskLevel === 'HIGH'
            ? 'HIGH RISK'
            : 'Voice Alert & Emergency Control'}
        </span>
        {isMuted ? <VolumeX size={14} className="text-red-300" /> : <Volume2 size={14} className="text-emerald-300" />}
      </button>
    </div>
  );
};

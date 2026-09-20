import React, { useState } from 'react';
import { useOceanData } from '../context/OceanDataContext';
import {
  Play,
  Pause,
  RotateCw,
  RefreshCcw,
  Sliders,
  Radio,
  Clock,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';

interface RealTimeSimulationBarProps {
  compact?: boolean;
  className?: string;
}

const INTERVAL_PRESETS = [
  { label: '5s (Turbo)', value: 5 },
  { label: '10s (Fast)', value: 10 },
  { label: '30s', value: 30 },
  { label: '60s (Standard)', value: 60 },
  { label: '120s (2m)', value: 120 },
  { label: '300s (5m)', value: 300 },
];

export const RealTimeSimulationBar: React.FC<RealTimeSimulationBarProps> = ({
  compact = false,
  className = '',
}) => {
  const {
    isPlaying,
    setIsPlaying,
    updateInterval,
    setUpdateInterval,
    countdown,
    lastUpdated,
    isSimulating,
    stepSimulation,
    resetSimulation,
    stations,
    stationDeltas,
  } = useOceanData();

  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);
  const [customSecs, setCustomSecs] = useState<string>(updateInterval.toString());
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Progress percentage of current interval
  const progressPercent = Math.max(0, Math.min(100, ((updateInterval - countdown) / updateInterval) * 100));

  // Count how many stations had notable deltas in latest tick
  const deltaEntries = Object.values(stationDeltas);
  const recentChangesCount = deltaEntries.filter((d) => Math.abs(d.waveDelta) > 0 || Math.abs(d.windDelta) > 0).length;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(customSecs, 10);
    if (!isNaN(parsed) && parsed >= 3 && parsed <= 600) {
      setUpdateInterval(parsed);
      setShowCustomModal(false);
    }
  };

  return (
    <div
      id="realtime-simulation-bar"
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900/90 via-[#0a192f]/90 to-slate-900/90 backdrop-blur-xl border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ${className}`}
    >
      {/* Background Accent Glow & Top Progress Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 transition-all duration-1000 ease-linear shadow-[0_0_8px_#06b6d4]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Stream Identity & Radar Pulse */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all ${
              isPlaying
                ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-amber-500/15 border-amber-400/30 text-amber-300'
            }`}>
              <Radio size={20} className={isPlaying ? 'animate-pulse' : ''} />
            </div>
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm sm:text-base text-slate-100 tracking-wide">
                Live Ocean Simulation Engine
              </span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                isPlaying
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 animate-pulse'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {isPlaying ? 'Live Streaming' : 'Paused'}
              </span>
            </div>

            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Auto-cycle:</span>
              <strong className="text-cyan-300 font-mono">{updateInterval}s interval</strong>
              <span className="text-slate-600">•</span>
              <span>{stations.length} Marine Buoys Monitored</span>
              {recentChangesCount > 0 && (
                <>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400 font-mono text-[11px] inline-flex items-center gap-0.5">
                    <Sparkles size={11} />
                    {recentChangesCount} stations updated
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Center/Right: Interactive Config & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Countdown Pill Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-white/10 backdrop-blur-md">
            <Clock size={14} className="text-cyan-400" />
            <div className="text-xs">
              <span className="text-slate-400">Next update: </span>
              <span className="font-mono font-extrabold text-cyan-300 text-sm">
                {isPlaying ? `${countdown}s` : 'Paused'}
              </span>
            </div>
          </div>

          {/* Interval Selector Dropdown */}
          <div className="relative">
            <button
              id="btn-simulation-interval-menu"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-xs font-semibold text-slate-200 transition backdrop-blur-md"
              title="Change simulation interval"
            >
              <Sliders size={13} className="text-cyan-400" />
              <span>{updateInterval}s Interval</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-[#031326] border border-cyan-500/30 p-2 shadow-2xl z-50 backdrop-blur-xl">
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                  Simulation Rate
                </div>
                {INTERVAL_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    id={`btn-interval-preset-${preset.value}`}
                    onClick={() => {
                      setUpdateInterval(preset.value);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      updateInterval === preset.value
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {updateInterval === preset.value && <CheckCircle2 size={12} className="text-cyan-400" />}
                  </button>
                ))}
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <button
                    id="btn-custom-interval-open"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowCustomModal(true);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-1.5"
                  >
                    <Sliders size={12} />
                    <span>Custom Seconds...</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Play / Pause Toggle */}
          <button
            id="btn-toggle-simulation-play"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition backdrop-blur-md ${
              isPlaying
                ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-400/30 text-amber-300'
                : 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-400/30 text-emerald-300'
            }`}
            title={isPlaying ? 'Pause auto simulation' : 'Start auto simulation'}
          >
            {isPlaying ? (
              <>
                <Pause size={13} />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play size={13} />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Trigger Step Now Button */}
          <button
            id="btn-step-simulation-now"
            onClick={() => stepSimulation()}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border border-cyan-400/30 shadow-md shadow-cyan-600/20 text-xs font-bold transition active:scale-95 disabled:opacity-50"
            title="Force immediate simulation step"
          >
            <RotateCw size={13} className={isSimulating ? 'animate-spin' : ''} />
            <span>{isSimulating ? 'Updating...' : 'Step Now'}</span>
          </button>

          {/* Reset Baseline Button */}
          <button
            id="btn-reset-simulation"
            onClick={() => resetSimulation()}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-slate-400 hover:text-slate-200 transition backdrop-blur-md"
            title="Reset ocean buoys to initial baseline"
          >
            <RefreshCcw size={14} />
          </button>
        </div>
      </div>

      {/* Custom Interval Popover Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-100 font-heading flex items-center gap-2">
                <Sliders size={16} className="text-cyan-400" />
                Configure Simulation Rate
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Set the frequency in seconds for real-time wave height, wind speed, and sea temperature simulation ticks (min 3s, max 600s).
            </p>
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-cyan-300 mb-1">
                  Interval Duration (Seconds)
                </label>
                <input
                  id="input-custom-simulation-interval"
                  type="number"
                  min="3"
                  max="600"
                  value={customSecs}
                  onChange={(e) => setCustomSecs(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="btn-save-custom-interval"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
                >
                  Apply Interval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

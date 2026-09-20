import React from 'react';
import { RefreshCw, Radio, AlertTriangle, ShieldCheck, Waves } from 'lucide-react';
import { OceanCondition } from '../types';

interface DataSourceBadgeProps {
  station: OceanCondition | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const DataSourceBadge: React.FC<DataSourceBadgeProps> = ({
  station,
  onRefresh,
  isRefreshing = false,
}) => {
  if (!station) return null;

  const isLive = station.dataStatus === 'LIVE_DATA' || (!station.dataStatus && station.dataSource?.includes('Open-Meteo'));
  const isSimulated = station.dataStatus === 'SIMULATED' || (!isLive);
  const dataSource = station.dataSource || (isLive ? 'Open-Meteo Marine & Weather API' : 'Oceanographic Dynamic Simulation');

  // Format updated timestamp
  let formattedTime = 'Just now';
  if (station.lastUpdated) {
    try {
      const d = new Date(station.lastUpdated);
      formattedTime = d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      formattedTime = station.lastUpdated;
    }
  }

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Status badge & Source */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
          {/* Status Badge */}
          {isLive ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE DATA</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>DEMO / SIMULATED</span>
            </div>
          )}

          {/* Source name */}
          <div className="flex items-center gap-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Source:</span>
            <span className="font-medium text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              {dataSource}
            </span>
          </div>

          {/* Coordinates & Location Tag */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span>•</span>
            <span className="font-mono text-slate-300">
              {station.lat.toFixed(4)}°N, {station.lng.toFixed(4)}°E
            </span>
          </div>

          {/* Weather condition if available */}
          {station.weatherCondition && (
            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              <Waves className="w-3 h-3 text-cyan-400" />
              <span>{station.weatherCondition}</span>
            </div>
          )}
        </div>

        {/* Right side: Last updated time & Refresh Button */}
        <div className="flex items-center gap-3 ml-auto text-xs">
          <div className="text-slate-400 flex items-center gap-1.5">
            <span>Updated:</span>
            <span className="font-mono text-slate-200">{formattedTime}</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 active:scale-95 text-cyan-400 border border-slate-700 transition disabled:opacity-50"
              title="Fetch fresh real-time marine telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-300' : ''}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Updating...' : 'Refresh Live'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Simulated warning banner if fallback was applied */}
      {isSimulated && (
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300 bg-amber-950/20 px-3 py-1.5 rounded-lg border border-amber-800/30">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>Notice:</strong> Live satellite / buoy telemetry temporarily unavailable for this offshore grid – showing calibrated oceanographic demo data.
          </span>
        </div>
      )}
    </div>
  );
};

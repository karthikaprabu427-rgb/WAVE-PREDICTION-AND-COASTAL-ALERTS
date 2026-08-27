import React, { useEffect, useState } from 'react';
import { OceanCondition } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import { LeafletMap } from '../components/LeafletMap';
import {
  Waves,
  Wind,
  Compass,
  Thermometer,
  Eye,
  Activity,
  Gauge,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  BrainCircuit,
  ShieldAlert,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

interface UserDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const [stations, setStations] = useState<OceanCondition[]>([]);
  const [selectedStation, setSelectedStation] = useState<OceanCondition | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString());

  const fetchConditions = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/ocean-conditions');
      if (res.ok) {
        const data = await res.json();
        setStations(data.stations || []);
        if (!selectedStation && data.stations?.length > 0) {
          // Select highest risk station or first station
          const highRisk = data.stations.find((s: OceanCondition) => s.riskLevel === 'CRITICAL' || s.riskLevel === 'HIGH');
          setSelectedStation(highRisk || data.stations[0]);
        } else if (selectedStation) {
          const updated = data.stations.find((s: OceanCondition) => s.id === selectedStation.id);
          if (updated) setSelectedStation(updated);
        }
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch (e) {
      console.error('Failed to fetch ocean conditions:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConditions();
    const interval = setInterval(fetchConditions, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handlePredictFromStation = (stn: OceanCondition) => {
    onNavigate('predict', { prefillStation: stn });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-cyan-400">
          <RefreshCw className="animate-spin" size={32} />
          <span className="text-sm font-mono text-slate-300">Connecting to Coastal Buoy Network...</span>
        </div>
      </div>
    );
  }

  const active = selectedStation || stations[0];

  return (
    <div className="space-y-6">
      {/* Top Banner: Station Selector & Status */}
      <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest">
              Live Coastal Monitoring Station
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              {active?.stationName}
            </h1>
            {active && <RiskBadge level={active.riskLevel} size="md" />}
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <MapPin size={13} className="text-cyan-400" />
            {active?.region} (Lat: {active?.lat}°, Lng: {active?.lng}°)
          </p>
        </div>

        {/* Station Switcher Dropdown & Refresh */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              id="select-active-station"
              value={active?.id}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) setSelectedStation(found);
              }}
              className="bg-slate-900/60 border border-white/15 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:border-cyan-400 backdrop-blur-md pr-8 shadow-sm"
            >
              {stations.map((stn) => (
                <option key={stn.id} value={stn.id} className="bg-[#031329] text-slate-100">
                  {stn.stationName} [{stn.riskLevel}]
                </option>
              ))}
            </select>
          </div>

          <button
            id="btn-refresh-telemetry"
            onClick={fetchConditions}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 border border-white/10 backdrop-blur-md text-slate-300 hover:text-cyan-300 transition shadow-sm"
            title="Refresh Station Telemetry"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
          </button>
        </div>
      </div>

      {/* 9 Key Ocean Conditions Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {/* 1. Wave Height */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wave Height (Hs)</span>
            <Waves size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-cyan-300">{active?.waveHeight.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span></p>
          <span className="text-[10px] text-slate-400 font-mono">Significant height</span>
        </div>

        {/* 2. Wave Period */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-sky-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wave Period (Tp)</span>
            <Clock size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-sky-300">{active?.wavePeriod.toFixed(1)} <span className="text-xs font-normal text-slate-400">s</span></p>
          <span className="text-[10px] text-slate-400 font-mono">Dominant peak</span>
        </div>

        {/* 3. Wind Speed */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wind Speed</span>
            <Wind size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-amber-300">{active?.windSpeed.toFixed(0)} <span className="text-xs font-normal text-slate-400">km/h</span></p>
          <span className="text-[10px] text-slate-400 font-mono">{active?.windDirection} ({active?.windDirectionDeg}°)</span>
        </div>

        {/* 4. Wind Direction */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-slate-700/60 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wind Direction</span>
            <Compass size={16} className="text-amber-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-slate-100">{active?.windDirection}</p>
          <span className="text-[10px] text-slate-400 font-mono">Bearing {active?.windDirectionDeg}°</span>
        </div>

        {/* 5. Wave Direction */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-cyan-700/60 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wave Direction</span>
            <Compass size={16} className="text-cyan-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-slate-100">{active?.waveDirection}</p>
          <span className="text-[10px] text-slate-400 font-mono">Swell {active?.waveDirectionDeg}°</span>
        </div>

        {/* 6. Water Temp */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-emerald-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Sea Temp</span>
            <Thermometer size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-emerald-300">{active?.waterTemperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span></p>
          <span className="text-[10px] text-slate-400 font-mono">Surface sensor</span>
        </div>

        {/* 7. Pressure */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-purple-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Pressure</span>
            <Gauge size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-purple-300">{active?.pressure.toFixed(0)} <span className="text-xs font-normal text-slate-400">hPa</span></p>
          <span className="text-[10px] text-slate-400 font-mono">Barometer</span>
        </div>

        {/* 8. Visibility */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-slate-700/60 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Visibility</span>
            <Eye size={16} className="text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-slate-100">{active?.visibility} <span className="text-xs font-normal text-slate-400">km</span></p>
          <span className="text-[10px] text-slate-400 font-mono">Atmospheric optical</span>
        </div>

        {/* 9. Current Speed */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-indigo-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Current Speed</span>
            <Activity size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-indigo-300">{active?.currentSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-400">m/s</span></p>
          <span className="text-[10px] text-slate-400 font-mono">{active?.currentDirection}</span>
        </div>
      </div>

      {/* Main Content Split: Live Wave Dynamics + Quick Predictor CTA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Wave Dynamics & Status */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Waves size={20} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100 font-heading">
                  Real-Time Wave Simulation ({active?.stationName})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Last Telemetry Sync: {lastRefreshed}
              </span>
            </div>

            {active && (
              <WaveVisualizer
                waveHeight={active.waveHeight}
                wavePeriod={active.wavePeriod}
                windSpeed={active.windSpeed}
                height={170}
                className="border-white/10"
              />
            )}

            <div className="p-4 rounded-2xl bg-slate-950/50 border border-white/10 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-semibold">Current Coastal Safety Status:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {active?.riskLevel === 'CRITICAL'
                    ? 'CRITICAL HAZARD: Extreme wave surge and gale wind forces. Prohibit maritime activity.'
                    : active?.riskLevel === 'HIGH'
                    ? 'HIGH RISK: Steep breaking swells and rip currents. Small craft advisory in effect.'
                    : active?.riskLevel === 'MODERATE'
                    ? 'MODERATE: Occasional whitecaps and surf chop. Exercise caution near harbor mouths.'
                    : 'SAFE CONDITIONS: Marine parameters within optimal threshold for navigation.'}
                </p>
              </div>

              {active && (
                <button
                  id="btn-dash-predict-station"
                  onClick={() => handlePredictFromStation(active)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 shrink-0 transition border border-cyan-300/40"
                >
                  <BrainCircuit size={16} />
                  <span>Predict for Station</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Alert Feed */}
          <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert size={18} className="text-amber-400" />
                <h3 className="font-bold text-sm text-slate-100 font-heading">
                  Active Coastal Alert Advisories
                </h3>
              </div>
              <button
                id="btn-dash-view-all-alerts"
                onClick={() => onNavigate('alerts')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>View All Alerts</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-400/30 backdrop-blur-md flex items-start gap-3">
                <ShieldAlert size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-red-300">CRITICAL STORM SURGE ALERT</span>
                    <span className="text-[10px] font-mono text-red-400">EMERGENCY</span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Severe offshore squalls and hazardous swell heights exceeding 4.3m near Mumbai Offshore.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-400/30 backdrop-blur-md flex items-start gap-3">
                <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-orange-300">HIGH WAVE WARNING</span>
                    <span className="text-[10px] font-mono text-orange-400">WARNING</span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Long-period swells of 3.6m reaching the shoreline at Cape Comorin. Small craft advisory in effect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Interactive Map Preview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100 font-heading">
                  Coastal Risk Map
                </h3>
              </div>
              <button
                id="btn-dash-open-full-map"
                onClick={() => onNavigate('risk-map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
              >
                <span>Full Map Mode</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <LeafletMap
              stations={stations}
              selectedStationId={active?.id}
              onSelectStation={(stn) => setSelectedStation(stn)}
              onPredictStation={handlePredictFromStation}
              height="360px"
            />
          </div>

          {/* Quick Links Dashboard Footer Cards */}
          <div className="grid grid-cols-2 gap-4">
            <button
              id="btn-dash-analytics-card"
              onClick={() => onNavigate('analytics')}
              className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl text-left transition group space-y-2 shadow-md hover:bg-slate-900/60"
            >
              <Activity size={20} className="text-cyan-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-slate-100 block font-heading">Ocean Analytics</span>
                <span className="text-[11px] text-slate-400">View swell charts &amp; stats</span>
              </div>
            </button>

            <button
              id="btn-dash-history-card"
              onClick={() => onNavigate('history')}
              className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-sky-400/40 backdrop-blur-xl text-left transition group space-y-2 shadow-md hover:bg-slate-900/60"
            >
              <BrainCircuit size={20} className="text-sky-400 group-hover:scale-110 transition-transform" />
              <div>
                <span className="text-xs font-bold text-slate-100 block font-heading">Prediction Logs</span>
                <span className="text-[11px] text-slate-400">Review past ML forecasts</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

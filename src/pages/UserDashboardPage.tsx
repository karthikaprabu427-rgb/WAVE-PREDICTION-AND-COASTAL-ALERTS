import React from 'react';
import { OceanCondition } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import { LeafletMap } from '../components/LeafletMap';
import { RealTimeSimulationBar } from '../components/RealTimeSimulationBar';
import { CoastalLocationSearch } from '../components/CoastalLocationSearch';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { PublicAnnouncerMiniWidget } from '../components/PublicAnnouncerMiniWidget';
import { CoastalEmergencyAnnouncement } from '../components/CoastalEmergencyAnnouncement';
import { useOceanData } from '../context/OceanDataContext';
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
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line } from 'recharts';

interface UserDashboardPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const UserDashboardPage: React.FC<UserDashboardPageProps> = ({ onNavigate }) => {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    loading,
    stationDeltas,
    telemetryHistory,
    lastUpdated,
    isSimulating,
    isLiveFetching,
    refreshActiveStation,
    activePrediction,
  } = useOceanData();

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
  const delta = active ? stationDeltas[active.id] : null;
  const historyData = active ? telemetryHistory[active.id] || [] : [];

  const renderDeltaBadge = (value: number | undefined, unit: string) => {
    if (value === undefined || value === 0) return null;
    const isPositive = value > 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full transition-all animate-pulse ${
          isPositive
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}
      >
        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {isPositive ? `+${value}` : `${value}`}
        {unit}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Simulation Control Bar */}
      <RealTimeSimulationBar />

      {/* 2. Prominent Coastal Emergency Public Announcement & Voice Broadcast Section */}
      <CoastalEmergencyAnnouncement />

      {/* 3. PROMINENT DYNAMIC COASTAL SEARCH BAR */}
      <div className="p-5 rounded-3xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
              Search Any Beach or Coastal Location Worldwide
            </h2>
          </div>
          <span className="text-xs text-cyan-400 hidden sm:inline-flex items-center gap-1 font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            Live Global Marine &amp; Weather API
          </span>
        </div>
        <CoastalLocationSearch
          onLocationSelected={(station) => {
            setSelectedStation(station);
          }}
          placeholder="Type any beach or coastal place (e.g., Marina Beach, Mahabalipuram, Rameswaram, Kanyakumari, Goa...)"
        />
      </div>

      {/* 3. Top Banner: Station Selector & Status */}
      <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulating || isLiveFetching ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
              {active?.isCustomSearched ? 'Searched Coastal Point' : 'Live Coastal Monitoring Station'}
              {(isSimulating || isLiveFetching) && (
                <span className="text-[10px] text-cyan-300 font-mono bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/40">
                  {isLiveFetching ? 'Fetching Live Marine Telemetry...' : 'Syncing Real-Time Packet...'}
                </span>
              )}
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
            {active?.region} (Lat: {active?.lat.toFixed(4)}°, Lng: {active?.lng.toFixed(4)}°)
            {active?.country && <span className="text-slate-300">• {active.country}</span>}
          </p>
        </div>

        {/* Station Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <label htmlFor="select-active-station" className="sr-only">Select Marine Station</label>
            <select
              id="select-active-station"
              value={active?.id}
              onChange={(e) => {
                const found = stations.find((s) => s.id === e.target.value);
                if (found) setSelectedStation(found);
              }}
              className="bg-slate-900/60 border border-white/15 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:border-cyan-400 backdrop-blur-md pr-8 shadow-sm"
            >
              {(stations || []).map((stn) => (
                <option key={stn.id} value={stn.id} className="bg-[#031329] text-slate-100">
                  {stn.stationName} — {stn.waveHeight.toFixed(1)}m [{stn.riskLevel}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. DATA SOURCE & STATUS BADGE WITH LIVE REFRESH */}
      {active && (
        <DataSourceBadge
          station={active}
          onRefresh={refreshActiveStation}
          isRefreshing={isLiveFetching}
        />
      )}

      {/* 3. 9 Key Ocean Conditions Cards Grid with Real-Time Delta Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {/* 1. Wave Height */}
        <div className={`p-4 rounded-2xl bg-slate-900/40 border backdrop-blur-xl shadow-md transition-all group ${
          delta?.waveDelta ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-white/10 hover:border-cyan-400/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wave Height (Hs)</span>
            <Waves size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-mono text-2xl font-extrabold text-cyan-300">
              {active?.waveHeight.toFixed(1)} <span className="text-xs font-normal text-slate-400">m</span>
            </p>
            {renderDeltaBadge(delta?.waveDelta, 'm')}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Significant height</span>
        </div>

        {/* 2. Wave Period */}
        <div className={`p-4 rounded-2xl bg-slate-900/40 border backdrop-blur-xl shadow-md transition-all group ${
          delta?.periodDelta ? 'border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]' : 'border-white/10 hover:border-sky-400/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wave Period (Tp)</span>
            <Clock size={16} className="text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-mono text-2xl font-extrabold text-sky-300">
              {active?.wavePeriod.toFixed(1)} <span className="text-xs font-normal text-slate-400">s</span>
            </p>
            {renderDeltaBadge(delta?.periodDelta, 's')}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Dominant peak</span>
        </div>

        {/* 3. Wind Speed */}
        <div className={`p-4 rounded-2xl bg-slate-900/40 border backdrop-blur-xl shadow-md transition-all group ${
          delta?.windDelta ? 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'border-white/10 hover:border-amber-400/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Wind Speed</span>
            <Wind size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-mono text-2xl font-extrabold text-amber-300">
              {active?.windSpeed.toFixed(0)} <span className="text-xs font-normal text-slate-400">km/h</span>
            </p>
            {renderDeltaBadge(delta?.windDelta, '')}
          </div>
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
        <div className={`p-4 rounded-2xl bg-slate-900/40 border backdrop-blur-xl shadow-md transition-all group ${
          delta?.tempDelta ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-white/10 hover:border-emerald-400/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Sea Temp</span>
            <Thermometer size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-mono text-2xl font-extrabold text-emerald-300">
              {active?.waterTemperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
            </p>
            {renderDeltaBadge(delta?.tempDelta, '°')}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Surface sensor</span>
        </div>

        {/* 7. Pressure */}
        <div className={`p-4 rounded-2xl bg-slate-900/40 border backdrop-blur-xl shadow-md transition-all group ${
          delta?.pressureDelta ? 'border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-white/10 hover:border-purple-400/40'
        }`}>
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Pressure</span>
            <Gauge size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="font-mono text-2xl font-extrabold text-purple-300">
              {active?.pressure.toFixed(0)} <span className="text-xs font-normal text-slate-400">hPa</span>
            </p>
            {renderDeltaBadge(delta?.pressureDelta, '')}
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Barometer</span>
        </div>

        {/* 8. Visibility */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-slate-700/60 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Visibility</span>
            <Eye size={16} className="text-slate-300 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-slate-100">
            {active?.visibility} <span className="text-xs font-normal text-slate-400">km</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono">Atmospheric optical</span>
        </div>

        {/* 9. Current Speed */}
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-indigo-400/40 backdrop-blur-xl shadow-md transition group">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold">Current Speed</span>
            <Activity size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-2xl font-extrabold text-indigo-300">
            {active?.currentSpeed.toFixed(1)} <span className="text-xs font-normal text-slate-400">m/s</span>
          </p>
          <span className="text-[10px] text-slate-400 font-mono">{active?.currentDirection}</span>
        </div>
      </div>

      {/* 4. Main Content Split: Live Wave Dynamics + Interactive Risk Map Preview */}
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
                Live Waveform Amplitude: <strong className="text-cyan-300">{active?.waveHeight.toFixed(1)}m</strong>
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

            {/* Live Telemetry Micro-Chart */}
            {historyData.length > 2 && (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Activity size={14} className="text-cyan-400" />
                    Live Swell &amp; Wind Fluctuations
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Rolling packets ({historyData.length} pts)</span>
                </div>
                <div className="h-28 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="waveHeightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} />
                      <YAxis stroke="#475569" fontSize={9} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#031326', borderColor: '#06b6d4', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(val: any, name: string) => [
                          name === 'waveHeight' ? `${val} m` : `${val} km/h`,
                          name === 'waveHeight' ? 'Wave Height' : 'Wind Speed',
                        ]}
                      />
                      <Area type="monotone" dataKey="waveHeight" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#waveHeightGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ML Wave Prediction Output (From Real-Time Telemetry) */}
            {activePrediction && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-slate-950/80 border border-cyan-500/30 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs text-cyan-300 uppercase tracking-wide">
                      Real-Time ML Wave Prediction Result
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Confidence: {activePrediction.confidenceScore}%
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Predicted Wave Height</span>
                    <span className="text-base font-bold font-mono text-cyan-300">
                      {activePrediction.predictedWaveHeight?.toFixed(2)} m
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Predicted Period</span>
                    <span className="text-base font-bold font-mono text-sky-300">
                      {activePrediction.predictedWavePeriod?.toFixed(1)} s
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Risk Category</span>
                    <span className="text-xs font-bold text-amber-300 block truncate">
                      {activePrediction.riskLevel}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-white/5">
                    <span className="text-[10px] text-slate-400 block">Prediction Time</span>
                    <span className="text-[11px] font-mono text-slate-300">
                      {new Date(activePrediction.predictionTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {activePrediction.explanation && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-white/5">
                    {activePrediction.explanation}
                  </p>
                )}
              </div>
            )}

            {/* 24-Hour Wave & Wind Forecast Timeline */}
            {active?.forecast && active.forecast.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Calendar size={14} className="text-cyan-400" />
                    24-Hour Oceanic Wave &amp; Wind Forecast (Open-Meteo)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Hourly Marine Model</span>
                </div>
                <div className="h-32 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={active.forecast} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#475569" fontSize={9} interval={3} />
                      <YAxis stroke="#475569" fontSize={9} domain={['auto', 'auto']} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#031326', borderColor: '#38bdf8', borderRadius: '8px', fontSize: '11px' }}
                        formatter={(val: any, name: string) => [
                          name === 'waveHeight' ? `${val} m` : `${val} km/h`,
                          name === 'waveHeight' ? 'Forecast Wave Height' : 'Forecast Wind Speed',
                        ]}
                      />
                      <Area type="monotone" dataKey="waveHeight" stroke="#38bdf8" strokeWidth={2} fillOpacity={1} fill="url(#forecastGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
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

          {/* Beach Horn Speakers & Marine Radio Status Widget */}
          <PublicAnnouncerMiniWidget onNavigate={onNavigate} />

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

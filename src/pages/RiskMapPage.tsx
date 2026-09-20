import React, { useState } from 'react';
import { OceanCondition } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import { RealTimeSimulationBar } from '../components/RealTimeSimulationBar';
import { CoastalLocationSearch } from '../components/CoastalLocationSearch';
import { DataSourceBadge } from '../components/DataSourceBadge';
import { useOceanData } from '../context/OceanDataContext';
import {
  MapPin,
  Search,
  Waves,
  Wind,
  Compass,
  Thermometer,
  Gauge,
  Activity,
  BrainCircuit,
  Eye,
  RefreshCw,
  Layers,
  Info,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface RiskMapPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RiskMapPage: React.FC<RiskMapPageProps> = ({ onNavigate }) => {
  const {
    stations,
    selectedStation,
    setSelectedStation,
    loading,
    stationDeltas,
    isSimulating,
  } = useOceanData();

  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter stations based on search and risk filter
  const filteredStations = stations.filter((stn) => {
    const matchesRisk = filterRisk === 'ALL' || stn.riskLevel === filterRisk;
    const matchesSearch =
      stn.stationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stn.region.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handlePredictStation = (stn: OceanCondition) => {
    onNavigate('predict', { prefillStation: stn });
  };

  const active = selectedStation || (filteredStations.length > 0 ? filteredStations[0] : null);
  const delta = active ? stationDeltas[active.id] : null;

  const renderDeltaBadge = (value: number | undefined, unit: string) => {
    if (value === undefined || value === 0) return null;
    const isPositive = value > 0;
    return (
      <span
        className={`inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full transition-all animate-pulse ${
          isPositive
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
        }`}
      >
        {isPositive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
        {isPositive ? `+${value}` : `${value}`}
        {unit}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-cyan-400">
          <RefreshCw className="animate-spin" size={32} />
          <span className="text-sm font-mono text-slate-300">Loading Geospatial Marine Stations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Real-Time Simulation Control Bar */}
      <RealTimeSimulationBar />

      {/* 2. Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-1.5">
              <MapPin size={13} />
              <span>Geospatial Marine Hazard Assessment</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Interactive Coastal Risk Map
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Explore coastal stations, live buoy telemetry, and danger radii zones along vulnerable coastal sectors
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Risk Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-white/15 text-xs backdrop-blur-md">
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  id={`btn-filter-map-${lvl.toLowerCase()}`}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    filterRisk === lvl
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/25'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global Dynamic Beach Search */}
        <div className="pt-2 border-t border-slate-800/80">
          <CoastalLocationSearch
            onLocationSelected={(stn) => {
              setSelectedStation(stn);
            }}
            placeholder="Search any beach on the map (e.g. Marina Beach, Mahabalipuram, Rameswaram, Goa...)"
          />
        </div>
      </div>

      {/* Live Data Source Badge */}
      {active && (
        <DataSourceBadge
          station={active}
          onRefresh={() => setSelectedStation(active)}
        />
      )}

      {/* 3. Map Layout Grid: Left Map (8 Cols) / Right Detail Panel (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-3">
            <LeafletMap
              stations={filteredStations}
              selectedStationId={active?.id}
              onSelectStation={(stn) => setSelectedStation(stn)}
              onPredictStation={handlePredictStation}
              height="560px"
            />

            {/* Map Legend */}
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                <Info size={14} className="text-cyan-400" />
                <span>Geospatial Buoy Radii &amp; Danger Classification:</span>
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300 font-mono">LOW (&lt; 1.5m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300 font-mono">MODERATE (1.5 - 2.5m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span className="text-slate-300 font-mono">HIGH (2.5 - 3.8m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-red-300 font-mono font-bold">CRITICAL (&gt; 3.8m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Station Detail Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {active ? (
            <div className="p-6 rounded-3xl bg-slate-900/45 border border-white/10 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-5">
              <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    Selected Station Telemetry
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-heading">
                    {active.stationName}
                  </h3>
                  <p className="text-xs text-slate-400">{active.region}</p>
                </div>
                <RiskBadge level={active.riskLevel} size="md" />
              </div>

              {/* Dynamic Wave Visualizer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Wave Simulation</span>
                  <span className="font-mono text-cyan-400">Live Waveform</span>
                </div>
                <WaveVisualizer
                  waveHeight={active.waveHeight}
                  wavePeriod={active.wavePeriod}
                  windSpeed={active.windSpeed}
                  height={130}
                  className="border-white/10"
                />
              </div>

              {/* Station Parameters List with Real-Time Delta Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className={`p-2.5 rounded-2xl bg-slate-950/70 border backdrop-blur-md transition-all ${
                  delta?.waveDelta ? 'border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]' : 'border-white/10'
                }`}>
                  <span className="text-[10px] text-slate-400 block font-mono">Wave Height</span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold font-mono text-cyan-300">
                      {active.waveHeight.toFixed(1)} m
                    </span>
                    {renderDeltaBadge(delta?.waveDelta, 'm')}
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl bg-slate-950/70 border backdrop-blur-md transition-all ${
                  delta?.periodDelta ? 'border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.2)]' : 'border-white/10'
                }`}>
                  <span className="text-[10px] text-slate-400 block font-mono">Wave Period</span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold font-mono text-sky-300">
                      {active.wavePeriod.toFixed(1)} s
                    </span>
                    {renderDeltaBadge(delta?.periodDelta, 's')}
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl bg-slate-950/70 border backdrop-blur-md transition-all ${
                  delta?.windDelta ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.2)]' : 'border-white/10'
                }`}>
                  <span className="text-[10px] text-slate-400 block font-mono">Wind Speed</span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold font-mono text-amber-300">
                      {active.windSpeed.toFixed(0)} km/h
                    </span>
                    {renderDeltaBadge(delta?.windDelta, '')}
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl bg-slate-950/70 border backdrop-blur-md transition-all ${
                  delta?.tempDelta ? 'border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'border-white/10'
                }`}>
                  <span className="text-[10px] text-slate-400 block font-mono">Water Temp</span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold font-mono text-emerald-300">
                      {active.waterTemperature.toFixed(1)} °C
                    </span>
                    {renderDeltaBadge(delta?.tempDelta, '°')}
                  </div>
                </div>

                <div className={`p-2.5 rounded-2xl bg-slate-950/70 border backdrop-blur-md transition-all ${
                  delta?.pressureDelta ? 'border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]' : 'border-white/10'
                }`}>
                  <span className="text-[10px] text-slate-400 block font-mono">Pressure</span>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="text-sm font-bold font-mono text-purple-300">
                      {active.pressure.toFixed(0)} hPa
                    </span>
                    {renderDeltaBadge(delta?.pressureDelta, '')}
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950/70 border border-white/10 backdrop-blur-md">
                  <span className="text-[10px] text-slate-400 block font-mono">Current Speed</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">
                    {active.currentSpeed.toFixed(1)} m/s
                  </span>
                </div>
              </div>

              {/* Predict CTA for this station */}
              <button
                id="btn-map-predict-selected"
                onClick={() => handlePredictStation(active)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <BrainCircuit size={16} />
                <span>Run ML Prediction for {active.stationName}</span>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/45 border border-white/10 text-center text-slate-400 text-xs backdrop-blur-xl">
              Click on any buoy station marker on the map to inspect live marine parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

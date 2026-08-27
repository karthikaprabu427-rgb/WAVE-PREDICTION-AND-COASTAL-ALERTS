import React, { useState, useEffect } from 'react';
import { OceanCondition } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import {
  MapPin,
  Filter,
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
} from 'lucide-react';

interface RiskMapPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const RiskMapPage: React.FC<RiskMapPageProps> = ({ onNavigate }) => {
  const [stations, setStations] = useState<OceanCondition[]>([]);
  const [selectedStation, setSelectedStation] = useState<OceanCondition | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/ocean-conditions');
      if (res.ok) {
        const data = await res.json();
        setStations(data.stations || []);
        if (data.stations?.length > 0 && !selectedStation) {
          setSelectedStation(data.stations[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load stations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
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
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                id="input-map-search-station"
                type="text"
                placeholder="Search coastal region..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Risk Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  id={`btn-filter-map-${lvl.toLowerCase()}`}
                  onClick={() => setFilterRisk(lvl)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                    filterRisk === lvl
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Map Layout Grid: Left Map (8 Cols) / Right Detail Panel (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
            <LeafletMap
              stations={filteredStations}
              selectedStationId={selectedStation?.id}
              onSelectStation={(stn) => setSelectedStation(stn)}
              onPredictStation={handlePredictStation}
              height="560px"
            />

            {/* Map Legend */}
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-mono text-slate-400 font-semibold flex items-center gap-1.5">
                <Info size={14} className="text-cyan-400" />
                <span>Hazard Classification Legend:</span>
              </span>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-300 font-mono">LOW (&lt; 1.5m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-slate-300 font-mono">MODERATE (1.5 - 2.5m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-slate-300 font-mono">HIGH (2.5 - 3.8m)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-slate-300 font-mono">CRITICAL (&gt; 3.8m)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Station Detail Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {selectedStation ? (
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                    Selected Station Telemetry
                  </span>
                  <h3 className="text-lg font-bold text-slate-100 font-heading">
                    {selectedStation.stationName}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedStation.region}</p>
                </div>
                <RiskBadge level={selectedStation.riskLevel} size="md" />
              </div>

              {/* Dynamic Wave Visualizer */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Wave Simulation</span>
                  <span className="font-mono text-cyan-400">Live State</span>
                </div>
                <WaveVisualizer
                  waveHeight={selectedStation.waveHeight}
                  wavePeriod={selectedStation.wavePeriod}
                  windSpeed={selectedStation.windSpeed}
                  height={130}
                />
              </div>

              {/* Station Parameters List */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Wave Height</span>
                  <span className="text-sm font-bold font-mono text-cyan-300">
                    {selectedStation.waveHeight.toFixed(1)} m
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Wave Period</span>
                  <span className="text-sm font-bold font-mono text-sky-300">
                    {selectedStation.wavePeriod.toFixed(1)} s
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Wind Speed</span>
                  <span className="text-sm font-bold font-mono text-amber-300">
                    {selectedStation.windSpeed.toFixed(0)} km/h
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Water Temp</span>
                  <span className="text-sm font-bold font-mono text-emerald-300">
                    {selectedStation.waterTemperature.toFixed(1)} °C
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Pressure</span>
                  <span className="text-sm font-bold font-mono text-purple-300">
                    {selectedStation.pressure.toFixed(0)} hPa
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-mono">Current Speed</span>
                  <span className="text-sm font-bold font-mono text-indigo-300">
                    {selectedStation.currentSpeed.toFixed(1)} m/s
                  </span>
                </div>
              </div>

              {/* Predict CTA for this station */}
              <button
                id="btn-map-predict-selected"
                onClick={() => handlePredictStation(selectedStation)}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
              >
                <BrainCircuit size={16} />
                <span>Run ML Prediction for {selectedStation.stationName}</span>
              </button>
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 text-center text-slate-400 text-xs">
              Click on any buoy station marker on the map to inspect live marine parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

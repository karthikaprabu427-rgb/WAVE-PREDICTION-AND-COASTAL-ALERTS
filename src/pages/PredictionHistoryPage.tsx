import React, { useState, useEffect } from 'react';
import { PredictionResult } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import {
  History,
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  Waves,
  BrainCircuit,
  MapPin,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const PredictionHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<PredictionResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedResult, setSelectedResult] = useState<PredictionResult | null>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/prediction-history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data.history || []);
      }
    } catch (e) {
      console.error('Failed to load history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = history.filter((item) => {
    const matchesRisk = riskFilter === 'ALL' || item.riskLevel === riskFilter;
    const matchesSearch =
      item.inputParams.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.predictedWaveCategory.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRisk && matchesSearch;
  });

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = [
      'ID',
      'Location',
      'Latitude',
      'Longitude',
      'Input_WaveHeight',
      'Input_WavePeriod',
      'Input_WindSpeed',
      'Input_Pressure',
      'Predicted_WaveHeight',
      'Predicted_WavePeriod',
      'Predicted_Category',
      'Risk_Level',
      'Confidence_Score',
      'Timestamp',
    ];

    const rows = history.map((item) => [
      item.id,
      `"${item.inputParams.location}"`,
      item.inputParams.latitude,
      item.inputParams.longitude,
      item.inputParams.waveHeight,
      item.inputParams.wavePeriod,
      item.inputParams.windSpeed,
      item.inputParams.pressure,
      item.predictedWaveHeight,
      item.predictedWavePeriod,
      `"${item.predictedWaveCategory}"`,
      item.riskLevel,
      item.confidenceScore,
      item.timestamp,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wave_prediction_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
              <BrainCircuit size={14} />
              <span>Historical Inference Logs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Prediction Logs &amp; Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Review and audit all machine learning wave forecasts with multi-parameter verification
            </p>
          </div>

          <button
            id="btn-export-prediction-csv"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition"
          >
            <Download size={15} className="text-cyan-400" />
            <span>Export CSV Dataset</span>
          </button>
        </div>

        {/* Search and Risk Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-history"
              type="text"
              placeholder="Search by coastal location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                id={`btn-history-filter-${lvl.toLowerCase()}`}
                onClick={() => setRiskFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                  riskFilter === lvl
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

      {/* History Table */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 overflow-hidden space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading prediction logs...
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No prediction logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="pb-3 px-3">Location</th>
                  <th className="pb-3 px-3">Input Wind &amp; Swell</th>
                  <th className="pb-3 px-3">Predicted Height</th>
                  <th className="pb-3 px-3">Predicted Period</th>
                  <th className="pb-3 px-3">Risk Level</th>
                  <th className="pb-3 px-3">Confidence</th>
                  <th className="pb-3 px-3">Timestamp</th>
                  <th className="pb-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-200">{item.inputParams.location}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Lat: {item.inputParams.latitude}°, Lng: {item.inputParams.longitude}°
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-300">
                      <div>{item.inputParams.windSpeed} km/h ({item.inputParams.windDirection})</div>
                      <div className="text-[10px] text-slate-400">H_in: {item.inputParams.waveHeight}m</div>
                    </td>
                    <td className="py-3.5 px-3 font-mono font-bold text-cyan-300">
                      {item.predictedWaveHeight.toFixed(2)} m
                    </td>
                    <td className="py-3.5 px-3 font-mono text-sky-300">
                      {item.predictedWavePeriod.toFixed(1)} s
                    </td>
                    <td className="py-3.5 px-3">
                      <RiskBadge level={item.riskLevel} size="sm" />
                    </td>
                    <td className="py-3.5 px-3 font-mono text-emerald-400">
                      {item.confidenceScore}%
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        id={`btn-view-log-${item.id}`}
                        onClick={() => setSelectedResult(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-cyan-300 font-semibold text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Modal Drawer */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  Inference Log #{selectedResult.id}
                </span>
                <h3 className="text-xl font-bold text-slate-100 font-heading">
                  {selectedResult.inputParams.location}
                </h3>
              </div>
              <button
                onClick={() => setSelectedResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <RiskBadge level={selectedResult.riskLevel} size="md" />
              <span className="text-xs font-mono text-slate-400">
                Confidence: <strong className="text-emerald-400">{selectedResult.confidenceScore}%</strong>
              </span>
            </div>

            <WaveVisualizer
              waveHeight={selectedResult.predictedWaveHeight}
              wavePeriod={selectedResult.predictedWavePeriod}
              windSpeed={selectedResult.inputParams.windSpeed}
              height={140}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Predicted Height</span>
                <span className="text-base font-bold font-mono text-cyan-300">
                  {selectedResult.predictedWaveHeight.toFixed(2)} m
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Predicted Period</span>
                <span className="text-base font-bold font-mono text-sky-300">
                  {selectedResult.predictedWavePeriod.toFixed(1)} s
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-mono">Sea Category</span>
                <span className="text-sm font-bold text-amber-300 font-heading">
                  {selectedResult.predictedWaveCategory}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-slate-200 font-heading block">Meteorological Evaluation:</span>
                <p className="text-slate-300 leading-relaxed">{selectedResult.explanation}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-1">
                <span className="font-bold text-amber-300 font-heading block">Safety Instructions:</span>
                <p className="leading-relaxed">{selectedResult.recommendedAction}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedResult(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { OceanCondition, PredictionInput, PredictionResult } from '../types';
import { useAuth } from '../context/AuthContext';
import { RiskBadge } from '../components/RiskBadge';
import { WaveVisualizer } from '../components/WaveVisualizer';
import {
  BrainCircuit,
  Waves,
  Wind,
  Compass,
  Thermometer,
  Gauge,
  Activity,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface WavePredictionPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialStation?: OceanCondition | null;
}

export const WavePredictionPage: React.FC<WavePredictionPageProps> = ({ onNavigate, initialStation }) => {
  const { token, user } = useAuth();
  const [stations, setStations] = useState<OceanCondition[]>([]);
  const [selectedStationPreset, setSelectedStationPreset] = useState<string>(initialStation?.id || '');

  // Form input state
  const [location, setLocation] = useState<string>(initialStation?.stationName || 'Marina Coastal Buoy (CB-01)');
  const [latitude, setLatitude] = useState<number>(initialStation?.lat || 13.0475);
  const [longitude, setLongitude] = useState<number>(initialStation?.lng || 80.2825);
  const [waveHeight, setWaveHeight] = useState<number>(initialStation?.waveHeight || 2.4);
  const [wavePeriod, setWavePeriod] = useState<number>(initialStation?.wavePeriod || 9.0);
  const [windSpeed, setWindSpeed] = useState<number>(initialStation?.windSpeed || 36.0);
  const [windDirection, setWindDirection] = useState<string>(initialStation?.windDirection || 'ENE');
  const [waveDirection, setWaveDirection] = useState<string>(initialStation?.waveDirection || 'E');
  const [waterTemperature, setWaterTemperature] = useState<number>(initialStation?.waterTemperature || 28.5);
  const [pressure, setPressure] = useState<number>(initialStation?.pressure || 1008.0);
  const [currentSpeed, setCurrentSpeed] = useState<number>(initialStation?.currentSpeed || 1.1);
  const [currentDirection, setCurrentDirection] = useState<string>(initialStation?.currentDirection || 'NE');

  const [predicting, setPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ocean-conditions')
      .then((res) => res.json())
      .then((data) => setStations(data.stations || []))
      .catch((e) => console.error(e));
  }, []);

  const handleApplyPreset = (presetType: 'calm' | 'monsoon' | 'cyclone') => {
    if (presetType === 'calm') {
      setLocation('Kochi Harbor Channel (Calm Preset)');
      setLatitude(9.9312);
      setLongitude(76.2673);
      setWaveHeight(0.9);
      setWavePeriod(5.5);
      setWindSpeed(14.0);
      setWindDirection('WNW');
      setWaveDirection('W');
      setWaterTemperature(29.6);
      setPressure(1013.5);
      setCurrentSpeed(0.4);
      setCurrentDirection('SSE');
    } else if (presetType === 'monsoon') {
      setLocation('Goa High Swell Sector (Monsoon Preset)');
      setLatitude(15.4909);
      setLongitude(73.8278);
      setWaveHeight(3.2);
      setWavePeriod(10.8);
      setWindSpeed(52.0);
      setWindDirection('WSW');
      setWaveDirection('SW');
      setWaterTemperature(27.8);
      setPressure(1002.0);
      setCurrentSpeed(1.6);
      setCurrentDirection('NW');
    } else if (presetType === 'cyclone') {
      setLocation('Mumbai Offshore Surge (Storm Surge Preset)');
      setLatitude(18.922);
      setLongitude(72.8347);
      setWaveHeight(4.8);
      setWavePeriod(13.5);
      setWindSpeed(82.0);
      setWindDirection('SW');
      setWaveDirection('WSW');
      setWaterTemperature(26.5);
      setPressure(988.0);
      setCurrentSpeed(2.4);
      setCurrentDirection('NNE');
    }
  };

  const handleStationSelect = (stnId: string) => {
    setSelectedStationPreset(stnId);
    const stn = stations.find((s) => s.id === stnId);
    if (stn) {
      setLocation(stn.stationName);
      setLatitude(stn.lat);
      setLongitude(stn.lng);
      setWaveHeight(stn.waveHeight);
      setWavePeriod(stn.wavePeriod);
      setWindSpeed(stn.windSpeed);
      setWindDirection(stn.windDirection);
      setWaveDirection(stn.waveDirection);
      setWaterTemperature(stn.waterTemperature);
      setPressure(stn.pressure);
      setCurrentSpeed(stn.currentSpeed);
      setCurrentDirection(stn.currentDirection);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPredicting(true);

    const inputData: PredictionInput = {
      location,
      latitude,
      longitude,
      waveHeight: Number(waveHeight),
      wavePeriod: Number(wavePeriod),
      windSpeed: Number(windSpeed),
      windDirection,
      waveDirection,
      waterTemperature: Number(waterTemperature),
      pressure: Number(pressure),
      currentSpeed: Number(currentSpeed),
      currentDirection,
    };

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/predict', {
        method: 'POST',
        headers,
        body: JSON.stringify(inputData),
      });

      const data = await res.json();
      setPredicting(false);

      if (res.ok) {
        setPredictionResult(data.result);
        // Scroll to result
        setTimeout(() => {
          document.getElementById('prediction-result-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setError(data.error || 'Prediction calculation failed.');
      }
    } catch (e: any) {
      setPredicting(false);
      setError('Network communication failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <BrainCircuit size={14} />
            <span>Random Forest Ensemble Regressor • Scikit-Learn Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            ML Wave Prediction Module
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Enter oceanic and atmospheric parameters to forecast significant wave heights and coastal hazard levels
          </p>
        </div>

        {/* Preset Quick Fill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-preset-calm"
            type="button"
            onClick={() => handleApplyPreset('calm')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800 transition"
          >
            Calm Sea
          </button>
          <button
            id="btn-preset-monsoon"
            type="button"
            onClick={() => handleApplyPreset('monsoon')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800 transition"
          >
            Monsoon Swell
          </button>
          <button
            id="btn-preset-cyclone"
            type="button"
            onClick={() => handleApplyPreset('cyclone')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800 transition"
          >
            Storm Surge
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
          <ShieldAlert size={18} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Input Parameters Form */}
      <form onSubmit={handlePredict} className="space-y-6">
        {/* Section 1: Location & Station Preset */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100 font-heading">
                1. Location &amp; Coastal Station
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Geospatial Coordinates</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Buoy Station Preset
              </label>
              <select
                id="select-prediction-station-preset"
                value={selectedStationPreset}
                onChange={(e) => handleStationSelect(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 font-semibold focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Custom Coastal Location --</option>
                {stations.map((stn) => (
                  <option key={stn.id} value={stn.id}>
                    {stn.stationName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location / Sector Name
              </label>
              <input
                id="input-predict-location"
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Latitude (°N)
                </label>
                <input
                  id="input-predict-lat"
                  type="number"
                  step="0.0001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Longitude (°E)
                </label>
                <input
                  id="input-predict-lng"
                  type="number"
                  step="0.0001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Ocean Wave & Wind Dynamic Parameters */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Waves size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100 font-heading">
                2. Environmental &amp; Hydrodynamic Features
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">ML Feature Vector</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Wave Height Input with Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Current Wave Height (m)</label>
                <span className="font-mono text-sm font-extrabold text-cyan-300">{waveHeight} m</span>
              </div>
              <input
                id="slider-predict-wave-height"
                type="range"
                min="0.2"
                max="8.0"
                step="0.1"
                value={waveHeight}
                onChange={(e) => setWaveHeight(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block font-mono">Significant Wave Height (Hs)</span>
            </div>

            {/* Wave Period Input with Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Wave Period (s)</label>
                <span className="font-mono text-sm font-extrabold text-sky-300">{wavePeriod} s</span>
              </div>
              <input
                id="slider-predict-wave-period"
                type="range"
                min="3.0"
                max="18.0"
                step="0.1"
                value={wavePeriod}
                onChange={(e) => setWavePeriod(parseFloat(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block font-mono">Peak Spectral Period (Tp)</span>
            </div>

            {/* Wind Speed Input with Slider */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">Wind Speed (km/h)</label>
                <span className="font-mono text-sm font-extrabold text-amber-300">{windSpeed} km/h</span>
              </div>
              <input
                id="slider-predict-wind-speed"
                type="range"
                min="0"
                max="110"
                step="1"
                value={windSpeed}
                onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block font-mono">Sustained 10m Wind Velocity</span>
            </div>

            {/* Wind & Wave Direction */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wind Direction
                </label>
                <input
                  id="input-predict-wind-dir"
                  type="text"
                  value={windDirection}
                  onChange={(e) => setWindDirection(e.target.value)}
                  placeholder="e.g. SW, ENE"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Wave Direction
                </label>
                <input
                  id="input-predict-wave-dir"
                  type="text"
                  value={waveDirection}
                  onChange={(e) => setWaveDirection(e.target.value)}
                  placeholder="e.g. SW, E"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Water Temperature & Atmospheric Pressure */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sea Temp (°C)
                </label>
                <input
                  id="input-predict-temp"
                  type="number"
                  step="0.1"
                  value={waterTemperature}
                  onChange={(e) => setWaterTemperature(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pressure (hPa)
                </label>
                <input
                  id="input-predict-pressure"
                  type="number"
                  step="0.5"
                  value={pressure}
                  onChange={(e) => setPressure(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Surface Current Speed & Direction */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Speed (m/s)
                </label>
                <input
                  id="input-predict-current-speed"
                  type="number"
                  step="0.1"
                  value={currentSpeed}
                  onChange={(e) => setCurrentSpeed(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Current Direction
                </label>
                <input
                  id="input-predict-current-dir"
                  type="text"
                  value={currentDirection}
                  onChange={(e) => setCurrentDirection(e.target.value)}
                  placeholder="e.g. NNE"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2 uppercase font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            id="btn-run-ml-prediction"
            type="submit"
            disabled={predicting}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-cyan-500/25 transition transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {predicting ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                <span>Running Ensemble ML Inference...</span>
              </>
            ) : (
              <>
                <BrainCircuit size={20} />
                <span>Compute Wave &amp; Risk Prediction</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Prediction Result Section */}
      {predictionResult && (
        <div id="prediction-result-section" className="space-y-6 pt-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={24} className="text-emerald-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading text-slate-100">
              Machine Learning Prediction Output
            </h2>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900 border-2 border-cyan-500/40 shadow-2xl shadow-cyan-950/40 space-y-6">
            {/* Top Result Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div className="space-y-1">
                <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-bold">
                  6-Hour Oceanic Forecast for:
                </span>
                <h3 className="text-2xl font-bold text-slate-100 font-heading">
                  {predictionResult.inputParams.location}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Timestamp: {new Date(predictionResult.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[11px] text-slate-400 block font-mono">Model Confidence</span>
                  <span className="text-sm font-extrabold font-mono text-emerald-400">
                    {predictionResult.confidenceScore}%
                  </span>
                </div>
                <RiskBadge level={predictionResult.riskLevel} size="lg" />
              </div>
            </div>

            {/* Core Output Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Predicted Wave Height
                </span>
                <p className="font-mono text-4xl font-extrabold text-cyan-300 mt-1">
                  {predictionResult.predictedWaveHeight.toFixed(2)} <span className="text-base font-normal text-slate-400">m</span>
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Significant wave height ($H_s$)
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Predicted Wave Period
                </span>
                <p className="font-mono text-4xl font-extrabold text-sky-300 mt-1">
                  {predictionResult.predictedWavePeriod.toFixed(1)} <span className="text-base font-normal text-slate-400">sec</span>
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Dominant swell energy period ($T_p$)
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block font-mono">
                  Predicted Sea State
                </span>
                <p className="text-lg font-bold text-amber-300 mt-1 font-heading">
                  {predictionResult.predictedWaveCategory}
                </p>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  WMO Oceanic Beaufort Category
                </span>
              </div>
            </div>

            {/* Dynamic Wave Simulation of Predicted Result */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold">Simulated Forecast Wave Profile:</span>
                <span className="font-mono text-cyan-400">Predicted State</span>
              </div>
              <WaveVisualizer
                waveHeight={predictionResult.predictedWaveHeight}
                wavePeriod={predictionResult.predictedWavePeriod}
                windSpeed={predictionResult.inputParams.windSpeed}
                height={160}
              />
            </div>

            {/* Scientific Explanation & Safety Recommendation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                <span className="text-xs font-bold text-slate-200 block font-heading">
                  Meteorological Explanation
                </span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {predictionResult.explanation}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 text-amber-200">
                <span className="text-xs font-bold text-amber-300 block font-heading">
                  Recommended Coastal Safety Action
                </span>
                <p className="text-xs leading-relaxed">
                  {predictionResult.recommendedAction}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
              <span className="text-xs text-slate-400 font-mono">
                Stored in Prediction History database.
              </span>
              <div className="flex items-center gap-3">
                <button
                  id="btn-view-map-for-prediction"
                  onClick={() => onNavigate('risk-map')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  View on Risk Map
                </button>
                <button
                  id="btn-view-prediction-history"
                  onClick={() => onNavigate('history')}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition flex items-center gap-1.5"
                >
                  <span>Go to Prediction Logs</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

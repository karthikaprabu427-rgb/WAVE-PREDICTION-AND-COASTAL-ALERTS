import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RiskThresholds } from '../../types';
import {
  Sliders,
  Save,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Radio,
  Sparkles,
  Waves,
  Wind,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { token } = useAuth();
  const [thresholds, setThresholds] = useState<RiskThresholds>({
    lowMaxWaveHeight: 1.5,
    moderateMaxWaveHeight: 2.5,
    highMaxWaveHeight: 3.8,
    lowMaxWindSpeed: 25,
    moderateMaxWindSpeed: 45,
    highMaxWindSpeed: 65,
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/admin/thresholds', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.thresholds) setThresholds(data.thresholds);
      })
      .catch((e) => console.error(e));
  }, [token]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/thresholds', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(thresholds),
      });

      const data = await res.json();
      setSaving(false);

      if (res.ok) {
        setMessage({ type: 'success', text: 'Hazard classification thresholds updated successfully.' });
        if (data.thresholds) setThresholds(data.thresholds);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update thresholds.' });
      }
    } catch (e) {
      setSaving(false);
      setMessage({ type: 'error', text: 'Network request error.' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-2">
            <Sliders size={14} />
            <span>WMO Ocean Hazard Calibration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Coastal Risk Threshold Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure significant wave height ($H_s$) and wind velocity cutoffs for danger classification
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            message.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Threshold Form */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Wave Height Cutoffs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Waves size={18} className="text-cyan-400" />
            <h3 className="font-bold text-base text-slate-100 font-heading">
              1. Significant Wave Height ($H_s$) Cutoff Limits (Meters)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">LOW Risk Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.lowMaxWaveHeight} m</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="3.0"
                value={thresholds.lowMaxWaveHeight}
                onChange={(e) => setThresholds({ ...thresholds, lowMaxWaveHeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">Below this = LOW RISK</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">MODERATE Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.moderateMaxWaveHeight} m</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="4.0"
                value={thresholds.moderateMaxWaveHeight}
                onChange={(e) => setThresholds({ ...thresholds, moderateMaxWaveHeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">Below this = MODERATE RISK</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 font-mono">HIGH Risk Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.highMaxWaveHeight} m</span>
              </div>
              <input
                type="number"
                step="0.1"
                min="2.0"
                max="6.0"
                value={thresholds.highMaxWaveHeight}
                onChange={(e) => setThresholds({ ...thresholds, highMaxWaveHeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block">Above this = CRITICAL HAZARD</span>
            </div>
          </div>
        </div>

        {/* Wind Speed Cutoffs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Wind size={18} className="text-amber-400" />
            <h3 className="font-bold text-base text-slate-100 font-heading">
              2. Sustained Wind Velocity Limits (km/h)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 font-mono">LOW Wind Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.lowMaxWindSpeed} km/h</span>
              </div>
              <input
                type="number"
                step="1"
                min="10"
                max="50"
                value={thresholds.lowMaxWindSpeed}
                onChange={(e) => setThresholds({ ...thresholds, lowMaxWindSpeed: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 font-mono">MODERATE Wind Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.moderateMaxWindSpeed} km/h</span>
              </div>
              <input
                type="number"
                step="1"
                min="20"
                max="80"
                value={thresholds.moderateMaxWindSpeed}
                onChange={(e) => setThresholds({ ...thresholds, moderateMaxWindSpeed: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-400 font-mono">HIGH Wind Max</span>
                <span className="font-mono text-sm font-bold text-slate-200">{thresholds.highMaxWindSpeed} km/h</span>
              </div>
              <input
                type="number"
                step="1"
                min="40"
                max="120"
                value={thresholds.highMaxWindSpeed}
                onChange={(e) => setThresholds({ ...thresholds, highMaxWindSpeed: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 text-xs font-mono focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            id="btn-save-risk-thresholds"
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/40 transition disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Saving Calibration...' : 'Save Risk Calibration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

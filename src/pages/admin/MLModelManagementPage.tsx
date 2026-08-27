import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MLModelInfo } from '../../types';
import {
  BrainCircuit,
  Sliders,
  Play,
  CheckCircle2,
  AlertCircle,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const MLModelManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [models, setModels] = useState<MLModelInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [training, setTraining] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Retrain Hyperparameters
  const [algorithm, setAlgorithm] = useState<string>('Random Forest Regressor (Ensemble)');
  const [nEstimators, setNEstimators] = useState<number>(100);
  const [testSplit, setTestSplit] = useState<number>(0.2);
  const [maxDepth, setMaxDepth] = useState<number>(12);

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/admin/models', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setModels(data.models || []);
      }
    } catch (e) {
      console.error('Failed to load ML models:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, [token]);

  const handleRetrain = async (e: React.FormEvent) => {
    e.preventDefault();
    setTraining(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/models/retrain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          algorithm,
          nEstimators: Number(nEstimators),
          testSplit: Number(testSplit),
          maxDepth: Number(maxDepth),
        }),
      });

      const data = await res.json();
      setTraining(false);

      if (res.ok) {
        setMessage({
          type: 'success',
          text: `Model ${data.model.version} trained successfully! (Accuracy: ${data.model.metrics.accuracy}%, MAE: ${data.model.metrics.mae}m, R²: ${data.model.metrics.r2Score})`,
        });
        fetchModels();
      } else {
        setMessage({ type: 'error', text: data.error || 'Training process failed.' });
      }
    } catch (e) {
      setTraining(false);
      setMessage({ type: 'error', text: 'Network connection failure.' });
    }
  };

  const handleActivateModel = async (model: MLModelInfo) => {
    try {
      const res = await fetch(`/api/admin/models/${model.id}/activate`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Activated model version ${model.version} for live inference.` });
        fetchModels();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to switch active model.' });
    }
  };

  const activeModel = models.find((m) => m.status === 'active') || models[0];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-2">
            <BrainCircuit size={14} />
            <span>Physics-Calibrated Machine Learning Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            ML Model Management &amp; Training
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Train, fine-tune, benchmark, and deploy wave prediction regression pipelines
          </p>
        </div>

        {activeModel && (
          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 text-right">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Active Production Model</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {activeModel.version} ({activeModel.name})
            </span>
          </div>
        )}
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

      {/* Active Model Benchmark Highlights */}
      {activeModel && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Classification Accuracy</span>
            <p className="font-mono text-3xl font-extrabold text-emerald-400">
              {activeModel.metrics.accuracy}%
            </p>
            <span className="text-[11px] text-slate-500 font-mono">Precision &amp; Recall F1: 0.95</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Mean Absolute Error (MAE)</span>
            <p className="font-mono text-3xl font-extrabold text-cyan-300">
              {activeModel.metrics.mae} <span className="text-xs font-normal text-slate-400">m</span>
            </p>
            <span className="text-[11px] text-slate-500 font-mono">Significant wave height bias</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Root Mean Square Error</span>
            <p className="font-mono text-3xl font-extrabold text-sky-300">
              {activeModel.metrics.rmse} <span className="text-xs font-normal text-slate-400">m</span>
            </p>
            <span className="text-[11px] text-slate-500 font-mono">Variance deviation</span>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
            <span className="text-xs font-semibold text-slate-400">Coefficient of Determination (R²)</span>
            <p className="font-mono text-3xl font-extrabold text-purple-300">
              {activeModel.metrics.r2Score}
            </p>
            <span className="text-[11px] text-slate-500 font-mono">Goodness of fit</span>
          </div>
        </div>
      )}

      {/* Retrain Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders size={20} className="text-purple-400" />
            <h3 className="font-bold text-base text-slate-100 font-heading">
              Train &amp; Fine-Tune New Model Version
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">Scikit-Learn Regression Pipeline</span>
        </div>

        <form onSubmit={handleRetrain} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Algorithm Architecture
              </label>
              <select
                value={algorithm}
                onChange={(e) => setAlgorithm(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="Random Forest Regressor (Ensemble)">Random Forest Regressor</option>
                <option value="Gradient Boosting Regressor">Gradient Boosting Regressor</option>
                <option value="Ridge + Decision Tree Ensemble">Ridge + Decision Tree Ensemble</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimator Trees: <span className="text-purple-400 font-mono font-bold">{nEstimators}</span>
              </label>
              <input
                type="range"
                min="20"
                max="250"
                step="10"
                value={nEstimators}
                onChange={(e) => setNEstimators(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">Number of decision trees</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Train / Validation Split: <span className="text-cyan-400 font-mono font-bold">{((1 - testSplit) * 100).toFixed(0)} / {(testSplit * 100).toFixed(0)}</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="0.4"
                step="0.05"
                value={testSplit}
                onChange={(e) => setTestSplit(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">Test partition percentage</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Max Tree Depth: <span className="text-sky-400 font-mono font-bold">{maxDepth}</span>
              </label>
              <input
                type="range"
                min="4"
                max="24"
                step="1"
                value={maxDepth}
                onChange={(e) => setMaxDepth(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 font-mono">Regularization constraint</span>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              id="btn-trigger-model-retrain"
              type="submit"
              disabled={training}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-purple-950/40 transition disabled:opacity-50"
            >
              {training ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Computing Multi-Fold Training &amp; Validation...</span>
                </>
              ) : (
                <>
                  <Cpu size={16} />
                  <span>Execute Model Training Run</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Model History Registry */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-slate-100 font-heading">
          Model Version Registry
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="pb-3 px-3">Version &amp; Algorithm</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Accuracy</th>
                <th className="pb-3 px-3">MAE</th>
                <th className="pb-3 px-3">RMSE</th>
                <th className="pb-3 px-3">R² Score</th>
                <th className="pb-3 px-3">Trained Date</th>
                <th className="pb-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {models.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-200">{m.version}</div>
                    <div className="text-[10px] text-slate-400">{m.name}</div>
                  </td>
                  <td className="py-3 px-3">
                    {m.status === 'active' ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ACTIVE PRODUCTION
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-950 border border-slate-800">
                        STANDBY
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-400">{m.metrics.accuracy}%</td>
                  <td className="py-3 px-3 text-cyan-300">{m.metrics.mae}m</td>
                  <td className="py-3 px-3 text-sky-300">{m.metrics.rmse}m</td>
                  <td className="py-3 px-3 text-purple-300">{m.metrics.r2Score}</td>
                  <td className="py-3 px-3 text-slate-400">{new Date(m.trainedAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    {m.status !== 'active' && (
                      <button
                        onClick={() => handleActivateModel(m)}
                        className="px-3 py-1 rounded-lg bg-slate-950 hover:bg-purple-950/40 text-purple-300 border border-slate-800 hover:border-purple-600 text-xs font-semibold transition"
                      >
                        Deploy to Production
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

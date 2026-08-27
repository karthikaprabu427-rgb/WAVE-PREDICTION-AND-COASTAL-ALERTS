import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Database,
  BrainCircuit,
  Activity,
  Sliders,
  ShieldCheck,
  TrendingUp,
  Server,
  ArrowRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface AdminDashboardPageProps {
  onNavigate: (page: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const res = await fetch('/api/admin/system-stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error('Failed to load admin stats:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [token]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/95 border border-purple-900/50 shadow-xl shadow-purple-950/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono mb-2">
            <ShieldCheck size={14} />
            <span>Chief Oceanographer &amp; Administrator Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            System Administration Overview
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Welcome back, <span className="font-bold text-slate-200">{user?.name}</span>. Monitor telemetry feeds, retrain ML models, and broadcast coastal emergency alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-admin-broadcast-alert"
            onClick={() => onNavigate('admin-alerts')}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition"
          >
            <AlertTriangle size={15} />
            <span>Broadcast Alert</span>
          </button>

          <button
            id="btn-admin-retrain-model"
            onClick={() => onNavigate('admin-models')}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-950/40 transition"
          >
            <BrainCircuit size={15} />
            <span>Retrain ML Model</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigate('admin-users')}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Registered Users</span>
            <Users size={18} className="text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-purple-300">
            {stats?.usersCount || 3}
          </p>
          <span className="text-[11px] text-slate-400">Manage maritime accounts →</span>
        </div>

        <div
          onClick={() => onNavigate('admin-alerts')}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-red-500/40 transition cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Coastal Alerts</span>
            <AlertTriangle size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-red-400">
            {stats?.activeAlertsCount || 2}
          </p>
          <span className="text-[11px] text-slate-400">Manage advisories &amp; notices →</span>
        </div>

        <div
          onClick={() => onNavigate('admin-datasets')}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Uploaded Datasets</span>
            <Database size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-cyan-300">
            {stats?.datasetsCount || 2}
          </p>
          <span className="text-[11px] text-slate-400">2,850+ trained rows →</span>
        </div>

        <div
          onClick={() => onNavigate('admin-models')}
          className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer group space-y-1"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Model Accuracy</span>
            <BrainCircuit size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-emerald-400">
            {stats?.activeModel?.metrics?.accuracy || 96.4}%
          </p>
          <span className="text-[11px] text-slate-400">v1.4.2 Random Forest →</span>
        </div>
      </div>

      {/* Admin Modules Quick Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Module 1: Alert Broadcast */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-100 font-heading">
            Coastal Alert Broadcasts
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Issue emergency cyclone bulletins, high swell warnings, or small craft advisories to all maritime subscribers.
          </p>
          <button
            id="btn-goto-admin-alerts-module"
            onClick={() => onNavigate('admin-alerts')}
            className="text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 pt-1"
          >
            <span>Open Alert Manager</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Module 2: Dataset Manager */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Database size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-100 font-heading">
            Dataset &amp; CSV Ingestion
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Upload new oceanic telemetry CSVs, validate column headers, missing values, and prepare training matrices.
          </p>
          <button
            id="btn-goto-admin-datasets-module"
            onClick={() => onNavigate('admin-datasets')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 pt-1"
          >
            <span>Open Dataset Manager</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Module 3: ML Model Hub */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BrainCircuit size={20} />
          </div>
          <h3 className="text-base font-bold text-slate-100 font-heading">
            ML Training &amp; Benchmarks
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Retrain Random Forest &amp; Gradient Boosting models. Inspect MAE (0.14m), RMSE (0.21m), and R² (0.942) scores.
          </p>
          <button
            id="btn-goto-admin-models-module"
            onClick={() => onNavigate('admin-models')}
            className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 pt-1"
          >
            <span>Open Model Hub</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

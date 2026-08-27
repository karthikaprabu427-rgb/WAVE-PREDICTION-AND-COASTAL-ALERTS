import React from 'react';
import { WaveVisualizer } from '../components/WaveVisualizer';
import {
  Waves,
  ShieldCheck,
  BrainCircuit,
  MapPin,
  BellRing,
  BarChart3,
  ArrowRight,
  Shield,
  Activity,
  Compass,
  CheckCircle2,
  Database,
  Lock,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-white/10">
        {/* Background Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/15 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-blue-500/10 blur-[110px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Academic Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/40 border border-white/10 text-xs text-cyan-300 font-mono shadow-inner backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                <span>Final-Year Engineering Project • Real-Time Ocean AI</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] font-heading">
                Monitor Ocean Conditions.{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-400 bg-clip-text text-transparent">
                  Predict Waves.
                </span>{' '}
                Protect Coastal Communities.
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                An advanced full-stack marine intelligence platform powered by Machine Learning.
                Forecast significant wave heights, calculate real-time coastal hazard indices, monitor interactive buoy telemetry, and broadcast automated emergency alerts.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="btn-hero-get-started"
                  onClick={() => onNavigate('register')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition transform hover:-translate-y-0.5 border border-cyan-300/40"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  id="btn-hero-dashboard"
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/60 text-slate-200 border border-white/15 backdrop-blur-md font-bold text-sm sm:text-base flex items-center gap-2 transition shadow-sm"
                >
                  <Activity size={18} className="text-cyan-400" />
                  <span>Live Dashboard</span>
                </button>

                <button
                  id="btn-hero-predict"
                  onClick={() => onNavigate('predict')}
                  className="px-5 py-3 rounded-xl bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300 border border-cyan-400/30 backdrop-blur-md font-semibold text-sm flex items-center gap-2 transition shadow-sm"
                >
                  <BrainCircuit size={18} />
                  <span>Predict Waves</span>
                </button>
              </div>

              {/* Highlights pill row */}
              <div className="pt-4 grid grid-cols-3 gap-4 border-t border-white/10 max-w-xl">
                <div className="p-3 rounded-xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
                  <p className="font-mono text-2xl font-extrabold text-cyan-400">96.4%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Classification Accuracy</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
                  <p className="font-mono text-2xl font-extrabold text-sky-400">0.14m</p>
                  <p className="text-xs text-slate-400 mt-0.5">Mean Absolute Error (MAE)</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
                  <p className="font-mono text-2xl font-extrabold text-emerald-400">&lt; 15ms</p>
                  <p className="text-xs text-slate-400 mt-0.5">Inference Latency</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Wave Simulation Card */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/45 border border-white/15 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] backdrop-blur-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Waves className="text-cyan-400" size={20} />
                    <span className="font-bold text-sm text-slate-200 font-heading">Real-Time Wave Dynamics</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 backdrop-blur-sm">
                    LIVE SIMULATION
                  </span>
                </div>

                <WaveVisualizer
                  waveHeight={3.2}
                  wavePeriod={10.4}
                  windSpeed={48.0}
                  height={160}
                  className="border-white/10"
                />

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-400 block font-mono">Predicted H_s</span>
                    <span className="text-sm font-bold font-mono text-cyan-300">3.42 m</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-400 block font-mono">Peak Period T_p</span>
                    <span className="text-sm font-bold font-mono text-sky-300">11.2 s</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/50 border border-white/10 backdrop-blur-sm">
                    <span className="text-[10px] text-slate-400 block font-mono">Coastal Risk</span>
                    <span className="text-sm font-bold font-mono text-orange-400">HIGH</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 backdrop-blur-md flex items-start gap-2.5 text-xs text-amber-200">
                  <ShieldCheck size={16} className="text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-snug">
                    Small craft advisory active for coastal sectors. Rip currents and steep swells expected over the next 6-hour window.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Modules */}
      <section className="py-16 sm:py-20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase font-bold tracking-widest text-cyan-400">
              System Capabilities &amp; Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-100">
              End-to-End Marine Safety Pipeline
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Designed as an academic-grade operational tool with complete authentication, machine learning retraining, geospatial mapping, and automated early warning broadcast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-cyan-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <BrainCircuit size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">ML Wave Prediction Engine</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Physics-informed Ensemble Random Forest Regression model calibrated to multi-parameter ocean telemetry (Wind, Pressure, Currents, Bathymetry).
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-sky-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Dynamic Risk Calculation</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Standardized 4-tier risk classification (LOW, MODERATE, HIGH, CRITICAL) derived from WMO maritime safety index and configurable thresholds.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-emerald-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Interactive Leaflet Risk Map</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Geospatial coastal monitoring with real-time station markers, dynamic hazard radius buffers, nautical dark layers, and detailed telemetry popups.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-amber-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                <BellRing size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Automated Coastal Alerts</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                High Wave, Gale Storm, and Critical Storm Surge alert generation with in-app notification center, unread counters, and broadcast push capabilities.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-purple-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-400/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Database size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Admin Dataset &amp; Model Hub</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Upload CSV datasets, validate missing values, inspect column distributions, and retrain ML models with live MAE, RMSE, and R² score metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-white/10 hover:border-blue-400/40 backdrop-blur-xl shadow-lg hover:bg-slate-900/60 transition group space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-400/30 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-100 font-heading">Interactive Ocean Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Responsive time-series charting for wave heights, wind vs swell correlation, risk distribution breakdowns, and exportable prediction history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Segmentation Banner */}
      <section className="py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Card */}
            <div className="p-8 rounded-3xl bg-slate-900/45 border border-cyan-500/30 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20 text-cyan-400">
                    <Activity size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 font-heading">Maritime User Portal</h3>
                    <p className="text-xs text-slate-400 font-mono">Fisheries • Ports • Coastal Public</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 backdrop-blur-sm">
                  Standard Role
                </span>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Real-time ocean conditions &amp; buoy telemetry cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Run custom ML predictions with meteorological inputs</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Full interactive Leaflet coastal risk map</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-cyan-400 shrink-0" />
                  <span>Receive early coastal warnings &amp; in-app notifications</span>
                </li>
              </ul>

              <button
                id="btn-landing-login-user"
                onClick={() => onNavigate('login')}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-200 border border-cyan-400/40 text-xs font-bold transition backdrop-blur-sm shadow-sm"
              >
                Sign In as Maritime User →
              </button>
            </div>

            {/* Admin Card */}
            <div className="p-8 rounded-3xl bg-slate-900/45 border border-purple-500/30 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] space-y-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-400">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100 font-heading">Admin Command Center</h3>
                    <p className="text-xs text-slate-400 font-mono">Oceanographers • Met Officers</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/15 text-purple-300 border border-purple-400/30 backdrop-blur-sm">
                  Admin Role
                </span>
              </div>

              <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  <span>Manage users &amp; activate/deactivate accounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  <span>Create, broadcast, and resolve emergency coastal alerts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  <span>Upload CSV datasets &amp; validate missing values</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0" />
                  <span>Retrain ML models &amp; evaluate MAE/RMSE/R² metrics</span>
                </li>
              </ul>

              <button
                id="btn-landing-login-admin"
                onClick={() => onNavigate('admin-login')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-400/40 text-xs font-bold transition backdrop-blur-sm shadow-sm"
              >
                Access Admin Portal →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-slate-400 text-xs text-center border-t border-white/10 bg-[#020c1b]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="text-slate-300 font-medium">
            Wave Prediction and Coastal Alerts System • Final-Year Academic Project
          </p>
          <p className="text-slate-500">
            Powered by Machine Learning (Random Forest / Scikit-Learn Ensemble), Node.js/Express, React &amp; Leaflet.js
          </p>
        </div>
      </footer>
    </div>
  );
};

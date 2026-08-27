import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  Waves,
  Wind,
  TrendingUp,
  Activity,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('24h');

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
  }, []);

  const riskColors = {
    LOW: '#10b981',
    MODERATE: '#f59e0b',
    HIGH: '#f97316',
    CRITICAL: '#ef4444',
  };

  const pieData = analytics?.riskDistribution
    ? [
        { name: 'Low Risk', value: analytics.riskDistribution.LOW, color: riskColors.LOW },
        { name: 'Moderate Risk', value: analytics.riskDistribution.MODERATE, color: riskColors.MODERATE },
        { name: 'High Risk', value: analytics.riskDistribution.HIGH, color: riskColors.HIGH },
        { name: 'Critical Risk', value: analytics.riskDistribution.CRITICAL, color: riskColors.CRITICAL },
      ]
    : [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono mb-2">
            <Activity size={14} />
            <span>Multi-Station Oceanographic Telemetry Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Marine Analytics &amp; Trends
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time hydrodynamic wave spectra, wind vs swell correlation, and geospatial danger distribution
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 text-xs">
          {['6h', '24h', '7d', '30d'].map((rng) => (
            <button
              key={rng}
              id={`btn-time-range-${rng}`}
              onClick={() => setTimeRange(rng)}
              className={`px-3 py-1 rounded-xl font-semibold transition ${
                timeRange === rng
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rng.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Highlights Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Mean Wave Height</span>
            <Waves size={18} className="text-cyan-400" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-cyan-300">
            {analytics?.stats?.avgWaveHeight || 2.47} <span className="text-xs font-normal text-slate-400">m</span>
          </p>
          <span className="text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp size={12} />
            <span>Normal Seasonal Range</span>
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Max Recorded Swell</span>
            <ArrowUpRight size={18} className="text-red-400" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-red-400">
            {analytics?.stats?.maxWaveHeight || 4.8} <span className="text-xs font-normal text-slate-400">m</span>
          </p>
          <span className="text-[11px] text-red-300">Offshore Cyclone Sector</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Mean Wind Velocity</span>
            <Wind size={18} className="text-amber-400" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-amber-300">
            {analytics?.stats?.avgWindSpeed || 36.8} <span className="text-xs font-normal text-slate-400">km/h</span>
          </p>
          <span className="text-[11px] text-amber-400/80">Moderate Gale Gusts</span>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total ML Forecasts</span>
            <Activity size={18} className="text-purple-400" />
          </div>
          <p className="font-mono text-3xl font-extrabold text-purple-300">
            {analytics?.stats?.totalPredictions || 38}
          </p>
          <span className="text-[11px] text-purple-300">Model Pipeline v1.4</span>
        </div>
      </div>

      {/* Row 1 Charts: Wave Height Comparison & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wave Height by Station Bar Chart */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-slate-100 font-heading">
                Significant Wave Height by Coastal Station ($H_s$)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time Buoy Nodes</span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.stationComparisons || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis stroke="#64748b" fontSize={11} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} meters`, 'Wave Height']}
                />
                <Bar dataKey="waveHeight" fill="#06b6d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hazard Risk Distribution Pie Chart */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-100 font-heading">
                Station Hazard Index Share
              </h3>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090d16',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Pie Legend */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}:</span>
                <span className="font-mono font-bold text-slate-100">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Wind Speed vs Wave Swell Energy Correlation */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wind size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100 font-heading">
              Wind Velocity (km/h) vs Wave Height (m) Dynamics
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Physics Scatter &amp; Line Tracking</span>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analytics?.stationComparisons || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#06b6d4" fontSize={11} unit="m" />
              <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} unit="km/h" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="waveHeight" stroke="#06b6d4" strokeWidth={2.5} name="Wave Height (m)" dot={{ r: 4 }} />
              <Line yAxisId="right" type="monotone" dataKey="windSpeed" stroke="#f59e0b" strokeWidth={2.5} name="Wind Speed (km/h)" dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

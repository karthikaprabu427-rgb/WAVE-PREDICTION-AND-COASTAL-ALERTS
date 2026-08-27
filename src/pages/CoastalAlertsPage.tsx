import React, { useState, useEffect } from 'react';
import { CoastalAlert } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import {
  AlertTriangle,
  Flame,
  ShieldCheck,
  Search,
  Filter,
  Clock,
  MapPin,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Radio,
} from 'lucide-react';

export const CoastalAlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<CoastalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error('Failed to fetch coastal alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? alert.active
        : !alert.active;
    const matchesSeverity =
      severityFilter === 'all' || alert.severity.toLowerCase() === severityFilter.toLowerCase();
    const matchesSearch =
      alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.affectedRegions.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase())) ||
      alert.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono mb-2">
              <Radio size={14} className="animate-pulse" />
              <span>National Coastal Early Warning Broadcast System</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
              Coastal Hazard Advisories &amp; Warnings
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Real-time maritime safety bulletins, small craft advisories, and severe storm surge emergency alerts
            </p>
          </div>

          {/* Quick Counter Badges */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-red-950/40 border border-red-800/60 text-center">
              <span className="font-mono text-xl font-extrabold text-red-400 block">
                {alerts.filter((a) => a.active && a.riskLevel === 'CRITICAL').length}
              </span>
              <span className="text-[10px] text-red-300 font-semibold uppercase">Critical Alerts</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="font-mono text-xl font-extrabold text-slate-200 block">
                {alerts.filter((a) => a.active).length}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Active</span>
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="input-search-alerts"
              type="text"
              placeholder="Search by region, hazard type, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                id="btn-alert-filter-all"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                id="btn-alert-filter-active"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'active' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                }`}
              >
                Active Only
              </button>
              <button
                id="btn-alert-filter-resolved"
                onClick={() => setStatusFilter('resolved')}
                className={`px-3 py-1 rounded-lg font-semibold transition ${
                  statusFilter === 'resolved' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400'
                }`}
              >
                Resolved
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading coastal bulletin database...
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
            No coastal alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl bg-slate-900/90 border transition space-y-4 ${
                alert.riskLevel === 'CRITICAL'
                  ? 'border-red-500/50 shadow-lg shadow-red-950/20'
                  : alert.riskLevel === 'HIGH'
                  ? 'border-orange-500/40 shadow-lg shadow-orange-950/20'
                  : 'border-slate-800'
              }`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                    {alert.severity === 'danger' ? (
                      <Flame size={22} className="text-red-400 animate-pulse" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle size={22} className="text-amber-400" />
                    ) : (
                      <AlertCircle size={22} className="text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 font-heading">
                        {alert.title}
                      </h3>
                      {alert.active ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          RESOLVED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Type: <span className="text-slate-200 font-semibold">{alert.type}</span> • Issuer: {alert.issuedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge level={alert.riskLevel} size="md" />
                </div>
              </div>

              {/* Alert Body */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                <p className="leading-relaxed">{alert.description}</p>

                {/* Safety Actions */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
                  <span className="font-bold text-cyan-400 block font-heading">
                    Mandatory Safety Instructions:
                  </span>
                  <p className="text-slate-300 leading-relaxed">{alert.instructions}</p>
                </div>
              </div>

              {/* Affected Regions and Timestamps Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-400">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-[11px] text-slate-400">Affected Sectors:</span>
                  {alert.affectedRegions.map((region, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-slate-300 border border-slate-800 text-[11px] font-medium flex items-center gap-1"
                    >
                      <MapPin size={11} className="text-cyan-400" />
                      {region}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock size={12} />
                    Issued: {new Date(alert.issuedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {alert.validUntil && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Calendar size={12} />
                      Expires: {new Date(alert.validUntil).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

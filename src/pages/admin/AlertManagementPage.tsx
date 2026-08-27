import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CoastalAlert, RiskLevel } from '../../types';
import { RiskBadge } from '../../components/RiskBadge';
import {
  AlertTriangle,
  Radio,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Flame,
  X,
  AlertCircle,
  Send,
} from 'lucide-react';

export const AlertManagementPage: React.FC = () => {
  const { token, user } = useAuth();
  const [alerts, setAlerts] = useState<CoastalAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Alert Form State
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<string>('High Wave Warning');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('HIGH');
  const [severity, setSeverity] = useState<'info' | 'warning' | 'danger'>('danger');
  const [description, setDescription] = useState<string>('');
  const [instructions, setInstructions] = useState<string>('');
  const [affectedRegionsStr, setAffectedRegionsStr] = useState<string>('Mumbai Offshore, Gujarat Coast');
  const [validHours, setValidHours] = useState<number>(24);
  const [broadcasting, setBroadcasting] = useState<boolean>(false);

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts || []);
      }
    } catch (e) {
      console.error('Failed to load alerts:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    setMessage(null);

    const affectedRegions = affectedRegionsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const validUntil = new Date(Date.now() + validHours * 3600 * 1000).toISOString();

    try {
      const res = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          type,
          riskLevel,
          severity,
          description,
          instructions,
          affectedRegions,
          validUntil,
        }),
      });

      const data = await res.json();
      setBroadcasting(false);

      if (res.ok) {
        setShowBroadcastModal(false);
        setMessage({ type: 'success', text: 'Emergency coastal alert broadcasted successfully to all subscribers!' });
        setTitle('');
        setDescription('');
        setInstructions('');
        fetchAlerts();
      } else {
        setMessage({ type: 'error', text: data.error || 'Broadcast failed.' });
      }
    } catch (e) {
      setBroadcasting(false);
      setMessage({ type: 'error', text: 'Network request error.' });
    }
  };

  const handleResolveAlert = async (alert: CoastalAlert) => {
    try {
      const res = await fetch(`/api/admin/alerts/${alert.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ active: false }),
      });
      if (res.ok) {
        setMessage({ type: 'success', text: `Alert "${alert.title}" resolved.` });
        fetchAlerts();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to update alert.' });
    }
  };

  const handleDeleteAlert = async (alert: CoastalAlert) => {
    if (!confirm(`Delete bulletin: ${alert.title}?`)) return;
    try {
      const res = await fetch(`/api/admin/alerts/${alert.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: 'success', text: 'Alert deleted from broadcast history.' });
        fetchAlerts();
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Failed to delete alert.' });
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono mb-2">
            <Radio size={14} className="animate-pulse" />
            <span>Emergency Broadcast Transmitter</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Coastal Alert Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Publish high swell bulletins, small craft advisories, and emergency storm surge sirens
          </p>
        </div>

        <button
          id="btn-open-broadcast-modal"
          onClick={() => setShowBroadcastModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-red-950/40 transition"
        >
          <Send size={15} />
          <span>Publish New Broadcast</span>
        </button>
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

      {/* Alerts Feed */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-mono">
            Loading alert repository...
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
            No active or archived alerts in the system.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 rounded-3xl bg-slate-900/90 border transition space-y-4 ${
                alert.active ? 'border-red-500/40 shadow-xl shadow-red-950/20' : 'border-slate-800 opacity-75'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                    {alert.severity === 'danger' ? (
                      <Flame size={20} className="text-red-400 animate-pulse" />
                    ) : alert.severity === 'warning' ? (
                      <AlertTriangle size={20} className="text-amber-400" />
                    ) : (
                      <AlertCircle size={20} className="text-cyan-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-100 font-heading">
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
                      Type: <span className="text-slate-200">{alert.type}</span> • Issuer: {alert.issuedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RiskBadge level={alert.riskLevel} size="md" />
                  {alert.active && (
                    <button
                      onClick={() => handleResolveAlert(alert)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-950/40 text-slate-300 hover:text-emerald-300 border border-slate-700 text-xs font-semibold transition"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAlert(alert)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Delete Alert"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p className="leading-relaxed">{alert.description}</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-cyan-400">Safety Instructions: </strong>
                  {alert.instructions}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span>Regions:</span>
                  {alert.affectedRegions.map((r, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                      {r}
                    </span>
                  ))}
                </div>
                <span>Issued: {new Date(alert.issuedAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-red-900/50 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send size={20} className="text-red-400" />
                <h3 className="font-bold text-base text-slate-100 font-heading">
                  Broadcast Coastal Alert
                </h3>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAlert} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Alert Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SEVERE CYCLONIC SWELL ADVISORY"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Alert Type
                  </label>
                  <input
                    type="text"
                    required
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="High Wave Warning"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Risk Level
                  </label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Affected Coastal Sectors (Comma separated)
                </label>
                <input
                  type="text"
                  required
                  value={affectedRegionsStr}
                  onChange={(e) => setAffectedRegionsStr(e.target.value)}
                  placeholder="e.g. Mumbai Offshore, Goa, Kerala Coast"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Advisory Description
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe ocean state, wave height range, wind velocity..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Actionable Safety Instructions
                </label>
                <textarea
                  rows={2}
                  required
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Fishermen advised not to venture into deep sea. Small craft stay moored."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Radio size={14} />
                  <span>{broadcasting ? 'Transmitting...' : 'Transmit Alert'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

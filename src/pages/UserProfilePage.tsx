import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Mail, Building, Phone, Key, Save, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, token, updateUser, isAdmin } = useAuth();
  const [name, setName] = useState<string>(user?.name || '');
  const [organization, setOrganization] = useState<string>(user?.organization || '');
  const [phone, setPhone] = useState<string>(user?.phone || '');
  const [saving, setSaving] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setSaving(true);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, organization, phone }),
      });
      const data = await res.json();
      setSaving(false);

      if (res.ok) {
        updateUser(data.user);
        setSuccessMessage('Profile information saved successfully.');
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (e: any) {
      setSaving(false);
      setError('Network communication failure.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            User Profile &amp; Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your account credentials, maritime station preferences, and API telemetry keys
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
              <Shield size={14} />
              ADMINISTRATOR
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <User size={14} />
              MARITIME OPERATOR
            </span>
          )}
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center gap-3 text-xs text-red-300">
          <AlertCircle size={18} className="text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Account Summary */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6 text-center">
          <div className="relative inline-block">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl mx-auto object-cover border-2 border-cyan-500/50 shadow-xl bg-slate-800"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950"></span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-100">{user?.name}</h3>
            <p className="text-xs text-slate-400 font-mono truncate">{user?.email}</p>
            <p className="text-xs text-cyan-400 font-semibold">{user?.organization || 'Maritime Sector'}</p>
          </div>

          <div className="border-t border-slate-800 pt-4 space-y-2 text-left text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Account Status:</span>
              <span className="text-emerald-400 font-mono font-bold uppercase">{user?.status || 'active'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Member Since:</span>
              <span className="text-slate-200 font-mono">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Form */}
        <div className="md:col-span-2 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-slate-100 font-heading">
            Personal &amp; Organization Details
          </h2>

          <form className="space-y-4" onSubmit={handleSave}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User size={16} />
                  </div>
                  <input
                    id="input-profile-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    id="input-profile-email"
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-slate-400 text-sm cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Organization / Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Building size={16} />
                  </div>
                  <input
                    id="input-profile-org"
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g. National Marine Port Operations"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Emergency Phone Contact
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone size={16} />
                  </div>
                  <input
                    id="input-profile-phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* API Authorization Token Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key size={16} className="text-cyan-400" />
                  <span className="text-xs font-bold text-slate-200">API Bearer Session Token</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Use this token to authenticate external wave prediction requests to <code className="text-cyan-300 font-mono">/api/predict</code>.
              </p>
              <div className="p-2 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 break-all border border-slate-800">
                Bearer {token || 'demo-session-token'}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="btn-save-profile"
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition disabled:opacity-50"
              >
                <Save size={16} />
                <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

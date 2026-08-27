import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, KeyRound } from 'lucide-react';

interface AdminLoginPageProps {
  onNavigate: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password, 'admin');
    setSubmitting(false);

    if (result.success) {
      onNavigate('admin-dashboard');
    } else {
      setError(result.error || 'Invalid administrator credentials');
    }
  };

  const handleAdminDemoFill = () => {
    setEmail('admin@wavepredict.org');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900/95 border border-purple-900/50 p-8 rounded-3xl shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/20 text-white mb-2">
            <Shield size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Admin Command Login
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/80">
            Authorized personnel only • Dataset, Model &amp; Alert Broadcasts
          </p>
        </div>

        {/* Quick Admin Demo Credentials Fill Button */}
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-purple-300 block">Chief Oceanographer Admin:</span>
            <span className="text-slate-400 font-mono text-[11px]">admin@wavepredict.org / Admin@123</span>
          </div>
          <button
            id="btn-admin-demo-fill"
            type="button"
            onClick={handleAdminDemoFill}
            className="px-2.5 py-1 text-xs font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-lg flex items-center gap-1 transition"
          >
            <Sparkles size={12} />
            <span>Auto-fill</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-300">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              Admin Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                id="input-admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@wavepredict.org"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-purple-900/60 text-slate-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1">
              Master Admin Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <KeyRound size={16} />
              </div>
              <input
                id="input-admin-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-purple-900/60 text-slate-100 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          <button
            id="btn-admin-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 transition disabled:opacity-50"
          >
            {submitting ? 'Verifying Credentials...' : 'Authenticate Admin Session'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <p>
            Maritime User?{' '}
            <button
              id="btn-goto-user-login"
              onClick={() => onNavigate('login')}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Standard User Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

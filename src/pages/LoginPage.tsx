import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Waves, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await login(email, password, 'user');
    setSubmitting(false);

    if (result.success) {
      onNavigate('dashboard');
    } else {
      setError(result.error || 'Invalid email or password');
    }
  };

  const handleDemoFill = () => {
    setEmail('user@wavepredict.org');
    setPassword('User@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-slate-900/90 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20 text-white mb-2">
            <Waves size={28} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-100">
            Maritime User Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access ocean telemetry and ML wave predictions
          </p>
        </div>

        {/* Quick Demo Credentials Fill Button */}
        <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-cyan-300 block">Quick Demo User:</span>
            <span className="text-slate-400 font-mono text-[11px]">user@wavepredict.org / User@123</span>
          </div>
          <button
            id="btn-login-demo-fill"
            type="button"
            onClick={handleDemoFill}
            className="px-2.5 py-1 text-xs font-bold bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg flex items-center gap-1 transition"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail size={16} />
              </div>
              <input
                id="input-login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                Password
              </label>
              <button
                id="btn-goto-forgot-pass"
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <input
                id="input-login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              />
            </div>
          </div>

          <button
            id="btn-login-submit"
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition disabled:opacity-50"
          >
            {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-400 space-y-2">
          <p>
            Don&apos;t have an account?{' '}
            <button
              id="btn-goto-register"
              onClick={() => onNavigate('register')}
              className="text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Create Account
            </button>
          </p>
          <p>
            System Administrator?{' '}
            <button
              id="btn-goto-admin-login"
              onClick={() => onNavigate('admin-login')}
              className="text-purple-400 hover:text-purple-300 font-bold underline"
            >
              Admin Portal
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

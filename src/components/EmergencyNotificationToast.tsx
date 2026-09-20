import React, { useEffect } from 'react';
import { ShieldAlert, AlertTriangle, X, Waves, ArrowRight } from 'lucide-react';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';

export const EmergencyNotificationToast: React.FC = () => {
  const { activeNotificationToast, dismissNotificationToast, openAlertModal } = useEmergencyAlert();

  useEffect(() => {
    if (!activeNotificationToast) return;
    // Auto dismiss after 10 seconds if not clicked
    const timer = setTimeout(() => {
      dismissNotificationToast();
    }, 10000);
    return () => clearTimeout(timer);
  }, [activeNotificationToast, dismissNotificationToast]);

  if (!activeNotificationToast) return null;

  const isExtreme = activeNotificationToast.riskLevel === 'CRITICAL';
  const isHigh = activeNotificationToast.riskLevel === 'HIGH';

  return (
    <div
      role="region"
      aria-label="Emergency Coastal Alert Notification"
      className="fixed bottom-5 right-5 z-[90] max-w-sm w-full animate-slideInRight"
    >
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all ${
          isExtreme
            ? 'bg-slate-950/95 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.4)] ring-1 ring-red-500/50'
            : isHigh
            ? 'bg-slate-950/95 border-amber-500/70 shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-amber-500/40'
            : 'bg-slate-950/95 border-slate-700 shadow-xl'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                isExtreme
                  ? 'bg-red-500/20 text-red-400'
                  : isHigh
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-cyan-500/20 text-cyan-400'
              }`}
            >
              {isExtreme ? (
                <span className="text-lg">🚨</span>
              ) : isHigh ? (
                <span className="text-lg">🔔</span>
              ) : (
                <Waves size={18} />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-xs font-black uppercase tracking-wider ${
                    isExtreme ? 'text-red-400' : isHigh ? 'text-amber-300' : 'text-cyan-300'
                  }`}
                >
                  {activeNotificationToast.title}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${
                    isExtreme
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : isHigh
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {activeNotificationToast.riskLevel === 'CRITICAL' ? 'EXTREME' : activeNotificationToast.riskLevel}
                </span>
              </div>

              <p className="text-xs text-slate-200 font-medium leading-snug">
                {activeNotificationToast.message}
              </p>

              {/* Wave Height indicator */}
              <div className="pt-1 flex items-center gap-3 text-[11px] text-slate-400">
                <span>
                  Location: <strong className="text-slate-100">{activeNotificationToast.location}</strong>
                </span>
                <span>
                  Wave: <strong className="text-cyan-300 font-mono">{activeNotificationToast.waveHeight.toFixed(1)}m</strong>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissNotificationToast}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>

        {/* Action Button for High/Extreme */}
        {(isExtreme || isHigh) && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-end">
            <button
              type="button"
              onClick={() => {
                dismissNotificationToast();
                openAlertModal();
              }}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              <span>View Emergency Directives &amp; Radar</span>
              <ArrowRight size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

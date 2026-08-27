import React, { useState } from 'react';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  Trash2,
  AlertTriangle,
  Flame,
  Info,
  ExternalLink,
  Filter,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface NotificationsPageProps {
  onNavigate: (page: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread' | 'danger' | 'warning'>('all');

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'danger') return notif.severity === 'danger';
    if (filter === 'warning') return notif.severity === 'warning';
    return true;
  });

  const handleNotificationAction = (notif: any) => {
    markAsRead(notif.id);
    if (notif.link) {
      const page = notif.link.replace('/', '');
      onNavigate(page || 'dashboard');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <Bell size={20} />
            </div>
            <h1 className="text-2xl font-extrabold font-heading text-slate-100">
              In-App Notification Center
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time storm bulletins, model retrain telemetry, and automated coastal hazard notices
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              id="btn-notif-mark-all-read"
              onClick={markAllAsRead}
              className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <CheckCheck size={14} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 text-xs w-fit">
        <button
          id="btn-notif-tab-all"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            filter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          id="btn-notif-tab-unread"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            filter === 'unread' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          id="btn-notif-tab-danger"
          onClick={() => setFilter('danger')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition ${
            filter === 'danger' ? 'bg-red-500 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Emergency Warnings
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center text-slate-400 text-xs">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                !notif.read
                  ? 'bg-slate-900 border-cyan-500/40 shadow-lg shadow-cyan-950/20'
                  : 'bg-slate-950/80 border-slate-800/80 opacity-80 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {notif.severity === 'danger' ? (
                    <Flame size={20} className="text-red-400 animate-pulse" />
                  ) : notif.severity === 'warning' ? (
                    <AlertTriangle size={20} className="text-amber-400" />
                  ) : (
                    <Info size={20} className="text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-bold truncate ${!notif.read ? 'text-slate-100' : 'text-slate-300'}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(notif.timestamp).toLocaleString()}
                    </span>
                    {notif.link && (
                      <button
                        onClick={() => handleNotificationAction(notif)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                    title="Mark as Read"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                )}
                <button
                  onClick={() => clearNotification(notif.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

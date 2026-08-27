import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Waves,
  MapPin,
  AlertTriangle,
  Bell,
  BarChart3,
  History,
  User,
  Users,
  Database,
  BrainCircuit,
  Sliders,
  Shield,
  Activity,
  LogOut,
  ChevronRight,
  Radio,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
  count?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen = true,
  onClose,
}) => {
  const { user, isAdmin, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const userNavItems: NavItem[] = [
    { id: 'dashboard', label: 'Monitoring Dashboard', icon: LayoutDashboard },
    { id: 'predict', label: 'ML Wave Prediction', icon: Waves, badge: 'AI' },
    { id: 'risk-map', label: 'Interactive Risk Map', icon: MapPin },
    { id: 'alerts', label: 'Coastal Alerts', icon: AlertTriangle },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount },
    { id: 'analytics', label: 'Ocean Analytics', icon: BarChart3 },
    { id: 'history', label: 'Prediction History', icon: History },
    { id: 'profile', label: 'User Profile', icon: User },
  ];

  const adminNavItems: NavItem[] = [
    { id: 'admin-dashboard', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'admin-users', label: 'User Management', icon: Users },
    { id: 'admin-alerts', label: 'Alert Broadcasts', icon: AlertTriangle },
    { id: 'admin-datasets', label: 'Dataset Manager', icon: Database },
    { id: 'admin-models', label: 'ML Models & Training', icon: BrainCircuit, badge: 'RF' },
    { id: 'admin-analytics', label: 'System Telemetry', icon: BarChart3 },
    { id: 'admin-settings', label: 'Risk Thresholds', icon: Sliders },
  ];


  const currentNavList = isAdmin && currentPage.startsWith('admin') ? adminNavItems : userNavItems;

  const handleItemClick = (pageId: string) => {
    onNavigate(pageId);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 bg-[#020c1b]/70 backdrop-blur-xl border-r border-white/10 transition-transform duration-200 ease-in-out flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation List */}
        <div className="p-4 space-y-6">
          {/* Active Mode Banner */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/40 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-400' : 'bg-cyan-400'} animate-pulse`} />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-200">
                {isAdmin ? 'Admin Console' : 'Monitoring Center'}
              </span>
            </div>
            {isAdmin && (
              <button
                id="btn-switch-to-user-view"
                onClick={() => handleItemClick(currentPage.startsWith('admin') ? 'dashboard' : 'admin-dashboard')}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-semibold underline"
              >
                {currentPage.startsWith('admin') ? 'User View' : 'Admin View'}
              </button>
            )}
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
              {isAdmin && currentPage.startsWith('admin') ? 'Admin Controls' : 'Main Navigation'}
            </div>

            {currentNavList.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                    isActive
                      ? isAdmin && currentPage.startsWith('admin')
                        ? 'bg-purple-600/20 text-purple-200 border border-purple-400/40 backdrop-blur-md shadow-inner'
                        : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 backdrop-blur-md shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={18}
                      className={
                        isActive
                          ? isAdmin && currentPage.startsWith('admin')
                            ? 'text-purple-400'
                            : 'text-cyan-400'
                          : 'text-slate-400 group-hover:text-slate-300'
                      }
                    />
                    <span>{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded bg-cyan-950/60 text-cyan-300 border border-cyan-700/40 backdrop-blur-sm">
                        {item.badge}
                      </span>
                    )}
                    {typeof item.count === 'number' && item.count > 0 && (
                      <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse shadow-md">
                        {item.count}
                      </span>
                    )}
                    {isActive && (
                      <ChevronRight size={14} className="text-cyan-400 opacity-80" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom System Status Widget */}
        <div className="p-4 border-t border-white/10 space-y-3 bg-slate-950/40 backdrop-blur-md">
          <div className="p-3 rounded-xl bg-slate-900/40 border border-white/10 text-xs space-y-1.5 backdrop-blur-md">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">ML Engine</span>
              <span className="text-cyan-400 font-mono font-bold">v1.4.2 RF</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Model Accuracy</span>
              <span className="text-emerald-400 font-mono font-bold">96.4%</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">R² Score</span>
              <span className="text-sky-300 font-mono font-bold">0.942</span>
            </div>
          </div>

          <button
            id="btn-sidebar-logout"
            onClick={() => {
              logout();
              onNavigate('landing');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/30 backdrop-blur-md transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

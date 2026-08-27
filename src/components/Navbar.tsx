import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Waves,
  Bell,
  CheckCircle,
  AlertTriangle,
  Flame,
  Info,
  User as UserIcon,
  LogOut,
  Shield,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Activity,
} from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleNotificationClick = (notif: any) => {
    markAsRead(notif.id);
    setShowNotifMenu(false);
    if (notif.link) {
      const page = notif.link.replace('/', '');
      onNavigate(page || 'dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#020c1b]/75 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            {isAuthenticated && onToggleSidebar && (
              <button
                id="btn-toggle-sidebar"
                onClick={onToggleSidebar}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md md:hidden"
                aria-label="Toggle sidebar"
              >
                <Menu size={20} />
              </button>
            )}

            <div
              id="brand-logo-container"
              onClick={() => onNavigate(isAuthenticated ? (isAdmin ? 'admin-dashboard' : 'dashboard') : 'landing')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/90 to-blue-600/90 border border-cyan-400/30 backdrop-blur-md flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Waves className="text-white h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300 bg-clip-text text-transparent block leading-tight">
                  WAVE PREDICTION
                </span>
                <span className="text-[10px] font-mono tracking-widest text-cyan-300/70 block uppercase">
                  &amp; Coastal Alert System
                </span>
              </div>
            </div>
          </div>

          {/* Center: Live Station Status Ticker */}
          <div className="hidden lg:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-md text-xs shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-mono">Live Ocean Buoy Network:</span>
            <span className="text-emerald-400 font-semibold font-mono">9 Stations Connected</span>
          </div>

          {/* Right Navigation & Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Role Switcher Pill */}
                {isAdmin ? (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-400/30 backdrop-blur-md text-purple-300 text-xs font-mono shadow-sm">
                    <Shield size={12} />
                    <span className="font-bold uppercase tracking-wider">Admin Portal</span>
                  </div>
                ) : (
                  <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 backdrop-blur-md text-cyan-300 text-xs font-mono shadow-sm">
                    <Activity size={12} />
                    <span className="font-bold uppercase tracking-wider">Maritime User</span>
                  </div>
                )}

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    id="btn-navbar-notifications"
                    onClick={() => {
                      setShowNotifMenu(!showNotifMenu);
                      setShowUserMenu(false);
                    }}
                    className="relative p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/30 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition shadow-sm"
                    aria-label="View notifications"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-[#020c1b] animate-bounce shadow-md">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Menu */}
                  {showNotifMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#031329]/85 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-slate-900/60 backdrop-blur-md">
                        <div className="flex items-center gap-2">
                          <Bell size={16} className="text-cyan-400" />
                          <span className="font-bold text-sm text-slate-100">Coastal Alerts &amp; Notifications</span>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            id="btn-mark-all-read"
                            onClick={() => markAllAsRead()}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No notifications at this time.
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => handleNotificationClick(notif)}
                              className={`p-3.5 hover:bg-white/[0.06] cursor-pointer transition flex items-start gap-3 ${
                                !notif.read ? 'bg-cyan-950/30' : ''
                              }`}
                            >
                              <div className="mt-0.5 shrink-0">
                                {notif.severity === 'danger' ? (
                                  <Flame size={16} className="text-red-400" />
                                ) : notif.severity === 'warning' ? (
                                  <AlertTriangle size={16} className="text-amber-400" />
                                ) : (
                                  <Info size={16} className="text-cyan-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className={`text-xs font-semibold truncate ${!notif.read ? 'text-slate-100' : 'text-slate-300'}`}>
                                    {notif.title}
                                  </p>
                                  {!notif.read && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-300/80 mt-0.5 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                                  {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className="p-2 border-t border-white/10 bg-slate-900/60 text-center">
                        <button
                          id="btn-view-all-notifs"
                          onClick={() => {
                            setShowNotifMenu(false);
                            onNavigate('notifications');
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold py-1 block w-full"
                        >
                          View all in Notification Center →
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Avatar & Menu */}
                <div className="relative">
                  <button
                    id="btn-navbar-profile"
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifMenu(false);
                    }}
                    className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/30 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition shadow-sm"
                  >
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name || 'User'}`}
                      alt={user?.name}
                      className="w-8 h-8 rounded-lg object-cover border border-cyan-500/30 bg-slate-800"
                    />
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-bold text-slate-200 truncate max-w-[130px]">{user?.name}</p>
                      <p className="text-[10px] text-cyan-400 font-mono capitalize">{user?.role}</p>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 hidden md:block" />
                  </button>

                  {/* User Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#031329]/85 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.6)] z-50 overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-4 py-2.5 border-b border-white/10 bg-slate-900/40">
                        <p className="text-xs font-bold text-slate-100">{user?.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                        <p className="text-[10px] text-cyan-400 font-mono mt-0.5">{user?.organization || 'Maritime Sector'}</p>
                      </div>

                      <div className="py-1">
                        <button
                          id="btn-menu-profile"
                          onClick={() => {
                            setShowUserMenu(false);
                            onNavigate('profile');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-slate-200 hover:bg-white/[0.08] hover:text-white flex items-center gap-2.5 transition"
                        >
                          <UserIcon size={14} className="text-cyan-400" />
                          <span>My Profile &amp; Settings</span>
                        </button>
                        {isAdmin && (
                          <button
                            id="btn-menu-admin-panel"
                            onClick={() => {
                              setShowUserMenu(false);
                              onNavigate('admin-dashboard');
                            }}
                            className="w-full px-4 py-2 text-left text-xs text-purple-300 hover:bg-purple-950/40 flex items-center gap-2.5 transition"
                          >
                            <Shield size={14} className="text-purple-400" />
                            <span>Admin Command Center</span>
                          </button>
                        )}
                      </div>

                      <div className="border-t border-white/10 pt-1">
                        <button
                          id="btn-navbar-logout"
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                            onNavigate('landing');
                          }}
                          className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-950/40 flex items-center gap-2.5 transition"
                        >
                          <LogOut size={14} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Guest Actions */
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  id="btn-nav-login"
                  onClick={() => onNavigate('login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white rounded-xl bg-slate-900/40 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition shadow-sm"
                >
                  User Login
                </button>
                <button
                  id="btn-nav-admin-login"
                  onClick={() => onNavigate('admin-login')}
                  className="px-3.5 py-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 rounded-xl bg-purple-950/30 hover:bg-purple-900/40 border border-purple-500/30 backdrop-blur-md transition hidden sm:inline-flex items-center gap-1.5 shadow-sm"
                >
                  <Shield size={12} />
                  <span>Admin Login</span>
                </button>
                <button
                  id="btn-nav-register"
                  onClick={() => onNavigate('register')}
                  className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 rounded-xl shadow-lg shadow-cyan-500/25 transition border border-cyan-300/40"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

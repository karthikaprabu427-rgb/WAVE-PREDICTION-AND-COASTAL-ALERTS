import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { useOceanData } from '../context/OceanDataContext';
import { useEmergencyAlert } from '../context/EmergencyAlertContext';
import { usePublicAnnouncer } from '../context/PublicAnnouncerContext';
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
  Radio,
  Volume2,
  VolumeX,
  ShieldAlert,
  Search,
  Megaphone,
} from 'lucide-react';
import { GlobalSearchModal } from './GlobalSearchModal';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage, onToggleSidebar }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { stations, updateInterval, countdown, isPlaying, isSimulating } = useOceanData();
  const { isHighRisk, isExtremeRisk, isMuted, toggleMute, openAlertModal, activeRiskLevel, emergencyStation } = useEmergencyAlert();
  const {
    isBroadcasting,
    isSpeaking,
    startAllLanguagesBroadcast,
    stopBroadcast,
    skipToNextLanguage,
    lineByLineStatus,
  } = usePublicAnnouncer();
  const [showNotifMenu, setShowNotifMenu] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showRadioMenu, setShowRadioMenu] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState<boolean>(false);
  const [selectedRadioRegion, setSelectedRadioRegion] = useState<string>('Marina Beach Coastal Region');

  // Global keyboard shortcut (Ctrl+K, Cmd+K, or '/') to open search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.metaKey || e.ctrlKey)) ||
        (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
          <div className="hidden xl:flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-slate-900/40 border border-white/10 backdrop-blur-md text-xs shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-cyan-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="text-slate-300 font-mono">Live Ocean:</span>
            <span className="text-cyan-300 font-bold font-mono">
              {stations.length} Buoys ({updateInterval}s cycle)
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {isPlaying ? `${countdown}s` : 'Paused'}
            </span>
          </div>

          {/* Global Search Option Bar */}
          <button
            id="btn-navbar-global-search"
            type="button"
            onClick={() => setShowGlobalSearch(true)}
            className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-800/90 border border-cyan-500/30 hover:border-cyan-400/60 text-slate-300 hover:text-white transition text-xs shadow-inner group w-28 sm:w-48 md:w-56 lg:w-64"
            title="Search beaches, coastal points, buoys, and ports worldwide (Ctrl + K)"
            aria-label="Search coastal locations"
          >
            <div className="flex items-center gap-2 truncate">
              <Search size={14} className="text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
              <span className="truncate text-slate-400 group-hover:text-slate-200">
                <span className="hidden sm:inline">Search beach, coast, buoy...</span>
                <span className="sm:hidden">Search...</span>
              </span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-400 group-hover:text-cyan-300">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>

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

                {/* Emergency Siren Mute/Unmute Quick Button */}
                <button
                  id="btn-navbar-siren-mute"
                  onClick={toggleMute}
                  className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/30 hover:bg-slate-800/60 border border-white/10 backdrop-blur-md transition shadow-sm"
                  title={isMuted ? 'Emergency Siren: Muted (Click to Unmute)' : 'Emergency Siren: Active (Click to Mute)'}
                  aria-label="Toggle Siren Audio"
                >
                  {isMuted ? <VolumeX size={18} className="text-red-400" /> : <Volume2 size={18} className="text-emerald-400" />}
                </button>

                {/* Coastal Radio Quick Option in Top Navbar */}
                <div className="relative">
                  <button
                    id="btn-navbar-public-announcer"
                    onClick={() => {
                      setShowRadioMenu(!showRadioMenu);
                      setShowNotifMenu(false);
                      setShowUserMenu(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-xl border backdrop-blur-md transition shadow-sm flex items-center gap-1.5 ${
                      isBroadcasting
                        ? 'bg-red-600/30 border-red-500 text-red-300 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                        : 'bg-slate-900/40 hover:bg-slate-800/60 border-white/15 text-slate-300 hover:text-cyan-300'
                    }`}
                    title="Coastal Emergency Radio Broadcast (VHF Channel 16 & Beach Horns)"
                    aria-label="Coastal Emergency Radio"
                  >
                    <Radio size={16} className={isBroadcasting ? 'text-red-400 animate-bounce' : 'text-cyan-400'} />
                    <span className="text-xs font-bold hidden sm:inline">
                      {isBroadcasting ? 'Radio: ON AIR' : 'Coastal Radio'}
                    </span>
                    {isBroadcasting && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                      </span>
                    )}
                  </button>

                  {/* Radio Quick Controls Dropdown */}
                  {showRadioMenu && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#031329]/95 backdrop-blur-2xl border border-white/15 shadow-[0_16px_40px_rgba(0,0,0,0.7)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-4 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Radio size={16} className="text-cyan-400" />
                          <span className="font-bold text-sm text-slate-100">
                            Coastal Emergency Radio
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                          isBroadcasting ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isBroadcasting ? '● LIVE ON-AIR' : 'STANDBY'}
                        </span>
                      </div>

                      {/* Region Selector */}
                      <div>
                        <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1">
                          Coastal Region:
                        </label>
                        <select
                          id="select-navbar-radio-region"
                          value={selectedRadioRegion}
                          onChange={(e) => setSelectedRadioRegion(e.target.value)}
                          className="w-full text-xs font-semibold bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-cyan-400"
                        >
                          <option value="Marina Beach Coastal Region">Marina Beach Coast (Chennai)</option>
                          <option value="Tuticorin Coastal Port">Tuticorin Coastal Port</option>
                          <option value="Rameswaram Shoreline">Rameswaram Shoreline</option>
                          <option value="Kochi Coastal Sector">Kochi Coastal Sector</option>
                          <option value="Visakhapatnam Bay">Visakhapatnam Bay</option>
                          <option value="Kanyakumari Ocean Point">Kanyakumari Ocean Point</option>
                          {emergencyStation && (
                            <option value={emergencyStation.stationName}>
                              {emergencyStation.stationName} (Monitored Station)
                            </option>
                          )}
                        </select>
                      </div>

                      {/* Current Status / Spoken Language */}
                      {isBroadcasting && lineByLineStatus ? (
                        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-amber-300 font-bold flex items-center gap-1.5">
                              <Volume2 size={14} className="animate-pulse" />
                              Speaking Line {lineByLineStatus.currentIndex + 1}/5 ({lineByLineStatus.currentLangName})
                            </span>
                            <span className="text-slate-400 text-[10px] font-mono">156.8 MHz</span>
                          </div>
                          <p className="text-xs text-slate-200 line-clamp-2">
                            "{lineByLineStatus.currentText}"
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={skipToNextLanguage}
                              className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                            >
                              Next Language
                            </button>
                            <button
                              type="button"
                              onClick={stopBroadcast}
                              className="py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition"
                            >
                              Silence
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            Plays voice warning over <strong>all 5 regional languages</strong> (Tamil, English, Hindi, Telugu, Malayalam) as a <strong>small option at the top of the screen</strong> without disturbing your current page.
                          </p>
                          <button
                            id="btn-navbar-start-5lang-broadcast"
                            type="button"
                            onClick={async () => {
                              setShowRadioMenu(false);
                              await startAllLanguagesBroadcast({
                                location: selectedRadioRegion,
                                hazardType: activeRiskLevel === 'CRITICAL' ? 'TSUNAMI' : 'HIGH_WAVE',
                                playAudioOutLoud: true,
                              });
                            }}
                            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition"
                          >
                            <Volume2 size={15} />
                            <span>Broadcast 5 Languages at Top of Screen</span>
                          </button>
                        </div>
                      )}

                      {/* Footer Link to Full Announcer Console */}
                      <div className="pt-1 flex items-center justify-between text-xs border-t border-white/10">
                        <span className="text-slate-400 text-[11px]">8 Acoustic Masts Online</span>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRadioMenu(false);
                            onNavigate('public-announcer');
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-bold transition flex items-center gap-1"
                        >
                          <span>Open Full Studio Console</span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Active Emergency Alert Indicator Pill */}
                {(isHighRisk || isExtremeRisk) && (
                  <button
                    id="btn-navbar-emergency-active"
                    onClick={openAlertModal}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition ${
                      isExtremeRisk
                        ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-500/50'
                        : 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/30'
                    }`}
                  >
                    <ShieldAlert size={15} />
                    <span className="hidden sm:inline">{isExtremeRisk ? 'EMERGENCY' : 'HIGH RISK'}</span>
                  </button>
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
                        {(!notifications || notifications.length === 0) ? (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No notifications at this time.
                          </div>
                        ) : (
                          (notifications || []).slice(0, 6).map((notif) => (
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

      {/* Global Coastal Location & Station Search Modal */}
      <GlobalSearchModal
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onNavigate={onNavigate}
      />
    </header>
  );
};

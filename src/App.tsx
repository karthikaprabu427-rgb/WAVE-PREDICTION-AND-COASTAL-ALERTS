import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { WavePredictionPage } from './pages/WavePredictionPage';
import { RiskMapPage } from './pages/RiskMapPage';
import { CoastalAlertsPage } from './pages/CoastalAlertsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AlertManagementPage } from './pages/admin/AlertManagementPage';
import { DatasetManagementPage } from './pages/admin/DatasetManagementPage';
import { MLModelManagementPage } from './pages/admin/MLModelManagementPage';
import { SystemAnalyticsPage } from './pages/admin/SystemAnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Sync initial page based on URL hash or auth status
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      setCurrentPage(hash);
    } else if (isAuthenticated) {
      setCurrentPage(isAdmin ? 'admin-dashboard' : 'dashboard');
    }
  }, [isAuthenticated, isAdmin]);

  const handleNavigate = (page: string, params?: any) => {
    // Admin route protection
    if (page.startsWith('admin') && !isAdmin && !['admin-login'].includes(page)) {
      setCurrentPage('admin-login');
      window.location.hash = 'admin-login';
      return;
    }

    setPageParams(params || null);
    setCurrentPage(page);
    window.location.hash = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isAuthPage = ['login', 'register', 'admin-login', 'forgot-password'].includes(currentPage);
  const isLandingPage = currentPage === 'landing' && !isAuthenticated;

  const renderPageContent = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'admin-login':
        return <AdminLoginPage onNavigate={handleNavigate} />;
      case 'forgot-password':
        return <ForgotPasswordPage onNavigate={handleNavigate} />;
      case 'profile':
        return <UserProfilePage />;
      case 'dashboard':
        return <UserDashboardPage onNavigate={handleNavigate} />;
      case 'predict':
        return (
          <WavePredictionPage
            onNavigate={handleNavigate}
            initialStation={pageParams?.prefillStation || null}
          />
        );
      case 'risk-map':
        return <RiskMapPage onNavigate={handleNavigate} />;
      case 'alerts':
        return <CoastalAlertsPage />;
      case 'notifications':
        return <NotificationsPage onNavigate={handleNavigate} />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'history':
        return <PredictionHistoryPage />;

      // Admin Pages
      case 'admin-dashboard':
        return <AdminDashboardPage onNavigate={handleNavigate} />;
      case 'admin-users':
        return <UserManagementPage />;
      case 'admin-alerts':
        return <AlertManagementPage />;
      case 'admin-datasets':
        return <DatasetManagementPage />;
      case 'admin-models':
        return <MLModelManagementPage />;
      case 'admin-analytics':
        return <SystemAnalyticsPage />;
      case 'admin-settings':
        return <SettingsPage />;

      default:
        return isAuthenticated ? (
          <UserDashboardPage onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020c1b] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="fixed top-[40%] right-[20%] w-[350px] h-[350px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Navigation Header */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex w-full relative z-10">
        {/* Sidebar for Authenticated Users (when not in standalone full landing) */}
        {isAuthenticated && !isAuthPage && currentPage !== 'landing' && (
          <Sidebar
            currentPage={currentPage}
            onNavigate={handleNavigate}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Content Container */}
        <main
          className={`flex-1 overflow-x-hidden ${
            isAuthenticated && !isAuthPage && currentPage !== 'landing'
              ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full'
              : 'w-full'
          }`}
        >
          {renderPageContent()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainAppContent />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;

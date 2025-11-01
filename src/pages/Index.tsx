import { useState, useEffect } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';
import { ProjectDetail } from '@/components/ProjectDetail';
import { AdminPanel } from '@/components/AdminPanel';
import { useAuth } from '@/hooks/useAuth';
import { initializeMockData } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

type Screen = 'login' | 'dashboard' | 'project-detail' | 'admin-panel';

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // Initialize mock data on first load
    initializeMockData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setCurrentScreen(isAuthenticated ? 'dashboard' : 'login');
    }
  }, [isAuthenticated, isLoading]);

  const handleLoginSuccess = () => {
    setCurrentScreen('dashboard');
  };

  const handleProjectSelect = (projectId: string) => {
    setSelectedProject(projectId);
    setCurrentScreen('project-detail');
  };

  const handleBackToDashboard = () => {
    setSelectedProject('');
    setCurrentScreen('dashboard');
  };

  const handleOpenAdminPanel = () => {
    setCurrentScreen('admin-panel');
  };

  const handleLogout = () => {
    logout();
    setCurrentScreen('login');
    setSelectedProject('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando sistema académico...</p>
        </div>
      </div>
    );
  }

  switch (currentScreen) {
    case 'login':
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
    
    case 'dashboard':
      return (
        <>
          <Dashboard 
            onProjectSelect={handleProjectSelect}
            onLogout={handleLogout}
          />
          {/* Floating Admin Button */}
          {user?.role === 'admin' && (
            <Button
              onClick={handleOpenAdminPanel}
              className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-elevated"
              aria-label="Panel de administración"
            >
              <Settings className="w-6 h-6" />
            </Button>
          )}
        </>
      );
    
    case 'project-detail':
      return (
        <ProjectDetail 
          projectId={selectedProject}
          onBack={handleBackToDashboard}
        />
      );

    case 'admin-panel':
      return (
        <AdminPanel 
          onBack={handleBackToDashboard}
        />
      );
    
    default:
      return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }
};

export default Index;

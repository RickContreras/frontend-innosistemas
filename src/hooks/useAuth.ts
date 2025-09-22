import { useState, useEffect } from 'react';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'estudiante' | 'profesor' | 'admin';
  authorizedProjects: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Mock user data
const mockUsers: Record<string, { password: string; user: User }> = {
  estudiante: {
    password: '1234',
    user: {
      id: '1',
      username: 'estudiante',
      name: 'Ana García',
      role: 'estudiante',
      authorizedProjects: ['proyecto-a']
    }
  },
  profesor: {
    password: 'prof123',
    user: {
      id: '2',
      username: 'profesor',
      name: 'Dr. Carlos Rodríguez',
      role: 'profesor',
      authorizedProjects: ['proyecto-a', 'proyecto-b']
    }
  },
  admin: {
    password: 'admin123',
    user: {
      id: '3',
      username: 'admin',
      name: 'María López',
      role: 'admin',
      authorizedProjects: ['proyecto-a', 'proyecto-b', 'proyecto-c']
    }
  }
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Session timeout (1 minute for demo)
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('academic_user');
    const sessionExpiry = localStorage.getItem('session_expiry');
    
    if (savedUser && sessionExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(sessionExpiry);
      
      if (now < expiry) {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
        startSessionTimer(expiry - now);
        return;
      } else {
        // Session expired
        localStorage.removeItem('academic_user');
        localStorage.removeItem('session_expiry');
      }
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
  }, []);

  const startSessionTimer = (duration: number) => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    const timeout = setTimeout(() => {
      logout();
      console.warn('Session expired due to inactivity');
    }, duration);
    
    setSessionTimeout(timeout);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API call
    
    const userRecord = mockUsers[username.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      console.warn('Login attempt failed:', { username, timestamp: new Date().toISOString() });
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
    
    const sessionDuration = 60000; // 1 minute for demo
    const expiryTime = new Date().getTime() + sessionDuration;
    
    localStorage.setItem('academic_user', JSON.stringify(userRecord.user));
    localStorage.setItem('session_expiry', expiryTime.toString());
    
    setAuthState({
      user: userRecord.user,
      isAuthenticated: true,
      isLoading: false
    });
    
    startSessionTimer(sessionDuration);
    console.log('User logged in successfully:', userRecord.user.name);
    
    return { success: true };
  };

  const logout = () => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    localStorage.removeItem('academic_user');
    localStorage.removeItem('session_expiry');
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    console.log('User logged out');
  };

  const hasProjectAccess = (projectId: string): boolean => {
    return authState.user?.authorizedProjects.includes(projectId) ?? false;
  };

  const logAccessAttempt = (projectId: string, success: boolean) => {
    const logEntry = {
      userId: authState.user?.id,
      username: authState.user?.username,
      projectId,
      success,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.log('Access attempt logged:', logEntry);
    
    // In a real app, this would be sent to a backend audit service
    const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
    auditLog.push(logEntry);
    localStorage.setItem('audit_log', JSON.stringify(auditLog));
  };

  return {
    ...authState,
    login,
    logout,
    hasProjectAccess,
    logAccessAttempt
  };
};
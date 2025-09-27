import { useState, useEffect } from 'react';
import { apiService, type LoginResponse } from '@/services/api';
import { config, logger } from '@/config/env';

export interface User {
  username: string;
  email: string;
  roles: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AccessAttempt {
  userId?: string;
  username?: string;
  projectId: string;
  success: boolean;
  timestamp: string;
  userAgent: string;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const token = localStorage.getItem('jwt_token');
    const tokenExpiry = localStorage.getItem('token_expiry');
    
    if (token && tokenExpiry) {
      const now = new Date().getTime();
      const expiry = parseInt(tokenExpiry);
      
      if (now < expiry) {
        // Token aún válido, verificar con el backend
        const response = await apiService.getCurrentUser();
        
        if (response.data && response.status === 200) {
          setAuthState({
            user: response.data,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Configurar timeout para el tiempo restante
          startSessionTimer(expiry - now);
          return;
        }
      }
      
      // Token expirado o inválido
      clearTokens();
    }
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
  };

  const startSessionTimer = (duration: number) => {
    if (sessionTimeout) clearTimeout(sessionTimeout);
    
    const timeout = setTimeout(() => {
      handleSessionExpired();
    }, duration);
    
    setSessionTimeout(timeout);
  };

  const handleSessionExpired = () => {
    clearTokens();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    console.warn('Sesión expirada por inactividad');
  };

  const clearTokens = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('token_expiry');
    localStorage.removeItem('login_time');
    if (sessionTimeout) clearTimeout(sessionTimeout);
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    const response = await apiService.login({ username, password });
    
    if (response.data && response.status === 200) {
      const { token, expiresInMinutes, user } = response.data;
      
      // Guardar token y configurar expiración
      const expiryTime = new Date().getTime() + (expiresInMinutes * 60 * 1000);
      const loginTime = new Date().toISOString();
      
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('token_expiry', expiryTime.toString());
      localStorage.setItem('login_time', loginTime);
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false
      });
      
      startSessionTimer(expiresInMinutes * 60 * 1000);
      console.log('Usuario autenticado exitosamente:', user.username);
      
      return { success: true };
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      console.warn('Intento de login fallido:', { username, timestamp: new Date().toISOString() });
      return { success: false, error: response.error || 'Error de autenticación' };
    }
  };

  const logout = async () => {
    // Notificar al backend (opcional, el token se manejará en frontend)
    await apiService.logout();
    
    clearTokens();
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    console.log('Usuario desconectado');
  };

  const hasRole = (role: string): boolean => {
    return authState.user?.roles.includes(role) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const isStudent = (): boolean => {
    return hasRole('ROLE_STUDENT');
  };

  const isTeacher = (): boolean => {
    return hasRole('ROLE_TEACHER');
  };

  const isAdmin = (): boolean => {
    return hasAnyRole(['ROLE_STUDENT', 'ROLE_TEACHER']); // Admin tiene ambos roles
  };

  // Función para registrar intentos de acceso (para auditoría)
  const logAccessAttempt = (projectId: string, success: boolean) => {
    const logEntry: AccessAttempt = {
      userId: authState.user?.username,
      username: authState.user?.username,
      projectId,
      success,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    
    console.log('Intento de acceso registrado:', logEntry);
    
    // Guardar en localStorage para debugging (en producción esto iría al backend)
    const auditLog = JSON.parse(localStorage.getItem('audit_log') || '[]');
    auditLog.push(logEntry);
    localStorage.setItem('audit_log', JSON.stringify(auditLog.slice(-100))); // Mantener últimos 100
  };

  return {
    ...authState,
    login,
    logout,
    hasRole,
    hasAnyRole,
    isStudent,
    isTeacher,
    isAdmin,
    logAccessAttempt
  };
};
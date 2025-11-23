import { useState, useEffect } from 'react';
import { apiService, type LoginResponse } from '@/services/api';
import { config, logger } from '@/config/env';

export interface User {
  id?: number;
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
          const user = response.data;
          
          // 🔍 DEBUG: Ver usuario restaurado
          console.log('✅ Sesión restaurada - usuario:', user);
          console.log('🆔 ID de usuario:', (user as any).id || 'No disponible en la respuesta');
          console.log('✅ Roles restaurados:', user.roles);
          
          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Configurar timeout para el tiempo restante
          const remainingTime = expiry - now;
          startSessionTimer(remainingTime);
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
      
      // 🔍 DEBUG: Ver datos completos del login
      console.log('✅ Login exitoso - respuesta completa:', response.data);
      console.log('✅ Usuario:', user);
      console.log('🆔 ID de usuario:', (user as any)?.id || 'No disponible en la respuesta');
      console.log('✅ Roles:', user?.roles);
      
      // Validar que user y roles existan
      if (!user || !user.roles || !Array.isArray(user.roles)) {
        console.error('❌ Error: datos de usuario inválidos', user);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: 'Datos de usuario inválidos' };
      }
      
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
      console.log('✅ Usuario autenticado exitosamente:', user.username, 'con roles:', user.roles);
      console.log('🆔 ID del usuario logueado:', (user as any)?.id || 'No disponible en la respuesta');
      
      return { success: true };
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      console.warn('❌ Intento de login fallido:', { username, error: response.error, timestamp: new Date().toISOString() });
      return { success: false, error: response.error || 'Credenciales inválidas' };
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
    const has = authState.user?.roles?.includes(role) ?? false;
    if (!authState.user?.roles) {
      console.warn('⚠️ hasRole llamado pero user.roles es undefined', { role, user: authState.user });
    }
    return has;
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
    return hasAnyRole(['ROLE_ADMIN', 'ROLE_TEACHER']); // Admin tiene rol ADMIN o TEACHER
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
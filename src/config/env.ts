// Configuración centralizada usando variables de entorno
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev/',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'InnoSistemas',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Session Configuration
  sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hora por defecto
  
  // Development Configuration
  isDev: import.meta.env.DEV,
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  
  // Environment info
  mode: import.meta.env.MODE,
} as const;

// Helper functions
export const isDevMode = () => config.isDev;
export const shouldLog = (level: 'debug' | 'info' | 'warn' | 'error') => {
  const levels = ['debug', 'info', 'warn', 'error'];
  return levels.indexOf(level) >= levels.indexOf(config.logLevel);
};

// Log helper
export const logger = {
  debug: (...args: any[]) => shouldLog('debug') && console.debug('[DEBUG]', ...args),
  info: (...args: any[]) => shouldLog('info') && console.info('[INFO]', ...args),
  warn: (...args: any[]) => shouldLog('warn') && console.warn('[WARN]', ...args),
  error: (...args: any[]) => shouldLog('error') && console.error('[ERROR]', ...args),
};
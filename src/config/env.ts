// Configuración centralizada usando variables de entorno
export const config = {
  // Microservices Configuration
  services: {
    auth: import.meta.env.VITE_AUTH_SERVICE_URL || 'https://studious-waffle-pvv4jv9qqx4f9r-8080.app.github.dev',
    projects: import.meta.env.VITE_PROJECTS_SERVICE_URL || 'https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev',
    deliveries: import.meta.env.VITE_DELIVERIES_SERVICE_URL || 'https://humble-sniffle-4445j4696xxc7665-8080.app.github.dev',
  },
  
  // Legacy API URL (deprecated - usar services.auth)
  apiUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_AUTH_SERVICE_URL || 'https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev',
  
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
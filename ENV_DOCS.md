# 🔧 Variables de Entorno

Este proyecto utiliza variables de entorno para la configuración. Todas las variables de frontend deben tener el prefijo `VITE_`.

## 📋 Variables Disponibles

### Configuración de API
| Variable | Descripción | Valor por Defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `VITE_API_URL` | URL del microservicio de backend | `https://jubilant-pancake-5w5j6ggxrv246jj-8080.app.github.dev` | ✅ |

### Configuración de la Aplicación
| Variable | Descripción | Valor por Defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `VITE_APP_NAME` | Nombre de la aplicación | `InnoSistemas` | ❌ |
| `VITE_APP_VERSION` | Versión de la aplicación | `1.0.0` | ❌ |
| `VITE_SESSION_TIMEOUT` | Timeout de sesión en ms | `3600000` (1 hora) | ❌ |

### Configuración de Desarrollo
| Variable | Descripción | Valor por Defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `VITE_ENABLE_DEVTOOLS` | Habilitar herramientas de dev | `true` | ❌ |
| `VITE_LOG_LEVEL` | Nivel de logging | `debug` | ❌ |

## 🔄 Proxy de Desarrollo

En desarrollo, se usa un proxy de Vite que redirige:
- `/api/*` → `${VITE_API_URL}/api/*`
- `/auth/*` → `${VITE_API_URL}/auth/*`

Esto evita problemas de CORS durante el desarrollo.

## 📁 Archivos de Configuración

### `.env` (Desarrollo local)
```bash
# Variables de entorno para desarrollo
VITE_API_URL=https://jubilant-pancake-5w5j6ggxrv246jj-8080.app.github.dev
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
VITE_SESSION_TIMEOUT=3600000
VITE_APP_NAME=InnoSistemas
VITE_APP_VERSION=1.0.0
```

### `.env.production` (Producción)
```bash
VITE_API_URL=https://api.innosistemas.com
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=warn
VITE_SESSION_TIMEOUT=1800000
```

## 🛠️ Uso en el Código

Las variables se acceden a través del archivo de configuración centralizado:

```typescript
import { config, logger } from '@/config/env';

// Uso de configuración
console.log(config.apiUrl);
console.log(config.appName);

// Uso de logger
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message');
```

## 🔐 Seguridad

- ⚠️ **NUNCA** pongas secrets o tokens en variables `VITE_*`
- ✅ Solo variables de configuración pública
- ✅ Las variables `VITE_*` son expuestas al cliente
- ✅ Para secrets usa variables de servidor sin prefijo `VITE_`
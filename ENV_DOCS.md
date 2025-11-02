# 🔧 Variables de Entorno

Este proyecto utiliza variables de entorno para la configuración. Todas las variables de frontend deben tener el prefijo `VITE_`.

## 📋 Variables Disponibles

### Configuración de Microservicios
| Variable | Descripción | Valor por Defecto | Requerida |
|----------|-------------|-------------------|-----------|
| `VITE_AUTH_SERVICE_URL` | URL del microservicio de autenticación | `https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev` | ✅ |
| `VITE_PROJECTS_SERVICE_URL` | URL del microservicio de proyectos | `https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev` | ✅ |
| `VITE_API_URL` | ⚠️ **Deprecated** - Usar `VITE_AUTH_SERVICE_URL` | Auto | ❌ |

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

## 🔄 Arquitectura de Microservicios

La aplicación consume múltiples microservicios:

### Microservicio de Autenticación (`VITE_AUTH_SERVICE_URL`)
- `/auth/login` - Autenticación de usuarios
- `/auth/logout` - Cierre de sesión
- `/auth/me` - Información del usuario actual
- `/api/users/*` - Gestión de usuarios
- `/api/roles/*` - Gestión de roles y permisos
- `/api/health/db` - Health check

### Microservicio de Proyectos (`VITE_PROJECTS_SERVICE_URL`)
- `/api/projects/student/{id}` - Proyectos por estudiante
- `/api/projects/*` - Otros endpoints de proyectos

### Manejo de CORS
En desarrollo, asegúrate de que ambos microservicios tengan CORS habilitado o usa un proxy.

## 📁 Archivos de Configuración

### `.env` (Desarrollo local)
```bash
# Microservicios
VITE_AUTH_SERVICE_URL=https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev
VITE_PROJECTS_SERVICE_URL=https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev

# Configuración de la aplicación
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
VITE_SESSION_TIMEOUT=3600000
VITE_APP_NAME=InnoSistemas
VITE_APP_VERSION=1.0.0
```

### `.env.production` (Producción)
```bash
# Microservicios
VITE_AUTH_SERVICE_URL=https://auth.innosistemas.com
VITE_PROJECTS_SERVICE_URL=https://projects.innosistemas.com

# Configuración de la aplicación
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
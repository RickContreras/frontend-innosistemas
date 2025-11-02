# 🏗️ Arquitectura de Microservicios

## Visión General

InnoSistemas Frontend consume múltiples microservicios backend independientes, siguiendo una arquitectura de microservicios moderna y escalable.

## 📊 Diagrama de Arquitectura

```
┌──────────────────────────────────────────────────────────────┐
│                   InnoSistemas Frontend                      │
│                    (React + TypeScript)                      │
└───────────┬────────────────┬──────────────┬──────────────────┘
            │                │              │
    ┌───────▼──────┐  ┌──────▼─────┐  ┌────▼───────────┐
    │              │  │            │  │                │
    │    Auth      │  │  Projects  │  │   Deliveries   │
    │   Service    │  │  Service   │  │    Service     │
    │   :8080      │  │   :8080    │  │    :8080       │
    ├──────────────┤  ├────────────┤  ├────────────────┤
    │ • /auth/*    │  │ • /api/    │  │ • /api/        │
    │ • /api/users │  │   projects │  │   deliveries   │
    │ • /api/roles │  │            │  │                │
    └──────────────┘  └────────────┘  └────────────────┘
```

## 🎯 Microservicios

### 1. Servicio de Autenticación

**Responsabilidad**: Gestión de autenticación, usuarios y roles

**URL de Desarrollo**: 
```
https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev
```

**Variable de Entorno**: `VITE_AUTH_SERVICE_URL`

**Endpoints**:

#### Autenticación
- `POST /auth/login` - Iniciar sesión
- `POST /auth/logout` - Cerrar sesión
- `GET /auth/me` - Obtener usuario actual

#### Usuarios
- `GET /api/users` - Listar usuarios
- `GET /api/users/with-roles` - Listar usuarios con roles
- `POST /api/users` - Crear usuario
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario

#### Roles
- `GET /api/roles` - Listar roles
- `GET /api/users/{id}/roles` - Obtener roles de usuario
- `POST /api/users/{id}/roles` - Asignar rol a usuario
- `DELETE /api/users/{id}/roles` - Remover rol de usuario

#### Health Check
- `GET /api/health/db` - Estado de la base de datos

---

### 2. Servicio de Proyectos

**Responsabilidad**: Gestión de proyectos académicos

**URL de Desarrollo**: 
```
https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev
```

**Variable de Entorno**: `VITE_PROJECTS_SERVICE_URL`

**Endpoints**:

#### Proyectos
- `GET /api/projects/student/{id}` - Obtener proyectos de un estudiante
- `GET /api/projects/{id}` - Obtener un proyecto específico por ID

**Response Example (Lista de proyectos)**:
```json
[
  {
    "id": 201,
    "name": "InnoSistemas Plataforma de Feedback",
    "description": "Desarrollar la plataforma web para la gestión de proyectos.",
    "statusId": 1,
    "createdAt": "2025-11-02T01:32:02.947011Z",
    "courseId": 101
  }
]
```

**Response Example (Proyecto individual)**:
```json
{
  "id": 201,
  "name": "InnoSistemas Plataforma de Feedback",
  "description": "Desarrollar la plataforma web para la gestión de proyectos.",
  "statusId": 1,
  "createdAt": "2025-11-02T01:32:02.947011Z",
  "courseId": 101
}
```

**Uso en el código**:
```typescript
// Listar proyectos de un estudiante
const projects = await apiService.getProjectsByStudent(studentId);

// Obtener detalle de un proyecto
const project = await apiService.getProjectById(projectId);
```

---

### 3. Servicio de Entregas

**Responsabilidad**: Gestión de entregas de proyectos

**URL de Desarrollo**: 
```
https://humble-sniffle-4445j4696xxc7665-8080.app.github.dev
```

**Variable de Entorno**: `VITE_DELIVERIES_SERVICE_URL`

**Endpoints**:

#### Entregas
- `GET /api/deliveries/project/{id}` - Obtener entregas de un proyecto

**Response Example**:
```json
[
  {
    "id": 3,
    "title": "Entrega Sprint 3",
    "description": "Tercera entrega - integración de servicios",
    "file_url": "https://drive.google.com/file/d/ejemplo3",
    "created_at": "2025-11-02T03:05:10.186269",
    "project_id": 202
  },
  {
    "id": 4,
    "title": "Documentación Técnica",
    "description": "Documentación completa del sistema",
    "file_url": "https://docs.google.com/document/ejemplo4",
    "created_at": "2025-11-02T03:05:10.186269",
    "project_id": 202
  }
]
```

**Uso en el código**:
```typescript
// Obtener entregas de un proyecto
const deliveries = await apiService.getDeliveriesByProject(projectId);
```

---

## 🔧 Configuración

### Variables de Entorno

Las URLs de los microservicios se configuran mediante variables de entorno:

```bash
# Servicio de Autenticación
VITE_AUTH_SERVICE_URL=https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev

# Servicio de Proyectos
VITE_PROJECTS_SERVICE_URL=https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev
```

### Configuración Centralizada

El archivo `src/config/env.ts` centraliza todas las configuraciones:

```typescript
export const config = {
  services: {
    auth: import.meta.env.VITE_AUTH_SERVICE_URL,
    projects: import.meta.env.VITE_PROJECTS_SERVICE_URL,
    deliveries: import.meta.env.VITE_DELIVERIES_SERVICE_URL,
  },
  // ... más configuraciones
};
```

### Servicio API

El archivo `src/services/api.ts` implementa todos los métodos para consumir los microservicios:

```typescript
import { config } from '@/config/env';

const AUTH_SERVICE_URL = config.services.auth;
const PROJECTS_SERVICE_URL = config.services.projects;
const DELIVERIES_SERVICE_URL = config.services.deliveries;

class ApiService {
  // Métodos para auth service
  async login() { /* ... */ }
  async getUsers() { /* ... */ }
  
  // Métodos para projects service
  async getProjectsByStudent() { /* ... */ }
  async getProjectById() { /* ... */ }
  
  // Métodos para deliveries service
  async getDeliveriesByProject() { /* ... */ }
}
```

---

## 🔐 Autenticación

### Flujo de Autenticación

1. **Login**: El usuario inicia sesión a través del servicio de autenticación
2. **Token JWT**: El servicio retorna un token JWT
3. **Almacenamiento**: El token se guarda en `localStorage`
4. **Headers**: Todas las peticiones subsecuentes incluyen el token en el header `Authorization: Bearer <token>`

### Implementación

```typescript
private getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}
```

---

## 📝 Logging y Debug

Todos los métodos del servicio API incluyen logging detallado:

```typescript
logger.debug(`Fetching projects for student ${studentId} from ${PROJECTS_SERVICE_URL}`);
logger.info(`Projects loaded successfully for student ${studentId}`);
logger.warn('Failed to load projects:', error);
logger.error('Error fetching projects:', error);
```

**Configurar nivel de log** en `.env`:
```bash
VITE_LOG_LEVEL=debug  # debug | info | warn | error
```

---

## 🚨 Manejo de Errores

### Estrategia de Fallback

Si un servicio falla, la aplicación:
1. Muestra una alerta informativa al usuario
2. Usa datos mock como fallback (cuando aplica)
3. Registra el error en los logs
4. Continúa funcionando con funcionalidad reducida

### Ejemplo en Dashboard

```typescript
const response = await apiService.getProjectsByStudent(studentId);

if (response.error) {
  setError(response.error);
  // Fallback a datos mock
  setProjects(mockProjects);
} else if (response.data) {
  setProjects(response.data.map(transformProject));
}
```

---

## 🔄 Transformación de Datos

Los datos del API se transforman al formato interno del frontend:

```typescript
const transformProject = (apiProject: ProjectFromAPI): Project => {
  return {
    id: apiProject.id.toString(),
    name: apiProject.name,
    description: apiProject.description,
    status: statusMap[apiProject.statusId] || 'active',
    // ... más transformaciones
  };
};
```

---

## 🧪 Testing

### Verificar Conectividad

```bash
# Auth Service
curl https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev/api/health/db

# Projects Service
curl https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev/api/projects/student/1
```

### Monitoreo en Desarrollo

Con `VITE_LOG_LEVEL=debug`, verás en consola:
- URLs de cada petición
- Resultados exitosos
- Errores y advertencias
- Tiempos de respuesta

---

## 🚀 Escalabilidad

### Agregar Nuevos Microservicios

1. **Agregar URL en configuración**:
```typescript
// src/config/env.ts
services: {
  auth: import.meta.env.VITE_AUTH_SERVICE_URL,
  projects: import.meta.env.VITE_PROJECTS_SERVICE_URL,
  feedback: import.meta.env.VITE_FEEDBACK_SERVICE_URL, // Nuevo
}
```

2. **Agregar variable de entorno**:
```bash
# .env
VITE_FEEDBACK_SERVICE_URL=https://feedback-service.com
```

3. **Implementar métodos en ApiService**:
```typescript
const FEEDBACK_SERVICE_URL = config.services.feedback;

async getFeedback(projectId: number) {
  const response = await fetch(`${FEEDBACK_SERVICE_URL}/api/feedback/${projectId}`);
  // ...
}
```

---

## 📚 Mejores Prácticas

### ✅ DO

- ✅ Usar variables de entorno para todas las URLs
- ✅ Centralizar la configuración en `env.ts`
- ✅ Implementar logging en todos los endpoints
- ✅ Manejar errores con fallbacks apropiados
- ✅ Incluir el token JWT en todos los headers
- ✅ Validar respuestas antes de usarlas
- ✅ Documentar cada endpoint

### ❌ DON'T

- ❌ Hardcodear URLs de servicios en el código
- ❌ Ignorar errores de red
- ❌ Asumir que el servicio siempre responderá
- ❌ Exponer tokens en logs
- ❌ Omitir transformación de datos
- ❌ Olvidar actualizar la documentación

---

## 🔜 Próximos Pasos

1. Implementar caché de respuestas
2. Agregar retry logic para peticiones fallidas
3. Implementar circuit breaker pattern
4. Agregar métricas de performance
5. Implementar refresh token automático
6. Agregar más microservicios según necesidad

---

## 📞 Contacto y Soporte

Para problemas con microservicios:
- Verificar variables de entorno
- Revisar logs en consola del navegador
- Verificar conectividad a las URLs
- Comprobar que los tokens JWT sean válidos

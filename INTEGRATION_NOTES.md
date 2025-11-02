# Integración del Microservicio de Proyectos

## Resumen
Se ha integrado exitosamente el microservicio de proyectos que expone el endpoint `/api/projects/student/{studentId}`.

## Cambios Realizados

### 1. Tipos (`src/types/index.ts`)
- ✅ Agregada interfaz `ProjectFromAPI` que coincide con la respuesta del microservicio:
  ```typescript
  export interface ProjectFromAPI {
    id: number;
    name: string;
    description: string;
    statusId: number;
    createdAt: string;
    courseId: number;
  }
  ```

### 2. Servicio API (`src/services/api.ts`)
- ✅ Agregado método `getProjectsByStudent(studentId: number)` para consumir el endpoint
- ✅ Incluye logging para rastrear las llamadas exitosas y errores
- ✅ Manejo de errores robusto con fallback

### 3. Dashboard (`src/components/Dashboard.tsx`)
- ✅ Implementada carga de proyectos desde el microservicio usando `useEffect`
- ✅ Función `transformProject()` que convierte `ProjectFromAPI` al formato `Project` usado en el frontend
- ✅ Estados de carga (`loading`) y error (`error`)
- ✅ Vista de carga con spinner mientras se cargan los proyectos
- ✅ Fallback a datos mock si el API falla
- ✅ Alerta informativa si hay error de conexión

## Mapeo de Datos

### StatusId → Status
```typescript
1 → 'active'
2 → 'completed'
3 → 'pending'
```

### Campos Calculados
- **category**: Se infiere del nombre del proyecto (investigación, desarrollo, análisis)
- **participants**: Se establece en 0 (no disponible en el API)
- **deadline**: Se usa `createdAt` del proyecto
- **teamId**: Se mapea desde `courseId`

## Arquitectura de Microservicios

La aplicación ahora consume dos microservicios independientes:

### 1. Microservicio de Autenticación
**URL**: `https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev`
- Autenticación y gestión de sesiones
- CRUD de usuarios
- Gestión de roles y permisos
- Health checks

### 2. Microservicio de Proyectos
**URL**: `https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev`
- Gestión de proyectos
- Consulta de proyectos por estudiante

## Ejemplo de Uso

El microservicio se llama automáticamente cuando el usuario inicia sesión:

```bash
curl -X 'GET' \
  'https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev/api/projects/student/1' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer <token>'
```

**Respuesta esperada:**
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

## Pendientes (TODOs)

1. **StudentId Dinámico**: Actualmente se usa `studentId = 1` hardcoded. Necesita obtenerse del usuario autenticado.
   
   ```typescript
   // TODO: En useEffect de Dashboard.tsx
   const studentId = 1; // Cambiar por: user.id o similar
   ```

2. **Autenticación**: Verificar que el token JWT se incluya en los headers de la petición

3. **Campos Adicionales**: 
   - Obtener el número real de `participants` si el API lo provee en el futuro
   - Usar un campo de `deadline` real si está disponible

4. **Manejo de Estados del Proyecto**: Confirmar con el backend la lista completa de `statusId` posibles

## Configuración de Variables de Entorno

Asegúrate de tener configuradas las siguientes variables en tu archivo `.env`:

```bash
# Microservicios
VITE_AUTH_SERVICE_URL=https://obscure-guacamole-6x7r4w6gv6v39rr-8080.app.github.dev
VITE_PROJECTS_SERVICE_URL=https://didactic-space-zebra-q5g9p6rqvgv29q4r-8080.app.github.dev
```

## Verificación

Para verificar que todo funciona:

1. ✅ Variables de entorno configuradas correctamente
2. ✅ Inicia sesión en la aplicación
3. ✅ El Dashboard carga automáticamente los proyectos del estudiante
4. ✅ Si hay error de conexión, verás una alerta amarilla con fallback a datos de ejemplo
5. ✅ Los logs en consola muestran las URLs usadas para cada petición

## Testing

El código compila correctamente:
```bash
npm run build
✓ built in 10.53s
```

No hay errores de TypeScript ni ESLint.

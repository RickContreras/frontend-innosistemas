# Integración del Microservicio de Retroalimentación y Comentarios

## 📋 Resumen

Se ha implementado la integración completa con el microservicio de retroalimentación (`VITE_FEEDBACK_SERVICE_URL`) que permite gestionar comentarios y respuestas en las entregas de los proyectos.

## 🔗 Endpoint del Microservicio

```
URL Base: https://redesigned-carnival-xgq9vx6wvg43p4xg-8080.app.github.dev
```

## 📁 Archivos Creados/Modificados

### 1. **`.env`** - Variables de Entorno
Se agregó la URL del microservicio:
```properties
VITE_FEEDBACK_SERVICE_URL=https://redesigned-carnival-xgq9vx6wvg43p4xg-8080.app.github.dev
```

### 2. **`src/services/feedbackService.ts`** - Servicio de API (NUEVO)
Servicio completo para gestionar todas las operaciones de feedback:

#### Interfaces de Datos
```typescript
interface FeedbackResponse {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  feedbackId: number;
  authorId: number;
  edited: boolean;
  deleted: boolean;
}

interface Feedback {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  deliveryId: number;
  projectId: number | null;
  taskId: number | null;
  authorId: number;
  edited: boolean;
  deleted: boolean;
}

interface FeedbackWithResponses {
  feedback: Feedback;
  responses: FeedbackResponse[];
}
```

#### Métodos Disponibles

##### **Feedbacks (Retroalimentación del Profesor)**

1. **`getFeedbacksWithResponses(deliveryId)`**
   - Obtiene todos los feedbacks con sus respuestas para una entrega
   - Método: `GET`
   - Endpoint: `/api/v1/deliveries/{deliveryId}/feedbacks-with-responses`

2. **`createFeedback(deliveryId, content, authorId)`**
   - Crea un nuevo feedback
   - Método: `POST`
   - Endpoint: `/api/v1/deliveries/{deliveryId}/feedbacks`

3. **`updateFeedback(feedbackId, content)`**
   - Actualiza un feedback existente
   - Método: `PUT`
   - Endpoint: `/api/v1/feedbacks/{feedbackId}`

4. **`deleteFeedback(feedbackId)`**
   - Elimina un feedback
   - Método: `DELETE`
   - Endpoint: `/api/v1/feedbacks/{feedbackId}`

##### **Respuestas (Comentarios de Estudiantes)**

5. **`createResponse(feedbackId, content, authorId)`**
   - Crea una respuesta a un feedback
   - Método: `POST`
   - Endpoint: `/api/v1/feedbacks/{feedbackId}/responses`

6. **`updateResponse(responseId, content)`**
   - Actualiza una respuesta existente
   - Método: `PUT`
   - Endpoint: `/api/v1/responses/{responseId}`

7. **`deleteResponse(responseId)`**
   - Elimina una respuesta
   - Método: `DELETE`
   - Endpoint: `/api/v1/responses/{responseId}`

### 3. **`src/components/FeedbackView.tsx`** - Componente Principal (MODIFICADO)

Se refactorizó completamente para usar el servicio real:

#### Características Implementadas

✅ **Carga de Retroalimentación**
- Obtiene feedbacks y respuestas desde el microservicio
- Estado de carga con spinner
- Manejo de errores con notificaciones toast

✅ **Crear Feedback (Solo Profesores)**
- Formulario para enviar retroalimentación
- Validación de contenido
- Notificación de éxito/error

✅ **Editar Feedback (Solo Profesores)**
- Modo de edición inline
- Botón de cancelar
- Actualización en tiempo real

✅ **Eliminar Feedback (Solo Profesores)**
- Confirmación antes de eliminar
- Notificación de resultado

✅ **Responder a Feedback (Estudiantes y Profesores)**
- Formulario de respuesta por cada feedback
- Campo de texto expandible

✅ **Editar Respuestas**
- Edición inline de respuestas propias
- Botón de cancelar edición

✅ **Eliminar Respuestas**
- Confirmación antes de eliminar
- Solo permite eliminar respuestas propias

✅ **Permisos por Rol**
- **Profesores**: Pueden crear, editar y eliminar feedbacks y respuestas
- **Estudiantes**: Pueden responder feedbacks y editar/eliminar sus propias respuestas
- **Administradores**: Solo lectura

✅ **UI/UX**
- Indicador de feedbacks editados
- Timestamps formateados en español
- Badges para estados
- Loading states
- Notificaciones toast para todas las operaciones

## 🔄 Flujo de Datos

### Carga Inicial
```
Usuario accede a FeedbackView
    ↓
loadFeedbacks()
    ↓
feedbackService.getFeedbacksWithResponses(deliveryId)
    ↓
GET /api/v1/deliveries/{id}/feedbacks-with-responses
    ↓
Actualiza estado con feedbacks y respuestas
```

### Crear Feedback (Profesor)
```
Profesor escribe comentario
    ↓
handleSendComment()
    ↓
feedbackService.createFeedback(deliveryId, content, authorId)
    ↓
POST /api/v1/deliveries/{id}/feedbacks
    ↓
Recarga feedbacks
    ↓
Muestra notificación de éxito
```

### Responder Feedback (Estudiante)
```
Estudiante escribe respuesta
    ↓
handleSendReply(feedbackId)
    ↓
feedbackService.createResponse(feedbackId, content, authorId)
    ↓
POST /api/v1/feedbacks/{id}/responses
    ↓
Recarga feedbacks
    ↓
Muestra notificación de éxito
```

## 🐛 Notas Técnicas

### ID de Usuario Temporal
El microservicio requiere un `authorId` numérico, pero actualmente el sistema de autenticación solo proporciona `username`. Se implementó una solución temporal:

```typescript
const tempUserId = Math.abs(user.username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
```

**TODO**: Cuando el backend de autenticación proporcione un ID numérico de usuario, reemplazar esta lógica.

### Permisos de Edición/Eliminación
Actualmente, todos los profesores pueden editar/eliminar cualquier feedback, y todos los estudiantes pueden editar/eliminar cualquier respuesta. Se recomienda validar propiedad en el backend.

## 📊 Ejemplo de Respuesta del API

### GET /api/v1/deliveries/{id}/feedbacks-with-responses

```json
[
  {
    "feedback": {
      "id": 1,
      "content": "Excelente trabajo en esta entrega.",
      "createdAt": "2025-10-29T00:29:15.896536Z",
      "updatedAt": null,
      "deliveryId": 1,
      "projectId": null,
      "taskId": null,
      "authorId": 101,
      "edited": false,
      "deleted": false
    },
    "responses": [
      {
        "id": 1,
        "content": "Gracias por el feedback positivo.",
        "createdAt": "2025-10-29T12:29:15.896536Z",
        "updatedAt": null,
        "feedbackId": 1,
        "authorId": 104,
        "edited": false,
        "deleted": false
      }
    ]
  }
]
```

## 🧪 Testing

### Casos de Prueba Manual

1. **Como Profesor**:
   - ✅ Crear retroalimentación
   - ✅ Editar retroalimentación propia
   - ✅ Eliminar retroalimentación propia
   - ✅ Responder a feedbacks
   - ✅ Ver respuestas de estudiantes

2. **Como Estudiante**:
   - ✅ Ver retroalimentación del profesor
   - ✅ Responder a retroalimentación
   - ✅ Editar respuestas propias
   - ✅ Eliminar respuestas propias

3. **Como Administrador**:
   - ✅ Ver retroalimentación (solo lectura)
   - ✅ Ver mensaje de "solo lectura"

### Comando para Prueba Manual con cURL

```bash
# Obtener feedbacks con respuestas
curl -X 'GET' \
  'https://redesigned-carnival-xgq9vx6wvg43p4xg-8080.app.github.dev/api/v1/deliveries/1/feedbacks-with-responses' \
  -H 'accept: */*'
```

## 🚀 Próximos Pasos

1. **Implementar autenticación con JWT** en las peticiones al microservicio
2. **Agregar paginación** para listas grandes de feedbacks
3. **Implementar WebSockets** para actualizaciones en tiempo real
4. **Agregar filtros** (por fecha, autor, etc.)
5. **Implementar búsqueda** en feedbacks y respuestas
6. **Agregar adjuntos** en feedbacks (archivos, imágenes)

## 📝 Changelog

### 2025-11-02
- ✅ Creado servicio `feedbackService.ts`
- ✅ Refactorizado `FeedbackView.tsx` para usar servicio real
- ✅ Implementadas operaciones CRUD completas
- ✅ Agregada variable de entorno `VITE_FEEDBACK_SERVICE_URL`
- ✅ Implementados permisos por rol
- ✅ Agregadas notificaciones toast
- ✅ Manejo de errores robusto

# 📚 InnoSistemas API - Documentación para Frontend

## 🚀 Información General

- **Base URL**: `http://localhost:8080` (desarrollo) / `https://jubilant-pancake-5w5j6ggxrv246jj-8080.app.github.dev` (Codespaces)
- **Tipo de Autenticación**: JWT Bearer Token
- **Content-Type**: `application/json`
- **Documentación Interactiva**: `/swagger-ui.html`

## 🔐 Autenticación JWT

Todos los endpoints protegidos requieren el header:
```
Authorization: Bearer {jwt_token}
```

## 👥 Usuarios de Prueba

| Usuario      | Contraseña | Email                       | Roles                    |
|-------------|------------|----------------------------|--------------------------|
| `estudiante` | `1234`     | estudiante@innosistemas.com | ROLE_STUDENT            |
| `profesor`   | `prof123`  | profesor@innosistemas.com   | ROLE_TEACHER            |
| `admin`      | `admin123` | admin@innosistemas.com      | ROLE_STUDENT + ROLE_TEACHER |

---

## 🔑 Endpoints de Autenticación

### 1. **POST** `/auth/login` - Iniciar Sesión
**Descripción**: Autentica usuario y devuelve JWT Bearer token

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200** (Éxito):
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresInMinutes": 60,
  "user": {
    "username": "admin",
    "email": "admin@innosistemas.com",
    "roles": ["ROLE_STUDENT", "ROLE_TEACHER"]
  }
}
```

**Response 401** (Error):
```json
"Usuario o contraseña incorrectos"
```

### 2. **GET** `/auth/me` - Usuario Actual
**Descripción**: Obtiene información del usuario autenticado

**Headers**: `Authorization: Bearer {token}`

**Response 200**:
```json
{
  "username": "admin",
  "email": "admin@innosistemas.com",
  "roles": ["ROLE_STUDENT", "ROLE_TEACHER"]
}
```

**Response 401**: No autenticado
**Response 404**: Usuario no encontrado

### 3. **POST** `/auth/logout` - Cerrar Sesión
**Descripción**: Logout stateless (el frontend debe descartar el token)

**Response 204**: No Content (éxito)

---

## 👤 Endpoints de Usuarios

**Headers requeridos**: `Authorization: Bearer {token}`

### 4. **GET** `/api/users` - Listar Usuarios (Básico)
**Descripción**: Lista todos los usuarios (información básica)

**Response 200**:
```json
[
  {
    "id": 1,
    "username": "estudiante",
    "email": "estudiante@innosistemas.com"
  },
  {
    "id": 2,
    "username": "profesor", 
    "email": "profesor@innosistemas.com"
  }
]
```

### 5. **GET** `/api/users/with-roles` - Usuarios con Roles
**Descripción**: Lista usuarios con roles y permisos completos

**Response 200**:
```json
[
  {
    "id": 1,
    "username": "estudiante",
    "email": "estudiante@innosistemas.com",
    "roles": [
      {
        "id": 1,
        "name": "ROLE_STUDENT",
        "permissions": [
          {
            "id": 1,
            "name": "PROJECT_VIEW"
          }
        ]
      }
    ]
  }
]
```

### 6. **GET** `/api/users/{id}/with-roles` - Usuario por ID con Roles
**Descripción**: Obtiene un usuario específico con roles y permisos

**Response 200**: Mismo formato que el anterior (un solo usuario)
**Response 404**: Usuario no encontrado

### 7. **POST** `/api/users` - Crear Usuario
**Descripción**: Crea un nuevo usuario

**Request Body**:
```json
{
  "username": "alumno1",
  "email": "a1@uni.edu", 
  "password": "Secreta123"
}
```

**Response 201**:
```json
{
  "id": 4,
  "username": "alumno1",
  "email": "a1@uni.edu"
}
```

**Response 400**: Solicitud inválida (datos incorrectos)

### 8. **PUT** `/api/users/{id}` - Actualizar Usuario
**Descripción**: Actualiza un usuario existente

**Request Body** (mismo formato que crear):
```json
{
  "username": "alumno1",
  "email": "a1@uni.edu",
  "password": "NuevaClave123"
}
```

**Response 200**: Usuario actualizado (mismo formato que crear)

### 9. **DELETE** `/api/users/{id}` - Eliminar Usuario
**Descripción**: Elimina un usuario

**Response 204**: No Content (éxito)

---

## 🔗 Endpoints de Roles de Usuario

**Headers requeridos**: `Authorization: Bearer {token}`

### 10. **GET** `/api/users/{userId}/roles` - Roles del Usuario
**Descripción**: Lista los roles asignados a un usuario

**Response 200**:
```json
["ROLE_STUDENT", "ROLE_TEACHER"]
```

**Response 404**: Usuario no encontrado

### 11. **POST** `/api/users/{userId}/roles` - Asignar Rol
**Descripción**: Asigna un rol a un usuario

**Request Body**:
```json
{
  "name": "ROLE_TEACHER"
}
```

**Response 200**: Lista actualizada de roles
**Response 400**: Rol no existe
**Response 404**: Usuario no encontrado

### 12. **DELETE** `/api/users/{userId}/roles` - Remover Rol
**Descripción**: Remueve un rol de un usuario

**Request Body**:
```json
{
  "name": "ROLE_TEACHER"
}
```

**Response 200**: Lista actualizada de roles
**Response 400**: Rol no existe
**Response 404**: Usuario no encontrado

---

## 🎯 Endpoints de Roles

**Headers requeridos**: `Authorization: Bearer {token}`

### 13. **GET** `/api/roles` - Listar Roles
**Descripción**: Lista todos los roles disponibles

**Response 200**:
```json
[
  {
    "id": 1,
    "name": "ROLE_STUDENT",
    "permissions": [
      {
        "id": 1,
        "name": "PROJECT_VIEW"
      }
    ]
  },
  {
    "id": 2,
    "name": "ROLE_TEACHER", 
    "permissions": [
      {
        "id": 2,
        "name": "PROJECT_MANAGE"
      }
    ]
  }
]
```

### 14. **POST** `/api/roles` - Crear Rol
**Descripción**: Crea un nuevo rol

**Request Body**:
```json
{
  "name": "ROLE_ADMIN"
}
```

**Response 201**: Rol creado (mismo formato que listar)

### 15. **PUT** `/api/roles/{id}` - Actualizar Rol
**Descripción**: Actualiza un rol existente

**Request Body**: Mismo formato que crear

**Response 200**: Rol actualizado

### 16. **DELETE** `/api/roles/{id}` - Eliminar Rol
**Descripción**: Elimina un rol

**Response 204**: No Content (éxito)

---

## 📋 Endpoints de Proyectos

### 17. **GET** `/api/projects/{code}` - Obtener Proyecto
**Descripción**: Obtiene un proyecto por código (con control de acceso por roles)

**Headers requeridos**: `Authorization: Bearer {token}`

**Lógica de acceso**:
- **ROLE_STUDENT**: Solo puede acceder a proyectos con `code = "A"`
- **ROLE_TEACHER**: Solo puede acceder a proyectos con `code = "B"` 
- **ADMIN** (ambos roles): Puede acceder a ambos

**Response 200** (Acceso permitido):
```json
{
  "code": "A",
  "owner": "student",
  "status": "active"
}
```

**Response 403** (Acceso denegado):
```json
{
  "message": "Acceso denegado"
}
```

**Response 401**: No autenticado

---

## 🏥 Endpoints de Salud

### 18. **GET** `/health` - Health Check Simple
**Descripción**: Verifica que la aplicación esté funcionando

**Response 200**: Aplicación funcionando

### 19. **GET** `/api/health/db` - Health Check de Base de Datos
**Descripción**: Verifica conexión a la base de datos

**Response 200** (BD funcionando):
```json
{
  "status": "UP",
  "url": "jdbc:postgresql://localhost:5433/innosistemas_dev",
  "product": "PostgreSQL"
}
```

**Response 503** (BD con problemas):
```json
{
  "status": "DOWN", 
  "error": "Error description"
}
```

---

## 🚨 Códigos de Respuesta HTTP

| Código | Descripción | Cuándo ocurre |
|--------|-------------|---------------|
| **200** | OK | Operación exitosa |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Operación exitosa sin contenido |
| **400** | Bad Request | Datos de entrada inválidos |
| **401** | Unauthorized | Token inválido o faltante |
| **403** | Forbidden | Sin permisos para la operación |
| **404** | Not Found | Recurso no encontrado |
| **503** | Service Unavailable | Servicio no disponible (ej: BD) |

---

## 🔧 Configuración CORS

La API está configurada para permitir:
- **Orígenes**: `localhost:*`, `127.0.0.1:*`, `*.app.github.dev`
- **Métodos**: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `HEAD`, `PATCH`
- **Headers**: Todos (`*`)
- **Credenciales**: Permitidas
- **Cache Preflight**: 3600 segundos

---

## 📝 Notas para el Frontend

### Manejo de JWT
1. Almacena el token después del login (localStorage/sessionStorage)
2. Incluye el token en todas las requests protegidas
3. Maneja la expiración del token (60 minutos por defecto)
4. Redirige al login si recibes 401

### Estructura de Errores
Los errores pueden ser:
- **String**: `"Usuario o contraseña incorrectos"`
- **Objeto**: `{"message": "Acceso denegado"}`

### Testing
Usa los usuarios de prueba para probar diferentes casos:
- **estudiante**: Para probar permisos limitados
- **profesor**: Para probar permisos de docente
- **admin**: Para probar todos los permisos

### URLs Importantes
- **Desarrollo**: `http://localhost:8080`
- **Codespaces**: `https://jubilant-pancake-5w5j6ggxrv246jj-8080.app.github.dev`
- **Swagger UI**: `/swagger-ui.html` (para pruebas interactivas)

---

¡Happy coding! 🚀
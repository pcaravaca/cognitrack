# CogniTrack API Documentation / Documentación de API

## Overview / Descripción General

CogniTrack API provides REST endpoints for managing Ollama servers, monitoring metrics, and interacting with AI models. The API is built with Go using the Gin framework and supports real-time communication via WebSockets.

La API de CogniTrack proporciona endpoints REST para gestionar servidores Ollama, monitorear métricas e interactuar con modelos de IA. La API está construida con Go usando el framework Gin y soporta comunicación en tiempo real vía WebSockets.

## Base URL / URL Base

```
Development: http://localhost:8081/api/v1
Production: http://cognitrack.local:8081/api/v1
```

## Authentication / Autenticación

The API uses JWT-based authentication. Most endpoints require a valid JWT token in the Authorization header.

La API usa autenticación basada en JWT. La mayoría de endpoints requieren un token JWT válido en el header de Authorization.

```http
Authorization: Bearer <jwt_token>
```

## Endpoints

### Authentication / Autenticación

#### Login / Iniciar Sesión
```http
POST /api/v1/auth/login
```

**Request Body / Cuerpo de la Petición:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response / Respuesta:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### Logout / Cerrar Sesión
```http
POST /api/v1/auth/logout
```

#### Get Current User / Obtener Usuario Actual
```http
GET /api/v1/auth/me
```

**Response / Respuesta:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Health Check / Verificación de Salud

#### Health Check / Verificación de Salud
```http
GET /api/v1/health
```

**Response / Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-27T17:36:00Z",
  "version": "2.0.0-go",
  "uptime": "2h30m45s"
}
```

### Servers / Servidores

#### Get All Servers / Obtener Todos los Servidores
```http
GET /api/v1/servers
```

**Response / Respuesta:**
```json
{
  "success": true,
  "servers": [
    {
      "id": 1,
      "name": "Ollama Server 1",
      "host": "192.168.0.104",
      "port": 11434,
      "status": "online",
      "models": [
        {
          "name": "granite3.2-vision:2b",
          "size": "1.6GB",
          "modified_at": "2024-02-27T10:00:00Z"
        }
      ]
    }
  ]
}
```

#### Get Server by ID / Obtener Servidor por ID
```http
GET /api/v1/servers/{id}
```

#### Add Server / Agregar Servidor
```http
POST /api/v1/servers
```

**Request Body / Cuerpo de la Petición:**
```json
{
  "name": "New Ollama Server",
  "host": "192.168.0.105",
  "port": 11434
}
```

#### Update Server / Actualizar Servidor
```http
PUT /api/v1/servers/{id}
```

#### Delete Server / Eliminar Servidor
```http
DELETE /api/v1/servers/{id}
```

#### Test Server Connection / Probar Conexión del Servidor
```http
POST /api/v1/servers/{id}/test
```

**Response / Respuesta:**
```json
{
  "success": true,
  "connected": true,
  "response_time": "45ms",
  "models_count": 3
}
```

### Models / Modelos

#### Get All Models / Obtener Todos los Modelos
```http
GET /api/ollama/models
```

**Response / Respuesta:**
```json
{
  "success": true,
  "models": [
    {
      "name": "granite3.2-vision:2b",
      "size": "1.6GB",
      "modified_at": "2024-02-27T10:00:00Z",
      "digest": "sha256:abc123...",
      "details": {
        "format": "gguf",
        "family": "granite",
        "families": null,
        "parameter_size": "2B",
        "quantization_level": "Q4_0"
      }
    }
  ]
}
```

#### Chat with Model / Chatear con Modelo
```http
POST /api/ollama/chat
```

**Request Body / Cuerpo de la Petición:**
```json
{
  "model": "granite3.2-vision:2b",
  "prompt": "Hello, how are you?",
  "stream": false
}
```

**Response / Respuesta:**
```json
{
  "success": true,
  "response": "Hello! I'm doing well, thank you for asking. How can I assist you today?",
  "model": "granite3.2-vision:2b",
  "created_at": "2024-02-27T17:36:00Z",
  "done": true
}
```

#### Pull Model / Descargar Modelo
```http
POST /api/ollama/pull
```

**Request Body / Cuerpo de la Petición:**
```json
{
  "model": "llama3:8b"
}
```

#### Delete Model / Eliminar Modelo
```http
DELETE /api/ollama/models/{model_name}
```

### Metrics / Métricas

#### Get Current Metrics / Obtener Métricas Actuales
```http
GET /api/v1/metrics
```

**Response / Respuesta:**
```json
{
  "success": true,
  "metrics": {
    "cpu": {
      "usage": 45.2,
      "cores": 8
    },
    "memory": {
      "total": 16777216000,
      "used": 8388608000,
      "usage": 50.0
    },
    "gpu": {
      "usage": 78.5,
      "memory_total": 8589934592,
      "memory_used": 4294967296
    },
    "load_average": [1.2, 1.5, 1.8],
    "timestamp": "2024-02-27T17:36:00Z"
  }
}
```

#### Get Metrics History / Obtener Historial de Métricas
```http
GET /api/v1/metrics/history?period=1h&limit=60
```

**Query Parameters / Parámetros de Query:**
- `period`: Período de tiempo (1h, 24h, 7d)
- `limit`: Número máximo de registros

### WebSocket Endpoints

#### Real-time Metrics / Métricas en Tiempo Real
```
WS /api/v1/metrics/ws
```

**Message Format / Formato de Mensaje:**
```json
{
  "type": "metrics",
  "data": {
    "cpu": 45.2,
    "memory": 50.0,
    "gpu": 78.5,
    "timestamp": "2024-02-27T17:36:00Z"
  }
}
```

#### Server Status Updates / Actualizaciones de Estado del Servidor
```
WS /api/v1/servers/ws
```

**Message Format / Formato de Mensaje:**
```json
{
  "type": "server_status",
  "server_id": 1,
  "status": "online",
  "timestamp": "2024-02-27T17:36:00Z"
}
```

## Error Responses / Respuestas de Error

### Standard Error Format / Formato de Error Estándar
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token",
    "details": null
  }
}
```

### Common Error Codes / Códigos de Error Comunes

| Code / Código | HTTP Status | Description / Descripción |
|---------------|-------------|---------------------------|
| UNAUTHORIZED | 401 | No authentication token provided / No se proporcionó token de autenticación |
| FORBIDDEN | 403 | Insufficient permissions / Permisos insuficientes |
| NOT_FOUND | 404 | Resource not found / Recurso no encontrado |
| VALIDATION_ERROR | 400 | Invalid input data / Datos de entrada inválidos |
| INTERNAL_ERROR | 500 | Server error / Error del servidor |
| SERVER_UNAVAILABLE | 503 | Ollama server not responding / Servidor Ollama no responde |

## Rate Limiting / Límite de Peticiones

- **Authentication endpoints**: 5 requests per minute
- **Chat endpoints**: 30 requests per minute
- **Other endpoints**: 100 requests per minute

## SDK Examples / Ejemplos de SDK

### JavaScript / Node.js
```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const { token } = await loginResponse.json();

// Get servers
const serversResponse = await fetch('/api/v1/servers', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { servers } = await serversResponse.json();
```

### Python
```python
import requests

# Login
login_response = requests.post('/api/v1/auth/login', json={
    'username': 'admin',
    'password': 'admin123'
})
token = login_response.json()['token']

# Get servers
servers_response = requests.get('/api/v1/servers', headers={
    'Authorization': f'Bearer {token}'
})
servers = servers_response.json()['servers']
```

### Go
```go
// Login
loginResp, _ := http.Post("/api/v1/auth/login", "application/json", 
    strings.NewReader(`{"username":"admin","password":"admin123"}`))
defer loginResp.Body.Close()

// Get servers
req, _ := http.NewRequest("GET", "/api/v1/servers", nil)
req.Header.Set("Authorization", "Bearer "+token)
serversResp, _ := http.DefaultClient.Do(req)
defer serversResp.Body.Close()
```

## Versioning / Versionado

The API follows semantic versioning. Current version: **2.0.0**

La API sigue versionado semántico. Versión actual: **2.0.0**

## Support / Soporte

For API support and questions:
- **Developer**: Peter Caravaca
- **Email**: [contact information]
- **Documentation**: https://docs.cognitrack.local

Para soporte y preguntas sobre la API:
- **Desarrollador**: Peter Caravaca
- **Email**: [información de contacto]
- **Documentación**: https://docs.cognitrack.local

---

*API Version 2.0.0 | Last Updated: 2024-02-27*

# CogniTrack 2.0 🚀

Aplicación multiplataforma para monitorear y gestionar servidores Ollama locales o remotos con backend Go de alto rendimiento.

## Características Principales / Key Features

### En Español
- **Panel de Control Integrado**: Visualiza el estado de tus servidores Ollama en tiempo real.
- **Gestión de Modelos**: Añade, elimina y actualiza modelos fácilmente.
- **Métricas en Tiempo Real**: Supervisa el uso de memoria, CPU y GPU.
- **Multi-servidor**: Gestiona múltiples instancias de Ollama desde un solo lugar.
- **Interfaz Intuitiva**: Diseño moderno y responsivo con Vuetify 3.
- **Chat Integrado**: Interactúa directamente con los modelos de IA.
- **Autenticación Segura**: Sistema de login con múltiples usuarios.
- **Bilingüe**: Soporte completo para español e inglés.
- **Docker Ready**: Despliegue automatizado con contenedores.

### In English
- **Integrated Dashboard**: Real-time monitoring of your Ollama servers.
- **Model Management**: Easily add, remove, and update models.
- **Real-time Metrics**: Monitor memory, CPU, and GPU usage.
- **Multi-server**: Manage multiple Ollama instances from one place.
- **Intuitive UI**: Modern and responsive design with Vuetify 3.
- **Integrated Chat**: Interact directly with AI models.
- **Secure Authentication**: Multi-user login system.
- **Bilingual**: Complete support for Spanish and English.
- **Docker Ready**: Automated container deployment.

## Tecnologías / Technologies

- **Frontend**: Vue 3 + Vite + Vuetify 3
- **Backend**: Go 1.21+ (Gin framework)
- **WebSockets**: Tiempo real nativo
- **Base de Datos**: SQL Server 2019+
- **Despliegue**: PowerShell automation + systemd

## Requisitos Previos / Prerequisites

### Frontend
- Node.js 18+ y npm 9+

### Backend Go
- Go 1.21+
- SQL Server 2019+
- Linux/Windows/macOS compatible
- Puerto por defecto: **8081**

## Instalación / Installation

### Frontend

1. Navega al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### Backend Go

1. Navega al directorio del backend:
   ```bash
   cd go-backend
   ```

2. Instala las dependencias:
   ```bash
   go mod tidy
   ```

3. Configura las variables de entorno:
   ```bash
   cp .env.example .env
   # Edita .env con tu configuración
   ```

4. Inicia el servidor:
   ```bash
   go run main.go
   ```

   El servidor estará disponible en: `http://localhost:8081`

## Configuración / Configuration

### Variables de Entorno / Environment Variables

Crea un archivo `.env` en el directorio `backend` con las siguientes variables:

```
# Configuración del servidor
PORT=8081
DEBUG=false

# Servidores Ollama
OLLAMA_SERVER=192.168.0.104:11434

# Base de datos SQL Server
DB_SERVER=10.10.1.21
DB_PORT=1433
DB_NAME=CogniTrack
DB_USER=sa
DB_PASSWORD=S@pr1ssa
```

## Estructura del Proyecto / Project Structure

```
cognitrack/
├── frontend/                # Frontend Vue 3 + Vite
│   ├── public/              # Archivos estáticos
│   ├── src/                 # Código fuente del frontend
│   │   ├── components/      # Componentes Vue (Dashboard, ServerConfig, ChatButton)
│   │   ├── views/           # Vistas principales (Dashboard, Servers, Settings, etc.)
│   │   ├── composables/     # Lógica reutilizable
│   │   ├── stores/          # Pinia stores (auth, servers)
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript definitions
│   │   └── assets/          # Recursos estáticos
│   ├── locales/             # Internacionalización (es/en)
│   └── dist/                # Build de producción
├── go-backend/              # Backend Go (Gin + WebSockets)
│   ├── main.go              # Punto de entrada
│   ├── handlers/            # HTTP handlers
│   ├── ollama/              # Cliente Ollama personalizado
│   ├── models/              # Data models
│   └── go.mod              # Dependencias Go
├── scripts/                 # Scripts de despliegue
│   ├── deploy-full.ps1     # Despliegue automatizado principal
│   └── deploy-*.ps1        # Scripts de despliegue específicos
├── docs/                    # Documentación
│   ├── API.md              # Documentación de API
│   ├── USER_GUIDE.md       # Manual de usuario
│   └── DEPLOYMENT.md       # Guía de despliegue
├── nginx/                   # Configuración Nginx
├── docker-compose.yml       # Configuración Docker
└── Dockerfile              # Imagen Docker
```

## 🌐 URLs de Acceso

### Desarrollo Local
- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8081/api/v1/`
- **Health Check**: `http://localhost:8081/api/v1/health`

### Producción (Docker)
- **Frontend**: `http://cognitrack.local` (o IP del servidor)
- **Backend API**: `http://cognitrack.local:8081/api/v1/`
- **Health Check**: `http://cognitrack.local:8081/api/v1/health`

## 🔐 Autenticación / Authentication

### Usuarios por Defecto / Default Users
- **Admin**: `admin` / `admin123`
- **User**: `peter` / `user123`

### Endpoints de Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `GET /api/v1/auth/me` - Obtener usuario actual

## 💬 Chat con Modelos / Model Chat

### Funcionalidades
- **Chat en tiempo real** con modelos Ollama
- **Soporte para múltiples modelos** (granite3.2-vision:2b, etc.)
- **Indicadores de uso** de modelos
- **Historial de conversación**
- **Interfaz flotante** accesible desde cualquier página

### API Endpoints
- `POST /api/ollama/chat` - Enviar mensaje al modelo
- `GET /api/ollama/models` - Listar modelos disponibles
- `WebSocket /api/v1/metrics/ws` - Métricas en tiempo real

## Despliegue / Deployment

### 🚀 Despliegue Automatizado Docker (v2.0.1)

**Nuevo despliegue automatizado completamente funcional con Docker:**

```powershell
# Despliegue completo en una sola línea
.\scripts\deploy-full.ps1 -ServerIP "10.10.1.210" -SshPort 2222 -Username "peter" -Domain "cognitrack.local"
```

#### ✅ Características del Script
- **Detección inteligente** de instalaciones previas (Docker/Tradicional/Mixto)
- **Corrección automática** de configuraciones (nginx-custom.conf)
- **Limpieza completa** de containers e imágenes antes del build
- **Build sin cache** para garantizar actualizaciones frescas
- **Health checks** automáticos post-despliegue
- **Verificación HTTP 200** en frontend y backend API

#### 🐳 Configuración Docker
```yaml
# Producción con docker-compose.prod.yml
services:
  frontend: cognitrack-frontend (puerto 80, 8080)
  backend: cognitrack-backend (puerto 8081)
  network: cognitrack-network
```

#### 🌐 Acceso Post-Despliegue
- **Frontend**: http://cognitrack.local (requiere hosts file)
- **Backend API**: http://cognitrack.local:8081/api/v1/health
- **Credenciales**: admin/admin123, peter/user123

#### 📋 Configuración Hosts (Cliente)
```
# Agregar a C:\Windows\System32\drivers\etc\hosts (Windows)
# o /etc/hosts (Linux/macOS)
10.10.1.210 cognitrack.local
```

### 🛠️ Despliegue Manual Alternativo

### Manual

**Frontend:**
```bash
cd frontend
npm run build
```

**Backend Go:**
```bash
cd go-backend
go build -o cognitrack-backend .
```

### 📖 Documentación Completa

- **[Guía de Despliegue Go](docs/despliegue-go.md)**: Proceso completo paso a paso
- **API Endpoints**: `http://servidor:8081/api/v1/health`
- **WebSockets**: `ws://servidor:8081/api/v1/metrics/ws`

### 🌐 URLs de Acceso

- **Frontend**: `http://servidor/`
- **Backend API**: `http://servidor:8081/api/v1/`
- **Health Check**: `http://servidor:8081/api/v1/health`

## Contribución / Contributing

1. Haz un fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Haz push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia / License

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🔄 Migración Python → Go

**CogniTrack 2.0** ha migrado completamente de Python a Go para mejorar:

- ✅ **Performance**: 10x más rápido en operaciones concurrentes
- ✅ **Recursos**: 50% menos uso de memoria
- ✅ **Deployment**: Binario único sin dependencias
- ✅ **WebSockets**: Implementación nativa más eficiente
- ✅ **Puerto**: Cambiado de 8080 → **8081** (evita conflictos)

## 📊 Métricas en Tiempo Real

### Métricas Disponibles
- **CPU Usage**: Porcentaje de uso de CPU
- **Memory Usage**: Uso de memoria RAM
- **GPU Usage**: Monitorización de GPU (si disponible)
- **Load Average**: Carga promedio del sistema
- **Ollama Server Status**: Estado del servidor Ollama
- **Models Status**: Estado de los modelos cargados
- **WebSocket Connections**: Conexiones activas

### Visualización
- **Gráficos en tiempo real** con ECharts
- **Actualización automática** cada segundo
- **Animaciones fluidas** y transiciones
- **Responsive design** para móviles y desktop

## 🌍 Internacionalización / Internationalization

### Idiomas Soportados
- **Español (es)**: Traducción completa
- **English (en)**: Complete translation

### Cambio de Idioma
- Selector de idioma en el navbar
- Persistencia en localStorage
- Traducciones dinámicas en toda la app

## 📱 Páginas de la Aplicación

### Páginas Principales
- **Landing Page**: Página de bienvenida y login
- **Dashboard**: Panel de control principal
- **Servers**: Gestión de servidores Ollama
- **Servers Management**: Administración avanzada
- **Server Detail**: Vista detallada de servidor

### Monitorización
- **Real-time Monitoring**: Métricas en vivo
- **Metrics**: Historial de métricas
- **Logs**: Visualización de logs

### Configuración
- **Settings**: Configuración general
- **Profile**: Perfil de usuario
- **API Documentation**: Documentación de API
- **Help**: Ayuda y manual de usuario

## 🔧 Desarrollo / Development

### Scripts Útiles
```bash
# Frontend
cd frontend
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run preview      # Preview del build

# Backend Go
cd go-backend
go run main.go       # Servidor de desarrollo
go build .           # Build de producción

# Docker
docker-compose up -d # Iniciar contenedores
docker-compose down  # Detener contenedores
docker-compose logs  # Ver logs
```

### Testing
```bash
# Tests del backend
cd go-backend
go test ./...

# Tests del frontend
cd frontend
npm run test
```

## 🐛 Troubleshooting

### Problemas Comunes
1. **Login no redirige**: Limpiar caché del navegador
2. **Puerto 8081 ocupado**: Matar proceso con `kill -9 <PID>`
3. **nginx del sistema interferiendo**: `sudo systemctl stop nginx`
4. **Docker cache antiguo**: `docker system prune -f`

### Comandos de Diagnóstico
```bash
# Verificar conexión Ollama
curl http://localhost:11434/api/tags

# Verificar backend
curl http://localhost:8081/api/v1/health

# Verificar WebSocket
wscat -c ws://localhost:8081/api/v1/metrics/ws
```

## Contacto / Contact

- **Peter Caravaca** - Desarrollador Principal
- **Servidor de Pruebas**: 10.10.1.210:2222 (SSH)
- **Servidor Ollama**: 192.168.0.104:11434

---

*Versión 2.0.0-go | Documentación bilingüe español/inglés*

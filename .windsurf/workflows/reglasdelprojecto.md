---
description: Reglas del Projecto
---


# CogniTrack 2.0

Aplicación moderna para monitorear y gestionar servidores Ollama locales o remotos, desarrollada con tecnologías de vanguardia para ofrecer un rendimiento óptimo y una excelente experiencia de usuario.

## Características Principales

- **Monitoreo en Tiem Real**: Seguimiento en vivo del estado de los servidores Ollama.
- **Interfaz Moderna y Responsive**: Diseño adaptativo que funciona en cualquier dispositivo.
- **Configuración Flexible**: Fácil configuración para servidores locales o remotos.
- **Dashboard Interactivo**: Visualización clara de métricas importantes.
- **Soporte Multilingüe**: Disponible en español e inglés.

## Stack Tecnológico

- **Frontend**: Vue 3 + Vite + TypeScript
- **UI Framework**: Vuetify 3
- **Backend**: Go (Golang)
- **Base de Datos**: SQL Server
- **Comunicación en Tiem Real**: Socket.IO

## Requisitos del Sistema

- Navegadores web modernos (Chrome, Firefox, Safari, Edge)
- Node.js 18+ (para desarrollo frontend)
- Go 1.20+ (para desarrollo backend)
- SQL Server 2019+

## Configuración Inicial

### Servidor de Pruebas

- **Servidor Ollama**: 10.10.1.131:11434
- **Servidor de Pruebas Linux**: 10.10.1.210
  - Usuario: peter
  - Contraseña: S@pr1ssa

### Base de Datos

- **Servidor**: 10.10.1.21
- **Motor**: SQL Server
- **Base de Datos**: CogniTrack
- **Usuario**: sa
- **Contraseña**: S@pr1ssa

### Despliegue con Docker

La aplicación está diseñada para ejecutarse en contenedores Docker, lo que facilita su despliegue y escalabilidad. Se proporciona un archivo `docker-compose.yml` para orquestar los servicios necesarios.

#### Requisitos para Docker

- Docker Engine 20.10+
- Docker Compose 2.0+

#### Servicios en los contenedores

1. **Frontend**: Servicio web Vue.js
2. **Backend**: API en Go
3. **Base de Datos**: SQL Server 2019+
4. **Redis**: Para caché y colas (opcional)

#### Comandos básicos de Docker

```bash
# Construir las imágenes y levantar los contenedores
docker-compose up -d --build

# Detener los contenedores
docker-compose down

# Ver logs de los contenedores
docker-compose logs -f

# Ejecutar migraciones (si es necesario)
docker-compose exec backend ./migrate
```

#### Variables de entorno para Docker

Las siguientes variables de entorno pueden configurarse en el archivo `.env` o directamente en `docker-compose.yml`:

```env
# Configuración del backend
BACKEND_PORT=8080
DATABASE_URL=sqlserver://sa:S@pr1ssa@db:1433?database=CogniTrack

# Configuración del frontend
VITE_API_BASE_URL=http://localhost:8080/api

# Configuración de la base de datos
SA_PASSWORD=S@pr1ssa
ACCEPT_EULA=Y
```

#### Redes y volúmenes

- Se crea una red Docker personalizada para la comunicación segura entre contenedores.
- Los volúmenes se utilizan para la persistencia de datos de la base de datos.
- Los puertos expuestos por defecto son:
  - Frontend: 3000
  - Backend: 8080
  - Base de datos: 1433

## Métricas Principales

- Uso de CPU
- Uso de Memoria
- Modelos Cargados
- Contenedores en Ejecución
- Uso de GPU
- Consumo de Energía

## Desarrollo

### Stack Tecnológico

- **Frontend**: Vue 3 + Vite + TypeScript
- **UI Framework**: Vuetify 3
- **Backend**: Go (Golang)
- **Base de datos**: SQL Server
- **Comunicación en tiempo real**: Socket.IO

### Configuración del Entorno

#### Frontend

```bash
# Instalar dependencias del frontend
cd frontend
npm install

# Iniciar servidor de desarrollo
npm run dev
```

#### Backend (Go)

```bash
# Instalar dependencias de Go
cd backend
go mod download

# Compilar y ejecutar el backend
go run cmd/main.go
```

### Estructura del Proyecto

```text
CogniTrack2/
├── frontend/           # Aplicación Vue 3 + Vite
│   ├── src/
│   │   ├── assets/    # Recursos estáticos
│   │   ├── components/ # Componentes Vue
│   │   ├── views/     # Vistas de la aplicación
│   │   ├── router/    # Configuración de rutas
│   │   └── store/     # Gestión de estado con Pinia
│   └── ...
│
└── backend/            # API en Go
    ├── cmd/           # Punto de entrada de la aplicación
    ├── internal/      # Código interno del backend
    └── pkg/           # Bibliotecas y utilidades
```

### Ejecutar Pruebas

```bash
# Frontend (desde el directorio frontend/)
npm run test

# Backend (desde el directorio backend/)
go test ./...
```

### Ejecutar la Aplicación en Desarrollo

```bash
# En una terminal (backend)
cd backend
go run cmd/main.go

# En otra terminal (frontend)
cd frontend
npm run dev
```

### Construir para Producción

```bash
# Construir frontend
cd frontend
npm run build

# Construir backend
cd ../backend
go build -o cognitrack .
```

## Proceso de Revisión

- Todos los PRs requieren revisión
- Asegúrate de que las pruebas pasen
- Mantén el código limpio y documentado

## Documentación

- Documentación de la API
- Documentación de la aplicación
- Manual de usuario o seccion de ayuda en la app.
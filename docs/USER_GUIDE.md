# CogniTrack User Guide / Manual de Usuario

## Table of Contents / Tabla de Contenidos

1. [Getting Started / Primeros Pasos](#getting-started--primeros-pasos)
2. [Login and Authentication / Inicio de Sesión y Autenticación](#login-and-authentication--inicio-de-sesión-y-autenticación)
3. [Dashboard Overview / Vista General del Dashboard](#dashboard-overview--vista-general-del-dashboard)
4. [Server Management / Gestión de Servidores](#server-management--gestión-de-servidores)
5. [Model Management / Gestión de Modelos](#model-management--gestión-de-modelos)
6. [Real-time Monitoring / Monitorización en Tiempo Real](#real-time-monitoring--monitorización-en-tiempo-real)
7. [Chat with AI Models / Chat con Modelos de IA](#chat-with-ai-models--chat-con-modelos-de-ia)
8. [Settings and Configuration / Configuración y Ajustes](#settings-and-configuration--configuración-y-ajustes)
9. [Troubleshooting / Solución de Problemas](#troubleshooting--solución-de-problemas)

## Getting Started / Primeros Pasos

### System Requirements / Requisitos del Sistema

#### Minimum Requirements / Requisitos Mínimos
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Screen Resolution**: 1024x768 (recommended: 1920x1080)
- **Internet**: Stable connection for real-time features

#### Recommended Setup / Configuración Recomendada
- **Browser**: Latest Chrome or Firefox
- **Screen**: 1920x1080 or higher
- **Network**: Broadband connection

### Accessing CogniTrack / Accediendo a CogniTrack

#### Development Environment / Entorno de Desarrollo
```
URL: http://localhost:5173
Backend: http://localhost:8081
```

#### Production Environment / Entorno de Producción
```
URL: http://cognitrack.local
Backend: http://cognitrack.local:8081
```

## Login and Authentication / Inicio de Sesión y Autenticación

### Default Users / Usuarios por Defecto

#### Administrator / Administrador
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: Full system access

#### Standard User / Usuario Estándar
- **Username**: `peter`
- **Password**: `user123`
- **Role**: Limited access

### Login Process / Proceso de Inicio de Sesión

1. **Navigate to CogniTrack** / Navegar a CogniTrack
2. **Enter credentials** / Ingresar credenciales
3. **Click "Login"** / Hacer clic en "Login"
4. **Automatic redirect** to dashboard / Redirección automática al dashboard

### Session Management / Gestión de Sesiones

- **Session Duration**: 24 hours
- **Auto-logout**: After 24 hours of inactivity
- **Manual Logout**: Click user profile → Logout

## Dashboard Overview / Vista General del Dashboard

### Main Dashboard Components / Componentes Principales del Dashboard

#### 1. Navigation Bar / Barra de Navegación
- **Logo**: CogniTrack branding
- **Language Selector**: Spanish/English (🌐)
- **User Menu**: Profile, Settings, Logout
- **Sidebar Toggle**: Show/hide navigation sidebar

#### 2. Sidebar Navigation / Navegación Lateral

**Main Sections / Secciones Principales:**
- **Dashboard** (/) - Main overview
- **Servers** (/servers) - Server status
- **Servers Management** (/servers/manage) - Admin functions
- **Real-time Monitoring** (/monitoring) - Live metrics
- **Metrics** (/metrics) - Historical data
- **Logs** (/logs) - System logs

**Configuration / Configuración:**
- **Settings** (/settings) - General settings
- **Profile** (/profile) - User profile
- **API Documentation** (/api-docs) - API reference
- **Help** (/help) - This guide

#### 3. Main Content Area / Área de Contenido Principal

**Status Cards / Tarjetas de Estado:**
- **Total Servers**: Number of configured servers
- **Online Servers**: Currently active servers
- **Total Models**: Available AI models
- **Active Users**: Current user sessions

**Real-time Metrics / Métricas en Tiempo Real:**
- **CPU Usage**: Live CPU percentage
- **Memory Usage**: RAM consumption
- **GPU Usage**: GPU utilization (if available)
- **Network Activity**: Data transfer rates

#### 4. Chat Button / Botón de Chat
- **Floating button**: Bottom-right corner
- **Quick access**: Chat with AI models
- **Status indicator**: Online/offline status

## Server Management / Gestión de Servidores

### Adding a New Server / Agregar un Nuevo Servidor

1. **Navigate to Servers Management** / Navegar a Servers Management
2. **Click "Add Server"** / Hacer clic en "Add Server"
3. **Fill server details** / Completar detalles del servidor:
   - **Name**: Descriptive server name
   - **Host**: IP address or domain
   - **Port**: Ollama port (default: 11434)
4. **Click "Save"** / Hacer clic en "Save"
5. **Test connection** / Probar conexión

### Server Status / Estado del Servidor

#### Status Indicators / Indicadores de Estado
- **🟢 Online**: Server responding correctly
- **🔴 Offline**: Server not accessible
- **🟡 Warning**: Server responding with issues
- **⚪ Unknown**: Status not determined

#### Server Information / Información del Servidor
- **Connection Details**: Host, port, response time
- **Model Count**: Number of available models
- **Last Check**: Timestamp of last status check
- **Uptime**: How long server has been online

### Server Actions / Acciones del Servidor

#### Available Actions / Acciones Disponibles
- **Test Connection**: Verify server accessibility
- **View Details**: Show comprehensive server information
- **Edit Configuration**: Modify server settings
- **Delete Server**: Remove server from system

#### Bulk Operations / Operaciones Masivas
- **Select Multiple**: Choose multiple servers
- **Bulk Test**: Test all selected servers
- **Bulk Delete**: Remove multiple servers

## Model Management / Gestión de Modelos

### Viewing Available Models / Ver Modelos Disponibles

1. **Navigate to Servers** / Navegar a Servers
2. **Select a server** / Seleccionar un servidor
3. **View Models tab** / Ver pestaña Models

#### Model Information / Información del Modelo
- **Name**: Model identifier (e.g., granite3.2-vision:2b)
- **Size**: Disk space usage
- **Modified**: Last update timestamp
- **Parameters**: Model specifications
- **Status**: Available/in use/offline

### Model Operations / Operaciones con Modelos

#### Chat with Model / Chatear con Modelo
1. **Click "Chat" button** / Hacer clic en botón "Chat"
2. **Select model** / Seleccionar modelo
3. **Type message** / Escribir mensaje
4. **Send and receive response** / Enviar y recibir respuesta

#### Model Actions / Acciones del Modelo
- **Play/Run**: Start model if not running
- **Stop**: Stop running model
- **Delete**: Remove model from server
- **Pull**: Download new model

#### Model Status Indicators / Indicadores de Estado del Modelo
- **🟢 Available**: Ready to use
- **🟡 In Use**: Currently being used by user
- **🔴 Offline**: Not available
- **⚠️ Error**: Model has issues

## Real-time Monitoring / Monitorización en Tiempo Real

### Metrics Dashboard / Panel de Métricas

#### System Metrics / Métricas del Sistema
- **CPU Usage**: Percentage with historical trend
- **Memory Usage**: RAM utilization with breakdown
- **GPU Usage**: GPU utilization (if available)
- **Load Average**: System load over time
- **Disk Usage**: Storage consumption
- **Network I/O**: Data transfer rates

#### Ollama Metrics / Métricas de Ollama
- **Server Status**: Online/offline status
- **Active Models**: Currently loaded models
- **Request Rate**: API calls per second
- **Response Time**: Average response duration

### Graph Features / Características de los Gráficos

#### Interactive Charts / Gráficos Interactivos
- **Zoom**: Click and drag to zoom
- **Pan**: Move chart horizontally
- **Hover**: Detailed information on hover
- **Legend**: Toggle metric visibility

#### Time Range Selection / Selección de Rango de Tiempo
- **Last Hour**: Most recent 60 minutes
- **Last 24 Hours**: Previous day
- **Last 7 Days**: Previous week
- **Custom Range**: Specific date range

### Alerts and Notifications / Alertas y Notificaciones

#### Alert Types / Tipos de Alertas
- **High CPU Usage**: > 80% for 5 minutes
- **High Memory Usage**: > 90% for 5 minutes
- **Server Offline**: Server not responding
- **Model Error**: Model fails to respond

#### Notification Methods / Métodos de Notificación
- **Visual**: Color changes and indicators
- **Messages**: In-app notifications
- **Email**: (Future feature)

## Chat with AI Models / Chat con Modelos de IA

### Accessing Chat / Accediendo al Chat

#### Chat Button / Botón de Chat
- **Location**: Bottom-right corner
- **Appearance**: Floating action button
- **Status**: Shows online/offline status

#### Chat Window / Ventana de Chat
- **Resizable**: Adjust window size
- **Minimizable**: Hide when not in use
- **Persistent**: Maintains conversation history

### Using the Chat / Usando el Chat

#### Starting a Conversation / Iniciar una Conversación
1. **Click Chat button** / Hacer clic en botón de Chat
2. **Select model** / Seleccionar modelo
3. **Type message** / Escribir mensaje
4. **Press Enter or click Send** / Presionar Enter o clic en Send

#### Chat Features / Características del Chat
- **Markdown Support**: Format messages with markdown
- **Code Highlighting**: Syntax highlighting for code
- **Message History**: View previous messages
- **Copy Responses**: Copy AI responses to clipboard
- **Clear Chat**: Reset conversation

#### Model Selection / Selección de Modelo
- **Available Models**: List of installed models
- **Model Information**: Size, parameters, status
- **Auto-switch**: Change models during conversation

### Chat Tips / Consejos de Chat

#### Best Practices / Mejores Prácticas
- **Clear Prompts**: Be specific in your requests
- **Context**: Provide relevant background information
- **Language**: Use consistent language per conversation
- **Formatting**: Use markdown for better readability

#### Troubleshooting Chat / Solución de Problemas de Chat
- **No Response**: Check server connection
- **Slow Response**: Monitor server load
- **Error Messages**: Verify model availability
- **Connection Lost**: Refresh and reconnect

## Settings and Configuration / Configuración y Ajustes

### General Settings / Configuración General

#### System Configuration / Configuración del Sistema
- **Language**: Spanish/English selection
- **Theme**: Light/Dark mode (future feature)
- **Time Zone**: Local time settings
- **Refresh Rate**: Metrics update interval

#### Server Settings / Configuración de Servidores
- **Default Timeout**: Connection timeout duration
- **Retry Attempts**: Number of connection retries
- **Health Check Interval**: Server status check frequency

### User Profile / Perfil de Usuario

#### Profile Information / Información del Perfil
- **Username**: Display name
- **Email**: Contact email
- **Role**: User permissions
- **Last Login**: Previous session timestamp

#### Security Settings / Configuración de Seguridad
- **Change Password**: Update user password
- **Two-Factor Auth**: (Future feature)
- **Session Management**: Active sessions list

### API Configuration / Configuración de API

#### API Keys / Claves de API
- **Generate Keys**: Create new API keys
- **Manage Permissions**: Set key restrictions
- **View Usage**: Monitor API usage

#### Webhook Settings / Configuración de Webhooks
- **URL Configuration**: Set webhook endpoints
- **Event Types**: Choose trigger events
- **Authentication**: Secure webhook connections

## Troubleshooting / Solución de Problemas

### Common Issues / Problemas Comunes

#### Login Problems / Problemas de Inicio de Sesión
**Issue**: Cannot login with credentials
**Solution**:
1. Verify username and password
2. Check for typos
3. Ensure server is accessible
4. Contact administrator if needed

**Issue**: Login successful but no redirect
**Solution**:
1. Clear browser cache
2. Try incognito mode
3. Check browser console for errors
4. Refresh the page

#### Server Connection Issues / Problemas de Conexión del Servidor
**Issue**: Server shows as offline
**Solution**:
1. Verify server IP and port
2. Check network connectivity
3. Test with curl: `curl http://server:11434/api/tags`
4. Verify Ollama is running on server

**Issue**: High response times
**Solution**:
1. Check server load
2. Verify network latency
3. Monitor available resources
4. Consider server optimization

#### Chat Issues / Problemas de Chat
**Issue**: Chat not responding
**Solution**:
1. Check model availability
2. Verify server connection
3. Try different model
4. Check model status indicators

**Issue**: Slow chat responses
**Solution**:
1. Monitor server resources
2. Check model size vs available RAM
3. Consider using smaller models
4. Optimize prompts

#### Dashboard Issues / Problemas del Dashboard
**Issue**: Metrics not updating
**Solution**:
1. Check WebSocket connection
2. Refresh the page
3. Verify backend status
4. Check browser console

**Issue**: Charts not displaying
**Solution**:
1. Enable JavaScript
2. Check browser compatibility
3. Clear browser cache
4. Update browser version

### Performance Optimization / Optimización de Rendimiento

#### Browser Optimization / Optimización del Navegador
- **Use modern browser**: Chrome, Firefox, Safari latest versions
- **Clear cache regularly**: Prevent outdated data
- **Disable extensions**: Remove conflicting extensions
- **Update graphics drivers**: Ensure smooth rendering

#### Network Optimization / Optimización de Red
- **Stable connection**: Use reliable internet
- **Low latency**: Minimize network delays
- **Sufficient bandwidth**: Support real-time features
- **VPN considerations**: May affect performance

### Getting Help / Obtener Ayuda

#### In-App Help / Ayuda en la Aplicación
- **Help Section**: Navigate to /help
- **API Documentation**: Navigate to /api-docs
- **Tooltips**: Hover over interface elements
- **Status Messages**: Check notification area

#### Contact Support / Contactar Soporte
- **Developer**: Peter Caravaca
- **Email**: [contact information]
- **Documentation**: Available in-app
- **Community**: [forum/link]

#### Reporting Issues / Reportar Problemas
When reporting issues, include:
- **Browser version and type**
- **Operating system**
- **Steps to reproduce**
- **Error messages**
- **Screenshots if applicable**

---

*User Guide Version 2.0.0 | Last Updated: 2024-02-27*

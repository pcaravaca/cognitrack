# Despliegue CogniTrack con Backend Go

## 📋 Descripción

Este documento describe el proceso de despliegue de CogniTrack con el nuevo backend desarrollado en Go, reemplazando completamente la implementación anterior en Python.

## 🏗️ Arquitectura del Sistema

### Backend Go
- **Framework:** Gin (HTTP server)
- **Puerto:** 8081 (cambiado desde 8080 por conflictos)
- **WebSockets:** Para métricas en tiempo real
- **Monitoreo:** gopsutil para métricas del sistema
- **Ollama Integration:** Cliente personalizado para servidores Ollama

### Frontend
- **Framework:** Vue.js 3 + Vite
- **UI Framework:** Vuetify 3
- **Internacionalización:** es/en
- **Build:** Archivos estáticos en `/dist`

## 🚀 Proceso de Despliegue

### Prerrequisitos

1. **Servidor de destino:**
   - Ubuntu/Debian Linux
   - SSH habilitado
   - Nginx instalado
   - Go runtime (para compilación local)

2. **Configuración local:**
   - PowerShell (Windows)
   - Go 1.19+
   - Node.js 18+

### Comando de Despliegue

```powershell
.\scripts\deploy-full.ps1 -ServerIP 10.10.1.210 -SshPort 2222
```

### Pasos Automatizados

1. **Verificación de conectividad:** SSH al servidor objetivo
2. **Compilación Frontend:** `npm run build` en directorio `frontend/`
3. **Compilación Backend Go:** Cross-compilation para Linux AMD64
4. **Transferencia de archivos:** SCP de binarios y assets
5. **Configuración systemd:** Servicio `cognitrack.service`
6. **Reinicio del servicio:** systemctl restart

## 🔧 Configuración del Servicio

### Archivo systemd: `/etc/systemd/system/cognitrack.service`

```ini
[Unit]
Description=CogniTrack Backend Service (Go)
After=network.target

[Service]
User=peter
WorkingDirectory=/var/www/cognitrack/backend
ExecStart=/var/www/cognitrack/backend/cognitrack-backend
Restart=always
RestartSec=10
Environment="PATH=/usr/bin:/usr/local/bin"

[Install]
WantedBy=multi-user.target
```

### Variables de Entorno (.env)

```env
PORT=8081
OLLAMA_SERVER=192.168.0.104:11434
DEBUG=false
```

## 📁 Estructura de Directorios en Servidor

```
/var/www/cognitrack/
├── backend/
│   ├── cognitrack-backend      # Binario Go
│   └── .env                    # Variables de entorno
├── assets/                     # Assets del frontend (CSS, JS)
├── index.html                  # Frontend principal
└── ...                        # Otros archivos estáticos
```

## 🌐 Endpoints API

### Base URL: `http://servidor:8081/api/v1/`

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/health` | GET | Estado de salud del backend |
| `/metrics` | GET | Métricas actuales del sistema |
| `/metrics/ws` | WebSocket | Métricas en tiempo real |
| `/ollama/servers` | GET/POST/DELETE | Gestión de servidores Ollama |
| `/ollama/models` | GET | Lista de modelos disponibles |

### Ejemplo de Respuesta Health Check

```json
{
  "success": true,
  "message": "CogniTrack Backend está funcionando correctamente",
  "data": {
    "version": "2.0.0-go",
    "uptime": "2025-08-31T20:44:52-07:00",
    "status": "healthy",
    "clients": 0
  }
}
```

## 🚨 Resolución de Problemas

### Conflicto de Puerto

**Problema:** `bind: address already in use`
**Solución:** Backend configurado para puerto 8081 en lugar de 8080

### Permisos de Archivos

**Problema:** Permission denied al copiar archivos
**Solución:** Script ajusta permisos antes y después de la copia:
- Propietario temporal: `peter`
- Propietario final: `www-data:www-data`

### Servicio No Inicia

```bash
# Verificar estado
sudo systemctl status cognitrack.service

# Ver logs
sudo journalctl -u cognitrack.service -f

# Reiniciar servicio
sudo systemctl restart cognitrack.service
```

## 📊 Monitoreo

### Métricas Disponibles

- **CPU Usage:** Porcentaje de uso de CPU
- **Memory Usage:** Uso de memoria (porcentaje y bytes)
- **Load Average:** Promedio de carga del sistema
- **Uptime:** Tiempo de actividad del servidor
- **WebSocket Clients:** Clientes conectados en tiempo real

### Conexión WebSocket

```javascript
const ws = new WebSocket('ws://servidor:8081/api/v1/metrics/ws');
ws.onmessage = (event) => {
    const metrics = JSON.parse(event.data);
    console.log('CPU Usage:', metrics.cpu_usage);
};
```

## 🔄 Actualización del Sistema

1. **Compilar nuevos cambios localmente:**
   ```bash
   cd go-backend
   go build -o cognitrack-backend .
   ```

2. **Redesplegar:**
   ```powershell
   .\scripts\deploy-full.ps1 -ServerIP 10.10.1.210 -SshPort 2222
   ```

## 📝 Migración desde Python

### Cambios Principales

- ✅ **Backend Python eliminado** completamente
- ✅ **Backend Go** implementado con misma funcionalidad
- ✅ **Puerto cambiado** de 8080 a 8081
- ✅ **Mejores performances** y menor uso de recursos
- ✅ **WebSockets nativos** para tiempo real
- ✅ **Cross-compilation** para deployment automatizado

### Archivos Eliminados

```
backend/ (directorio Python completo)
requirements.txt
plugins/
main.py
```

### Archivos Añadidos

```
go-backend/
├── main.go
├── ollama/client.go
├── go.mod
└── go.sum
```

## 🌟 Mejoras Implementadas

1. **Performance:** Backend Go es significativamente más rápido
2. **Recursos:** Menor consumo de memoria comparado con Python
3. **Deployment:** Binario único, sin dependencias de runtime
4. **Concurrencia:** Mejor manejo de conexiones simultáneas
5. **WebSockets:** Implementación nativa más eficiente

## 📞 Soporte

Para problemas relacionados con el despliegue:

1. Verificar conectividad SSH al servidor
2. Confirmar permisos de usuario en directorio destino
3. Revisar logs del servicio systemd
4. Validar configuración de puerto en firewall
5. Comprobar disponibilidad de recursos del servidor

---

**Última actualización:** 31 de agosto, 2025  
**Versión:** 2.0.0-go  
**Autor:** Peter Caravaca

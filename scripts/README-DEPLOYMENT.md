# 📋 GUÍA DE DESPLIEGUE AUTOMÁTICO - CogniTrack

## 🚀 Scripts Disponibles

### 1. deploy-cognitrack-complete.ps1 (Recomendado)
**Uso estándar para servidores conocidos**
```powershell
.\scripts\deploy-cognitrack-complete.ps1 -ServerIP "10.10.1.185" -SshPort 22 -Username "peter"
```

**Características:**
- ✅ Instalación automática de dependencias
- ✅ Corrección automática de go.mod (1.21.0 → 1.21)
- ✅ Transferencia ordenada de archivos
- ✅ Construcción y verificación automática
- ✅ Manejo robusto de errores

### 2. deploy-cognitrack-new-server.ps1 (Servidores nuevos)
**Para instalaciones completamente nuevas**
```powershell
.\scripts\deploy-cognitrack-new-server.ps1 -ServerIP "NUEVA_IP" -SshPort 22 -Username "peter" -Force
```

**Características adicionales:**
- ✅ Instalación completa desde cero
- ✅ Modo Force para errores no críticos
- ✅ Verificaciones más estrictas
- ✅ Documentación integrada en el script
- ✅ Mensajes de error más descriptivos

### 3. deploy-simple.sh (Solución de problemas)
**Script bash para correcciones rápidas**
```bash
# En el servidor:
cd /opt/cognitrack
chmod +x deploy-simple.sh
./deploy-simple.sh
```

## 🔧 Correcciones Automáticas Incluidas

### ✅ Corrección de go.mod
- **Problema:** go 1.21.0 inválido
- **Solución:** Automáticamente cambia a go 1.21
- **Ejecuta:** go mod tidy automáticamente

### ✅ Verificación de Dependencias
- Docker y Docker Compose
- Node.js 18.x
- Go 1.21.5
- Herramientas básicas (curl, wget, git)

### ✅ Configuración de Permisos
- Permisos correctos en archivos críticos
- Propiedad de directorios configurada

## 🌐 Acceso Después del Despliegue

### URLs Funcionales:
- **Frontend:** http://cognitrack.local
- **Backend API:** http://10.10.1.185:8082/api
- **Estado:** http://10.10.1.185:8080/status.txt

### Archivo Hosts Necesario:
```
10.10.1.185 cognitrack.local
10.10.1.185 ipcheck-go.local
```

## 🚨 Solución de Problemas Comunes

### Si aparece "no Go files in /app":
1. El script ya incluye la corrección automática
2. Se ejecuta automáticamente en cada despliegue
3. No requiere intervención manual

### Si el frontend no carga:
1. Verificar que el backend esté corriendo
2. Comprobar logs: docker logs [container_name]
3. Reiniciar servicios: docker-compose restart

### Si hay conflictos de puertos:
1. Detener servicios antiguos: docker-compose down
2. Limpiar: docker system prune -f
3. Reintentar despliegue

## 📞 Soporte

**Scripts principales:**
- deploy-cognitrack-complete.ps1 (uso estándar)
- deploy-cognitrack-new-server.ps1 (servidores nuevos)

**Contacto:** Peter Caravaca

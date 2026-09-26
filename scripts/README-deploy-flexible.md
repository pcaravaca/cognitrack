# 🚀 DEPLOY-COGNITRACK-FLEXIBLE.PS1 - GUÍA DE USO

## 📋 Descripción

Script de despliegue completamente flexible para CogniTrack que permite configurar servidor, puerto y credenciales de conexión de forma dinámica.

## ✨ Características Principales

- **🔧 Parámetros Configurables:** Servidor, puerto, usuario y contraseña
- **🔐 Seguridad:** Manejo seguro de contraseñas (no se muestran en pantalla)
- **🎯 Interfaz Interactiva:** Solicita información si no se proporcionan parámetros
- **🛡️ Manejo de Errores:** Verificación completa y mensajes de error claros
- **📦 Funcionalidades Completas:** Instalación, construcción y despliegue automático

## 🔧 Uso Básico

### Opción 1: Con Parámetros (Automático)
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 -ServerIP "192.168.1.100" -Username "admin" -Password "tu_contraseña"
```

### Opción 2: Interactivo (Pregunta por Datos)
```powershell
.\scripts\deploy-cognitrack-flexible.ps1
```

### Opción 3: Con Puerto Personalizado
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 -ServerIP "192.168.1.100" -SshPort 2222 -Username "admin"
```

## 📋 Parámetros Disponibles

| Parámetro | Descripción | Obligatorio | Por Defecto |
|-----------|-------------|-------------|-------------|
| `-ServerIP` | Dirección IP del servidor remoto | Sí | Ninguno |
| `-SshPort` | Puerto SSH del servidor | No | 22 |
| `-Username` | Usuario SSH para conexión | Sí | Ninguno |
| `-Password` | Contraseña del usuario | No | Se solicita |

## 🎯 Ejemplos de Uso

### Ejemplo 1: Despliegue Básico
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 -ServerIP "10.10.1.185" -Username "peter"
# El script pedirá la contraseña de forma segura
```

### Ejemplo 2: Despliegue Completo con Parámetros
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 `
    -ServerIP "192.168.1.100" `
    -SshPort 22 `
    -Username "deploy" `
    -Password "mi_contraseña_segura"
```

### Ejemplo 3: Servidor con Puerto SSH Personalizado
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 `
    -ServerIP "servidor.ejemplo.com" `
    -SshPort 2222 `
    -Username "admin"
```

## 🔒 Seguridad

- **🔐 Contraseñas Seguras:** Se solicitan con `Read-Host -AsSecureString`
- **🚫 No Logging:** Las contraseñas no se registran en logs
- **🔒 Conexión Segura:** Usa SSH con verificación estricta de hosts
- **🛡️ Validación:** Verifica archivos y permisos antes de proceder

## 🚀 Funcionalidades del Despliegue

### ✅ Instalación Automática
- **Sistema Operativo:** Ubuntu/Debian actualizado
- **Docker & Docker Compose:** Instalación y configuración
- **Node.js:** Para el frontend (v18 LTS)
- **Go:** Para el backend (v1.21.5)

### ✅ Despliegue Completo
- **Transferencia Segura:** Archivos críticos primero
- **Corrección Automática:** Ajustes de `go.mod` si es necesario
- **Construcción Docker:** Imágenes optimizadas
- **Inicio de Servicios:** Aplicación completamente funcional

### ✅ Verificaciones
- **Conectividad:** Verifica acceso SSH antes de proceder
- **Archivos Locales:** Confirma que todos los archivos necesarios existen
- **Servicios Remotos:** Verifica que los servicios estén corriendo
- **Acceso Externo:** Confirma que la aplicación sea accesible

## 📊 URLs de Acceso (Después del Despliegue)

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Aplicación Web** | `http://[ServerIP]:8080` | Interfaz principal de CogniTrack |
| **API Backend** | `http://[ServerIP]:8082/api` | Endpoints de la API REST |
| **Estado** | `http://[ServerIP]:8080/status.txt` | Información del estado del sistema |
| **Health Check** | `http://[ServerIP]:8082/api/health` | Verificación de salud de la API |

## 🔧 Solución de Problemas

### ❌ Error de Conexión SSH
```powershell
# Verificar conectividad básica
ping [ServerIP]
Test-NetConnection -ComputerName [ServerIP] -Port 22

# Diagnóstico detallado
ssh -v [Username]@[ServerIP]
```

### ❌ Error de Transferencia de Archivos
- Verificar permisos en el servidor remoto
- Confirmar que hay espacio suficiente en disco
- Verificar conexión de red estable

### ❌ Error de Construcción Docker
- Verificar que Docker esté corriendo: `docker ps`
- Confirmar permisos del usuario: `sudo usermod -aG docker $USER`
- Verificar espacio en disco: `df -h`

## 📞 Soporte

Si encuentras problemas:
1. **Verifica logs:** El script proporciona mensajes de error detallados
2. **Prueba conectividad:** Usa los comandos de diagnóstico sugeridos
3. **Revisa permisos:** Confirma permisos SSH y Docker
4. **Consulta documentación:** Revisa esta guía para parámetros correctos

## 🆚 Comparación con Script Anterior

| Característica | Script Anterior | Script Flexible |
|----------------|----------------|-----------------|
| **Parámetros** | Fijos (hardcoded) | Configurables |
| **Interacción** | Ninguna | Interactiva si es necesario |
| **Credenciales** | En texto plano | Seguras (ocultas) |
| **Flexibilidad** | Un servidor fijo | Múltiples servidores |
| **Mantenimiento** | Requiere edición | Solo parámetros |

## 🎉 ¡Listo para Desplegar!

Con este script flexible puedes desplegar CogniTrack en cualquier servidor con solo cambiar los parámetros. ¡Ya no dependes de servidores específicos!

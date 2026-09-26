# EJEMPLOS DE USO - deploy-cognitrack-flexible.ps1

## 🚀 Ejemplos Prácticos

### Ejemplo 1: Despliegue en Servidor de Producción
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 `
    -ServerIP "192.168.1.100" `
    -Username "cognitrack_admin" `
    -Password "ProdPass2024!"
```

### Ejemplo 2: Despliegue en Servidor de Desarrollo
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 `
    -ServerIP "dev.cognitrack.local" `
    -SshPort 22 `
    -Username "developer"
```

### Ejemplo 3: Despliegue con Puerto SSH Personalizado
```powershell
.\scripts\deploy-cognitrack-flexible.ps1 `
    -ServerIP "10.0.0.50" `
    -SshPort 2222 `
    -Username "deploy_user"
```

### Ejemplo 4: Despliegue Interactivo (Pregunta Todo)
```powershell
.\scripts\deploy-cognitrack-flexible.ps1
```

## 🔧 Comandos de Verificación Después del Despliegue

### Verificar Servicios Remotos
```bash
# Desde el servidor remoto después del despliegue
sudo docker ps
sudo docker-compose logs
curl http://localhost:8080
curl http://localhost:8082/api/health
```

### Verificar Acceso Local
```powershell
# Desde tu máquina local
Test-NetConnection -ComputerName [ServerIP] -Port 80
Test-NetConnection -ComputerName [ServerIP] -Port 8080
Test-NetConnection -ComputerName [ServerIP] -Port 8082
Invoke-WebRequest -Uri "http://[ServerIP]" -UseBasicParsing
```

## 📋 Checklist Pre-Despliegue

- [ ] ✅ Verificar que el servidor esté encendido
- [ ] ✅ Confirmar acceso SSH al servidor
- [ ] ✅ Verificar permisos de usuario en el servidor
- [ ] ✅ Confirmar que Docker esté instalado (opcional)
- [ ] ✅ Verificar archivos locales necesarios
- [ ] ✅ Preparar credenciales de acceso

## 🎯 Servidores Recomendados para Despliegue

| Entorno | Servidor | IP Ejemplo | Usuario | Notas |
|---------|----------|------------|---------|-------|
| **Producción** | Ubuntu Server 22.04 | 192.168.1.100 | cognitrack | Servidor dedicado |
| **Desarrollo** | Ubuntu Desktop | 10.10.1.185 | peter | Entorno local |
| **Testing** | Docker Desktop | localhost | user | Contenedores locales |
| **Demo** | VPS Cloud | 45.79.123.456 | demo | Servidor remoto |

## 🚨 Solución de Problemas Comunes

### ❌ Error: "Connection refused"
```powershell
# Solución: Verificar que SSH esté corriendo en el servidor
ssh -p 22 [Username]@[ServerIP] "systemctl status ssh"
# Si no funciona, reiniciar el servicio SSH
ssh -p 22 [Username]@[ServerIP] "sudo systemctl restart ssh"
```

### ❌ Error: "Permission denied"
```powershell
# Solución: Verificar permisos del usuario
ssh -p 22 [Username]@[ServerIP] "whoami"
ssh -p 22 [Username]@[ServerIP] "groups"
# Agregar al grupo docker si es necesario
ssh -p 22 [Username]@[ServerIP] "sudo usermod -aG docker $USER"
```

### ❌ Error: "No space left on device"
```powershell
# Solución: Limpiar espacio en disco
ssh -p 22 [Username]@[ServerIP] "df -h"
ssh -p 22 [Username]@[ServerIP] "docker system prune -f"
ssh -p 22 [Username]@[ServerIP] "sudo apt autoremove -y && sudo apt autoclean"
```

## 🎉 ¡Éxito!

Después de un despliegue exitoso verás:

```
=== 🚀 DESPLIEGUE COMPLETADO ===
===============================
📍 Aplicación disponible en: http://[ServerIP]:8080
🔗 API disponible en: http://[ServerIP]:8082/api
📊 Estado: http://[ServerIP]:8080/status.txt

✅ ¡Despliegue completado exitosamente!
```

**¡Tu aplicación CogniTrack estará lista y funcionando!** 🎊

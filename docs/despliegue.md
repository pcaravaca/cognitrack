# Documentaciu00f3n de Despliegue para CogniTrack2

## Introducciu00f3n

Este documento describe el proceso de despliegue de la aplicaciu00f3n CogniTrack2, incluyendo la configuraciu00f3n del frontend y los pasos necesarios para un despliegue exitoso en un servidor remoto.

## Requisitos Previos

- PowerShell 7 (pwsh) instalado en la mu00e1quina local
- Acceso SSH al servidor remoto configurado con llaves SSH
- Docker y docker-compose instalados en el servidor remoto
- Git para control de versiones

## Estructura del Proyecto

La estructura bu00e1sica del proyecto es la siguiente:

```
Cognitrack2/
u251cu2500u2500 backend/
u251cu2500u2500 frontend/
u2502   u251cu2500u2500 src/
u2502   u251cu2500u2500 public/
u2502   u251cu2500u2500 Dockerfile
u2502   u251cu2500u2500 package.json
u2502   u251cu2500u2500 vite.config.ts
u251cu2500u2500 nginx/
u251cu2500u2500 scripts/
u2502   u251cu2500u2500 deploy-robust.ps1
u2502   u251cu2500u2500 rebuild-containers.ps1
u251cu2500u2500 docker-compose.yml
```

## Archivos Clave

### docker-compose.yml

Este archivo define los servicios, redes y volu00famenes necesarios para la aplicaciu00f3n. Es crucial para el despliegue, ya que configura cu00f3mo se construyen y ejecutan los contenedores Docker.

Puntos importantes:
- Configura el servicio `frontend` con los puertos y volu00famenes correctos
- Monta los directorios fuente para actualizaciones en tiempo real
- Define la red `cognitrack-network` para la comunicaciu00f3n entre servicios

### frontend/Dockerfile

Define cu00f3mo se construye la imagen Docker para el frontend. Incluye:
- Instalaciu00f3n de dependencias con pnpm
- Configuraciu00f3n del entorno (desarrollo/producciu00f3n)
- Comandos para iniciar la aplicaciu00f3n

### scripts/deploy-robust.ps1

Script principal para desplegar la aplicaciu00f3n. Realiza los siguientes pasos:
1. Verifica la conexiu00f3n SSH con el servidor
2. Verifica/crea el directorio del proyecto remoto
3. Transfiere el archivo docker-compose.yml
4. Detiene contenedores existentes
5. Limpia imu00e1genes Docker antiguas
6. Reconstruye y levanta los contenedores
7. Verifica el estado de los contenedores
8. Muestra logs para diagnu00f3stico

## Proceso de Despliegue

### 1. Preparaciu00f3n

Asegu00farate de que todos los cambios estu00e9n confirmados en Git:

```powershell
git status
git add .
git commit -m "Descripciu00f3n de los cambios"
```

### 2. Verificar Configuraciu00f3n

Revisa que los siguientes archivos existan y estu00e9n correctamente configurados:

- `frontend/src/assets/styles/global.scss` y `main.scss`
- `frontend/src/components/ConnectionStatus.vue` y `ServerConfig.vue`
- `frontend/src/stores/servers.js`
- `docker-compose.yml`
- `frontend/Dockerfile`

### 3. Despliegue

Utiliza el script de despliegue robusto:

```powershell
pwsh -File scripts/deploy-robust.ps1
```

Este script maneja todo el proceso de despliegue, incluyendo la transferencia de archivos, reconstrucciu00f3n de contenedores y verificaciu00f3n del estado.

### 4. Verificaciu00f3n

Despuu00e9s del despliegue, verifica que la aplicaciu00f3n estu00e9 funcionando correctamente:

- Accede a la aplicaciu00f3n a travu00e9s del navegador usando la IP del servidor
- Revisa los logs de Docker para cualquier error:
  ```
  ssh peter@192.168.0.105 "docker logs cognitrack2_frontend_1"
  ```

## Soluciu00f3n de Problemas

### Error de Montaje de Volumen

Si hay problemas con los volu00famenes montados:

1. Verifica que las rutas en `docker-compose.yml` sean correctas
2. Asegu00farate de que los archivos existan en el servidor
3. Comprueba los permisos de los directorios

### Error de Construcciu00f3n

Si la construcciu00f3n del contenedor falla:

1. Revisa los logs de Docker para identificar el error especu00edfico
2. Verifica que todas las dependencias estu00e9n correctamente definidas
3. Asegu00farate de que el archivo `Dockerfile` sea correcto

### Error de Conexiu00f3n SSH

Si hay problemas con la conexiu00f3n SSH:

1. Verifica que el servidor estu00e9 accesible (ping)
2. Comprueba que las llaves SSH estu00e9n configuradas correctamente
3. Asegu00farate de estar usando PowerShell 7 (pwsh) y no PowerShell 5.1

## Notas Importantes

- La ruta del proyecto en el servidor es `/home/peter/Cognitrack2` (con 't' minu00fascula)
- El contenedor frontend expone los puertos 80 (producciu00f3n) y 5173 (desarrollo)
- Se utiliza pnpm para manejo de dependencias
- El proyecto usa Vue 3 con Pinia y Vuetify

## Comandos u00datiles

```powershell
# Verificar estado de contenedores
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose ps"

# Ver logs del contenedor frontend
ssh peter@192.168.0.105 "docker logs cognitrack2_frontend_1 --tail 100"

# Reiniciar contenedores sin reconstruir
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose restart"

# Detener todos los contenedores
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose down"
```

---

**Documentation for Deployment of CogniTrack2**

## Introduction

This document describes the deployment process for the CogniTrack2 application, including frontend configuration and necessary steps for successful deployment on a remote server.

## Prerequisites

- PowerShell 7 (pwsh) installed on the local machine
- SSH access to remote server configured with SSH keys
- Docker and docker-compose installed on the remote server
- Git for version control

## Project Structure

The basic project structure is as follows:

```
Cognitrack2/
u251cu2500u2500 backend/
u251cu2500u2500 frontend/
u2502   u251cu2500u2500 src/
u2502   u251cu2500u2500 public/
u2502   u251cu2500u2500 Dockerfile
u2502   u251cu2500u2500 package.json
u2502   u251cu2500u2500 vite.config.ts
u251cu2500u2500 nginx/
u251cu2500u2500 scripts/
u2502   u251cu2500u2500 deploy-robust.ps1
u2502   u251cu2500u2500 rebuild-containers.ps1
u251cu2500u2500 docker-compose.yml
```

## Key Files

### docker-compose.yml

This file defines the services, networks, and volumes required for the application. It is crucial for deployment as it configures how Docker containers are built and run.

Important points:
- Configures the `frontend` service with correct ports and volumes
- Mounts source directories for real-time updates
- Defines the `cognitrack-network` for service communication

### frontend/Dockerfile

Defines how the Docker image for the frontend is built. Includes:
- Installation of dependencies with pnpm
- Environment configuration (development/production)
- Commands to start the application

### scripts/deploy-robust.ps1

Main script for deploying the application. Performs the following steps:
1. Verifies SSH connection with the server
2. Checks/creates the remote project directory
3. Transfers the docker-compose.yml file
4. Stops existing containers
5. Cleans old Docker images
6. Rebuilds and starts containers
7. Verifies container status
8. Shows logs for diagnostics

## Deployment Process

### 1. Preparation

Ensure all changes are committed to Git:

```powershell
git status
git add .
git commit -m "Description of changes"
```

### 2. Verify Configuration

Check that the following files exist and are correctly configured:

- `frontend/src/assets/styles/global.scss` and `main.scss`
- `frontend/src/components/ConnectionStatus.vue` and `ServerConfig.vue`
- `frontend/src/stores/servers.js`
- `docker-compose.yml`
- `frontend/Dockerfile`

### 3. Deployment

Use the robust deployment script:

```powershell
pwsh -File scripts/deploy-robust.ps1
```

This script handles the entire deployment process, including file transfer, container rebuilding, and status verification.

### 4. Verification

After deployment, verify that the application is working correctly:

- Access the application through the browser using the server's IP
- Check Docker logs for any errors:
  ```
  ssh peter@192.168.0.105 "docker logs cognitrack2_frontend_1"
  ```

## Troubleshooting

### Volume Mount Error

If there are problems with mounted volumes:

1. Verify that the paths in `docker-compose.yml` are correct
2. Make sure the files exist on the server
3. Check directory permissions

### Build Error

If container building fails:

1. Review Docker logs to identify the specific error
2. Verify that all dependencies are correctly defined
3. Make sure the `Dockerfile` is correct

### SSH Connection Error

If there are problems with the SSH connection:

1. Verify that the server is accessible (ping)
2. Check that SSH keys are correctly configured
3. Make sure you are using PowerShell 7 (pwsh) and not PowerShell 5.1

## Important Notes

- The project path on the server is `/home/peter/Cognitrack2` (with lowercase 't')
- The frontend container exposes ports 80 (production) and 5173 (development)
- pnpm is used for dependency management
- The project uses Vue 3 with Pinia and Vuetify

## Useful Commands

```powershell
# Check container status
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose ps"

# View frontend container logs
ssh peter@192.168.0.105 "docker logs cognitrack2_frontend_1 --tail 100"

# Restart containers without rebuilding
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose restart"

# Stop all containers
ssh peter@192.168.0.105 "cd /home/peter/Cognitrack2 && docker-compose down"
```

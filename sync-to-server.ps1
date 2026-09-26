# Script para sincronizar archivos con el servidor remoto
$remoteUser = "peter"
$remoteHost = "10.10.1.210"
$remotePort = "2222"
$remoteDir = "/home/peter/cognitrack"

# Archivos a sincronizar
$filesToSync = @(
    "docker-compose.yml",
    "docker-compose.prod.yml",
    "docker-compose.override.yml",
    "backend/Dockerfile",
    "backend/Dockerfile.dev",
    "frontend/Dockerfile",
    "frontend/Dockerfile.dev",
    "nginx/nginx.conf"
)

# Crear directorios remotos necesarios
Write-Host "Verificando directorios remotos..."
ssh -p $remotePort ${remoteUser}@${remoteHost} "mkdir -p $remoteDir/nginx && mkdir -p $remoteDir/backend && mkdir -p $remoteDir/frontend"

# Sincronizar cada archivo
foreach ($file in $filesToSync) {
    if (Test-Path $file) {
        Write-Host "Enviando $file..."
        scp -P $remotePort $file ${remoteUser}@${remoteHost}:${remoteDir}/$file
    } else {
        Write-Host "Advertencia: $file no encontrado localmente, omitiendo..."
    }
}

Write-Host "Sincronización completada."

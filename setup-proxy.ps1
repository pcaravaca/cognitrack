# Script para configurar el proxy inverso Nginx

# Crear directorios necesarios
$nginxDirs = @("nginx\conf.d", "nginx\certs", "nginx\vhost.d")
foreach ($dir in $nginxDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Directorio creado: $dir" -ForegroundColor Green
    }
}

# Crear archivo de configuración del proxy
$proxyConfig = @"
version: '3.8'

services:
  nginx-proxy:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./nginx/certs:/etc/nginx/certs
      - ./nginx/vhost.d:/etc/nginx/vhost.d
      - /var/run/docker.sock:/tmp/docker.sock:ro
    networks:
      - proxy-network
    restart: unless-stopped

  nginx-letsencrypt:
    image: jrcs/letsencrypt-nginx-proxy-companion
    container_name: nginx-letsencrypt
    depends_on:
      - nginx-proxy
    volumes:
      - ./nginx/certs:/etc/nginx/certs:rw
      - /var/run/docker.sock:/var/run/docker.sock:ro
    volumes_from:
      - nginx-proxy
    environment:
      - NGINX_PROXY_CONTAINER=nginx-proxy
    restart: unless-stopped

networks:
  proxy-network:
    name: nginx-proxy-network
    driver: bridge
"@

# Guardar configuración
$proxyConfig | Out-File -FilePath "docker-compose.proxy.yml" -Encoding utf8
Write-Host "Archivo de configuración del proxy creado: docker-compose.proxy.yml" -ForegroundColor Green

# Crear red Docker si no existe
$networkExists = docker network ls --format '{{.Name}}' | Select-String -Pattern '^nginx-proxy-network$' -Quiet
if (-not $networkExists) {
    docker network create nginx-proxy-network
    Write-Host "Red 'nginx-proxy-network' creada" -ForegroundColor Green
} else {
    Write-Host "La red 'nginx-proxy-network' ya existe" -ForegroundColor Yellow
}

# Instrucciones para el usuario
Write-Host "`nConfiguración completada. Para iniciar el proxy inverso, ejecuta:`" -ForegroundColor Cyan
Write-Host "docker-compose -f docker-compose.proxy.yml up -d" -ForegroundColor White -BackgroundColor Black
Write-Host "`nLuego inicia tu aplicación con:`" -ForegroundColor Cyan
Write-Host "docker-compose up -d" -ForegroundColor White -BackgroundColor Black

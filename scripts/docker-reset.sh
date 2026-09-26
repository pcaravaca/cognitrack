#!/bin/bash

echo "=== Reiniciando Docker Desktop ==="

# Detener Docker Desktop
echo "Deteniendo Docker Desktop..."
wsl --shutdown 2>/dev/null || true
taskkill /F /IM "Docker Desktop.exe" 2>/dev/null || true
taskkill /F /IM "com.docker.service" 2>/dev/null || true

# Limpiar estado de Docker
echo "Limpiando estado de Docker..."
docker system prune -a -f --volumes 2>/dev/null || true

# Esperar un momento
echo "Esperando reinicio del sistema..."
sleep 5

# Iniciar Docker Desktop
echo "Iniciando Docker Desktop..."
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo "Esperando a que Docker Desktop inicie completamente..."
sleep 30

# Verificar si Docker funciona
if docker ps &>/dev/null; then
    echo "✓ Docker Desktop reiniciado correctamente"
    echo "Ejecuta: ./deploy.sh"
    exit 0
else
    echo "✗ Docker Desktop no se pudo iniciar correctamente"
    echo "Por favor:"
    echo "1. Reinicia Docker Desktop manualmente desde el menú de Windows"
    echo "2. Espera a que termine de cargar completamente"
    echo "3. Ejecuta ./deploy.sh nuevamente"
    exit 1
fi

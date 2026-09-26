#!/bin/bash

echo "=== Verificando Docker ==="

# Verificar si Docker está ejecutándose
if docker ps &>/dev/null; then
    echo "✓ Docker está funcionando correctamente"
    exit 0
else
    echo "✗ Docker no está funcionando"

    # Verificar si Docker Desktop está instalado
    if command -v "docker-desktop" &>/dev/null; then
        echo "Iniciando Docker Desktop..."
        docker-desktop &
        sleep 10

        # Verificar nuevamente
        if docker ps &>/dev/null; then
            echo "✓ Docker Desktop iniciado correctamente"
            exit 0
        else
            echo "✗ No se pudo iniciar Docker Desktop"
            echo "Por favor, inicie Docker Desktop manualmente desde el menú de Windows"
            exit 1
        fi
    else
        echo "✗ Docker Desktop no está instalado"
        echo "Por favor, instale Docker Desktop desde: https://www.docker.com/products/docker-desktop"
        exit 1
    fi
fi

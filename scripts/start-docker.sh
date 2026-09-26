#!/bin/bash

echo "=== Iniciando Docker Desktop ==="

# Verificar si estamos en Windows
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "Detectado Windows..."

    # Intentar iniciar Docker Desktop
    echo "Iniciando Docker Desktop..."
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

    echo "Esperando a que Docker Desktop inicie..."
    sleep 15

    # Verificar si Docker está funcionando
    if docker ps &>/dev/null; then
        echo "✓ Docker está funcionando correctamente"
        exit 0
    else
        echo "✗ Docker aún no está funcionando"
        echo "Por favor:"
        echo "1. Espere a que Docker Desktop termine de iniciar"
        echo "2. Si no funciona, reinicie Docker Desktop manualmente"
        echo "3. Asegúrese de que la virtualización esté habilitada en BIOS"
        exit 1
    fi
else
    echo "No es Windows, ejecutando docker directamente..."
    if docker ps &>/dev/null; then
        echo "✓ Docker está funcionando"
        exit 0
    else
        echo "✗ Docker no está funcionando"
        exit 1
    fi
fi

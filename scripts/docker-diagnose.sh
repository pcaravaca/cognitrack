#!/bin/bash

echo "=== Diagnóstico de Docker ==="

# Verificar si Docker está funcionando
echo "1. Verificando Docker..."
if docker ps &>/dev/null; then
    echo "✓ Docker está funcionando correctamente"
    echo ""
    echo "=== Información del sistema ==="
    docker version
    echo ""
    echo "=== Contenedores ejecutándose ==="
    docker ps
    echo ""
    echo "=== Imágenes disponibles ==="
    docker images
    exit 0
else
    echo "✗ Docker no está funcionando"
    echo ""
    echo "=== Solución de problemas ==="
    echo ""
    echo "PASO 1: Iniciar Docker Desktop manualmente"
    echo "   - Presione Windows + S"
    echo "   - Busque 'Docker Desktop'"
    echo "   - Haga clic para iniciar"
    echo "   - Espere a que termine de iniciar (puede tomar 1-2 minutos)"
    echo ""
    echo "PASO 2: Si no funciona, verificar:"
    echo "   - Asegúrese de que la virtualización esté habilitada en BIOS"
    echo "   - Reinicie el equipo si es necesario"
    echo "   - Verifique que WSL2 esté instalado correctamente"
    echo ""
    echo "PASO 3: Comandos de verificación:"
    echo "   wsl --list --all    (debe mostrar Ubuntu)"
    echo "   wsl --version       (debe mostrar WSL2)"
    echo ""
    echo "PASO 4: Una vez que Docker esté funcionando, ejecute:"
    echo "   cd scripts"
    echo "   ./deploy.sh"
    echo ""
    exit 1
fi

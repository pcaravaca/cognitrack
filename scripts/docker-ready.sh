#!/bin/bash

echo "=== Verificación Final de Docker ==="
echo ""

# Verificar Docker
if docker ps &>/dev/null; then
    echo "✓ Docker está funcionando correctamente"
    echo ""
    echo "=== Información del sistema ==="
    docker version --format "Docker version: {{.Version}}"
    echo "API version: $(docker version --format '{{.ApiVersion}}')"
    echo "Go version: $(docker version --format '{{.GoVersion}}')"
    echo ""
    echo "=== Contenedores ejecutándose ==="
    docker ps
    echo ""
    echo "=== Imágenes disponibles ==="
    docker images | head -10
    echo ""
    echo "=== ¡Listo para el despliegue! ==="
    echo "Ejecuta el siguiente comando:"
    echo "cd scripts"
    echo "./deploy.sh"
    exit 0
else
    echo "✗ Docker aún no está funcionando"
    echo ""
    echo "=== Sigue estos pasos: ==="
    echo "1. Asegúrate de que Docker Desktop esté iniciado"
    echo "2. Espera a que termine de cargar completamente"
    echo "3. Si ves el icono de Docker en la barra de tareas, está listo"
    echo "4. Ejecuta este script nuevamente"
    echo ""
    echo "Si el problema persiste:"
    echo "- Reinicia Docker Desktop"
    echo "- Reinicia el equipo"
    echo "- Verifica que la virtualización esté habilitada en BIOS"
    exit 1
fi

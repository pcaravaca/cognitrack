#!/bin/bash

# Detener y eliminar el contenedor frontend
echo "Deteniendo y eliminando el contenedor frontend..."
docker stop cognitrack2_frontend_1 2>/dev/null
docker rm cognitrack2_frontend_1 2>/dev/null

# Eliminar la imagen anterior
echo "Eliminando la imagen anterior..."
docker rmi cognitrack2_frontend 2>/dev/null

# Limpiar Docker
echo "Limpiando Docker..."
docker system prune -f

# Reconstruir y levantar los servicios
echo "Reconstruyendo y levantando los servicios..."
cd /home/peter/Cognitrack2
docker-compose up -d --build --force-recreate

# Mostrar logs del frontend
echo "Mostrando logs del frontend..."
docker logs cognitrack2_frontend_1 --tail 50

echo "\nSi ves algún error, por favor comparte la salida para ayudarte mejor."

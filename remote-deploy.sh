#!/bin/bash
# Script de despliegue remoto para CogniTrack

# Configuración
REMOTE_USER="peter"
REMOTE_HOST="10.10.1.210"
REMOTE_PORT="2222"
REMOTE_DIR="/home/peter/cognitrack"

# 1. Ejecutar el despliegue en el servidor remoto
echo "[1/4] Iniciando despliegue en el servidor remoto..."
ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "
  cd $REMOTE_DIR && \
  echo '[2/4] Deteniendo contenedores existentes...' && \
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml down && \
  echo '[3/4] Reconstruyendo y levantando servicios...' && \
  docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build && \
  echo '[4/4] Verificando contenedores...' && \
  docker-compose ps"

echo "\n¡Despliegue completado!"
echo "La aplicación debería estar disponible en: http://10.10.1.210"
echo "\nPara ver los logs de los contenedores, ejecuta:"
echo "ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST 'cd $REMOTE_DIR && docker-compose logs -f'"

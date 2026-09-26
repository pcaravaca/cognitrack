#!/bin/bash
# Script para configurar Nginx para CogniTrack

# Configuración
APP_NAME="cognitrack"
APP_DOMAIN="cognitrack.local"  # Cambia esto por tu dominio real
APP_CONTAINER="cognitrack_app"  # Nombre del contenedor de la aplicación
APP_PORT="3000"                # Puerto interno del contenedor
NGINX_CONF_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"
TEMPLATE_FILE="$(dirname "$0")/nginx/app-template.conf"
OUTPUT_FILE="${NGINX_CONF_DIR}/${APP_NAME}.conf"

# Verificar si el usuario es root
if [ "$(id -u)" -ne 0 ]; then
    echo "Este script debe ejecutarse como root"
    exit 1
fi

# Verificar si el archivo de plantilla existe
if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "Error: No se encontró el archivo de plantilla $TEMPLATE_FILE"
    exit 1
fi

# Crear directorios si no existen
mkdir -p "$NGINX_CONF_DIR"
mkdir -p "$NGINX_ENABLED_DIR"

# Generar archivo de configuración
echo "Generando configuración de Nginx para $APP_NAME..."
cp "$TEMPLATE_FILE" "$OUTPUT_FILE"

# Reemplazar variables en la plantilla
sed -i "s/{{APP_NAME}}/$APP_NAME/g" "$OUTPUT_FILE"
sed -i "s/{{APP_DOMAIN}}/$APP_DOMAIN/g" "$OUTPUT_FILE"
sed -i "s/{{APP_CONTAINER}}/$APP_CONTAINER/g" "$OUTPUT_FILE"
sed -i "s/{{APP_PORT}}/$APP_PORT/g" "$OUTPUT_FILE"

# Crear enlace simbólico en sites-enabled
if [ ! -L "${NGINX_ENABLED_DIR}/${APP_NAME}.conf" ]; then
    ln -s "$OUTPUT_FILE" "${NGINX_ENABLED_DIR}/"
fi

# Verificar configuración de Nginx
echo "Verificando configuración de Nginx..."
if ! nginx -t; then
    echo "Error en la configuración de Nginx. Por favor, revisa los logs."
    exit 1
fi

# Recargar Nginx
systemctl reload nginx

echo "Configuración completada. La aplicación estará disponible en http://$APP_DOMAIN"
echo "Asegúrate de que el dominio $APP_DOMAIN apunte a la IP de este servidor."

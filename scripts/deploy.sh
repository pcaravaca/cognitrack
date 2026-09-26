#!/bin/bash

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuración
SERVER_IP="10.10.1.185"
SSH_USER="peter"
SSH_PORT="22"
REMOTE_DIR="/opt/cognitrack"

# Función para mostrar mensajes de error y salir
error_exit() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

# Verificación rápida de Docker (opcional)
echo -e "${BLUE}Verificando Docker...${NC}"

# Verificación no bloqueante - timeout de 3 segundos
if timeout 3s docker ps &>/dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker está funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Docker no responde o no está disponible${NC}"
    echo -e "${YELLOW}   Continuando sin Docker...${NC}"
fi

# Mostrar configuración
echo -e "${BLUE}=== CogniTrack - Despliegue Remoto ===${NC}"
echo "Servidor: $SERVER_IP"
echo "Puerto SSH: $SSH_PORT"
echo "Usuario: $SSH_USER"
echo "Directorio remoto: $REMOTE_DIR"
echo -e "${BLUE}======================================${NC}"

# Verificar conexión SSH
echo -e "${BLUE}Verificando conexión SSH...${NC}"
if ! ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "echo 'Conexión SSH exitosa'" &> /dev/null; then
    error_exit "No se pudo conectar a $SSH_USER@$SERVER_IP:$SSH_PORT"
fi
echo -e "${GREEN}✓ Conexión SSH exitosa${NC}"

# 1. Construir el frontend
echo -e "${BLUE}1. Construyendo frontend...${NC}"
cd ../frontend
npm install && npm run build || error_exit "Error al construir el frontend"

# 2. Copiar archivos al servidor
echo -e "${BLUE}2. Copiando archivos al servidor...${NC}"
cd ..
scp -P $SSH_PORT -r frontend/dist $SSH_USER@$SERVER_IP:$REMOTE_DIR/frontend/ || error_exit "Error al copiar frontend"
scp -P $SSH_PORT -r backend $SSH_USER@$SERVER_IP:$REMOTE_DIR/ || error_exit "Error al copiar backend"
scp -P $SSH_PORT .env.production $SSH_USER@$SERVER_IP:$REMOTE_DIR/.env
scp -P $SSH_PORT frontend/.env.production $SSH_USER@$SERVER_IP:$REMOTE_DIR/frontend/.env

# 3. Crear directorios remotos
echo -e "${BLUE}3. Configurando directorios en el servidor...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    sudo mkdir -p $REMOTE_DIR/{nginx,logs,frontend,backend} &&
    sudo chown -R $SSH_USER:$SSH_USER $REMOTE_DIR &&
    sudo chmod -R 755 $REMOTE_DIR
" || error_exit "Error al configurar directorios"

# 4. Configurar Nginx de forma segura
echo -e "${BLUE}4. Configurando Nginx...${NC}"

# Verificar si nginx está usando configuración por defecto
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    echo 'Verificando configuración de nginx existente...' &&
    sudo nginx -T | grep -E '(server_name|root|proxy_pass)' | head -10 || echo 'Configuración por defecto detectada'
" || error_exit "Error verificando nginx"

# Crear configuración segura que no interfiera con otras apps
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "cat > /tmp/cognitrack.conf" << 'NGINX_CONFIG'
# Configuración segura de CogniTrack - NO INTERFIERE con otras apps
server {
    listen 80;
    server_name _;

    # Solo servir CogniTrack si no hay configuración específica
    location /cognitrack/ {
        alias /opt/cognitrack/frontend/;
        try_files $uri $uri/ /cognitrack/index.html;

        # Proxy para API
        location /cognitrack/api/ {
            proxy_pass http://localhost:8081/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }
    }
}
NGINX_CONFIG

# Configurar nginx de forma segura
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    # Verificar si ya existe una configuración de CogniTrack
    if [ -f /etc/nginx/sites-available/cognitrack.conf ]; then
        echo 'Haciendo backup de configuración existente...'
        sudo cp /etc/nginx/sites-available/cognitrack.conf /etc/nginx/sites-available/cognitrack.conf.backup.\$(date +%Y%m%d_%H%M%S)
    fi &&

    sudo cp /tmp/cognitrack.conf /etc/nginx/sites-available/cognitrack.conf &&
    sudo nginx -t &&
    sudo systemctl reload nginx || sudo systemctl restart nginx
" || error_exit "Error al configurar Nginx de forma segura"

# 5. Compilar y ejecutar backend de forma segura
echo -e "${BLUE}5. Compilando y ejecutando backend...${NC}"

# Verificar si el backend ya está corriendo
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    if pgrep -f 'cognitrack-backend' > /dev/null; then
        echo 'Backend ya está ejecutándose, reiniciando...'
        pkill -f 'cognitrack-backend' || true
        sleep 2
    fi
"

ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    cd $REMOTE_DIR/backend &&
    echo 'Compilando backend Go...' &&
    go mod tidy &&
    go build -o backend . &&
    echo 'Backend compilado correctamente' &&
    nohup ./backend > $REMOTE_DIR/logs/backend.log 2>&1 &
" || error_exit "Error al compilar backend"

# 6. Verificar estado y mostrar URLs
echo -e "${BLUE}6. Verificando estado...${NC}"
ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "
    echo '=== Estado del backend ===' &&
    ps aux | grep backend | grep -v grep &&
    echo '' &&
    echo '=== Estado de Nginx ===' &&
    sudo systemctl status nginx --no-pager &&
    echo '' &&
    echo '=== Archivos frontend ===' &&
    ls -la $REMOTE_DIR/frontend/
"

# 7. Mostrar URLs de acceso
echo -e "\n${GREEN}¡Despliegue completado con éxito!${NC}"
echo -e "${BLUE}Frontend:${NC} http://$SERVER_IP/cognitrack/"
echo -e "${BLUE}API:${NC}      http://$SERVER_IP/cognitrack/api"
echo -e "\n${YELLOW}URLs alternativas si nginx no responde:${NC}"
echo -e "${BLUE}Backend directo:${NC} http://$SERVER_IP:8081"
echo -e "\n${YELLOW}Comandos de administración segura:${NC}"
echo "Ver logs backend:       ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'tail -f $REMOTE_DIR/logs/backend.log'"
echo "Ver logs Nginx:         ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/error.log'"
echo "Detener backend:        ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pkill -f cognitrack-backend'"
echo "Reiniciar backend:      ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pkill -f cognitrack-backend && sleep 2 && cd $REMOTE_DIR/backend && nohup ./backend > $REMOTE_DIR/logs/backend.log 2>&1 &'"
echo "Reiniciar Nginx:        ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo systemctl reload nginx'"
echo "Rollback nginx:         ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo rm /etc/nginx/sites-enabled/cognitrack.conf && sudo systemctl reload nginx'"

exit 0
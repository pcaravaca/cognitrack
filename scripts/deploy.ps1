# Script de PowerShell para ejecutar el despliegue de CogniTrack
Write-Host "🚀 CogniTrack - Despliegue Remoto" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Configuración
$SERVER_IP = "10.10.1.185"
$SSH_USER = "peter"
$SSH_PORT = "22"
$REMOTE_DIR = "/opt/cognitrack"

Write-Host "Servidor: $SERVER_IP" -ForegroundColor Blue
Write-Host "Puerto SSH: $SSH_PORT" -ForegroundColor Blue
Write-Host "Usuario: $SSH_USER" -ForegroundColor Blue
Write-Host "Directorio remoto: $REMOTE_DIR" -ForegroundColor Blue

# Verificar Docker (opcional)
Write-Host "Verificando Docker..." -ForegroundColor Blue
try {
    $dockerVersion = & docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker está instalado" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  Docker no está disponible. Continuando sin Docker..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "ℹ️  Docker no está disponible. Continuando sin Docker..." -ForegroundColor Yellow
}

# Verificar conexión SSH
Write-Host "Verificando conexión SSH..." -ForegroundColor Blue
try {
    $sshTest = & ssh -p $SSH_PORT -o ConnectTimeout=5 -o StrictHostKeyChecking=no $SSH_USER@$SERVER_IP "echo 'Conexión SSH exitosa'" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Conexión SSH exitosa" -ForegroundColor Green
    } else {
        throw "Error en SSH"
    }
} catch {
    Write-Host "❌ Error: No se pudo conectar a $SSH_USER@$SERVER_IP`:$SSH_PORT" -ForegroundColor Red
    Write-Host "Verifica que:" -ForegroundColor Yellow
    Write-Host "1. El servidor esté encendido" -ForegroundColor Yellow
    Write-Host "2. SSH esté funcionando en el puerto $SSH_PORT" -ForegroundColor Yellow
    Write-Host "3. Las credenciales sean correctas" -ForegroundColor Yellow
    exit 1
}

# Construir el frontend
Write-Host "1. Construyendo frontend..." -ForegroundColor Blue
try {
    Set-Location "../frontend"
    & npm install
    if ($LASTEXITCODE -ne 0) { throw "Error en npm install" }
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "Error en npm run build" }
    Write-Host "✅ Frontend construido correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al construir el frontend: $_" -ForegroundColor Red
    exit 1
}

# Copiar archivos al servidor
Write-Host "2. Copiando archivos al servidor..." -ForegroundColor Blue
Set-Location ".."
try {
    & scp -P $SSH_PORT -r frontend/dist $SSH_USER@$SERVER_IP`:$REMOTE_DIR/frontend/ 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error copiando frontend" }
    & scp -P $SSH_PORT -r backend $SSH_USER@$SERVER_IP`:$REMOTE_DIR/ 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error copiando backend" }
    & scp -P $SSH_PORT .env.production $SSH_USER@$SERVER_IP`:$REMOTE_DIR/.env 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error copiando .env" }
    & scp -P $SSH_PORT frontend/.env.production $SSH_USER@$SERVER_IP`:$REMOTE_DIR/frontend/.env 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error copiando .env.production" }
    Write-Host "✅ Archivos copiados correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al copiar archivos: $_" -ForegroundColor Red
    exit 1
}

# Crear directorios remotos
Write-Host "3. Configurando directorios en el servidor..." -ForegroundColor Blue
try {
    $command = "sudo mkdir -p $REMOTE_DIR/{nginx,logs,frontend,backend} && sudo chown -R $SSH_USER`:$SSH_USER $REMOTE_DIR && sudo chmod -R 755 $REMOTE_DIR"
    & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP $command 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error creando directorios" }
    Write-Host "✅ Directorios configurados correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al configurar directorios: $_" -ForegroundColor Red
    exit 1
}

# Configurar Nginx
Write-Host "4. Configurando Nginx..." -ForegroundColor Blue
try {
    # Crear configuración de nginx
    $nginxConfig = @"
# Configuración segura de CogniTrack - NO INTERFIERE con otras apps
server {
    listen 80;
    server_name _;

    # Solo servir CogniTrack si no hay configuración específica
    location /cognitrack/ {
        alias /opt/cognitrack/frontend/;
        try_files `$uri `$uri/ /cognitrack/index.html;

        # Proxy para API
        location /cognitrack/api/ {
            proxy_pass http://localhost:8081/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade `$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host `$host;
            proxy_cache_bypass `$http_upgrade;
            proxy_set_header X-Real-IP `$remote_addr;
            proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        }
    }
}
"@

    # Copiar configuración
    $nginxConfig | & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP "cat > /tmp/cognitrack.conf" 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error creando configuración nginx" }

    # Aplicar configuración
    $command = @"
if [ -f /etc/nginx/sites-available/cognitrack.conf ]; then
    echo 'Haciendo backup de configuración existente...'
    sudo cp /etc/nginx/sites-available/cognitrack.conf /etc/nginx/sites-available/cognitrack.conf.backup.`$(date +%Y%m%d_%H%M%S)
fi &&
sudo cp /tmp/cognitrack.conf /etc/nginx/sites-available/cognitrack.conf &&
sudo ln -sf /etc/nginx/sites-available/cognitrack.conf /etc/nginx/sites-enabled/ &&
sudo nginx -t &&
sudo systemctl reload nginx || sudo systemctl restart nginx
"@
    & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP $command 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error aplicando configuración nginx" }

    Write-Host "✅ Nginx configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al configurar Nginx: $_" -ForegroundColor Red
    exit 1
}

# Compilar y ejecutar backend
Write-Host "5. Compilando y ejecutando backend..." -ForegroundColor Blue
try {
    # Verificar si backend ya está corriendo
    $command = "if pgrep -f 'cognitrack-backend' > /dev/null; then echo 'Backend ya ejecutándose, reiniciando...'; pkill -f 'cognitrack-backend' || true; sleep 2; fi"
    & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP $command 2>$null

    # Compilar y ejecutar backend
    $command = "cd $REMOTE_DIR/backend && echo 'Compilando backend Go...' && go mod tidy && go build -o backend . && echo 'Backend compilado correctamente' && nohup ./backend > $REMOTE_DIR/logs/backend.log 2>&1 &"
    & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP $command 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Error compilando backend" }

    Write-Host "✅ Backend compilado y ejecutándose" -ForegroundColor Green
} catch {
    Write-Host "❌ Error al compilar backend: $_" -ForegroundColor Red
    exit 1
}

# Verificar estado
Write-Host "6. Verificando estado..." -ForegroundColor Blue
try {
    $command = "echo '=== Estado del backend ===' && ps aux | grep backend | grep -v grep && echo '' && echo '=== Estado de Nginx ===' && sudo systemctl status nginx --no-pager | grep -E '(Active|Loaded)' && echo '' && echo '=== Archivos frontend ===' && ls -la $REMOTE_DIR/frontend/"
    $status = & ssh -p $SSH_PORT $SSH_USER@$SERVER_IP $command 2>$null
    Write-Host $status
    Write-Host "✅ Estado verificado" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Error verificando estado: $_" -ForegroundColor Yellow
}

# Mostrar URLs de acceso
Write-Host ""
Write-Host "🎉 ¡Despliegue completado con éxito!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Frontend: http://$SERVER_IP/cognitrack/" -ForegroundColor Blue
Write-Host "🔌 API:      http://$SERVER_IP/cognitrack/api" -ForegroundColor Blue
Write-Host ""
Write-Host "🔧 URLs alternativas si nginx no responde:" -ForegroundColor Yellow
Write-Host "🔌 Backend directo: http://$SERVER_IP`:8081" -ForegroundColor Blue
Write-Host ""
Write-Host "⚙️  Comandos de administración:" -ForegroundColor Yellow
Write-Host "Ver logs backend:       ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'tail -f $REMOTE_DIR/logs/backend.log'"
Write-Host "Ver logs Nginx:         ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/error.log'"
Write-Host "Detener backend:        ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pkill -f cognitrack-backend'"
Write-Host "Reiniciar backend:      ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'pkill -f cognitrack-backend && sleep 2 && cd $REMOTE_DIR/backend && nohup ./backend > $REMOTE_DIR/logs/backend.log 2>&1 &'"
Write-Host "Reiniciar Nginx:        ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo systemctl reload nginx'"
Write-Host "Rollback nginx:         ssh -p $SSH_PORT $SSH_USER@$SERVER_IP 'sudo rm /etc/nginx/sites-enabled/cognitrack.conf && sudo systemctl reload nginx'"

Write-Host ""
Write-Host "✅ ¡Despliegue completado!" -ForegroundColor Green

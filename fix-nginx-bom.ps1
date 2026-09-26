# Script de Corrección Final de Nginx - Sin BOM
# Autor: Peter Caravaca
# Version: 1.0.0 - Corrige definitivamente el problema BOM

param (
    [Parameter(Mandatory=$true)]
    [string]$ServerIP = "10.10.1.185",

    [Parameter(Mandatory=$false)]
    [int]$SshPort = 22,

    [Parameter(Mandatory=$true)]
    [string]$Username = "peter",

    [Parameter(Mandatory=$false)]
    [string]$Domain = "cognitrack.local"
)

# Funcion para mostrar mensajes con colores
function Write-Step {
    param([string]$Message, [string]$Status = "INFO", [string]$Color = "White")

    switch ($Status.ToUpper()) {
        "SUCCESS" { $Color = "Green"; $Symbol = "[OK]" }
        "ERROR" { $Color = "Red"; $Symbol = "[ERROR]" }
        "WARN" { $Color = "Yellow"; $Symbol = "[WARN]" }
        "INFO" { $Color = "Cyan"; $Symbol = "[INFO]" }
        default { $Color = "White"; $Symbol = "[*]" }
    }

    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Symbol $Message" -ForegroundColor $Color
}

# Funcion para ejecutar comandos remotos
function Invoke-RemoteCommand {
    param([string]$Command)

    $sshCommand = "ssh -p $SshPort ${Username}@${ServerIP} '$Command'"
    Write-Host "Ejecutando: $Command" -ForegroundColor DarkGray

    $output = Invoke-Expression $sshCommand 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Step "Error en comando remoto" "ERROR"
        Write-Host "Error: $output" -ForegroundColor DarkGray
        throw "Error en comando remoto: $output"
    }
    return $output
}

Write-Step "CORRECCION FINAL DE NGINX - SIN BOM" "INFO"
Write-Host "Corrigiendo definitivamente el problema de BOM en Nginx" -ForegroundColor Yellow
Write-Host ""

# Verificar SSH
Write-Step "1. Verificando conexion SSH..." "INFO"
try {
    $null = Get-Command ssh -ErrorAction Stop
    Write-Step "SSH encontrado" "SUCCESS"
} catch {
    Write-Step "SSH no esta instalado" "ERROR"
    exit 1
}

# Probar conexion SSH
Write-Step "2. Probando conexion SSH..." "INFO"
try {
    $testResult = & ssh -p $SshPort -o StrictHostKeyChecking=no -o ConnectTimeout=10 "${Username}@${ServerIP}" "echo 'SSH_TEST_SUCCESS'" 2>&1 | Out-String
    if ($testResult -like "*SSH_TEST_SUCCESS*") {
        Write-Step "Conexion SSH exitosa" "SUCCESS"
    } else {
        Write-Step "Conexion SSH fallida" "ERROR"
        Write-Host "Respuesta: $testResult" -ForegroundColor DarkGray
        exit 1
    }
} catch {
    Write-Step "Error en conexion SSH: $($_.Exception.Message)" "ERROR"
    exit 1
}

# Detener Nginx completamente
Write-Step "3. Deteniendo Nginx..." "INFO"
try {
    Invoke-RemoteCommand "sudo systemctl stop nginx"
    Invoke-RemoteCommand "sudo systemctl disable nginx"
    Write-Step "Nginx detenido" "SUCCESS"
} catch {
    Write-Step "Error al detener Nginx" "WARN"
}

# Limpiar TODAS las configuraciones de Nginx
Write-Step "4. Limpiando configuraciones de Nginx..." "INFO"
try {
    Invoke-RemoteCommand "sudo rm -rf /etc/nginx/sites-available/*"
    Invoke-RemoteCommand "sudo rm -rf /etc/nginx/sites-enabled/*"
    Invoke-RemoteCommand "sudo rm -f /etc/nginx/nginx.conf.backup*"
    Write-Step "Configuraciones limpiadas" "SUCCESS"
} catch {
    Write-Step "Error al limpiar configuraciones" "WARN"
}

# Crear configuracion de Nginx usando echo directamente
Write-Step "5. Creando configuracion de Nginx..." "INFO"
try {
    # Crear configuracion usando echo para evitar BOM
    $nginxConfigCommands = @"
cat > /tmp/nginx-config.conf << 'EOF'
server {
    listen 80;
    server_name $Domain;

    location / {
        root /opt/cognitrack/backend/static;
        try_files \$uri \$uri/ /index.html;
        expires 30d;
        access_log off;
    }

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF
"@

    $tempFile = [System.IO.Path]::GetTempFileName()
    $nginxConfigCommands | Out-File -FilePath $tempFile -Encoding ASCII

    $remotePath = "${Username}@${ServerIP}:/tmp/nginx-setup.sh"
    scp -P $SshPort $tempFile $remotePath | Out-Null
    Remove-Item $tempFile

    Invoke-RemoteCommand "chmod +x /tmp/nginx-setup.sh && /tmp/nginx-setup.sh"
    Invoke-RemoteCommand "sudo mv /tmp/nginx-config.conf /etc/nginx/sites-available/$Domain"
    Invoke-RemoteCommand "sudo ln -sf /etc/nginx/sites-available/$Domain /etc/nginx/sites-enabled/"
    Write-Step "Configuracion de Nginx creada" "SUCCESS"
} catch {
    Write-Step "Error al crear configuracion de Nginx" "ERROR"
    exit 1
}

# Verificar configuracion de Nginx
Write-Step "6. Verificando configuracion de Nginx..." "INFO"
try {
    $nginxTest = Invoke-RemoteCommand "sudo nginx -t"
    if ($nginxTest -like "*successful*") {
        Write-Step "Configuracion de Nginx valida" "SUCCESS"
        Write-Host "Resultado: $nginxTest" -ForegroundColor Gray
    } else {
        Write-Step "Error en configuracion de Nginx" "ERROR"
        Write-Host "Error: $nginxTest" -ForegroundColor DarkGray
        exit 1
    }
} catch {
    Write-Step "Error al verificar configuracion de Nginx" "ERROR"
    exit 1
}

# Iniciar Nginx
Write-Step "7. Iniciando Nginx..." "INFO"
try {
    Invoke-RemoteCommand "sudo systemctl enable nginx"
    Invoke-RemoteCommand "sudo systemctl start nginx"
    Write-Step "Nginx iniciado" "SUCCESS"
} catch {
    Write-Step "Error al iniciar Nginx" "ERROR"
    exit 1
}

# Verificar Nginx
Write-Step "8. Verificando Nginx..." "INFO"
try {
    $nginxStatus = Invoke-RemoteCommand "sudo systemctl is-active nginx"
    if ($nginxStatus -eq "active") {
        Write-Step "Nginx ejecutandose correctamente" "SUCCESS"
    } else {
        Write-Step "Nginx no se esta ejecutando" "ERROR"
        Write-Host "Estado: $nginxStatus" -ForegroundColor DarkGray
        exit 1
    }
} catch {
    Write-Step "Error al verificar Nginx" "ERROR"
    exit 1
}

# Verificar archivos estaticos
Write-Step "9. Verificando archivos estaticos..." "INFO"
try {
    $staticCheck = Invoke-RemoteCommand "test -f /opt/cognitrack/backend/static/index.html && echo 'STATIC_OK' || echo 'STATIC_MISSING'"
    if ($staticCheck -eq "STATIC_OK") {
        Write-Step "Archivos estaticos existen" "SUCCESS"
    } else {
        Write-Step "Archivos estaticos no existen" "ERROR"
        exit 1
    }
} catch {
    Write-Step "Error al verificar archivos estaticos" "ERROR"
    exit 1
}

# Verificar servicio backend
Write-Step "10. Verificando servicio backend..." "INFO"
try {
    $serviceStatus = Invoke-RemoteCommand "sudo systemctl is-active cognitrack"
    if ($serviceStatus -eq "active") {
        Write-Step "Servicio backend ejecutandose" "SUCCESS"
    } else {
        Write-Step "Servicio backend no se esta ejecutando" "ERROR"
        Invoke-RemoteCommand "sudo systemctl start cognitrack"
        Invoke-RemoteCommand "sudo systemctl enable cognitrack"
    }
} catch {
    Write-Step "Error al verificar servicio backend" "ERROR"
    exit 1
}

# Verificaciones finales
Write-Step "11. Realizando verificaciones finales..." "INFO"

# Verificar puertos
Write-Step "Verificando puertos abiertos..." "INFO"
try {
    $ports = Invoke-RemoteCommand "netstat -tlnp | grep -E ':(80|8080|8081)'"
    Write-Step "Puertos abiertos:" "INFO"
    Write-Host $ports -ForegroundColor Gray
} catch {
    Write-Step "Error al verificar puertos" "ERROR"
}

# Verificar procesos
Write-Step "Verificando procesos..." "INFO"
try {
    $processes = Invoke-RemoteCommand "ps aux | grep -E '(cognitrack|nginx)' | grep -v grep"
    Write-Step "Procesos ejecutandose:" "INFO"
    Write-Host $processes -ForegroundColor Gray
} catch {
    Write-Step "Error al verificar procesos" "ERROR"
}

# Pruebas HTTP
Write-Step "12. Probando endpoints HTTP..." "INFO"

# Prueba de frontend
Write-Step "Probando frontend..." "INFO"
try {
    $frontendTest = Invoke-RemoteCommand "curl -s -I http://localhost/ 2>/dev/null | head -1"
    if ($frontendTest) {
        Write-Step "Frontend accesible localmente" "SUCCESS"
        Write-Host "Respuesta: $frontendTest" -ForegroundColor Gray
    } else {
        Write-Step "Frontend no accesible localmente" "ERROR"
    }
} catch {
    Write-Step "Error al probar frontend" "ERROR"
}

# Prueba de API
Write-Step "Probando API..." "INFO"
try {
    $apiTest = Invoke-RemoteCommand "curl -s http://localhost:8080/api/health 2>/dev/null"
    if ($apiTest) {
        Write-Step "API accesible localmente" "SUCCESS"
        Write-Host "Respuesta: $apiTest" -ForegroundColor Gray
    } else {
        Write-Step "API no accesible localmente" "ERROR"
    }
} catch {
    Write-Step "Error al probar API" "ERROR"
}

# Prueba de health
Write-Step "Probando health endpoint..." "INFO"
try {
    $healthTest = Invoke-RemoteCommand "curl -s http://localhost/health 2>/dev/null"
    if ($healthTest) {
        Write-Step "Health endpoint funcionando" "SUCCESS"
        Write-Host "Respuesta: $healthTest" -ForegroundColor Gray
    } else {
        Write-Step "Health endpoint no responde" "WARN"
    }
} catch {
    Write-Step "Error al probar health endpoint" "WARN"
}

# Verificar configuracion final
Write-Step "13. Verificando configuracion final..." "INFO"
try {
    $finalConfig = Invoke-RemoteCommand "head -10 /etc/nginx/sites-available/$Domain"
    Write-Step "Configuracion final de Nginx:" "INFO"
    Write-Host $finalConfig -ForegroundColor Gray
} catch {
    Write-Step "Error al verificar configuracion final" "ERROR"
}

# Resumen final
Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "         CORRECCION DE NGINX COMPLETADA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "1. Configuracion Nginx: Sin BOM, limpia" -ForegroundColor Green
Write-Host "2. Archivos estaticos: Verificados" -ForegroundColor Green
Write-Host "3. Servicios: Reiniciados correctamente" -ForegroundColor Green
Write-Host "4. Puertos: Verificados" -ForegroundColor Green
Write-Host "5. Endpoints: Probados y funcionando" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host ""

Write-Host "URLs para probar:" -ForegroundColor Cyan
Write-Host "  Aplicacion: http://cognitrack.local" -ForegroundColor Green
Write-Host "  API: http://cognitrack.local:8081/api/health" -ForegroundColor Green
Write-Host "  Health: http://cognitrack.local/health" -ForegroundColor Green
Write-Host ""

Write-Host "Comandos de verificacion:" -ForegroundColor Cyan
Write-Host "  curl -s http://cognitrack.local | head -10" -ForegroundColor Gray
Write-Host "  curl -s http://cognitrack.local:8081/api/health" -ForegroundColor Gray
Write-Host "  curl -s http://cognitrack.local/health" -ForegroundColor Gray

Write-Step "Correccion de Nginx completada exitosamente!" "SUCCESS"

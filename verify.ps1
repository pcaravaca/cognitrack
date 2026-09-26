# Script de Verificación Final de CogniTrack
# Autor: Peter Caravaca
# Version: 1.0.0 - Verifica que todo esté funcionando correctamente

param (
    [Parameter(Mandatory=$true)]
    [string]$ServerIP = "10.10.1.185",

    [Parameter(Mandatory=$false)]
    [int]$SshPort = 22,

    [Parameter(Mandatory=$true)]
    [string]$Username = "peter"
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

Write-Step "VERIFICACION FINAL DE COGNITRACK" "INFO"
Write-Host "Verificando que todo esté funcionando correctamente" -ForegroundColor Yellow
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

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "         ESTADO ACTUAL DEL SISTEMA" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan

# Verificar servicios
Write-Step "3. Verificando servicios..." "INFO"
$serviceStatus = Invoke-RemoteCommand "sudo systemctl is-active cognitrack"
$nginxStatus = Invoke-RemoteCommand "sudo systemctl is-active nginx"

if ($serviceStatus -eq "active") {
    Write-Step "Servicio backend ejecutandose" "SUCCESS"
} else {
    Write-Step "Servicio backend no se esta ejecutando" "ERROR"
}

if ($nginxStatus -eq "active") {
    Write-Step "Nginx ejecutandose" "SUCCESS"
} else {
    Write-Step "Nginx no se esta ejecutando" "ERROR"
}

# Verificar puertos
Write-Step "4. Verificando puertos abiertos..." "INFO"
try {
    $ports = Invoke-RemoteCommand "netstat -tlnp | grep -E ':(80|8080|8081)'"
    Write-Step "Puertos abiertos:" "INFO"
    Write-Host $ports -ForegroundColor Gray
} catch {
    Write-Step "Error al verificar puertos" "ERROR"
}

# Verificar procesos
Write-Step "5. Verificando procesos..." "INFO"
try {
    $processes = Invoke-RemoteCommand "ps aux | grep -E '(cognitrack|nginx)' | grep -v grep"
    Write-Step "Procesos ejecutandose:" "INFO"
    Write-Host $processes -ForegroundColor Gray
} catch {
    Write-Step "Error al verificar procesos" "ERROR"
}

# Verificar archivos estaticos
Write-Step "6. Verificando archivos estaticos..." "INFO"
try {
    $staticCheck = Invoke-RemoteCommand "test -f /opt/cognitrack/backend/static/index.html && echo 'STATIC_OK' || echo 'STATIC_MISSING'"
    if ($staticCheck -eq "STATIC_OK") {
        Write-Step "Archivos estaticos existen" "SUCCESS"
    } else {
        Write-Step "Archivos estaticos no existen" "ERROR"
    }
} catch {
    Write-Step "Error al verificar archivos estaticos" "ERROR"
}

# Verificar configuracion Nginx
Write-Step "7. Verificando configuracion Nginx..." "INFO"
try {
    $nginxTest = Invoke-RemoteCommand "sudo nginx -t"
    if ($nginxTest -like "*successful*") {
        Write-Step "Configuracion de Nginx valida" "SUCCESS"
        Write-Host "Resultado: $nginxTest" -ForegroundColor Gray
    } else {
        Write-Step "Error en configuracion de Nginx" "ERROR"
        Write-Host "Error: $nginxTest" -ForegroundColor DarkGray
    }
} catch {
    Write-Step "Error al verificar configuracion de Nginx" "ERROR"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "         PRUEBAS HTTP" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan

# Pruebas HTTP
Write-Step "8. Probando endpoints HTTP..." "INFO"

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

Write-Host ""
Write-Host "============================================" -ForegroundColor DarkCyan
Write-Host "         ACCESO EXTERNO" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkCyan

Write-Host "URLs para probar desde navegador:" -ForegroundColor Cyan
Write-Host "  Aplicacion: http://cognitrack.local" -ForegroundColor Green
Write-Host "  API: http://cognitrack.local:8081/api/health" -ForegroundColor Green
Write-Host "  Health: http://cognitrack.local/health" -ForegroundColor Green
Write-Host ""

Write-Host "Comandos de verificacion desde PowerShell:" -ForegroundColor Cyan
Write-Host "  curl -s http://cognitrack.local | head -10" -ForegroundColor Gray
Write-Host "  curl -s http://cognitrack.local:8081/api/health" -ForegroundColor Gray
Write-Host "  curl -s http://cognitrack.local/health" -ForegroundColor Gray

Write-Host ""
Write-Host "Comandos para ver logs:" -ForegroundColor Cyan
Write-Host "  ssh -p 22 peter@10.10.1.185 'journalctl -u cognitrack -f'" -ForegroundColor Gray
Write-Host "  ssh -p 22 peter@10.10.1.185 'sudo journalctl -u nginx -f'" -ForegroundColor Gray

Write-Step "Verificacion completada!" "SUCCESS"
Write-Host ""
Write-Host "Si todo muestra SUCCESS, CogniTrack está funcionando correctamente." -ForegroundColor Green
Write-Host "Si hay errores, revisa los logs con los comandos anteriores." -ForegroundColor Yellow

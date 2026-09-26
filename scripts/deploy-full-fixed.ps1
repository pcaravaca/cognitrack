# Parámetros del script
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [int]$SshPort = 22,
    
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Domain,
    
    [Parameter(Mandatory=$false)]
    [string]$RemoteDir = "/opt/cognitrack"
)

# Variables globales del script
$script:ServerIP = $ServerIP
$script:SshPort = $SshPort
$script:Username = $Username
$script:Domain = if ($Domain) { $Domain } else { "cognitrack.local" }
$script:RemoteDir = $RemoteDir

# Función para mostrar mensajes de estado
function Write-Status {
    param(
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR", "DOCKER", "FRONTEND", "BACKEND", "PROGRESS")]
        [string]$Type = "INFO"
    )
    
    switch ($Type) {
        "INFO"     { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
        "SUCCESS"  { Write-Host "[OK] $Message" -ForegroundColor Green }
        "WARNING"  { Write-Host "[AVISO] $Message" -ForegroundColor Yellow }
        "ERROR"    { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        "DOCKER"   { Write-Host "[DOCKER] $Message" -ForegroundColor Blue }
        "FRONTEND" { Write-Host "[FRONTEND] $Message" -ForegroundColor Magenta }
        "BACKEND"  { Write-Host "[BACKEND] $Message" -ForegroundColor DarkYellow }
        "PROGRESS" { Write-Host "[PROGRESO] $Message" -ForegroundColor Cyan }
    }
}

# Función para ejecutar comandos remotos
function Invoke-RemoteCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        [string]$WorkingDirectory = "",
        [switch]$Sudo,
        [string]$ErrorAction = "Continue"
    )
    
    $fullCommand = if ($Sudo) { "sudo $Command" } else { $Command }
    if ($WorkingDirectory) {
        $fullCommand = "cd $WorkingDirectory && $fullCommand"
    }
    
    Write-Status "Ejecutando: $fullCommand" -Type INFO
    
    try {
        $result = ssh -p $script:SshPort "$($script:Username)@$($script:ServerIP)" "$fullCommand"
        return $result
    }
    catch {
        Write-Status "Error al ejecutar comando: $_" -Type ERROR
        if ($ErrorAction -eq "Continue") {
            return $null
        }
        throw $_
    }
}

# Función principal de despliegue con Docker
function Deploy-WithDocker {
    Write-Status "Iniciando despliegue con Docker..." -Type DOCKER
    
    try {
        # Crear directorio remoto
        Write-Status "Creando directorios remotos..." -Type INFO
        Invoke-RemoteCommand -Command "mkdir -p $script:RemoteDir" -Sudo
        Invoke-RemoteCommand -Command "chown -R $script:Username`:$script:Username $script:RemoteDir" -Sudo
        
        # Detener servicios conflictivos
        Write-Status "Deteniendo servicios conflictivos..." -Type WARNING
        Invoke-RemoteCommand -Command "systemctl stop cognitrack-api.service 2>/dev/null || true" -Sudo -ErrorAction "SilentlyContinue"
        
        # Copiar archivos del proyecto
        Write-Status "Copiando archivos del proyecto..." -Type INFO
        $tarFile = "cognitrack-deploy.tar.gz"
        
        # Crear archivo TAR excluyendo archivos innecesarios
        tar -czf $tarFile --exclude="node_modules" --exclude="dist" --exclude=".git" --exclude="venv" --exclude=".venv" --exclude="*.log" --exclude="backup" --exclude="test-*" .
        
        # Copiar al servidor
        scp -P $script:SshPort $tarFile "$($script:Username)@$($script:ServerIP):$script:RemoteDir/"
        
        # Extraer archivos
        Invoke-RemoteCommand -Command "tar -xzf $script:RemoteDir/$tarFile -C $script:RemoteDir"
        Invoke-RemoteCommand -Command "rm $script:RemoteDir/$tarFile"
        Remove-Item $tarFile -ErrorAction SilentlyContinue
        
        # Verificar/instalar Docker
        Write-Status "Verificando Docker en el servidor..." -Type DOCKER
        $dockerCheck = Invoke-RemoteCommand -Command "command -v docker" -ErrorAction "SilentlyContinue"
        if ([string]::IsNullOrEmpty($dockerCheck)) {
            Write-Status "Instalando Docker..." -Type DOCKER
            Invoke-RemoteCommand -Command "curl -fsSL https://get.docker.com -o get-docker.sh" -Sudo
            Invoke-RemoteCommand -Command "sh get-docker.sh" -Sudo
            Invoke-RemoteCommand -Command "usermod -aG docker $script:Username" -Sudo
        }
        
        # Verificar Docker Compose
        $composeCheck = Invoke-RemoteCommand -Command "command -v docker-compose" -ErrorAction "SilentlyContinue"
        if ([string]::IsNullOrEmpty($composeCheck)) {
            Write-Status "Instalando Docker Compose..." -Type DOCKER
            Invoke-RemoteCommand -Command "curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64' -o /usr/local/bin/docker-compose" -Sudo
            Invoke-RemoteCommand -Command "chmod +x /usr/local/bin/docker-compose" -Sudo
        }
        
        # Limpiar containers existentes
        Write-Status "Limpiando containers existentes..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true" -WorkingDirectory $script:RemoteDir -ErrorAction "SilentlyContinue"
        
        # Construir imágenes
        Write-Status "Construyendo imágenes Docker..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache" -WorkingDirectory $script:RemoteDir
        
        # Iniciar contenedores
        Write-Status "Iniciando contenedores..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d" -WorkingDirectory $script:RemoteDir
        
        # Verificar estado
        Start-Sleep -Seconds 15
        $containerStatus = Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml ps" -WorkingDirectory $script:RemoteDir
        Write-Status "Estado de contenedores:" -Type DOCKER
        Write-Host $containerStatus
        
        # Verificaciones de salud
        Write-Status "Verificando servicios..." -Type INFO
        $frontendCheck = Invoke-RemoteCommand -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost" -ErrorAction "SilentlyContinue"
        if ($frontendCheck -eq "200") {
            Write-Status "Frontend accesible correctamente" -Type SUCCESS
        } else {
            Write-Status "Frontend no responde correctamente" -Type WARNING
        }
        
        $backendCheck = Invoke-RemoteCommand -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/v1/health" -ErrorAction "SilentlyContinue"
        if ($backendCheck -eq "200") {
            Write-Status "Backend API accesible correctamente" -Type SUCCESS
        } else {
            Write-Status "Backend API no responde correctamente" -Type WARNING
        }
        
        Write-Host ""
        Write-Host "=== DESPLIEGUE COMPLETADO ===" -ForegroundColor Green
        Write-Status "Aplicación CogniTrack desplegada exitosamente" -Type SUCCESS
        Write-Status "URL: http://$script:ServerIP" -Type INFO
        Write-Status "Dashboard: http://$script:ServerIP/dashboard" -Type INFO
        Write-Status "API Health: http://$script:ServerIP:8081/api/v1/health" -Type INFO
        Write-Host ""
        
    }
    catch {
        Write-Status "Error en despliegue Docker: $_" -Type ERROR
        throw $_
    }
}

# Flujo principal
try {
    Write-Host ""
    Write-Host "=== INICIANDO PROCESO DE DESPLIEGUE ===" -ForegroundColor Cyan
    Write-Host "Servidor: $ServerIP"
    Write-Host "Puerto SSH: $SshPort"
    Write-Host "Usuario: $Username"
    Write-Host "Directorio remoto: $RemoteDir"
    Write-Host "Dominio: $script:Domain"
    Write-Host ""
    
    # Verificar conectividad SSH
    Write-Status "Verificando conectividad SSH..." -Type INFO
    $sshTest = ssh -p $script:SshPort -o ConnectTimeout=5 "$($script:Username)@$($script:ServerIP)" "echo 'SSH OK'"
    if ($sshTest -eq "SSH OK") {
        Write-Status "Conectividad SSH confirmada" -Type SUCCESS
    } else {
        throw "No se pudo conectar via SSH al servidor"
    }
    
    # Verificar requisitos básicos
    Write-Status "Verificando requisitos en el servidor..." -Type INFO
    $requirements = @("curl", "unzip")
    $missing = @()
    
    foreach ($req in $requirements) {
        $check = Invoke-RemoteCommand -Command "command -v $req" -ErrorAction "SilentlyContinue"
        if ([string]::IsNullOrEmpty($check)) {
            $missing += $req
        }
    }
    
    if ($missing.Count -gt 0) {
        $missingList = $missing -join ', '
        Write-Status "Faltan los siguientes requisitos: $missingList" -Type ERROR
        Write-Status "Por favor instale los paquetes necesarios" -Type WARNING
        exit 1
    }
    
    Write-Status "Todos los requisitos están instalados" -Type SUCCESS
    
    # Ejecutar despliegue
    Deploy-WithDocker
    
    Write-Host "=== DESPLIEGUE FINALIZADO EXITOSAMENTE ===" -ForegroundColor Green
    Write-Host "Puede acceder a la aplicacion en http://$script:ServerIP" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Status "ERROR CRITICO: El despliegue ha fallado" -Type ERROR
    Write-Status "Detalles del error: $_" -Type ERROR
    Write-Status "" -Type ERROR
    Write-Status "Pasos para resolver:" -Type WARNING
    Write-Status "1. Verifique la conectividad SSH con el servidor" -Type WARNING
    Write-Status "2. Asegurese de tener los permisos necesarios" -Type WARNING
    Write-Status "3. Verifique que Docker esté disponible" -Type WARNING
    Write-Host ""
    exit 1
}

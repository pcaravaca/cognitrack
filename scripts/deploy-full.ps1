# Script de despliegue completo para CogniTrack
# Incluye frontend, backend y configuracion de Nginx
# Version: 1.0.2

param(
    [Parameter(Mandatory=$false)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [int]$SshPort = 2222,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "peter",
    
    [Parameter(Mandatory=$false)]
    [string]$RemoteDir = "/var/www/cognitrack",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "cognitrack.local"
)

# Configurar la codificacion de salida
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSDefaultParameterValues['*:Encoding'] = 'utf8'

# Configuracion inicial
$ErrorActionPreference = "Stop"

# Interfaz de usuario
Write-Host ""
Write-Host "=== DESPLIEGUE DE COGNITRACK ===" -ForegroundColor Cyan

# Obtener parametros si no se proporcionaron
if ([string]::IsNullOrEmpty($ServerIP)) {
    # Solicitar direccion IP del servidor
    do {
        $script:ServerIP = Read-Host "  Ingrese la direccion IP del servidor (ej: 10.10.0.210)"
        if ([string]::IsNullOrWhiteSpace($script:ServerIP)) {
            Write-Host "  [!] La direccion IP no puede estar vacia" -ForegroundColor Red
        }
    } while ([string]::IsNullOrWhiteSpace($script:ServerIP))
    
    # Solicitar puerto SSH
    $portInput = Read-Host "  Ingrese el puerto SSH [22]"
    if (-not [string]::IsNullOrWhiteSpace($portInput) -and $portInput -match '^\d+$') {
        $script:SshPort = [int]$portInput
    }
    
    # Solicitar nombre de usuario
    $userInput = Read-Host "  Ingrese el nombre de usuario [$($script:Username)]"
    if (-not [string]::IsNullOrWhiteSpace($userInput)) {
        $script:Username = $userInput.Trim()
    }
    
    # Solicitar directorio remoto
    $dirInput = Read-Host "  Ingrese el directorio remoto [$($script:RemoteDir)]"
    if (-not [string]::IsNullOrWhiteSpace($dirInput)) {
        $script:RemoteDir = $dirInput.TrimEnd('/')
    }
    
    # Solicitar dominio
    $domainInput = Read-Host "  Ingrese el dominio [$($script:Domain)]"
    if (-not [string]::IsNullOrWhiteSpace($domainInput)) {
        $script:Domain = $domainInput.Trim()
    }
    
    # Mostrar resumen
    Write-Host ""
    Write-Host "=== RESUMEN DE CONFIGURACION ===" -ForegroundColor Cyan
    Write-Host "  Servidor: $($script:ServerIP)"
    Write-Host "  Puerto SSH: $($script:SshPort)"
    Write-Host "  Usuario: $($script:Username)"
    Write-Host "  Directorio: $($script:RemoteDir)"
    Write-Host "  Dominio: $($script:Domain)"
    Write-Host ""
    
    # Continuar con el despliegue automáticamente
    Write-Host ""
}

# Mostrar resumen si se usaron parámetros por línea de comandos
if (-not [string]::IsNullOrEmpty($ServerIP)) {
    Write-Host ""
    Write-Host "=== CONFIGURACION DE DESPLIEGUE ===" -ForegroundColor Cyan
    Write-Host "  Servidor: $ServerIP"
    Write-Host "  Puerto SSH: $SshPort"
    Write-Host "  Usuario: $Username"
    Write-Host "  Directorio: $RemoteDir"
    Write-Host "  Dominio: $Domain"
    Write-Host ""
    
    # Continuar con el despliegue automáticamente
}

# Funcion para mostrar mensajes de estado con emojis
function Write-Status {
    param(
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR", "DOCKER", "FRONTEND", "BACKEND")]
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
    }
}

# Funcion para ejecutar comandos remotos
function Invoke-RemoteCommand {
    param(
        [string]$Command,
        [switch]$Sudo = $false,
        [string]$WorkingDirectory = ""
    )
    
    $fullCommand = $Command
    if ($WorkingDirectory -ne "") {
        $fullCommand = "cd '$WorkingDirectory' && $Command"
    }
    if ($Sudo) {
        $fullCommand = "sudo $fullCommand"
    }
    
    Write-Status "Ejecutando: $fullCommand" -Type INFO
    
    try {
        $result = ssh -p $script:SshPort "$($script:Username)@$($script:ServerIP)" "$fullCommand"
        return $result
    }
    catch {
        Write-Status "Error al ejecutar comando: $_" -Type ERROR
        throw $_
    }
}

# Funcion para copiar archivos al servidor con manejo de permisos
function Copy-ToServer {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    Write-Status "Copiando $Source a $($script:Username)@$($script:ServerIP):$Destination" -Type INFO
    
    try {
        # Preparar permisos en destino antes de copiar
        Write-Status "Preparando permisos de destino..." -Type INFO
        Invoke-RemoteCommand -Command "sudo chown -R $($script:Username):$($script:Username) $Destination" -Sudo:$false
        Invoke-RemoteCommand -Command "sudo chmod -R 755 $Destination" -Sudo:$false
        
        # Intentar copia SCP
        scp -P $script:SshPort -r $Source "$($script:Username)@$($script:ServerIP):$Destination" 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Status "SCP falló, intentando con sudo..." -Type WARNING
            
            # Crear directorio temporal y copiar vía sudo
            $tempDir = "/tmp/cognitrack_$(Get-Random)"
            Invoke-RemoteCommand -Command "mkdir -p $tempDir"
            
            scp -P $script:SshPort -r $Source "$($script:Username)@$($script:ServerIP):$tempDir/"
            Invoke-RemoteCommand -Command "sudo cp -r $tempDir/* $Destination/" -Sudo
            Invoke-RemoteCommand -Command "rm -rf $tempDir"
        }
        
        # Arreglar permisos finales
        Invoke-RemoteCommand -Command "chown -R www-data:www-data $Destination" -Sudo
        Invoke-RemoteCommand -Command "chmod -R 755 $Destination" -Sudo
        
        Write-Status "Archivos copiados correctamente" -Type SUCCESS
    }
    catch {
        Write-Status "Error al copiar archivos: $_" -Type ERROR
        Write-Status "Intentando recuperación de permisos..." -Type WARNING
        
        try {
            Invoke-RemoteCommand -Command "chown -R $($script:Username):$($script:Username) $Destination" -Sudo
            Write-Status "Permisos recuperados, reintentando..." -Type INFO
            scp -P $script:SshPort -r $Source "$($script:Username)@$($script:ServerIP):$Destination"
        }
        catch {
            Write-Status "Error crítico en copia de archivos: $_" -Type ERROR
            throw $_
        }
    }
}

# Función para detectar instalaciones previas de CogniTrack
function Test-PreviousInstallation {
    Write-Status "Detectando instalaciones previas de CogniTrack..." -Type INFO
    
    $installationInfo = @{
        HasInstallation = $false
        InstallationType = "None"
        TraditionalPaths = @()
        DockerContainers = @()
        Services = @()
    }
    
    try {
        # Verificar instalación tradicional
        $traditionalChecks = @(
            "$script:RemoteDir/cognitrack-backend",
            "$script:RemoteDir/frontend",
            "/etc/systemd/system/cognitrack.service",
            "/etc/nginx/sites-available/cognitrack"
        )
        
        foreach ($path in $traditionalChecks) {
            $exists = Invoke-RemoteCommand -Command "test -e '$path' && echo 'exists' || echo 'not_exists'" -ErrorAction SilentlyContinue
            if ($exists -eq "exists") {
                $installationInfo.TraditionalPaths += $path
                $installationInfo.HasInstallation = $true
                if ($installationInfo.InstallationType -eq "None") {
                    $installationInfo.InstallationType = "Traditional"
                }
            }
        }
        
        # Verificar servicios systemd
        $serviceCheck = Invoke-RemoteCommand -Command "systemctl list-units --all | grep cognitrack || echo 'no_service'" -ErrorAction SilentlyContinue
        if ($serviceCheck -ne "no_service" -and ![string]::IsNullOrEmpty($serviceCheck)) {
            $installationInfo.Services += "cognitrack.service"
            $installationInfo.HasInstallation = $true
            if ($installationInfo.InstallationType -eq "None") {
                $installationInfo.InstallationType = "Traditional"
            }
        }
        
        # Verificar instalación Docker
        $dockerCheck = Invoke-RemoteCommand -Command "command -v docker" -ErrorAction SilentlyContinue
        if (![string]::IsNullOrEmpty($dockerCheck)) {
            # Verificar contenedores de CogniTrack
            $containers = Invoke-RemoteCommand -Command "docker ps -a --filter name=cognitrack --format '{{.Names}}' 2>/dev/null || echo 'no_containers'" -ErrorAction SilentlyContinue
            if ($containers -ne "no_containers" -and ![string]::IsNullOrEmpty($containers)) {
                $installationInfo.DockerContainers = $containers -split "`n" | Where-Object { $_ -ne "" }
                $installationInfo.HasInstallation = $true
                if ($installationInfo.InstallationType -eq "None") {
                    $installationInfo.InstallationType = "Docker"
                } elseif ($installationInfo.InstallationType -eq "Traditional") {
                    $installationInfo.InstallationType = "Mixed"
                }
            }
            
            # Verificar docker-compose en directorio
            $composeCheck = Invoke-RemoteCommand -Command "test -f '$script:RemoteDir/docker-compose.yml' && echo 'exists' || echo 'not_exists'" -ErrorAction SilentlyContinue
            if ($composeCheck -eq "exists") {
                $installationInfo.HasInstallation = $true
                if ($installationInfo.InstallationType -eq "None") {
                    $installationInfo.InstallationType = "Docker"
                } elseif ($installationInfo.InstallationType -eq "Traditional") {
                    $installationInfo.InstallationType = "Mixed"
                }
            }
        }
        
        return $installationInfo
    }
    catch {
        Write-Status "Error al detectar instalaciones: $_" -Type WARNING
        return $installationInfo
    }
}

# Función para limpiar instalaciones previas
function Remove-PreviousInstallation {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$InstallationInfo,
        [Parameter(Mandatory=$true)]
        [string]$CleanupType
    )
    
    Write-Status "Iniciando limpieza de instalación previa ($CleanupType)..." -Type INFO
    
    try {
        if ($CleanupType -eq "Traditional" -or $CleanupType -eq "All") {
            # Detener y eliminar servicios systemd
            if ($InstallationInfo.Services.Count -gt 0) {
                Write-Status "Deteniendo servicios systemd..." -Type INFO
                Invoke-RemoteCommand -Command "systemctl stop cognitrack" -Sudo -ErrorAction SilentlyContinue
                Invoke-RemoteCommand -Command "systemctl disable cognitrack" -Sudo -ErrorAction SilentlyContinue
                Invoke-RemoteCommand -Command "rm -f /etc/systemd/system/cognitrack.service" -Sudo -ErrorAction SilentlyContinue
                Invoke-RemoteCommand -Command "systemctl daemon-reload" -Sudo -ErrorAction SilentlyContinue
            }
            
            # Eliminar archivos tradicionales
            Write-Status "Eliminando archivos de instalación tradicional..." -Type INFO
            Invoke-RemoteCommand -Command "rm -rf $script:RemoteDir" -Sudo -ErrorAction SilentlyContinue
            Invoke-RemoteCommand -Command "rm -f /etc/nginx/sites-available/cognitrack" -Sudo -ErrorAction SilentlyContinue
            Invoke-RemoteCommand -Command "rm -f /etc/nginx/sites-enabled/cognitrack" -Sudo -ErrorAction SilentlyContinue
        }
        
        if ($CleanupType -eq "Docker" -or $CleanupType -eq "All") {
            # Detener y eliminar contenedores Docker
            if ($InstallationInfo.DockerContainers.Count -gt 0) {
                Write-Status "Deteniendo contenedores Docker..." -Type DOCKER
                Invoke-RemoteCommand -Command "docker-compose down --remove-orphans --volumes 2>/dev/null || true" -WorkingDirectory $script:RemoteDir -ErrorAction SilentlyContinue
                
                foreach ($container in $InstallationInfo.DockerContainers) {
                    Write-Status "Eliminando contenedor: $container" -Type DOCKER
                    Invoke-RemoteCommand -Command "docker rm -f $container 2>/dev/null || true" -ErrorAction SilentlyContinue
                }
                
                # Eliminar imágenes de CogniTrack
                Write-Status "Eliminando imagenes Docker..." -Type DOCKER
                Invoke-RemoteCommand -Command "docker images | grep cognitrack | awk '{print `$3}' | xargs docker rmi -f 2>/dev/null || true" -ErrorAction SilentlyContinue
            }
            
            # Eliminar archivos Docker
            Write-Status " Eliminando archivos de configuración Docker..." -Type DOCKER
            Invoke-RemoteCommand -Command "rm -f $script:RemoteDir/docker-compose.yml" -ErrorAction SilentlyContinue
        }
        
        # Reiniciar Nginx
        Write-Status "Reiniciando Nginx..." -Type INFO
        Invoke-RemoteCommand -Command "systemctl reload nginx" -Sudo -ErrorAction SilentlyContinue
        
        Write-Status "Limpieza completada correctamente" -Type SUCCESS
    }
    catch {
        Write-Status "Error durante la limpieza: $_" -Type ERROR
        throw $_
    }
}

# Función para mostrar información de instalación previa
function Show-InstallationInfo {
    param(
        [Parameter(Mandatory=$true)]
        [hashtable]$InstallationInfo
    )
    
    Write-Host ""
    Write-Host "INSTALACION PREVIA DETECTADA" -ForegroundColor Yellow
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host "Tipo: $($InstallationInfo.InstallationType)" -ForegroundColor Cyan
    
    if ($InstallationInfo.TraditionalPaths.Count -gt 0) {
        Write-Host ""
        Write-Host "Instalacion Tradicional encontrada:" -ForegroundColor Yellow
        foreach ($path in $InstallationInfo.TraditionalPaths) {
            Write-Host "  * $path" -ForegroundColor White
        }
    }
    
    if ($InstallationInfo.Services.Count -gt 0) {
        Write-Host ""
        Write-Host "Servicios activos:" -ForegroundColor Yellow
        foreach ($service in $InstallationInfo.Services) {
            Write-Host "  * $service" -ForegroundColor White
        }
    }
    
    if ($InstallationInfo.DockerContainers.Count -gt 0) {
        Write-Host ""
        Write-Host "Contenedores Docker encontrados:" -ForegroundColor Yellow
        foreach ($container in $InstallationInfo.DockerContainers) {
            Write-Host "  * $container" -ForegroundColor White
        }
    }
    
    Write-Host "=================================" -ForegroundColor Yellow
    Write-Host ""
}

# Función para desplegar con Docker
function Deploy-WithDocker {
    Write-Status "Iniciando despliegue con Docker..." -Type DOCKER
    
    try {
        # Crear directorio remoto
        Write-Status "Creando directorios remotos..." -Type INFO
        Invoke-RemoteCommand -Command "mkdir -p $script:RemoteDir" -Sudo
        Invoke-RemoteCommand -Command "chown -R $script:Username:$script:Username $script:RemoteDir" -Sudo
        
        # PASO CRÍTICO: Detener servicios systemd conflictivos
        Write-Status "Deteniendo servicios systemd conflictivos..." -Type WARNING
        Invoke-RemoteCommand -Command "systemctl stop cognitrack-api.service 2>/dev/null || true" -Sudo -ErrorAction SilentlyContinue
        Invoke-RemoteCommand -Command "systemctl disable cognitrack-api.service 2>/dev/null || true" -Sudo -ErrorAction SilentlyContinue
        Write-Status "Servicios systemd detenidos" -Type SUCCESS
        
        # Copiar archivos del proyecto
        Write-Status "Copiando archivos del proyecto..." -Type INFO
        
        # Crear archivo TAR con los archivos necesarios
        $tarFile = "cognitrack-deploy.tar.gz"
        Write-Status "Creando archivo TAR con archivos del proyecto..." -Type INFO
        
        # Crear archivo .tar.gz excluyendo archivos innecesarios
        tar -czf $tarFile --exclude="node_modules" --exclude="dist" --exclude=".git" --exclude="venv" --exclude=".venv" --exclude="*.log" --exclude="frontend/go/test" --exclude="backup" --exclude="test-*" --exclude="venv_temp" --exclude="*.zip" .
        
        # Copiar archivo TAR al servidor
        Write-Status "Copiando archivo al servidor..." -Type INFO
        scp -P $script:SshPort $tarFile "$($script:Username)@$($script:ServerIP):$script:RemoteDir/"
        
        # Extraer archivo en el servidor
        Write-Status "Extrayendo archivos en el servidor..." -Type INFO
        Invoke-RemoteCommand -Command "tar -xzf $script:RemoteDir/$tarFile -C $script:RemoteDir"
        Invoke-RemoteCommand -Command "rm $script:RemoteDir/$tarFile"
        
        # Limpiar archivo TAR local
        Remove-Item $tarFile -ErrorAction SilentlyContinue
        
        # PASO CRÍTICO: Corregir nginx-custom.conf automáticamente
        Write-Status "Corrigiendo configuración nginx-custom.conf..." -Type INFO
        Invoke-RemoteCommand -Command "sed -i 's|http://api:3000/|http://backend:8081/|g' $script:RemoteDir/frontend/nginx-custom.conf" -WorkingDirectory $script:RemoteDir -ErrorAction SilentlyContinue
        Write-Status "Configuración nginx-custom.conf corregida" -Type SUCCESS
        
        # Instalar Docker y Docker Compose si no están instalados
        Write-Status "Verificando Docker en el servidor..." -Type DOCKER
        $dockerCheck = Invoke-RemoteCommand -Command "command -v docker" -ErrorAction SilentlyContinue
        if ([string]::IsNullOrEmpty($dockerCheck)) {
            Write-Status "Instalando Docker..." -Type DOCKER
            Invoke-RemoteCommand -Command "curl -fsSL https://get.docker.com -o get-docker.sh" -Sudo
            Invoke-RemoteCommand -Command "sh get-docker.sh" -Sudo
            Invoke-RemoteCommand -Command "usermod -aG docker $script:Username" -Sudo
        }
        
        $composeCheck = Invoke-RemoteCommand -Command "command -v docker-compose" -ErrorAction SilentlyContinue
        if ([string]::IsNullOrEmpty($composeCheck)) {
            Write-Status "Instalando Docker Compose..." -Type DOCKER
            Invoke-RemoteCommand -Command "curl -L 'https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64' -o /usr/local/bin/docker-compose" -Sudo
            Invoke-RemoteCommand -Command "chmod +x /usr/local/bin/docker-compose" -Sudo
        }
        
        # PASO CRÍTICO: Limpiar containers e imágenes existentes
        Write-Status "Deteniendo y limpiando containers existentes..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true" -WorkingDirectory $script:RemoteDir -ErrorAction SilentlyContinue
        Invoke-RemoteCommand -Command "docker rm -f cognitrack-frontend cognitrack-backend 2>/dev/null || true" -ErrorAction SilentlyContinue
        Invoke-RemoteCommand -Command "docker rmi cognitrack-frontend cognitrack-backend 2>/dev/null || true" -ErrorAction SilentlyContinue
        Write-Status "Containers e imágenes limpios" -Type SUCCESS
        
        # PASO CRÍTICO: Build sin cache usando configuración de producción
        Write-Status "Construyendo imágenes Docker sin cache..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache" -WorkingDirectory $script:RemoteDir
        Write-Status "Imágenes construidas exitosamente" -Type SUCCESS
        
        # PASO CRÍTICO: Iniciar con configuración de producción
        Write-Status "Iniciando contenedores en modo producción..." -Type DOCKER
        Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d" -WorkingDirectory $script:RemoteDir
        
        # Verificar estado de los contenedores
        Write-Status "Esperando que los contenedores se inicien..." -Type INFO
        Start-Sleep -Seconds 15
        
        $containerStatus = Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml ps" -WorkingDirectory $script:RemoteDir
        Write-Status "Estado de contenedores:" -Type DOCKER
        Write-Host $containerStatus
        
        # Verificar logs del frontend por si hay errores
        Write-Status "Verificando logs del frontend..." -Type INFO
        $frontendLogs = Invoke-RemoteCommand -Command "docker compose -f docker-compose.yml -f docker-compose.prod.yml logs frontend --tail=5" -WorkingDirectory $script:RemoteDir
        Write-Host $frontendLogs
        
        # Verificar conectividad
        Write-Status "Verificando conectividad..." -Type INFO
        Start-Sleep -Seconds 5
        $healthCheck = Invoke-RemoteCommand -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost" -ErrorAction SilentlyContinue
        if ($healthCheck -eq "200") {
            Write-Status "Frontend accesible correctamente (HTTP $healthCheck)" -Type SUCCESS
        } else {
            Write-Status "Advertencia: Frontend no responde correctamente (HTTP $healthCheck)" -Type WARNING
        }
        
        $backendCheck = Invoke-RemoteCommand -Command "curl -s -o /dev/null -w '%{http_code}' http://localhost:8081/api/v1/health" -ErrorAction SilentlyContinue
        if ($backendCheck -eq "200") {
            Write-Status "Backend API accesible correctamente (HTTP $backendCheck)" -Type SUCCESS
        } else {
            Write-Status "Advertencia: Backend API no responde correctamente (HTTP $backendCheck)" -Type WARNING
        }
        
        Write-Status "Despliegue Docker completado correctamente" -Type SUCCESS
    }
    catch {
        Write-Status "Error en despliegue Docker: $_" -Type ERROR
        throw $_
    }
}

# Funcion para desplegar el frontend (método tradicional)
function Publish-Frontend {
    Write-Status "Iniciando despliegue del frontend..." -Type FRONTEND
    
    try {
        # Generar versión de construcción
        $buildVersion = Get-Date -Format "yyyyMMdd_HHmmss"
        Write-Status "Version de construccion: $buildVersion" -Type INFO
        
        # Preparar archivo .env para produccion
        $envContent = @"
VUE_APP_API_URL=/api
VUE_APP_BUILD_VERSION=$buildVersion
VUE_APP_DOMAIN=$script:Domain
"@
        $envPath = Join-Path -Path (Get-Location).Path -ChildPath '.env.production'
        $envContent | Out-File -FilePath $envPath -Encoding ASCII -Force
        
        # Construir el frontend
        Write-Status "Construyendo el frontend..." -Type INFO
        Push-Location frontend
        try {
            npm run build
            if ($LASTEXITCODE -ne 0) {
                throw "Error en la construcción del frontend"
            }
        }
        finally {
            Pop-Location
        }
        
        # Verificar si la carpeta dist existe
        if (-not (Test-Path "frontend\dist")) {
            Write-Status "No se encontró la carpeta dist. Verifique la compilación del frontend." -Type ERROR
            throw "Error al construir el frontend"
        }
        
        # Crear directorio de destino
        Invoke-RemoteCommand -Command "mkdir -p $RemoteDir" -Sudo
        Invoke-RemoteCommand -Command "chown -R $script:Username:$script:Username $RemoteDir" -Sudo
        
        # Copiar archivos del frontend
        Copy-ToServer -Source "frontend/dist/*" -Destination "$RemoteDir/"
        
        # Ajustar permisos después de copiar
        Invoke-RemoteCommand -Command "chown -R www-data:www-data $RemoteDir" -Sudo
        Invoke-RemoteCommand -Command "chmod -R 755 $RemoteDir" -Sudo
        
        Write-Status "Frontend desplegado correctamente" -Type SUCCESS
        
    } catch {
        Write-Status "Error al desplegar el frontend: $_" -Type ERROR
        throw $_
    }
}

# Funcion para desplegar el backend Go (método tradicional)
function Publish-Backend {
    Write-Status "Iniciando despliegue del backend Go..." -Type BACKEND
    
    try {
        # Compilar el backend Go localmente
        Write-Status "Compilando backend Go..." -Type INFO
        Push-Location .\go-backend
        try {
            # Compilar para Linux desde Windows
            $env:GOOS = "linux"
            $env:GOARCH = "amd64"
            go build -o cognitrack-backend .
            if ($LASTEXITCODE -ne 0) {
                throw "Error al compilar el backend Go"
            }
            Write-Status "Backend Go compilado correctamente" -Type SUCCESS
        }
        finally {
            # Restaurar variables de entorno
            Remove-Item Env:GOOS -ErrorAction SilentlyContinue
            Remove-Item Env:GOARCH -ErrorAction SilentlyContinue
            Pop-Location
        }
        
        # Preparar directorio remoto para backend
        Invoke-RemoteCommand -Command "mkdir -p $script:RemoteDir/backend" -Sudo
        Invoke-RemoteCommand -Command "chown -R $script:Username:$script:Username $script:RemoteDir/backend" -Sudo
        
        # Copiar binario compilado al servidor
        Copy-ToServer -Source "./go-backend/cognitrack-backend" -Destination "$script:RemoteDir/backend/cognitrack-backend"
        
        # Hacer el binario ejecutable
        Invoke-RemoteCommand -Command "chmod +x $script:RemoteDir/backend/cognitrack-backend" -Sudo
        
        # Copiar archivo de configuración si existe
        if (Test-Path ".env") {
            Copy-ToServer -Source ".env" -Destination "$script:RemoteDir/backend/.env"
        }
        
        # Configurar servicio systemd para Go
        $serviceConfig = @"
[Unit]
Description=CogniTrack Backend Service (Go)
After=network.target

[Service]
User=$script:Username
WorkingDirectory=$script:RemoteDir/backend
ExecStart=$script:RemoteDir/backend/cognitrack-backend
Restart=always
RestartSec=10
Environment="PATH=/usr/bin:/usr/local/bin"

[Install]
WantedBy=multi-user.target
"@
        
        $tempFile = [System.IO.Path]::GetTempFileName()
        $serviceConfig | Out-File -FilePath $tempFile -Encoding ASCII
        
        # Copiar archivo de servicio al servidor
        Copy-ToServer -Source $tempFile -Destination '/tmp/cognitrack.service'
        Invoke-RemoteCommand -Command 'mv /tmp/cognitrack.service /etc/systemd/system/cognitrack.service' -Sudo
        
        # Recargar configuración de systemd y activar servicio
        Invoke-RemoteCommand -Command 'systemctl daemon-reload' -Sudo
        Invoke-RemoteCommand -Command 'systemctl enable cognitrack.service' -Sudo
        Invoke-RemoteCommand -Command 'systemctl restart cognitrack.service' -Sudo
        
        Write-Status "Backend desplegado correctamente" -Type SUCCESS
    }
    catch {
        Write-Status "Error al desplegar backend: $_" -Type ERROR
        throw $_
    }
    finally {
        # Limpiar archivos temporales
        if ($tempFile -and (Test-Path $tempFile)) {
            Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
        }
    }
}

# Función para configurar Nginx
function Set-NginxConfig {
    Write-Status "Configurando Nginx con configuración básica..." -Type INFO
    
    try {
        # Crear configuración básica de Nginx para CogniTrack
        $nginxConfig = @"
server {
    listen 80;
    server_name $script:Domain;
    root $script:RemoteDir;
    index index.html;

    # Servir archivos estáticos del frontend
    location / {
        try_files `$uri `$uri/ /index.html;
    }

    # Proxy para la API del backend Go
    location /api/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }

    # Proxy para WebSocket endpoints
    location /ws/ {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
}
"@
        
        # Crear archivo temporal con la configuración
        $tempFile = [System.IO.Path]::GetTempFileName() + '.conf'
        $nginxConfig | Out-File -FilePath $tempFile -Encoding ASCII
        
        # Copiar configuración al servidor y configurar
        Copy-ToServer -Source $tempFile -Destination '/tmp/cognitrack-nginx.conf'
        
        Invoke-RemoteCommand -Command 'mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled' -Sudo
        Invoke-RemoteCommand -Command 'mv /tmp/cognitrack-nginx.conf /etc/nginx/sites-available/cognitrack' -Sudo
        Invoke-RemoteCommand -Command 'chmod 644 /etc/nginx/sites-available/cognitrack' -Sudo
        
        # Habilitar sitio
        Invoke-RemoteCommand -Command 'rm -f /etc/nginx/sites-enabled/cognitrack' -Sudo
        Invoke-RemoteCommand -Command 'ln -s /etc/nginx/sites-available/cognitrack /etc/nginx/sites-enabled/cognitrack' -Sudo
        
        # Probar configuración y reiniciar Nginx
        $nginxTest = Invoke-RemoteCommand -Command 'nginx -t 2>&1' -Sudo
        if ($nginxTest -match "test is successful") {
            Write-Status "Configuración de Nginx válida" -Type SUCCESS
            Invoke-RemoteCommand -Command 'systemctl restart nginx' -Sudo
            Write-Status "Configuración de Nginx completada" -Type SUCCESS
        } else {
            Write-Status "Error en la configuración de Nginx: $nginxTest" -Type ERROR
            throw "Configuración de Nginx inválida"
        }
        
        # Limpiar archivo temporal
        Remove-Item -Path $tempFile -Force -ErrorAction SilentlyContinue
    }
    catch {
        Write-Status "Error al configurar Nginx: $_" -Type ERROR
        throw $_
    }
}

# Función para probar la conexión al servidor
function Test-ServerConnection {
    param (
        [string]$ServerIP,
        [int]$Port = 22
    )
    
    Write-Status "Probando conexion a ${ServerIP} en puerto ${Port}..." -Type INFO
    
    # Verificar si el puerto es valido
    if ($Port -lt 1 -or $Port -gt 65535) {
        Write-Status "Numero de puerto invalido: $Port" -Type ERROR
        return $false
    }
    
    # Verificar si la direccion IP es valida
    $ipAddress = $null
    if (-not [System.Net.IPAddress]::TryParse($ServerIP, [ref]$ipAddress)) {
        Write-Status "Direccion IP invalida: $ServerIP" -Type ERROR
        return $false
    }
    
    # Intentar la conexion con timeout
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $connectTask = $tcpClient.ConnectAsync($ServerIP, $Port)
    
    # Esperar la conexion con un timeout de 5 segundos
    $timeout = [System.Threading.CancellationTokenSource]::new(5000)
    
    try {
        $completedTask = [System.Threading.Tasks.Task]::WhenAny($connectTask, [System.Threading.Tasks.Task]::Delay(-1, $timeout.Token)).GetAwaiter().GetResult()
        
        if ($completedTask -eq $connectTask -and $connectTask.Status -eq [System.Threading.Tasks.TaskStatus]::RanToCompletion) {
            Write-Status "Conexion exitosa a ${ServerIP}:${Port}" -Type SUCCESS
            return $true
        } else {
            Write-Status "Timeout de conexion a ${ServerIP}:${Port}" -Type ERROR
            return $false
        }
    }
    catch {
        Write-Status "Error de conexion: $_" -Type ERROR
        return $false
    }
    finally {
        $tcpClient.Close()
        $timeout.Dispose()
    }
    
    return $false
}

# Flujo principal de despliegue
try {
    Write-Host ""
    Write-Host "=== INICIANDO PROCESO DE DESPLIEGUE ===" -ForegroundColor Cyan
    
    # Probar conexión al servidor
    Write-Status "Verificando conexion con el servidor..." -Type INFO
    if (-not (Test-ServerConnection -ServerIP $script:ServerIP -Port $script:SshPort)) {
        Write-Status "No se pudo establecer conexion con el servidor." -Type ERROR
        Write-Status "Por favor verifique lo siguiente:" -Type WARNING
        Write-Status "1. Que la direccion IP $($script:ServerIP) sea correcta" -Type WARNING
        Write-Status "2. Que el puerto $($script:SshPort) este abierto y sea accesible" -Type WARNING
        Write-Status "3. Que el firewall no este bloqueando la conexion" -Type WARNING
        exit 1
    }
    
    # Verificar requisitos en el servidor
    Write-Status "Verificando requisitos en el servidor..." -Type INFO
    try {
        $requirements = @("unzip")
        $missing = @()
        
        foreach ($req in $requirements) {
            $result = Invoke-RemoteCommand -Command "command -v $req" -ErrorAction SilentlyContinue
            if ([string]::IsNullOrEmpty($result)) {
                $missing += $req
            }
        }
        
        # Verificación específica para nginx
        $nginxCheck = Invoke-RemoteCommand -Command 'command -v nginx' -ErrorAction SilentlyContinue
        # Usar el resultado de nginxCheck para la verificación
        Write-Status "Verificando nginx: $nginxCheck" -Type INFO
        $nginxStatus = Invoke-RemoteCommand -Command "echo $?" -ErrorAction SilentlyContinue
        if ($nginxStatus -ne "True") {
            $missing += "nginx"
        }
        
        if ($missing.Count -gt 0) {
            Write-Status "Faltan los siguientes requisitos en el servidor: $($missing -join ', ')" -Type ERROR
            Write-Status "Por favor instale los paquetes necesarios y vuelva a intentarlo." -Type WARNING
            exit 1
        }
        
        Write-Status "Todos los requisitos estan instalados en el servidor" -Type SUCCESS
    }
    catch {
        Write-Status "Error al verificar los requisitos: $_" -Type ERROR
        exit 1
    }
    
    # Detectar instalaciones previas
    $installationInfo = Test-PreviousInstallation
    
    if ($installationInfo.HasInstallation) {
        Show-InstallationInfo -InstallationInfo $installationInfo
        
        Write-Host "¿Qué desea hacer con la instalación existente?" -ForegroundColor Cyan
        Write-Host "1. Actualizar manteniendo el mismo tipo ($($installationInfo.InstallationType))"
        Write-Host "2. Cambiar tipo de instalación (limpiar y reinstalar)"
        Write-Host "3. Solo limpiar instalación actual (sin reinstalar)"
        Write-Host "4. Cancelar despliegue"
        Write-Host ""
        
        do {
            $updateOption = Read-Host "Seleccione una opción [1]"
            if ([string]::IsNullOrWhiteSpace($updateOption)) {
                $updateOption = "1"
            }
        } while ($updateOption -notin @("1", "2", "3", "4"))
        
        switch ($updateOption) {
            "1" {
                Write-Status "Actualizando instalación existente..." -Type INFO
                # No limpiar, solo actualizar
                $deployMethod = switch ($installationInfo.InstallationType) {
                    "Docker" { "1" }
                    "Traditional" { "2" }
                    "Mixed" {
                        Write-Status "Instalación mixta detectada. Se usará Docker por defecto." -Type WARNING
                        "1"
                    }
                    default { "1" }
                }
            }
            "2" {
                Write-Status "Cambiando tipo de instalación..." -Type INFO
                
                # Preguntar nuevo tipo
                Write-Host ""
                Write-Host "Seleccione el NUEVO tipo de instalación:" -ForegroundColor Cyan
                Write-Host "1. Docker"
                Write-Host "2. Tradicional"
                Write-Host ""
                
                do {
                    $newType = Read-Host "Nuevo tipo de instalación [1]"
                    if ([string]::IsNullOrWhiteSpace($newType)) {
                        $newType = "1"
                    }
                } while ($newType -notin @("1", "2"))
                
                $deployMethod = $newType
                
                # Determinar qué limpiar
                $cleanupType = if ($newType -eq "1") {
                    # Cambiar a Docker - limpiar tradicional
                    if ($installationInfo.InstallationType -eq "Traditional" -or $installationInfo.InstallationType -eq "Mixed") {
                        "Traditional"
                    } else {
                        "None"
                    }
                } else {
                    # Cambiar a Tradicional - limpiar Docker
                    if ($installationInfo.InstallationType -eq "Docker" -or $installationInfo.InstallationType -eq "Mixed") {
                        "Docker"
                    } else {
                        "None"
                    }
                }
                
                if ($cleanupType -ne "None") {
                    Remove-PreviousInstallation -InstallationInfo $installationInfo -CleanupType $cleanupType
                }
            }
            "3" {
                Write-Status "Iniciando limpieza completa..." -Type INFO
                Remove-PreviousInstallation -InstallationInfo $installationInfo -CleanupType "All"
                Write-Status "Servidor limpiado. Saliendo del script." -Type SUCCESS
                exit 0
            }
            "4" {
                Write-Status "Despliegue cancelado por el usuario." -Type WARNING
                exit 0
            }
        }
    } else {
        # No hay instalación previa, preguntar método de despliegue
        Write-Status "No se detectaron instalaciones previas." -Type SUCCESS
        
        Write-Host ""
        Write-Host "Seleccione el método de despliegue:" -ForegroundColor Cyan
        Write-Host "1. Docker (Recomendado)"
        Write-Host "2. Tradicional (Frontend + Backend + Nginx)"
        Write-Host ""
        
        do {
            $deployMethod = Read-Host "Ingrese su opción [1]"
            if ([string]::IsNullOrWhiteSpace($deployMethod)) {
                $deployMethod = "1"
            }
        } while ($deployMethod -notin @("1", "2"))
    }
    
    if ($deployMethod -eq "1") {
        # Despliegue con Docker
        try {
            Deploy-WithDocker
        }
        catch {
            Write-Status "Error en despliegue Docker: $_" -Type ERROR
            exit 1
        }
    } else {
        # Despliegue tradicional
        try {
            Write-Status "Iniciando despliegue del frontend..." -Type FRONTEND
            Publish-Frontend
        }
        catch {
            Write-Status "Error al desplegar el frontend: $_" -Type ERROR
            exit 1
        }
        
        try {
            Write-Status "Iniciando despliegue del backend..." -Type BACKEND
            Publish-Backend
        }
        catch {
            Write-Status "Error al desplegar el backend: $_" -Type ERROR
            exit 1
        }
        
        try {
            Write-Status "Configurando Nginx..." -Type INFO
            Set-NginxConfig
        }
        catch {
            Write-Status "Error al configurar Nginx: $_" -Type ERROR
            exit 1
        }
    }
    
    # Éxito
    Write-Host ""
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host "¡DESPLIEGUE COMPLETADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "=================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "La aplicacion CogniTrack ahora esta disponible en: http://$($script:Domain)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resumen de la configuracion:" -ForegroundColor Cyan
    Write-Host "- Servidor: $($script:ServerIP)"
    Write-Host "- Directorio: $($script:RemoteDir)"
    Write-Host "- Usuario: $($script:Username)"
    Write-Host "- Puerto SSH: $($script:SshPort)"
    Write-Host ""
    Write-Host "Puede acceder a la aplicacion abriendo http://$($script:Domain) en su navegador" -ForegroundColor Cyan
    Write-Host ""
}
catch {
    Write-Status "ERROR CRITICO: El despliegue ha fallado" -Type ERROR
    Write-Status "Detalles del error: $_" -Type ERROR
    Write-Status "" -Type ERROR
    Write-Status "Sugerencias para solucionar el problema:" -Type WARNING
    Write-Status "1. Verifique los mensajes de error anteriores" -Type WARNING
    Write-Status "2. Asegurese de tener los permisos necesarios en el servidor" -Type WARNING
    Write-Status "3. Verifique que todos los servicios requeridos esten instalados" -Type WARNING
    Write-Status "4. Si el problema persiste, contacte al soporte tecnico." -Type WARNING
    Write-Host ""
    exit 1
}
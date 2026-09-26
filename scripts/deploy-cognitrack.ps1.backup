# Script de despliegue simplificado para CogniTrack
# Compatible con PowerShell 5.1
# Uso: .\deploy-cognitrack.ps1 -ServerIP "10.10.1.210" -SshPort 2222 -Username "peter" -RemoteDir "/home/peter/cognitrack"

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [int]$SshPort,
    [string]$Username,
    [string]$RemoteDir,
    [string]$Domain = "cognitrack.local"
)

# Configuración de colores para la salida
$ErrorActionPreference = 'Stop'
$host.UI.RawUI.ForegroundColor = 'White'

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    $color = switch ($Type) {
        "INFO" { "White" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "DOCKER" { "Cyan" }
        default { "White" }
    }
    
    Write-Host "[$($timestamp)] [$($Type)] $($Message)" -ForegroundColor $color
}

function Invoke-RemoteCommand {
    param(
        [string]$Command,
        [switch]$Sudo = $false
    )
    
    try {
        $sshTarget = "${Username}@${ServerIP}"
        $sshArgs = "-p ${SshPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"
        
        $fullCommand = if ($Sudo) { 
            "sudo bash -c `"$($Command -replace '"','\"')`""
        } else { 
            $Command 
        }
        
        Write-Status "Ejecutando: $fullCommand" -Type "INFO"
        $sshCommand = "ssh ${sshArgs} ${sshTarget} `"${fullCommand}`" 2>&1"
        $output = Invoke-Expression $sshCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw ("Error en comando remoto (código {0}): {1}" -f $LASTEXITCODE, $output)
        }
        
        return $output
    }
    catch {
        Write-Status "Error: $($_.Exception.Message)" -Type "ERROR"
        throw $_
    }
}

function Copy-ToServer {
    param(
        [string]$Source,
        [string]$Destination
    )
    
    try {
        Write-Status "Copiando ${Source} a ${ServerIP}:${Destination}" -Type "INFO"
        $scpArgs = "-P ${SshPort} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r"
        $scpCommand = "scp ${scpArgs} `"${Source}" ${Username}@${ServerIP}:`"${Destination}`" 2>&1"
        $output = Invoke-Expression $scpCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw "Error al copiar: $output"
        }
        
        Write-Status "Copia completada: ${Source} -> ${ServerIP}:${Destination}" -Type "SUCCESS"
    }
    catch {
        Write-Status "Error al copiar archivos: $($_.Exception.Message)" -Type "ERROR"
        throw $_
    }
}

# Función principal
try {
    # Mostrar información del despliegue
    Write-Host "`n=== INICIANDO DESPLIEGUE COGNITRACK ===" -ForegroundColor Cyan
    Write-Host "Servidor: ${ServerIP}:${SshPort}" -ForegroundColor Cyan
    Write-Host "Usuario: ${Username}" -ForegroundColor Cyan
    Write-Host "Directorio remoto: ${RemoteDir}" -ForegroundColor Cyan
    Write-Host "Dominio: ${Domain}" -ForegroundColor Cyan
    Write-Host "`n"
    
    # 1. Probar conexión SSH
    Write-Status "Probando conexión SSH..." -Type "INFO"
    $serverInfo = Invoke-RemoteCommand -Command "uname -a"
    Write-Status "Conexión exitosa: $serverInfo" -Type "SUCCESS"
    
    # 2. Crear directorio remoto
    Write-Status "Creando directorio remoto..." -Type "INFO"
    Invoke-RemoteCommand -Command "mkdir -p ${RemoteDir}"
    
    # 3. Copiar archivos locales al servidor
    Write-Status "Copiando archivos al servidor..." -Type "INFO"
    $localPath = Join-Path -Path $PSScriptRoot -ChildPath ".." -Resolve
    Copy-ToServer -Source "${localPath}\*" -Destination "${RemoteDir}"
    
    # 4. Instalar Docker y dependencias (si es necesario)
    Write-Status "Verificando Docker..." -Type "DOCKER"
    $dockerCheck = Invoke-RemoteCommand -Command "which docker || echo 'docker-no-instalado'"
    
    if ($dockerCheck -match "docker-no-instalado") {
        Write-Status "Instalando Docker..." -Type "DOCKER"
        Invoke-RemoteCommand -Command "curl -fsSL https://get.docker.com | sh" -Sudo
        Invoke-RemoteCommand -Command "usermod -aG docker $Username" -Sudo
    } else {
        Write-Status "Docker ya está instalado" -Type "DOCKER"
    }
    
    # 5. Iniciar contenedores con docker-compose
    Write-Status "Iniciando contenedores Docker..." -Type "DOCKER"
    Invoke-RemoteCommand -Command "cd ${RemoteDir} && docker compose down"
    Invoke-RemoteCommand -Command "cd ${RemoteDir} && docker compose up -d --build"
    
    # 6. Verificar que los contenedores estén en ejecución
    $containers = Invoke-RemoteCommand -Command "docker ps --format '{{.Names}} ({{.Status}})'"
    Write-Status "Contenedores en ejecución:`n$containers" -Type "DOCKER"
    
    # 7. Mostrar resumen
    Write-Host "`n=== DESPLIEGUE COMPLETADO CON ÉXITO ===" -ForegroundColor Green
    Write-Host "URL: http://${Domain}" -ForegroundColor Green
    Write-Host "`n"
    
    # 8. Mostrar logs de los contenedores
    Write-Status "Mostrando logs de los contenedores (últimas 10 líneas):" -Type "INFO"
    $logs = Invoke-RemoteCommand -Command "cd ${RemoteDir} && docker compose logs --tail=10"
    Write-Host $logs -ForegroundColor Gray
}
catch {
    Write-Status "ERROR DURANTE EL DESPLIEGUE: $($_.Exception.Message)" -Type "ERROR"
    exit 1
}
finally {
    Write-Status "Proceso de despliegue finalizado" -Type "INFO"
}

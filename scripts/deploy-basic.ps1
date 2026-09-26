# Script de despliegue básico para CogniTrack
# Versión: 1.0.0

param (
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$false)]
    [int]$SshPort = 22,
    
    [Parameter(Mandatory=$false)]
    [string]$Username = "peter",
    
    [Parameter(Mandatory=$false)]
    [string]$RemoteDir = "/var/www/cognitrack",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "cognitrack.local"
)

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timeStamp = Get-Date -Format "HH:mm:ss"
    $color = "Cyan"
    
    switch ($Type) {
        "SUCCESS" { $color = "Green" }
        "WARNING" { $color = "Yellow" }
        "ERROR"   { $color = "Red" }
        "DEBUG"   { $color = "Gray" }
    }
    
    Write-Host "[$timeStamp] [$Type] $Message" -ForegroundColor $color
}

function Invoke-SshCommand {
    param(
        [string]$Command,
        [bool]$Sudo = $false
    )
    
    $sshTarget = "${Username}@${ServerIP}"
    $sshArgs = "-p $SshPort -o StrictHostKeyChecking=no -o ConnectTimeout=30"
    
    if ($Sudo) {
        $Command = "echo 'S@pr1ssa' | sudo -S $Command"
    }
    
    $fullCommand = "ssh $sshArgs $sshTarget \"$Command\" 2>&1"
    Write-Status "Ejecutando: $fullCommand" -Type "DEBUG"
    
    $output = Invoke-Expression $fullCommand
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Status "Error (código $exitCode) al ejecutar: $Command" -Type "ERROR"
        Write-Status "Salida: $output" -Type "ERROR"
        throw "Error en comando remoto"
    }
    
    return $output
}

try {
    Write-Host "`n=== INICIANDO DESPLIEGUE BÁSICO ===" -ForegroundColor Cyan
    Write-Host "Servidor: ${ServerIP}:${SshPort}" -ForegroundColor Cyan
    Write-Host "Usuario: $Username" -ForegroundColor Cyan
    Write-Host "Directorio: $RemoteDir" -ForegroundColor Cyan
    Write-Host "Dominio: $Domain" -ForegroundColor Cyan
    
    # Verificar conexión
    Write-Status "Probando conexión SSH..."
    $testOutput = Invoke-SshCommand "echo 'Conexión exitosa'"
    Write-Status "Conexión exitosa: $testOutput" -Type "SUCCESS"
    
    # Verificar directorio remoto
    Write-Status "Verificando directorio remoto..."
    $dirCheck = Invoke-SshCommand "if [ -d '$RemoteDir' ]; then echo 'exists'; else echo 'not_found'; fi"
    
    if ($dirCheck -eq 'exists') {
        Write-Status "El directorio $RemoteDir ya existe" -Type "INFO"
    } else {
        Write-Status "Creando directorio $RemoteDir..." -Type "INFO"
        Invoke-SshCommand "mkdir -p $RemoteDir" $true
        Invoke-SshCommand "chown $Username:$Username $RemoteDir" $true
    }
    
    # Verificar Docker
    Write-Status "Verificando Docker..."
    $dockerCheck = Invoke-SshCommand "if command -v docker &> /dev/null; then echo 'installed'; else echo 'not_installed'; fi"
    
    if ($dockerCheck -eq 'installed') {
        $dockerVersion = Invoke-SshCommand "docker --version"
        Write-Status "Docker instalado: $dockerVersion" -Type "SUCCESS"
    } else {
        Write-Status "Docker no está instalado. Se requiere Docker para continuar." -Type "ERROR"
        exit 1
    }
    
    Write-Host "`n=== DESPLIEGUE COMPLETADO CON ÉXITO ===" -ForegroundColor Green
}
catch {
    Write-Status "Error durante el despliegue: $_" -Type "ERROR"
    exit 1
}

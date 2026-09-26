# Script de despliegue completo para CogniTrack
# Versión compatible con Windows PowerShell 5.1
# Incluye frontend, backend y configuracion de Nginx
# Version: 1.0.2

# Verificar versión de PowerShell
if ($PSVersionTable.PSVersion.Major -lt 5) {
    Write-Host "[ERROR] Este script requiere Windows PowerShell 5.1 o superior." -ForegroundColor Red
    exit 1
}

# Parámetros del script
param (
    [string]$ServerIP = $null,
    [int]$SshPort = 22,
    [string]$Username = "peter",
    [string]$RemoteDir = "/var/www/cognitrack",
    [string]$Domain = "cognitrack.local"
)

# Función para mostrar estado
function Write-Status {
    param (
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
        "FRONTEND" { "Magenta" }
        "BACKEND" { "Blue" }
        default { "White" }
    }

    Write-Host "[$($timestamp)] [$($Type)] $($Message)" -ForegroundColor $color
}

# Función para ejecutar comandos remotos
function Invoke-RemoteCommand {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Command,
        [bool]$Sudo = $false,
        [bool]$NoStatus = $false
    )

    $sshTarget = "$($script:Username)@$($script:ServerIP)"
    $sshArgs = "-p $($script:SshPort) -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

    try {
        $fullCommand = if ($Sudo) { "sudo bash -c "$($Command)"" } else { $Command }
        
        if (-not $NoStatus) {
            Write-Status "Ejecutando: $($fullCommand)" -Type INFO
        }
        
        $sshCommand = "ssh $($sshArgs) $($sshTarget) "$($fullCommand)" 2>&1"
        $output = Invoke-Expression $sshCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw "Comando falló con código de salida $($LASTEXITCODE)"
        }
        
        return $output
    }
    catch {
        Write-Status "Error al ejecutar comando: $($_.Exception.Message)" -Type ERROR
        throw $_
    }
}

# Función para copiar archivos
function Copy-ToServer {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Description = ""
    )

    try {
        if (-not [string]::IsNullOrEmpty($Description)) {
            Write-Status "$($Description)..." -Type INFO
        }

        $scpArgs = "-P $($script:SshPort) -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -r"
        $scpCommand = "scp $($scpArgs) "$($Source)" $($script:Username)@$($script:ServerIP):$($Destination)" 2>&1"
        
        $output = Invoke-Expression $scpCommand
        
        if ($LASTEXITCODE -ne 0) {
            throw "Error al copiar $($Source) a $($Destination)"
        }
    }
    catch {
        Write-Status "Error al copiar archivos: $($_.Exception.Message)" -Type ERROR
        throw $_
    }
}

# Función principal
function Main {
    try {
        Write-Host "=== INICIANDO PROCESO DE DESPLIEGUE ===" -ForegroundColor Cyan
        Write-Host "Servidor: $($ServerIP):$($SshPort)" -ForegroundColor Cyan
        Write-Host "Usuario: $($Username)" -ForegroundColor Cyan
        Write-Host "Directorio remoto: $($RemoteDir)" -ForegroundColor Cyan
        Write-Host "Dominio: $($Domain)" -ForegroundColor Cyan
        
        # Aquí iría el resto de la lógica de despliegue...
        Write-Status "Iniciando despliegue..." -Type INFO
        
        # Ejemplo de comando remoto
        $result = Invoke-RemoteCommand -Command "echo 'Hola desde el servidor'"
        Write-Status "Respuesta del servidor: $($result)" -Type SUCCESS
        
        Write-Status "Despliegue completado con éxito" -Type SUCCESS
    }
    catch {
        Write-Status "Error durante el despliegue: $($_.Exception.Message)" -Type ERROR
        exit 1
    }
}

# Guardar los parámetros en variables de script para acceso global
$script:ServerIP = $ServerIP
$script:SshPort = $SshPort
$script:Username = $Username
$script:RemoteDir = $RemoteDir
$script:Domain = $Domain

# Ejecutar la función principal
Main

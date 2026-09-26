# Script de prueba de conexión
# Versión: 1.0.0

param (
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [int]$SshPort = 22,
    [string]$Username = "peter"
)

Write-Host "=== PRUEBA DE CONEXIÓN ===" -ForegroundColor Cyan
Write-Host "Servidor: ${ServerIP}:${SshPort}" -ForegroundColor Cyan
Write-Host "Usuario: $Username" -ForegroundColor Cyan
Write-Host ""

# Función para probar conexión SSH
function Test-SshConnection {
    param(
        [string]$Server,
        [int]$Port,
        [string]$User
    )
    
    $startTime = Get-Date
    Write-Host "Probando conexión SSH a ${User}@${Server}:${Port}..." -NoNewline
    
    try {
        $sshCmd = "ssh -p $Port -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${User}@${Server} 'echo \"Conexión exitosa\"'"
        $result = Invoke-Expression $sshCmd 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $elapsed = (Get-Date) - $startTime
            Write-Host " [COMPLETADO en $($elapsed.TotalSeconds.ToString('0.00'))s]" -ForegroundColor Green
            return $true
        } else {
            Write-Host " [FALLIDO]" -ForegroundColor Red
            Write-Host "  Error: $result" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host " [ERROR]" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Ejecutar prueba de conexión
$connectionOK = Test-SshConnection -Server $ServerIP -Port $SshPort -User $Username

if ($connectionOK) {
    Write-Host "`nLa conexión SSH se estableció correctamente." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nNo se pudo establecer la conexión SSH." -ForegroundColor Red
    Write-Host "Por favor verifica:"
    Write-Host "1. Que el servidor esté encendido y accesible"
    Write-Host "2. Que el puerto $SshPort esté abierto"
    Write-Host "3. Que el usuario '$Username' exista en el servidor"
    Write-Host "4. Que tengas permisos para conectarte"
    exit 1
}

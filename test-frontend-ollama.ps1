# Script para probar la conectividad del frontend a servidores Ollama
# Test de Conectividad CogniTrack Multi-Servidor

param(
    [string]$BaseUrl = "http://localhost:8080",
    [string[]]$Servers = @("10.10.1.210:11434")
)

function Write-Status {
    param(
        [string]$Message,
        [string]$Type = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    switch ($Type.ToUpper()) {
        "SUCCESS" { Write-Host "[$timestamp] OK $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "[$timestamp] ERROR $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "[$timestamp] WARN $Message" -ForegroundColor Yellow }
        default { Write-Host "[$timestamp] INFO $Message" -ForegroundColor Cyan }
    }
}

function Test-OllamaEndpoint {
    param(
        [string]$Url,
        [string]$Description
    )
    
    Write-Status "Probando $Description - $Url" -Type INFO
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ContentType "application/json" -TimeoutSec 10
        
        if ($response) {
            Write-Status "$Description - ✅ ÉXITO" -Type SUCCESS
            
            if ($response.models) {
                Write-Status "  Modelos disponibles: $($response.models.Count)" -Type INFO
                $response.models | Select-Object -First 3 | ForEach-Object {
                    $sizeGB = [math]::Round($_.size / 1GB, 1)
                    Write-Status "    - $($_.name) (${sizeGB}GB)" -Type INFO
                }
            }
            return $true
        }
    }
    catch {
        Write-Status "$Description - ❌ ERROR: $($_.Exception.Message)" -Type ERROR
        
        if ($_.Exception.Message -like "*502*") {
            Write-Status "    Sugerencia: Verificar que el servidor Ollama esté ejecutándose" -Type WARNING
        }
        elseif ($_.Exception.Message -like "*404*") {
            Write-Status "    Sugerencia: Verificar configuración de rutas en Nginx" -Type WARNING
        }
        elseif ($_.Exception.Message -like "*timeout*") {
            Write-Status "    Sugerencia: Verificar conectividad de red" -Type WARNING
        }
        
        return $false
    }
}

Write-Host ""
Write-Host "=== TEST DE CONECTIVIDAD COGNITRACK OLLAMA ===" -ForegroundColor Cyan
Write-Host "URL Base: $BaseUrl" -ForegroundColor White
Write-Host ""

# Configuración de pruebas
$tests = @(
    @{ Url = "$BaseUrl/api/ollama/api/tags"; Description = "Servidor Principal (Ruta por defecto)" },
    @{ Url = "$BaseUrl/api/server1/api/tags"; Description = "Servidor 1 (Ruta específica)" },
    @{ Url = "$BaseUrl/api/server2/api/tags"; Description = "Servidor 2 (Ruta específica)" },
    @{ Url = "$BaseUrl/api/server1/health"; Description = "Health Check Servidor 1" },
    @{ Url = "$BaseUrl/api/server2/health"; Description = "Health Check Servidor 2" }
)

$results = @()

foreach ($test in $tests) {
    $success = Test-OllamaEndpoint -Url $test.Url -Description $test.Description
    $results += @{
        Description = $test.Description
        Url = $test.Url
        Success = $success
    }
    Start-Sleep -Milliseconds 500  # Pequeña pausa entre pruebas
}

# Resumen
Write-Host ""
Write-Host "=== RESUMEN DE RESULTADOS ===" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Success }).Count
$totalCount = $results.Count
$successRate = [math]::Round(($successCount / $totalCount) * 100, 1)

Write-Host "┌─────────────────────────────────────────┬──────────┐" -ForegroundColor White
Write-Host "│ Endpoint                                │ Estado   │" -ForegroundColor White
Write-Host "├─────────────────────────────────────────┼──────────┤" -ForegroundColor White

foreach ($result in $results) {
    $description = $result.Description.PadRight(39).Substring(0, 39)
    $status = if ($result.Success) { "   ✅   " } else { "   ❌   " }
    Write-Host "│ $description │ $status │" -ForegroundColor White
}

Write-Host "└─────────────────────────────────────────┴──────────┘" -ForegroundColor White

Write-Host ""
Write-Status "Tasa de éxito: $successCount/$totalCount ($successRate%)" -Type INFO

if ($successCount -eq $totalCount) {
    Write-Status "🎉 Todos los endpoints están funcionando correctamente" -Type SUCCESS
} elseif ($successCount -gt 0) {
    Write-Status "⚠️ Algunos endpoints presentan problemas" -Type WARNING
} else {
    Write-Status "🚨 No se pudo conectar a ningún endpoint" -Type ERROR
}

# Recomendaciones
Write-Host ""
Write-Host "=== RECOMENDACIONES ===" -ForegroundColor Cyan

$failedTests = $results | Where-Object { -not $_.Success }

if ($failedTests.Count -gt 0) {
    Write-Status "Para los endpoints que fallan:" -Type INFO
    Write-Status "1. Verificar que Nginx esté ejecutándose y configurado correctamente" -Type WARNING
    Write-Status "2. Comprobar que los servidores Ollama estén activos en las IPs configuradas" -Type WARNING
    Write-Status "3. Revisar logs de Nginx: sudo journalctl -u nginx -f" -Type WARNING
    Write-Status "4. Verificar configuración de firewall y conectividad de red" -Type WARNING
    Write-Status "5. Probar conectividad directa: curl http://10.10.1.210:11434/api/tags" -Type WARNING
}

Write-Host ""
Write-Host "Test completado." -ForegroundColor Green

# Test script para verificar las rutas del backend

Write-Host "=== Probando Backend CogniTrack ===" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`nProbando Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/health" -Method GET
    Write-Host "✓ Health Check OK" -ForegroundColor Green
    $health | ConvertTo-Json
} catch {
    Write-Host "✗ Health Check falló: $_" -ForegroundColor Red
}

# Test 2: Ollama Tags sin servidor
Write-Host "`nProbando Ollama Tags (local)..." -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/ollama/tags" -Method GET
    Write-Host "✓ Ollama Tags OK" -ForegroundColor Green
    $tags | ConvertTo-Json
} catch {
    Write-Host "✗ Ollama Tags falló: $_" -ForegroundColor Red
}

# Test 3: Ollama Tags con servidor específico
Write-Host "`nProbando Ollama Tags con servidor..." -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/ollama/tags?server=192.168.0.104:11434" -Method GET
    Write-Host "✓ Ollama Tags con servidor OK" -ForegroundColor Green
    $tags | ConvertTo-Json
} catch {
    Write-Host "✗ Ollama Tags con servidor falló: $_" -ForegroundColor Red
}

# Test 4: System Metrics
Write-Host "`nProbando System Metrics..." -ForegroundColor Yellow
try {
    $metrics = Invoke-RestMethod -Uri "http://localhost:8081/api/v1/metrics/system" -Method GET
    Write-Host "✓ System Metrics OK" -ForegroundColor Green
    $metrics | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ System Metrics falló: $_" -ForegroundColor Red
}

Write-Host "`n=== Pruebas completadas ===" -ForegroundColor Green

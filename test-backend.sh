#!/bin/bash

echo "🧪 Probando backend API..."

echo "📊 1. Probando health check..."
if curl -s -f "http://localhost:8081/api/health" > /dev/null 2>&1; then
    echo "✅ Health check: OK"
    curl -s "http://localhost:8081/api/health" | grep -o '"status":"[^"]*"' | cut -d'"' -f4
else
    echo "❌ Health check: FAILED"
fi

echo -e "\n🔍 2. Probando rutas principales..."
if curl -s -f "http://localhost:8081/api/proxy/discover" > /dev/null 2>&1; then
    echo "✅ Discovery: OK"
else
    echo "❌ Discovery: FAILED"
fi

echo -e "\n🔗 3. Probando API de Ollama..."
if curl -s -f "http://localhost:8081/api/v1/ollama/tags?server=10.10.1.131:11434" > /dev/null 2>&1; then
    echo "✅ Ollama API: OK"
else
    echo "❌ Ollama API: FAILED"
fi

echo -e "\n✅ Pruebas completadas"

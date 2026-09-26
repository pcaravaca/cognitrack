#!/bin/bash

echo "🧪 Probando API del backend..."

# Probar health check
echo "📊 Probando health check..."
curl -s "http://localhost:8081/api/health" | head -20

echo -e "\n🔍 Probando rutas disponibles..."
curl -s "http://localhost:8081/" | head -20

echo -e "\n🔗 Probando rutas de API de Ollama..."
curl -s "http://localhost:8081/api/v1/ollama/tags?server=10.10.1.131:11434" | head -5

echo -e "\n🚀 Probando descubrimiento de servidores..."
curl -s "http://localhost:8081/api/proxy/discover" | head -20

echo -e "\n✅ Pruebas completadas"

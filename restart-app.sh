#!/bin/bash

echo "🧹 Limpiando localStorage y reiniciando la aplicación..."

echo "1. Deteniendo servicios..."
pkill -f "go run main.go" 2>/dev/null || echo "   Backend no estaba corriendo"
pkill -f "npm run dev" 2>/dev/null || echo "   Frontend no estaba corriendo"

echo "2. Limpiando datos del navegador..."
echo "   Abre la consola del navegador (F12) y ejecuta:"
echo "   localStorage.clear();"
echo "   sessionStorage.clear();"
echo "   location.reload();"

echo "3. Reiniciando backend..."
cd backend && go run main.go &
BACKEND_PID=$!
echo "   Backend iniciado con PID: $BACKEND_PID"

echo "4. Reiniciando frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "   Frontend iniciado con PID: $FRONTEND_PID"

echo ""
echo "✅ Aplicación reiniciada!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔧 Backend: http://localhost:8081"
echo ""
echo "📝 Pasos para completar:"
echo "   1. Abre http://localhost:5173 en tu navegador"
echo "   2. Abre la consola del navegador (F12)"
echo "   3. Ejecuta: localStorage.clear(); location.reload();"
echo "   4. El dashboard debería cargar sin errores"
echo ""
echo "🛠️  Si ves errores 404, verifica que el backend esté respondiendo:"
echo "   curl http://localhost:8081/api/health"

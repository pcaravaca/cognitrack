#!/bin/bash

echo "🧹 LIMPANDO Y REINICIANDO COGNITRACK COMPLETAMENTE"

echo ""
echo "1. Deteniendo servicios..."
pkill -f "go run main.go" 2>/dev/null || echo "   Backend no estaba corriendo"
pkill -f "npm run dev" 2>/dev/null || echo "   Frontend no estaba corriendo"

echo ""
echo "2. Limpiando datos del navegador..."
echo "   ⚠️  Copia esto y ejecútalo en la consola del navegador (F12):"
echo "   localStorage.clear();"
echo "   sessionStorage.clear();"
echo "   location.reload();"

echo ""
echo "3. Limpiando archivos temporales..."
rm -f frontend/dist.zip 2>/dev/null || echo "   No había archivos temporales"

echo ""
echo "4. Reiniciando backend..."
cd backend && go run main.go &
BACKEND_PID=$!
echo "   ✅ Backend iniciado con PID: $BACKEND_PID"

echo ""
echo "5. Reiniciando frontend..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!
echo "   ✅ Frontend iniciado con PID: $FRONTEND_PID"

echo ""
echo "🎉 ¡COGNITRACK REINICIADO COMPLETAMENTE!"
echo ""
echo "🌐 URLs de la aplicación:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8081"
echo ""
echo "📋 Pasos para usar:"
echo "   1. Abre http://localhost:5173 en tu navegador"
echo "   2. Ve al Dashboard"
echo "   3. Deberías ver el dashboard completo con datos simulados"
echo "   4. Si ves loading → espera a que termine"
echo "   5. Si ves pantalla blanca → ejecuta localStorage.clear() en consola"
echo ""
echo "💡 Características del nuevo Dashboard:"
echo "   ✅ Loading informativo con progreso visual"
echo "   ✅ Manejo robusto de servidores offline"
echo "   ✅ Gráficos con datos simulados"
echo "   ✅ No se cuelga si los servidores no están disponibles"
echo "   ✅ Estados informativos claros para el usuario"
echo ""
echo "🚀 ¡Disfruta de tu Dashboard mejorado! ✨"

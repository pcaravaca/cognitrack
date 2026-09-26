#!/bin/sh
set -e

# Configuración para deshabilitar la apertura del navegador
export BROWSER=none

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  pnpm install --frozen-lockfile || pnpm install
fi

# Iniciar Vite directamente con las opciones necesarias
echo "Iniciando Vite..."
exec node node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 --open false --strictPort

#!/bin/sh
set -e

# Configuración para deshabilitar la apertura del navegador
export BROWSER=none
export VITE_OPEN_BROWSER=false

# Instalar dependencias si es necesario
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  pnpm install --frozen-lockfile || pnpm install
fi

# Iniciar Vite directamente con node y todas las opciones necesarias
echo "Iniciando Vite directamente con node..."
exec node --no-warnings=ExperimentalWarning node_modules/vite/bin/vite.js --host 0.0.0.0 --port 5173 --strictPort --open false

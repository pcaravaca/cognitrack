#!/bin/sh
set -e

# Asegurarse de que las dependencias estén instaladas
echo "Instalando dependencias..."
pnpm install --frozen-lockfile --reporter=append-only || pnpm install

# Deshabilitar la apertura automática del navegador
export BROWSER=none

# Construir la aplicación si es necesario
# echo "Construyendo la aplicación..."
# pnpm run build

# Iniciar la aplicación en modo desarrollo
# Usamos exec para reemplazar el proceso actual con el comando de Vite
echo "Iniciando la aplicación..."
exec pnpm run dev:no-open

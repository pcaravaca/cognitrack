# Etapa de construcción
FROM node:18-alpine AS builder

# Establecer el directorio de trabajo
WORKDIR /app

# Instalar pnpm globalmente
RUN npm install -g pnpm@8

# Copiar solo los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml* ./

# Instalar dependencias
RUN echo "[BUILD] 📦 Instalando dependencias..." && \
    pnpm install --no-frozen-lockfile --reporter=default && \
    echo "[BUILD] ✅ Dependencias instaladas correctamente"

# Copiar el resto de los archivos
COPY . .

# Construir la aplicación
RUN pnpm run build

# Etapa de producción
FROM nginx:alpine

# Copiar la configuración personalizada de Nginx
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos construidos desde la etapa de construcción
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto 80
EXPOSE 80

# Iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]

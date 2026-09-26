# Etapa de construcción - Optimizada para caché
FROM golang:1.21-alpine AS builder

# Instalar dependencias del sistema y zona horaria
RUN apk add --no-cache git ca-certificates wget tzdata

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar solo archivos de dependencias primero (mejor caching)
COPY go.mod go.sum ./

# Descargar dependencias (esta capa se reutiliza si no cambian las dependencias)
RUN echo "[BUILD] 📦 Descargando dependencias Go..." && \
    go mod download && \
    echo "[BUILD] ✅ Dependencias descargadas"

# Copiar el código fuente
COPY . .

# Instalar file para verificar el binario
RUN apk add --no-cache file

# Construir el binario con optimizaciones para Linux
RUN echo "[BUILD] 🔨 Compilando backend Go..." && \
    unset GOOS && \
    unset GOARCH && \
    export GO111MODULE=on && \
    export CGO_ENABLED=0 && \
    export GOOS=linux && \
    export GOARCH=amd64 && \
    echo "GOOS: $GOOS, GOARCH: $GOARCH" && \
    go env && \
    go build -a -v \
    -ldflags='-w -s -extldflags "-static"' \
    -o cognitrack-backend . && \
    echo "[BUILD] ✅ Backend compilado exitosamente" && \
    file cognitrack-backend

# Etapa de producción - Usando scratch para la imagen más pequeña posible
FROM scratch

# Configurar zona horaria
ENV TZ=America/Costa_Rica
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copiar certificados SSL
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt

# Copiar el binario estático
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Directorio de trabajo
WORKDIR /app

# Copiar el binario desde el builder
COPY --from=builder /app/cognitrack-backend /cognitrack-backend

# Usar el usuario no-root
USER 1000:1000

# Puerto expuesto
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/v1/health || exit 1

# Comando de inicio
CMD ["/cognitrack-backend"]

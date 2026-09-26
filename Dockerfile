# =============================================================================
# CogniTrack Backend Dockerfile - Optimizado
# =============================================================================

# Etapa de construcción
FROM golang:1.21-alpine AS builder

# Metadata del builder
LABEL stage=builder \
      maintainer="CogniTrack Team" \
      description="CogniTrack Backend Builder"

# Configurar el directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema necesarias para la construcción
RUN apk add --no-cache gcc musl-dev git

# Copiar archivos de dependencias primero para aprovechar el cache de Docker
COPY backend/go.mod backend/go.sum ./

# Descargar las dependencias (esto se cachea si go.mod y go.sum no cambian)
RUN go mod download && go mod verify

# Copiar el código fuente del backend
COPY backend/ ./

# Construir la aplicación con optimizaciones
RUN CGO_ENABLED=1 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s -X main.version=$(date -u +%Y%m%d.%H%M%S)" \
    -a -installsuffix cgo \
    -o /go/bin/cognitrack-backend

# =============================================================================

# Etapa de producción - Imagen mínima
FROM alpine:latest

# Metadata de la imagen final
LABEL maintainer="CogniTrack Team" \
      description="CogniTrack Backend API Server" \
      version="2.0.0" \
      repository="https://github.com/petercaravaca/cognitrack"

# Configurar el directorio de trabajo
WORKDIR /app

# Instalar dependencias necesarias en producción
RUN apk --no-cache add \
    ca-certificates \
    freetds \
    unixodbc \
    tzdata \
    && rm -rf /var/cache/apk/*

# Crear usuario no-root para seguridad
RUN addgroup -g 1000 cognitrack && \
    adduser -D -s /bin/sh -u 1000 -G cognitrack cognitrack

# Copiar el binario compilado desde la etapa builder
COPY --from=builder /go/bin/cognitrack-backend /app/cognitrack-backend

# Crear archivo .env vacío
RUN touch /app/.env

# Cambiar propietario de archivos para seguridad
RUN chown -R cognitrack:cognitrack /app

# Cambiar al usuario no-root
USER cognitrack

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/health || exit 1

# Puerto expuesto
EXPOSE 8081

# Comando para ejecutar la aplicación
CMD ["/app/cognitrack-backend"]
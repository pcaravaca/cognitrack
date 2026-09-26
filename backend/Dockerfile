# Dockerfile ultra simple para backend
FROM golang:1.21-alpine

# Instalar herramientas necesarias
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

# Copiar todo de una vez (más simple)
COPY . .

# Construir
RUN go mod tidy && \
    go build -o backend .

EXPOSE 8081

CMD ["./backend"]

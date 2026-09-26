# CogniTrack Frontend - Guía de Desarrollo

Esta guía proporciona instrucciones para configurar y ejecutar el frontend de CogniTrack en un entorno de desarrollo local, ya sea directamente en WSL/Debian o usando Docker.

## Requisitos previos

- Node.js 18 o superior
- pnpm 8 o superior
- Docker y Docker Compose (opcional, para desarrollo con contenedores)

## Configuración del entorno de desarrollo

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/cognitrack.git
cd cognitrack/frontend
```

### 2. Instalar dependencias

```bash
pnpm install
```

## Ejecución en WSL/Debian

### Variables de entorno

Crea un archivo `.env` en el directorio `frontend` con las siguientes variables:

```env
VITE_API_URL=http://localhost:11434
VITE_PORT=5173
```

### Iniciar el servidor de desarrollo

```bash
pnpm run dev
```

La aplicación estará disponible en: http://localhost:5173

## Ejecución con Docker

### Usando Docker Compose (recomendado para desarrollo)

1. Asegúrate de que el archivo `docker-compose.override.yml` esté configurado correctamente.
2. Ejecuta el siguiente comando desde la raíz del proyecto:

```bash
docker-compose up frontend
```

La aplicación estará disponible en: http://localhost:5173

### Construir la imagen de desarrollo

```bash
docker build -f Dockerfile.dev -t cognitrack-frontend-dev .
```

### Ejecutar el contenedor de desarrollo

```bash
docker run -it --rm \
  -v ${PWD}:/app \
  -v /app/node_modules \
  -p 5173:5173 \
  -e VITE_API_URL=http://host.docker.internal:11434 \
  --name cognitrack-frontend-dev \
  cognitrack-frontend-dev
```

## Estructura del proyecto

```
frontend/
├── src/
│   ├── assets/         # Recursos estáticos
│   ├── components/     # Componentes de Vue
│   ├── composables/    # Composable functions
│   ├── router/         # Configuración del enrutador
│   ├── stores/         # Stores de Pinia
│   ├── styles/         # Estilos globales
│   └── views/          # Vistas de la aplicación
├── public/             # Archivos públicos
├── tests/              # Pruebas
├── .env                # Variables de entorno
├── .eslintrc.js        # Configuración de ESLint
├── .prettierrc         # Configuración de Prettier
├── index.html          # Punto de entrada HTML
├── package.json        # Dependencias y scripts
├── pnpm-lock.yaml      # Bloqueo de versiones
├── tsconfig.json       # Configuración de TypeScript
└── vite.config.ts      # Configuración de Vite
```

## Comandos útiles

- `pnpm dev` - Inicia el servidor de desarrollo
- `pnpm build` - Construye la aplicación para producción
- `pnpm preview` - Previsualiza la aplicación construida
- `pnpm lint` - Ejecuta el linter
- `pnpm test` - Ejecuta las pruebas

## Solución de problemas

### Problemas de CORS

Si encuentras problemas de CORS al realizar peticiones a la API de Ollama, asegúrate de que:

1. La URL de la API esté correctamente configurada en `.env`
2. El servidor de Ollama esté configurado para aceptar peticiones desde tu dominio
3. Las cabeceras CORS estén correctamente configuradas en `vite.config.ts`

### Problemas con Docker

- Si usas WSL2, asegúrate de que Docker Desktop esté configurado para usar WSL2
- Si tienes problemas de permisos, intenta ejecutar Docker con permisos de administrador
- Si la aplicación no se actualiza automáticamente, verifica que los volúmenes estén montados correctamente

## Contribución

1. Crea un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Realiza tus cambios y haz commit (`git commit -am 'Añade nueva característica'`)
4. Haz push a la rama (`git push origin feature/nueva-caracteristica`)
5. Crea un Pull Request

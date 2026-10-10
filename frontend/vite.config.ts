import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath } from 'node:url';
import vuetify from 'vite-plugin-vuetify';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  // Forzar la URL base a '/' para asegurar que la aplicación se cargue correctamente
  const base = '/';
  
  // Asegurarse de que process.env.BASE_URL esté definido
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = base;
  }
  
  // URL del servidor Ollama
  const ollamaServerUrl = env.VITE_OLLAMA_SERVER_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:11434');

  // URL del backend para proxy - forzar localhost:8082 para desarrollo
  const backendUrl = 'http://localhost:8082';
  
  // Configuración para manejar rutas de la API
    // El frontend usa baseURL: '/api/v1' y llama a '/api/v1/auth/login'
    // El proxy debe reescribir '/api/v1/...' -> '/api/v1/...' (pasar directamente al backend)
    const proxyConfig = {
      target: backendUrl,
      changeOrigin: true,
      secure: false,
      ws: true,
      // No reescribir, pasar las rutas directamente al backend
      rewrite: (path: string) => path,
      configure: (proxy: any, _options: any) => {
        proxy.on('error', (err: Error) => console.error('Error en el proxy:', err));
        proxy.on('proxyReq', (proxyReq: any, req: any) => {
          console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.path}`);
        });
      }
    };

  
  
  return {
    base,
    css: {
      postcss: {
        plugins: [
          tailwindcss,
          autoprefixer,
        ],
      },
    },
    plugins: [
      vue(),
      vuetify({
        autoImport: true,
        styles: 'sass',
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      open: false,
      hmr: {
        overlay: false
      },
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': proxyConfig
      }
    },
    preview: {
      port: 5173,
      open: false,
      proxy: {
        '/api': proxyConfig
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'esbuild',
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vuetify': ['vuetify'],
            'vue': ['vue', 'vue-router', 'pinia']
          }
        }
      }
    },
    optimizeDeps: {
      include: []
    }
  };
});

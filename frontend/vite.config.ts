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

  // URL del backend para proxy
  const backendUrl = env.VITE_BACKEND_URL ||
    (process.env.NODE_ENV === 'production' ? `http://10.10.1.185:8081` : 'http://localhost:8081');
  
  // Configuración para manejar rutas de la API
  const proxyConfig = {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    ws: true,
    // No reescribir la ruta, enviar /api/v1/... al backend como está
    rewrite: (path: string) => path,
    configure: (proxy: any, _options: any) => {
      proxy.on('error', (err: Error) => console.error('Error en el proxy:', err));
      proxy.on('proxyReq', (proxyReq: any, req: any) => {
        console.log(`[PROXY] ${req.method} ${req.url} -> ${proxyReq.path}`);
      });
    }
  };

  // Configuración para manejar rutas de la API v1
  const v1ProxyConfig = {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    rewrite: (path: string) => `/api${path}`,
    configure: (proxy: any, _options: any) => {
      proxy.on('error', (err: Error) => console.error('Error en el proxy (v1):', err));
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
        '/api': proxyConfig,
        '/v1': v1ProxyConfig
      }
    },
    preview: {
      port: 5173,
      open: false,
      proxy: {
        '/api': proxyConfig,
        '/v1': v1ProxyConfig
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
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

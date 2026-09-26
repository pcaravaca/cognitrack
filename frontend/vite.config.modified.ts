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
  
  // Determinar la URL base según el entorno
  const base = '/';
  
  // Usar la URL del servidor Ollama de las variables de entorno
  // con valores por defecto inteligentes que se adaptan al entorno
  const ollamaServerUrl = env.VITE_OLLAMA_SERVER_URL || 
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:11434');
  
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
        '/api': {
          target: ollamaServerUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          configure: (proxy) => {
            proxy.on('error', (err, req, res) => {
              console.error('Error de proxy:', err);
              if (!res.headersSent) {
                res.writeHead(500, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({
                  error: 'Error de conexión con el servidor',
                  message: err.message
                }));
              }
            });
          }
        }
      }
    },
    preview: {
      port: 5173,
      open: false,
      proxy: {
        '/api': {
          target: ollamaServerUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
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
    }
  };
});

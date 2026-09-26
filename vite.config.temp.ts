import { defineConfig, loadEnv, type ConfigEnv } from 'vite';
import type { UserConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import vuetify from 'vite-plugin-vuetify';

// Función para parchear el módulo 'open' de forma síncrona
function patchOpenModule() {
  try {
    const openModule = require('open');
    const originalOpen = { ...openModule };
    
    openModule.default = async () => {
      console.log('Apertura del navegador deshabilitada intencionalmente');
      return { unref: () => {} };
    };
    
    // @ts-ignore
    Object.assign(openModule, {
      ...originalOpen,
      default: openModule.default
    });
  } catch (error) {
    console.error('No se pudo parchear el módulo open:', error);
  }
}

// Ejecutar el parche al cargar el módulo
patchOpenModule();

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determinar la URL base según el entorno
  const base = env.NODE_ENV === 'production' ? '/' : '/';
  
  // Forzar desactivación de la apertura del navegador a nivel de configuración
  process.env.BROWSER = 'none';
  process.env.VITE_OPEN_BROWSER = 'false';
  process.env.NO_OPEN = 'true';

  const config = {
    base,
    server: {
      open: false,
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      hmr: {
        overlay: false
      },
      watch: {
        usePolling: true
      }
    },
    preview: {
      port: 5173,
      open: false,
      strictPort: true
    },
    plugins: [
      vue(),
      vuetify({ autoImport: true }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:map";
            @use "sass:math";
            @import "@/assets/styles/settings";
          `,
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: env.NODE_ENV !== 'production',
      minify: env.NODE_ENV === 'production' ? 'terser' as const : false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia', 'vuetify'],
            'vendors-chart': ['chart.js'],
            'vuetify': ['vuetify'],
            'mdi': ['@mdi/font/css/materialdesignicons.css']
          }
        }
      },
      terserOptions: env.NODE_ENV === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
      } : undefined,
    },
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'vuetify'],
      exclude: ['@mdi/font']
    }
  };

  // Configuración solo para desarrollo
  if (env.NODE_ENV !== 'production') {
    return {
      ...config,
      server: {
        port: 5173,
        strictPort: true,
        open: true,
        host: '0.0.0.0',
        allowedHosts: ['cognitrack.local', 'localhost', '127.0.0.1', '192.168.0.105'],
        cors: {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
          exposedHeaders: ['Content-Range', 'X-Total-Count']
        },
        proxy: {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            configure: (proxy: any) => {
              proxy.on('error', (err: Error) => {
                console.error('Proxy error:', err);
              });
              proxy.on('proxyReq', (proxyReq: any, req: any) => {
                console.log('Sending Request to the Target:', req.method, req.url);
              });
              proxy.on('proxyRes', (proxyRes: any, req: any) => {
                console.log('Received Response from the Target:', req.method, req.url, '->', proxyRes.statusCode);
              });
            },
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api/, '')
          },
          '/api/ws': {
            target: 'ws://localhost:8080',
            changeOrigin: true,
            secure: false,
            ws: true,
            configure: (proxy: any) => {
              proxy.on('error', (err: Error) => {
                console.error('WebSocket proxy error:', err);
              });
              proxy.on('upgrade', (req: any) => {
                console.log('WebSocket upgrade:', req.url);
              });
            },
            rewrite: (path: string) => path.replace(/^\/api\/ws/, '')
          }
        }
      },
      preview: {
        port: 5173,
        strictPort: true,
        cors: {
          origin: true,
          credentials: true,
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
          allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
          exposedHeaders: ['Content-Range', 'X-Total-Count']
        },
        proxy: {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
            secure: false,
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api/, '')
          },
          '/api/ws': {
            target: 'ws://localhost:8080',
            changeOrigin: true,
            secure: false,
            ws: true,
            rewrite: (path: string) => path.replace(/^\/api\/ws/, '')
          }
        }
      }
    };
  }
  
  return config;
});

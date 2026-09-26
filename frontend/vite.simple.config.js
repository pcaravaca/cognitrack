import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';
import vuetify from 'vite-plugin-vuetify';

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
  ],
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  
  server: {
    port: 5173,
    host: '0.0.0.0',
    strictPort: true,
    open: false,
    cors: true,
  },
  
  preview: {
    port: 5174,
    strictPort: true,
    host: '0.0.0.0',
    open: false,
    cors: true
  }
});

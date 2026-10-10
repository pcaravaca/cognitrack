// vite.config.ts
import { defineConfig, loadEnv } from "file:///mnt/d/Main%20Repo/cognitrack/frontend/node_modules/vite/dist/node/index.js";
import vue from "file:///mnt/d/Main%20Repo/cognitrack/frontend/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath } from "node:url";
import vuetify from "file:///mnt/d/Main%20Repo/cognitrack/frontend/node_modules/vite-plugin-vuetify/dist/index.js";
import tailwindcss from "file:///mnt/d/Main%20Repo/cognitrack/frontend/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///mnt/d/Main%20Repo/cognitrack/frontend/node_modules/autoprefixer/lib/autoprefixer.js";
var __vite_injected_original_import_meta_url = "file:///mnt/d/Main%20Repo/cognitrack/frontend/vite.config.ts";
var vite_config_default = defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const base = "/";
  if (!process.env.BASE_URL) {
    process.env.BASE_URL = base;
  }
  const ollamaServerUrl = env.VITE_OLLAMA_SERVER_URL || (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:11434");
  const backendUrl = "http://localhost:8082";
  const proxyConfig = {
    target: backendUrl,
    changeOrigin: true,
    secure: false,
    ws: true,
    // Reescribir /api/v1/... -> /v1/...
    rewrite: (path) => path.replace(/^\/api/, ""),
    configure: (proxy, _options) => {
      proxy.on("error", (err) => console.error("Error en el proxy:", err));
      proxy.on("proxyReq", (proxyReq, req) => {
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
          autoprefixer
        ]
      }
    },
    plugins: [
      vue(),
      vuetify({
        autoImport: true,
        styles: "sass"
      })
    ],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
      }
    },
    server: {
      host: "0.0.0.0",
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
        "/api": proxyConfig
      }
    },
    preview: {
      port: 5173,
      open: false,
      proxy: {
        "/api": proxyConfig
      }
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      minify: "esbuild",
      chunkSizeWarningLimit: 1e3,
      rollupOptions: {
        output: {
          manualChunks: {
            "vuetify": ["vuetify"],
            "vue": ["vue", "vue-router", "pinia"]
          }
        }
      }
    },
    optimizeDeps: {
      include: []
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2QvTWFpbiBSZXBvL2NvZ25pdHJhY2svZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvZC9NYWluIFJlcG8vY29nbml0cmFjay9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2QvTWFpbiUyMFJlcG8vY29nbml0cmFjay9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcbmltcG9ydCB2dWV0aWZ5IGZyb20gJ3ZpdGUtcGx1Z2luLXZ1ZXRpZnknO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJztcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJztcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+IHtcbiAgLy8gQ2FyZ2FyIHZhcmlhYmxlcyBkZSBlbnRvcm5vXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xuICBcbiAgLy8gRm9yemFyIGxhIFVSTCBiYXNlIGEgJy8nIHBhcmEgYXNlZ3VyYXIgcXVlIGxhIGFwbGljYWNpXHUwMEYzbiBzZSBjYXJndWUgY29ycmVjdGFtZW50ZVxuICBjb25zdCBiYXNlID0gJy8nO1xuICBcbiAgLy8gQXNlZ3VyYXJzZSBkZSBxdWUgcHJvY2Vzcy5lbnYuQkFTRV9VUkwgZXN0XHUwMEU5IGRlZmluaWRvXG4gIGlmICghcHJvY2Vzcy5lbnYuQkFTRV9VUkwpIHtcbiAgICBwcm9jZXNzLmVudi5CQVNFX1VSTCA9IGJhc2U7XG4gIH1cbiAgXG4gIC8vIFVSTCBkZWwgc2Vydmlkb3IgT2xsYW1hXG4gIGNvbnN0IG9sbGFtYVNlcnZlclVybCA9IGVudi5WSVRFX09MTEFNQV9TRVJWRVJfVVJMIHx8XG4gICAgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicgPyAnL2FwaScgOiAnaHR0cDovL2xvY2FsaG9zdDoxMTQzNCcpO1xuXG4gIC8vIFVSTCBkZWwgYmFja2VuZCBwYXJhIHByb3h5IC0gZm9yemFyIGxvY2FsaG9zdDo4MDgyIHBhcmEgZGVzYXJyb2xsb1xuICBjb25zdCBiYWNrZW5kVXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6ODA4Mic7XG4gIFxuICAvLyBDb25maWd1cmFjaVx1MDBGM24gcGFyYSBtYW5lamFyIHJ1dGFzIGRlIGxhIEFQSVxuICAvLyBFbCBmcm9udGVuZCB1c2EgYmFzZVVSTDogJy9hcGkvdjEnIHkgbGxhbWEgYSAnL2FwaS92MS9hdXRoL2xvZ2luJ1xuICAvLyBFbCBwcm94eSBkZWJlIHJlZXNjcmliaXIgJy9hcGkvdjEvLi4uJyAtPiAnL3YxLy4uLicgcGFyYSBlbCBiYWNrZW5kXG4gIGNvbnN0IHByb3h5Q29uZmlnID0ge1xuICAgIHRhcmdldDogYmFja2VuZFVybCxcbiAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgc2VjdXJlOiBmYWxzZSxcbiAgICB3czogdHJ1ZSxcbiAgICAvLyBSZWVzY3JpYmlyIC9hcGkvdjEvLi4uIC0+IC92MS8uLi5cbiAgICByZXdyaXRlOiAocGF0aDogc3RyaW5nKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hcGkvLCAnJyksXG4gICAgY29uZmlndXJlOiAocHJveHk6IGFueSwgX29wdGlvbnM6IGFueSkgPT4ge1xuICAgICAgcHJveHkub24oJ2Vycm9yJywgKGVycjogRXJyb3IpID0+IGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGVuIGVsIHByb3h5OicsIGVycikpO1xuICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxOiBhbnksIHJlcTogYW55KSA9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbUFJPWFldICR7cmVxLm1ldGhvZH0gJHtyZXEudXJsfSAtPiAke3Byb3h5UmVxLnBhdGh9YCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgXG4gIFxuICByZXR1cm4ge1xuICAgIGJhc2UsXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB0YWlsd2luZGNzcyxcbiAgICAgICAgICBhdXRvcHJlZml4ZXIsXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgcGx1Z2luczogW1xuICAgICAgdnVlKCksXG4gICAgICB2dWV0aWZ5KHtcbiAgICAgICAgYXV0b0ltcG9ydDogdHJ1ZSxcbiAgICAgICAgc3R5bGVzOiAnc2FzcycsXG4gICAgICB9KSxcbiAgICBdLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGFsaWFzOiB7XG4gICAgICAgICdAJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYycsIGltcG9ydC5tZXRhLnVybCkpXG4gICAgICB9XG4gICAgfSxcbiAgICBzZXJ2ZXI6IHtcbiAgICAgIGhvc3Q6ICcwLjAuMC4wJyxcbiAgICAgIHBvcnQ6IDUxNzMsXG4gICAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgICAgb3BlbjogZmFsc2UsXG4gICAgICBobXI6IHtcbiAgICAgICAgb3ZlcmxheTogZmFsc2VcbiAgICAgIH0sXG4gICAgICB3YXRjaDoge1xuICAgICAgICB1c2VQb2xsaW5nOiB0cnVlXG4gICAgICB9LFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiBwcm94eUNvbmZpZ1xuICAgICAgfVxuICAgIH0sXG4gICAgcHJldmlldzoge1xuICAgICAgcG9ydDogNTE3MyxcbiAgICAgIG9wZW46IGZhbHNlLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgJy9hcGknOiBwcm94eUNvbmZpZ1xuICAgICAgfVxuICAgIH0sXG4gICAgYnVpbGQ6IHtcbiAgICAgIG91dERpcjogJ2Rpc3QnLFxuICAgICAgYXNzZXRzRGlyOiAnYXNzZXRzJyxcbiAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICAgIG1pbmlmeTogJ2VzYnVpbGQnLFxuICAgICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxuICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICBtYW51YWxDaHVua3M6IHtcbiAgICAgICAgICAgICd2dWV0aWZ5JzogWyd2dWV0aWZ5J10sXG4gICAgICAgICAgICAndnVlJzogWyd2dWUnLCAndnVlLXJvdXRlcicsICdwaW5pYSddXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBvcHRpbWl6ZURlcHM6IHtcbiAgICAgIGluY2x1ZGU6IFtdXG4gICAgfVxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQWdTLFNBQVMsY0FBYyxlQUFlO0FBQ3RVLE9BQU8sU0FBUztBQUNoQixTQUFTLHFCQUFxQjtBQUM5QixPQUFPLGFBQWE7QUFDcEIsT0FBTyxpQkFBaUI7QUFDeEIsT0FBTyxrQkFBa0I7QUFMdUosSUFBTSwyQ0FBMkM7QUFRak8sSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE1BQU07QUFFeEMsUUFBTSxNQUFNLFFBQVEsTUFBTSxRQUFRLElBQUksR0FBRyxFQUFFO0FBRzNDLFFBQU0sT0FBTztBQUdiLE1BQUksQ0FBQyxRQUFRLElBQUksVUFBVTtBQUN6QixZQUFRLElBQUksV0FBVztBQUFBLEVBQ3pCO0FBR0EsUUFBTSxrQkFBa0IsSUFBSSwyQkFDekIsUUFBUSxJQUFJLGFBQWEsZUFBZSxTQUFTO0FBR3BELFFBQU0sYUFBYTtBQUtuQixRQUFNLGNBQWM7QUFBQSxJQUNsQixRQUFRO0FBQUEsSUFDUixjQUFjO0FBQUEsSUFDZCxRQUFRO0FBQUEsSUFDUixJQUFJO0FBQUE7QUFBQSxJQUVKLFNBQVMsQ0FBQyxTQUFpQixLQUFLLFFBQVEsVUFBVSxFQUFFO0FBQUEsSUFDcEQsV0FBVyxDQUFDLE9BQVksYUFBa0I7QUFDeEMsWUFBTSxHQUFHLFNBQVMsQ0FBQyxRQUFlLFFBQVEsTUFBTSxzQkFBc0IsR0FBRyxDQUFDO0FBQzFFLFlBQU0sR0FBRyxZQUFZLENBQUMsVUFBZSxRQUFhO0FBQ2hELGdCQUFRLElBQUksV0FBVyxJQUFJLE1BQU0sSUFBSSxJQUFJLEdBQUcsT0FBTyxTQUFTLElBQUksRUFBRTtBQUFBLE1BQ3BFLENBQUM7QUFBQSxJQUNIO0FBQUEsRUFDRjtBQUlBLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFDQSxLQUFLO0FBQUEsTUFDSCxTQUFTO0FBQUEsUUFDUCxTQUFTO0FBQUEsVUFDUDtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLElBQUk7QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLFFBQVE7QUFBQSxNQUNWLENBQUM7QUFBQSxJQUNIO0FBQUEsSUFDQSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3REO0FBQUEsSUFDRjtBQUFBLElBQ0EsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sWUFBWTtBQUFBLE1BQ1osTUFBTTtBQUFBLE1BQ04sS0FBSztBQUFBLFFBQ0gsU0FBUztBQUFBLE1BQ1g7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFlBQVk7QUFBQSxNQUNkO0FBQUEsTUFDQSxPQUFPO0FBQUEsUUFDTCxRQUFRO0FBQUEsTUFDVjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLE1BQU07QUFBQSxNQUNOLE9BQU87QUFBQSxRQUNMLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLElBQ0EsT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLE1BQ1IsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLE1BQ1gsUUFBUTtBQUFBLE1BQ1IsdUJBQXVCO0FBQUEsTUFDdkIsZUFBZTtBQUFBLFFBQ2IsUUFBUTtBQUFBLFVBQ04sY0FBYztBQUFBLFlBQ1osV0FBVyxDQUFDLFNBQVM7QUFBQSxZQUNyQixPQUFPLENBQUMsT0FBTyxjQUFjLE9BQU87QUFBQSxVQUN0QztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDO0FBQUEsSUFDWjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=

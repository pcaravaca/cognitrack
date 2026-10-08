<template>
  <v-app :theme="$vuetify.theme.global.current.dark ? 'dark' : 'light'">
    <!-- Header - Solo mostrar si NO es landing page -->
    <AppNavbar 
      v-if="!isLandingPage"
      @toggle-drawer="drawer = !drawer"
    />

    <!-- Sidebar - Solo mostrar si NO es landing page -->
    <AppSidebar
      v-if="!isLandingPage"
      v-model="drawer"
    />

    <v-main style="min-height: 100vh; padding: 0;">
      <router-view v-slot="{ Component }">
        <component :is="Component" style="height: 100%; width: 100%;" />
      </router-view>
    </v-main>

    <!-- Botón de chat global - solo si no es landing -->
    <ChatButton v-if="!isLandingPage" />
    
    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar"
      :color="snackbarColor"
      :timeout="3000"
      location="top"
    >
      {{ snackbarText }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useServersStore } from './stores/servers'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import ChatButton from './components/ChatButton.vue'

const router = useRouter()
const route = useRoute()
const serversStore = useServersStore()
const drawer = ref(true)

// Snackbar state
const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

// Detectar si estamos en landing page
const isLandingPage = computed(() => {
  return route.name === 'landing' || route.path === '/landing'
})

function isActive(routeName: string) {
  return route.name === routeName
}

// Estado de carga inicial
const isInitialized = ref(false)

// Limpiar estado inválido al cargar la aplicación
function cleanupAppState() {
  // Limpiar localStorage si hay rutas inválidas
  const returnUrl = localStorage.getItem('cognitrack_return_url');
  if (returnUrl && (returnUrl.includes('false') || returnUrl === 'false')) {
    console.log('🧹 Limpiando URL de retorno inválida:', returnUrl);
    localStorage.removeItem('cognitrack_return_url');
  }
}

// Cargar servidores al iniciar (solo si no es landing page)
onMounted(async () => {
  // Limpiar estado al iniciar
  cleanupAppState();
  
  if (!isLandingPage.value) {
    try {
      console.log('🚀 Inicializando aplicación...')
      // La inicialización de servidores ahora ocurre después del login
      // a través del store de autenticación
      console.log('✅ Inicialización completada')
    } catch (error) {
      console.error('❌ Error durante la inicialización:', error)
    } finally {
      isInitialized.value = true
    }
  }
})
</script>

<style>
/* Reset total */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: auto;
}

/* Vuetify theme backgrounds preserved — no transparent overrides */
.v-application {
  min-height: 100% !important;
  display: flex !important;
}

.v-application--wrap {
  min-height: 100% !important;
  display: flex !important;
}

/* Contenido principal — flex para que Vuetify layout funcione */
.v-main {
  --v-layout-top: 0 !important;
  --v-layout-bottom: 0 !important;
  --v-layout-left: 0 !important;
  --v-layout-right: 0 !important;
  min-height: 100% !important;
  display: flex !important;
  padding: 0 !important;
  margin: 0 !important;
}

.v-main__wrap {
  min-height: 100% !important;
  display: flex !important;
  padding: 0 !important;
  margin: 0 !important;
}
</style>

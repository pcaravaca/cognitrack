<template>
  <v-app :theme="$vuetify.theme.global.current.dark ? 'dark' : 'light'">
    <div class="app-container">
      <!-- Sidebar -->
      <AppSidebar 
        v-if="!isLandingPage" 
        :drawer-open="drawer"
        @update:drawer="drawer = $event"
      />

      <!-- Main content area -->
      <div class="app-content" :class="{ 'sidebar-open': drawer && !isMobile }">
        <AppNavbar 
          v-if="!isLandingPage"
          @toggle-drawer="drawer = !drawer"
        />
        
        <div class="main-content">
          <router-view />
        </div>
      </div>
    </div>

    <!-- Chat button global -->
    <ChatButton v-if="!isLandingPage" />

    <!-- Snackbar -->
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
import { useDisplay } from 'vuetify'
import AppNavbar from './components/layout/AppNavbar.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import ChatButton from './components/ChatButton.vue'

const router = useRouter()
const route = useRoute()
const serversStore = useServersStore()
const { mobile } = useDisplay()

const drawer = ref(true)

const isMobile = computed(() => mobile.value)

const isLandingPage = computed(() => {
  return route.name === 'landing' || route.path === '/landing' || route.path === '/'
})

const snackbar = ref(false)
const snackbarText = ref('')
const snackbarColor = ref('success')

const isInitialized = ref(false)

function cleanupAppState() {
  const returnUrl = localStorage.getItem('cognitrack_return_url');
  if (returnUrl && (returnUrl.includes('false') || returnUrl === 'false')) {
    console.log('🧹 Limpiando URL de retorno inválida:', returnUrl);
    localStorage.removeItem('cognitrack_return_url');
  }
}

onMounted(async () => {
  cleanupAppState();
  
  if (!isLandingPage.value) {
    try {
      console.log('🚀 Inicializando aplicación...')
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* Contenedor principal flex */
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

/* Sidebar - ocupa ancho fijo */
.app-sidebar {
  flex-shrink: 0;
  width: 256px;
  min-width: 256px;
  background: var(--v-surface-base, #1e1e1e);
  border-right: 1px solid var(--v-divider, rgba(0,0,0,0.12));
  overflow: hidden;
}

.app-sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

/* Contenido con navbar y main */
.app-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Navbar */
.app-navbar {
  flex-shrink: 0;
  height: 64px;
}

/* Main content - el área que puede hacer scroll */
.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  min-height: 0;
}

/* Sidebar colapsado - ajustar ancho del main content */
.app-sidebar.collapsed ~ .app-content .main-content {
  width: calc(100% - 64px);
}

/* Sidebar abierto - ajustar ancho del main content */
.app-sidebar:not(.collapsed) ~ .app-content .main-content {
  width: calc(100% - 256px);
}

@media (max-width: 959px) {
  .app-container {
    flex-direction: column;
  }
  
  .app-sidebar {
    width: 100%;
    height: auto;
    max-height: 200px;
  }
  
  .main-content {
    width: 100% !important;
  }
}
</style>
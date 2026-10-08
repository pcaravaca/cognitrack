<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="isMiniVariant"
    :permanent="!isMobile"
    :temporary="isMobile"
    app
    class="sidebar"
  >
    <!-- Header -->
    <div v-if="!isMiniVariant" class="sidebar-header">
      <v-list-item
        :title="appName"
        :subtitle="appDescription"
        class="px-4"
      >
        <template v-slot:prepend>
          <v-avatar color="primary" size="40" class="mr-2">
            <v-icon icon="mdi-server-network" />
          </v-avatar>
        </template>
      </v-list-item>
    </div>
    <v-divider />

    <!-- Navigation Menu -->
    <v-list density="compact" nav>
      <!-- Dashboard -->
      <v-list-item
        to="/dashboard"
        prepend-icon="mdi-view-dashboard"
        title="Dashboard"
        :class="{ 'active-menu-item': route.path === '/dashboard' || route.path === '/' }"
      />

      <!-- Servers Group -->
      <v-list-group value="servers">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-server"
            title="Servidores"
            :class="{ 'active-menu-item': route.path.startsWith('/servers') }"
          />
        </template>

        <v-list-item
          v-for="(item, i) in serversItems"
          :key="'servers-' + i"
          :to="item.to"
          :title="item.title"
          :class="{ 'active-menu-item': route.path === item.to }"
          class="ml-4"
        />
      </v-list-group>

      <!-- Monitoring Group -->
      <v-list-group value="monitoring">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-monitor-dashboard"
            title="Monitorización"
            :class="{ 'active-menu-item': route.path.startsWith('/monitoring') }"
          />
        </template>

        <v-list-item
          v-for="(item, i) in monitoringItems"
          :key="'monitoring-' + i"
          :to="item.to"
          :title="item.title"
          :class="{ 'active-menu-item': route.path === item.to }"
          class="ml-4"
        />
      </v-list-group>

      <!-- Settings Group -->
      <v-list-group value="settings">
        <template v-slot:activator="{ props }">
          <v-list-item
            v-bind="props"
            prepend-icon="mdi-cog"
            title="Configuración"
            :class="{ 'active-menu-item': route.path.startsWith('/settings') }"
          />
        </template>

        <v-list-item
          v-for="(item, i) in settingsItems"
          :key="'settings-' + i"
          :to="item.to"
          :title="item.title"
          :class="{ 'active-menu-item': route.path === item.to }"
          class="ml-4"
        />
      </v-list-group>

      <!-- Help & Documentation -->
      <v-divider class="my-2" />
      
      <v-list-item
        to="/api-docs"
        prepend-icon="mdi-api"
        title="Documentación API"
        :class="{ 'active-menu-item': route.path === '/api-docs' }"
      />

      <v-list-item
        to="/help"
        prepend-icon="mdi-help-circle"
        title="Ayuda"
        :class="{ 'active-menu-item': route.path === '/help' }"
      />
    </v-list>

    <!-- Footer -->
    <template v-slot:append>
      <v-divider />
      <div class="pa-2">
        <v-btn
          variant="text"
          block
          :icon="isMiniVariant ? 'mdi-chevron-right' : 'mdi-chevron-left'"
          @click="isMiniVariant = !isMiniVariant"
          class="toggle-sidebar"
          :title="isMiniVariant ? 'Expandir menú' : 'Contraer menú'"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useDisplay } from 'vuetify'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// Utilities
const route = useRoute()
const { mobile } = useDisplay()

// State
const drawer = ref(true)
const isMiniVariant = ref(false)

// App data
const appName = 'CogniTrack'
const appDescription = 'Monitor de servidores'

// Menu items
const serversItems = [
  { title: 'Estado de Servidores', to: '/servers' },
  { title: 'Administrar Servidores', to: '/servers/manage' },
  { title: 'Detalles del Servidor', to: '/server/1' }
]

const monitoringItems = [
  { title: 'Monitoreo en Tiempo Real', to: '/monitoring' },
  { title: 'Métricas', to: '/metrics' },
  { title: 'Logs', to: '/logs' }
]

const settingsItems = [
  { title: 'Configuración General', to: '/settings' },
  { title: 'Perfil de Usuario', to: '/profile' }
]

// Computed
const isMobile = computed(() => mobile.value)

// Lifecycle
onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

const handleResize = () => {
  if (window.innerWidth < 960) {
    isMiniVariant.value = false
  }
}
</script>

<style scoped>
.sidebar {
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.sidebar-header {
  padding: 16px;
  background: linear-gradient(45deg, var(--v-primary-base), var(--v-primary-darken-2));
  color: white;
}

.active-menu-item {
  background-color: rgba(var(--v-primary-base), 0.1);
  border-left: 3px solid var(--v-primary-base);
  color: var(--v-primary-base);
}

.toggle-sidebar {
  transition: all 0.3s ease;
}

.toggle-sidebar:hover {
  transform: scale(1.1);
}

@media (max-width: 959px) {
  .v-navigation-drawer {
    width: 280px !important;
  }
}

:deep(.v-list-item--active) {
  font-weight: 500;
}

:deep(.v-list-group__items .v-list-item) {
  padding-left: 32px !important;
}

:deep(.v-list-item--link:not(.v-list-item--active):hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>

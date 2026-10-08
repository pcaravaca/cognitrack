<template>
  <aside class="sidebar" :class="{ 'collapsed': !drawerOpen }">
    <!-- Sidebar header -->
    <div v-if="drawerOpen" class="sidebar-header">
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
    <v-divider v-if="drawerOpen" />

    <!-- Navigation -->
    <v-list density="compact" nav class="flex-grow-1">
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

    <!-- Footer toggle -->
    <div class="sidebar-footer">
      <v-divider />
      <div class="pa-2">
        <v-btn
          variant="text"
          block
          :icon="drawerOpen ? 'mdi-chevron-left' : 'mdi-chevron-right'"
          @click="emit('update:drawer', !drawerOpen)"
          :title="drawerOpen ? 'Contraer menú' : 'Expandir menú'"
        />
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  drawerOpen: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:drawer'])

const route = useRoute()

const appName = 'CogniTrack'
const appDescription = 'Monitor de servidores'

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
</script>

<style scoped>
.sidebar {
  width: 256px;
  min-width: 256px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--v-surface-base, #1e1e1e);
  border-right: 1px solid var(--v-divider, rgba(0,0,0,0.12));
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 20;
}

.sidebar.collapsed {
  width: 64px;
  min-width: 64px;
}

.sidebar.collapsed .sidebar-header {
  display: none;
}

.sidebar-header {
  padding: 16px;
  background: linear-gradient(45deg, var(--v-primary-base), var(--v-primary-darken-2));
  color: white;
}

.sidebar-footer {
  margin-top: auto;
}

.active-menu-item {
  background-color: rgba(var(--v-primary-base), 0.1);
  border-left: 3px solid var(--v-primary-base);
  color: var(--v-primary-base);
}
</style>

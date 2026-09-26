<template>
  <div class="server-list pa-4">
    <!-- Barra de acciones -->
    <v-row class="mb-6">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <div>
          <h2 class="text-h5 font-weight-bold">Servidores Ollama</h2>
          <p class="text-caption text-medium-emphasis mt-1">Monitoreo en tiempo real</p>
        </div>
        <div class="d-flex">
          <v-btn
            color="primary"
            variant="outlined"
            prepend-icon="mdi-magnify-scan"
            @click="discoverServers"
            :loading="isDiscovering"
            class="mr-2"
            elevation="1"
          >
            <template v-slot:prepend>
              <v-icon :color="isDiscovering ? 'primary' : 'white'"></v-icon>
            </template>
            Descubrir Servidores
          </v-btn>
          <v-btn 
            color="primary" 
            prepend-icon="mdi-plus" 
            @click="openAddDialog"
            elevation="1"
          >
            Agregar Servidor
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Mensaje de estado -->
    <v-alert
      v-if="discoveryStatus"
      :type="discoveryStatus.type"
      :title="discoveryStatus.title"
      :text="discoveryStatus.message"
      class="mb-4"
      closable
      @click:close="discoveryStatus = null"
    />

    <!-- Lista de servidores -->
    <v-row v-if="serversStore.servers.length > 0" class="servers-grid" :class="$vuetify.theme.current.dark ? 'dark-theme' : 'light-theme'" justify="center">
      <v-col 
        v-for="server in serversStore.servers" 
        :key="server.id"
        cols="12"
        sm="12"
        md="8"
        lg="6"
        xl="5"
      >
        <v-card 
          :class="['server-card', { 'active-server': currentServer?.id === server.id }]"
          :elevation="currentServer?.id === server.id ? 8 : 4"
          @click="selectServer(server)"
          height="100%"
          class="d-flex flex-column transition-swing"
          :style="{ borderLeft: `4px solid ${server.status === 'online' ? '#4CAF50' : '#F44336'}` }"
        >
          <!-- Encabezado de la tarjeta -->
          <v-card-title class="d-flex align-center pa-4">
            <div class="status-indicator me-3">
              <div :class="['pulse-dot', server.status]"></div>
            </div>
            <div class="d-flex flex-column flex-grow-1">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="36" class="me-3">
                  <v-icon color="white" size="small">mdi-server</v-icon>
                </v-avatar>
                <div class="d-flex flex-column">
                  <div class="text-h6 font-weight-bold text-truncate" style="max-width: 250px" :title="server.name || server.ip">
                    {{ server.name || server.ip }}
                  </div>
                  <div class="text-caption text-medium-emphasis d-flex align-center">
                    <v-icon size="x-small" class="me-1">mdi-ip-network</v-icon>
                    <span class="text-truncate" style="max-width: 200px" :title="`${server.ip}:${server.port}`">
                      {{ server.ip }}:{{ server.port }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <v-chip
              :color="server.status === 'online' ? 'success' : 'error'"
              variant="flat"
              size="small"
              class="font-weight-bold"
            >
              <v-icon start size="small">
                {{ server.status === 'online' ? 'mdi-check-circle' : 'mdi-close-circle' }}
              </v-icon>
              {{ server.status === 'online' ? 'En línea' : 'Desconectado' }}
            </v-chip>
          </v-card-title>
          
          <!-- Estado del servidor con animación mejorada -->
          <v-card-text class="px-4 py-3">
            <!-- Sección de Estado -->
            <v-alert
              :color="server.status === 'online' ? 'success' : 'error'"
              density="compact"
              class="mb-4"
              :text="server.error || (server.status === 'online' ? 'El servidor está funcionando correctamente' : 'No se puede conectar al servidor')"
              :icon="server.status === 'online' ? 'mdi-check-circle' : 'mdi-alert-circle'"
            >
              <template v-slot:title>
                <div class="d-flex align-center">
                  <span class="text-subtitle-2">
                    {{ server.status === 'online' ? 'Conectado' : 'Error de conexión' }}
                  </span>
                  <v-spacer></v-spacer>
                  <v-chip
                    size="x-small"
                    :color="server.status === 'online' ? 'success' : 'error'"
                    variant="flat"
                    class="text-caption font-weight-bold"
                    density="compact"
                  >
                    {{ server.status === 'online' ? 'ACTIVO' : 'INACTIVO' }}
                  </v-chip>
                </div>
              </template>

              <!-- Mensaje de error detallado -->
              <div v-if="server.error" class="mt-2 text-caption">
                {{ server.error }}
              </div>

              <!-- Botón de reintentar para servidores desconectados -->
              <template v-if="server.status !== 'online'" v-slot:append>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  :color="$vuetify.theme.current.dark ? 'white' : 'primary'"
                  class="mt-2"
                  @click.stop="retryConnection(server)"
                  :loading="server.isConnecting"
                  prepend-icon="mdi-refresh"
                  block
                >
                  Reintentar conexión
                </v-btn>
              </template>
            </v-alert>

            <!-- Sección de Recursos -->
            <div class="resource-section mb-4">
              <div class="d-flex align-center mb-3">
                <v-icon size="small" color="primary" class="me-2">mdi-chart-box</v-icon>
                <span class="text-subtitle-2 font-weight-bold">Recursos del Sistema</span>
                <v-spacer></v-spacer>
                <v-chip size="x-small" color="primary" variant="tonal" class="text-caption">
                  {{ server.stats?.updatedAt ? new Date(server.stats.updatedAt).toLocaleTimeString() : 'Nunca' }}
                </v-chip>
              </div>

              <!-- CPU -->
              <div class="resource-item mb-3">
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" color="blue" class="me-2">mdi-cpu-64-bit</v-icon>
                  <span class="text-caption font-weight-medium">Procesador</span>
                  <v-spacer></v-spacer>
                  <span class="text-caption font-weight-bold">{{ server.stats?.cpu?.usage || 0 }}%</span>
                </div>
                <v-progress-linear
                  :model-value="server.stats?.cpu?.usage || 0"
                  :color="getProgressColor(server.stats?.cpu?.usage || 0)"
                  height="6"
                  class="rounded"
                ></v-progress-linear>
                <div class="text-caption text-medium-emphasis mt-1">
                  {{ server.stats?.cpu?.cores || '?' }} núcleos | {{ server.stats?.cpu?.model || 'Desconocido' }}
                </div>
              </div>

              <!-- Memoria -->
              <div class="resource-item mb-3">
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" color="deep-purple" class="me-2">mdi-memory</v-icon>
                  <span class="text-caption font-weight-medium">Memoria RAM</span>
                  <v-spacer></v-spacer>
                  <span class="text-caption font-weight-bold">
                    {{ formatBytes(server.stats?.memory?.used || 0) }} / {{ formatBytes(server.stats?.memory?.total || 0) }}
                    ({{ server.stats?.memory?.total ? Math.round(((server.stats.memory.used || 0) / server.stats.memory.total) * 100) : 0 }}%)
                  </span>
                </div>
                <v-progress-linear
                  :model-value="server.stats?.memory?.total ? ((server.stats.memory.used || 0) / server.stats.memory.total * 100) : 0"
                  :color="getProgressColor(server.stats?.memory?.total ? ((server.stats.memory.used || 0) / server.stats.memory.total * 100) : 0)"
                  height="6"
                  class="rounded"
                ></v-progress-linear>
                <div class="d-flex justify-space-between mt-1">
                  <span class="text-caption text-medium-emphasis">
                    {{ formatBytes(server.stats?.memory?.free || 0) }} libres
                  </span>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatBytes(server.stats?.memory?.total || 0) }} total
                  </span>
                </div>
              </div>

              <!-- GPU (si está disponible) -->
              <div v-if="server.stats?.gpu" class="resource-item">
                <div class="d-flex align-center mb-1">
                  <v-icon size="small" color="amber" class="me-2">mdi-gpu</v-icon>
                  <span class="text-caption font-weight-medium">GPU</span>
                  <v-spacer></v-spacer>
                  <span class="text-caption font-weight-bold">
                    {{ server.stats.gpu?.usage || 0 }}% de uso
                  </span>
                </div>
                <v-progress-linear
                  :model-value="server.stats.gpu?.usage || 0"
                  :color="getProgressColor(server.stats.gpu?.usage || 0)"
                  height="6"
                  class="rounded"
                ></v-progress-linear>
                <div v-if="server.stats.gpu?.name" class="text-caption text-medium-emphasis mt-1">
                  {{ server.stats.gpu.name }}
                </div>
              </div>
            </div>

            <!-- Sección de Información del Servidor -->
            <v-divider class="my-2"></v-divider>
            <div class="server-info mt-3">
              <div class="d-flex justify-space-between mb-2">
                <div class="d-flex align-center">
                  <v-icon size="small" color="indigo" class="me-2">mdi-package-variant</v-icon>
                  <div>
                    <div class="text-caption font-weight-medium">Modelos</div>
                    <div class="text-h6 font-weight-bold">{{ server.stats?.models ? server.stats.models.length : 0 }}</div>
                  </div>
                </div>
                
                <div class="d-flex align-center">
                  <v-icon size="small" color="teal" class="me-2">mdi-docker</v-icon>
                  <div>
                    <div class="text-caption font-weight-medium">Contenedores</div>
                    <div class="text-h6 font-weight-bold">0</div>
                  </div>
                </div>

                <div class="d-flex align-center" v-if="server.stats?.version">
                  <v-icon size="small" color="blue-grey" class="me-2">mdi-information</v-icon>
                  <div>
                    <div class="text-caption font-weight-medium">Versión</div>
                    <div class="text-h6 font-weight-bold">v{{ server.stats.version }}</div>
                  </div>
                </div>
              </div>
            </div>
          </v-card-text>
          
          <!-- Acciones -->
          <v-card-actions class="px-4 pb-4 pt-0 mt-auto">
            <v-spacer></v-spacer>
            <v-btn 
              color="primary" 
              variant="tonal" 
              size="small"
              @click="navigateToServer(server)"
              prepend-icon="mdi-arrow-right"
              class="text-none"
            >
              Ver detalles
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Estado vacío -->
    <v-row v-else class="mt-8">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-server-off</v-icon>
        <h3 class="text-h5 mb-2">No hay servidores configurados</h3>
        <p class="text-body-1 text-medium-emphasis mb-6">
          Parece que aún no has agregado ningún servidor Ollama.
        </p>
        <v-btn 
          color="primary" 
          prepend-icon="mdi-plus" 
          @click="openAddDialog"
          class="mt-2"
        >
          Agregar Servidor
        </v-btn>
        <v-card class="pa-6" :elevation="2" rounded="lg">
          <v-icon size="64" :color="$vuetify.theme.current.dark ? 'grey-lighten-1' : 'grey-darken-2'" class="mb-4">mdi-server-off</v-icon>
          <h3 class="text-h5 mb-2">No hay servidores</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            No se encontraron servidores. Intenta agregar uno manualmente o usa la función de descubrimiento.
          </p>
          <v-btn 
            color="primary" 
            @click="openAddDialog" 
            prepend-icon="mdi-plus"
            variant="tonal"
            class="me-2"
          >
            Agregar servidor
          </v-btn>
          <v-btn 
            @click="discoverServers" 
            :loading="isDiscovering"
            prepend-icon="mdi-magnify"
            variant="outlined"
          >
            Descubrir servidores
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useServersStore } from '@/stores/servers'
import type { Server, ServerStats } from '@/types/server.types'

interface DiscoveryStatus {
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
}

// Router
const router = useRouter()

// Stores
const serversStore = useServersStore()

// State
const isDiscovering = ref(false)
const discoveryStatus = ref<DiscoveryStatus | null>(null)
const updateInterval = ref<number | null>(null)

// Computed
const servers = computed(() => serversStore.servers)
const currentServer = computed(() => serversStore.currentServer)

// Methods
const isServerActive = (server: Server) => server.status === 'online'

const getCpuColor = (usage: number) => {
  if (usage < 50) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

const openAddDialog = () => {
  // Lógica para abrir diálogo de agregar servidor
  console.log('Abrir diálogo de agregar servidor')
}

const discoverServers = async () => {
  isDiscovering.value = true
  try {
    await serversStore.discoverServers()
    discoveryStatus.value = {
      type: 'success',
      title: 'Búsqueda completada',
      message: `Se encontraron ${servers.value.length} servidores`
    }
  } catch (error) {
    console.error('Error al descubrir servidores:', error)
    discoveryStatus.value = {
      type: 'error',
      title: 'Error',
      message: 'No se pudieron descubrir servidores. Verifica tu conexión de red.'
    }
  } finally {
    isDiscovering.value = false
  }
}

const navigateToServer = (server: Server) => {
  router.push(`/server/${server.id}`)
}

const selectServer = async (server: Server) => {
  try {
    await serversStore.setCurrentServer(server.id)
    // Actualizar estadísticas del servidor seleccionado
    await serversStore.getServerStats(server.id)
  } catch (error) {
    console.error('Error al seleccionar el servidor:', error)
  }
}

const getProgressColor = (value: number) => {
  if (value < 50) return 'success'
  if (value < 80) return 'warning'
  return 'error'
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

// Usamos la interfaz Server importada de server.types.ts

// Actualizar estadísticas de un servidor
const updateServer = async (server: Server) => {
  try {
    const stats = await serversStore.getServerStats(server.id)
    
    // Actualizar el servidor en la lista
    const serverIndex = serversStore.servers.findIndex(s => s.id === server.id)
    if (serverIndex !== -1) {
      const currentServer = serversStore.servers[serverIndex]
      serversStore.servers[serverIndex] = {
        ...currentServer,
        stats: {
          ...currentServer.stats,
          ...stats
        },
        lastChecked: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error(`Error al actualizar estadísticas del servidor ${server.name}:`, error)
  }
}

const updateServerStats = async () => {
  if (servers.value.length > 0) {
    try {
      await Promise.all(servers.value.map(async server => {
        try {
          await updateServer(server)
        } catch (error) {
          console.error(`Error al actualizar estadísticas del servidor ${server.name}:`, error)
          // Actualizar estado a offline si hay un error
          serversStore.updateServer(server.id, { status: 'offline' })
        }
      }))
    } catch (error) {
      console.error('Error en la actualización de estadísticas:', error)
    }
  }
}

const retryConnection = async (server: Server) => {
  try {
    // Actualizar estado a conectando
    const serverIndex = serversStore.servers.findIndex(s => s.id === server.id)
    if (serverIndex !== -1) {
      const currentServer = serversStore.servers[serverIndex]
      serversStore.servers[serverIndex] = {
        ...currentServer,
        isConnecting: true,
        error: undefined
      }
    }

    // Intentar reconectar
    const { success, error } = await serversStore.checkOllamaServer(server.ip, server.port || 11434)
    
    // Actualizar estado según el resultado
    if (serverIndex !== -1) {
      const currentServer = serversStore.servers[serverIndex]
      serversStore.servers[serverIndex] = {
        ...currentServer,
        isConnecting: false,
        status: success ? 'online' : 'offline',
        error: success ? undefined : error,
        lastChecked: new Date().toISOString()
      }
    }

    return { success, error }
  } catch (error) {
    console.error('Error al reintentar conexión:', error)
    
    // Actualizar estado
    const serverIndex = serversStore.servers.findIndex(s => s.id === server.id)
    if (serverIndex !== -1) {
      const currentServer = serversStore.servers[serverIndex]
      serversStore.servers[serverIndex] = {
        ...currentServer,
        isConnecting: false,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
        lastChecked: new Date().toISOString()
      }
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// Lifecycle
onMounted(async () => {
  try {
    console.log('📊 ServerList montado - Servidores disponibles:', serversStore.servers.length)
    console.log('📊 Datos de servidores:', JSON.stringify(serversStore.servers, null, 2))
    
    // Si hay servidores, actualizar sus estadísticas
    if (serversStore.servers.length > 0) {
      console.log('🔄 Actualizando estadísticas de servidores...')
      await updateServerStats()
      console.log('✅ Estadísticas actualizadas. Servidores:', JSON.stringify(serversStore.servers, null, 2))
    } else {
      console.log('⚠️ No hay servidores para mostrar')
    }
    
    // Configurar actualización periódica cada 30 segundos
    updateInterval.value = window.setInterval(() => {
      if (serversStore.servers.length > 0) {
        updateServerStats()
      }
    }, 30000)
  } catch (error) {
    console.error('❌ Error al inicializar el componente ServerList:', error)
  }
})

// Limpiar intervalo al desmontar el componente
onUnmounted(() => {
  if (updateInterval.value !== null) {
    clearInterval(updateInterval.value)
    updateInterval.value = null
  }
})
</script>

<style scoped>
.server-list {
  height: 100%;
  background-color: rgb(var(--v-theme-background));
  padding: 16px;
}

.servers-grid {
  max-width: 1800px;
  margin: 0 auto;
  width: 100%;
}

.server-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  height: 100%;
  display: flex;
  flex-direction: column;
}

.server-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.5);
}

.active-server {
  border: 2px solid rgb(var(--v-theme-primary));
  box-shadow: 0 5px 20px -5px rgba(var(--v-theme-primary), 0.2) !important;
}

.status-indicator {
  position: relative;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 20px;
}

.status-indicator.online .status-text {
  color: var(--v-theme-success);
  font-weight: 500;
}

.pulse-dot {
  position: absolute;
  left: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--v-theme-success);
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0% {
    transform: scale(0.8);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.7;
  }
}

/* Mejoras para el tema oscuro */
:deep(.v-theme--dark) .server-card {
  background-color: #1E1E1E !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.v-theme--dark) .active-server {
  background-color: #1a1a1a !important;
}

/* Mejoras para el tema claro */
:deep(.v-theme--light) .server-card {
  background-color: #FFFFFF !important;
  border-color: rgba(0, 0, 0, 0.1) !important;
}

:deep(.v-theme--light) .active-server {
  background-color: #f8f9fa !important;
}

/* Transición suave para los cambios de estado */
.v-progress-linear__determinate,
.v-progress-linear__indeterminate {
  transition: all 0.5s ease-in-out;
}

/* Ajustes de espaciado */
.v-card-title {
  padding-bottom: 8px !important;
}

.v-card-text {
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

/* Mejoras en la tipografía */
.text-caption {
  font-size: 0.75rem !important;
  line-height: 1.25;
}

.text-body-2 {
  font-size: 0.875rem !important;
  font-weight: 500;
}
</style>
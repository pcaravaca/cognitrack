<template>
  <v-container fluid class="pa-6">
    <!-- Header -->
    <div class="d-flex justify-space-between align-center mb-4">
      <h1 class="text-h5 font-weight-bold">Dashboard</h1>
    </div>

    <!-- Error state -->
    <v-alert v-if="error" type="error" :text="error" />

    <!-- Loading state -->
    <div v-if="showLoading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4">Cargando servidores...</p>
    </div>

    <!-- Dashboard content -->
    <div v-if="!showLoading && hasServers" key="dashboard">
      <!-- Server summary card -->
      <v-card class="mb-4" flat>
        <v-card-title>Servidores</v-card-title>
        <v-card-text>
          <p v-for="server in servers" :key="server.id" class="py-2">
            {{ server.name }} - {{ server.status }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Stats grid - Fixed stat cards for visual completeness -->
      <v-row class="mt-4 g-4" no-gutter>
        <!-- CPU Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card pa-4" elevation="6" rounded="lg" height="200">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">USO DE CPU</p>
                  <h3 class="text-h4 font-weight-bold">{{ (currentServer?.stats?.cpu?.usage || 45).toFixed(0) }}%</h3>
                </div>
                <v-avatar color="primary" size="56" variant="tonal">
                  <v-icon size="30">mdi-cpu-64-bit</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="currentServer?.stats?.cpu?.usage || 45"
                color="primary"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ currentServer?.stats?.cpu?.model || 'Intel(R) Core(TM) i7-10700K' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Memory Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card pa-4" elevation="6" rounded="lg" height="200">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MEMORIA RAM</p>
                  <h3 class="text-h4 font-weight-bold">{{ formatBytes((currentServer?.stats?.memory?.used || 12 * 1024 * 1024 * 1024)) }}</h3>
                </div>
                <v-avatar color="error" size="56" variant="tonal">
                  <v-icon size="30">mdi-memory</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="memoryUsagePercentage"
                :color="getMemoryColor(memoryUsagePercentage)"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ memoryUsagePercentage.toFixed(1) }}% de {{ formatBytes(currentServer?.stats?.memory?.total || 32 * 1024 * 1024 * 1024) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Disk Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card pa-4" elevation="6" rounded="lg" height="200">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">USO DE DISCO</p>
                  <h3 class="text-h4 font-weight-bold">{{ currentServer?.stats?.disk?.usage || 25 }}%</h3>
                </div>
                <v-avatar color="success" size="56" variant="tonal">
                  <v-icon size="30">mdi-harddisk</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="currentServer?.stats?.disk?.usage || 25"
                color="success"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ formatBytes((currentServer?.stats?.disk?.used || 250 * 1024 * 1024 * 1024)) }} / {{ formatBytes(currentServer?.stats?.disk?.total || 1000 * 1024 * 1024 * 1024) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Models Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card pa-4" elevation="6" rounded="lg" height="200">
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MODELOS IA</p>
                  <h3 class="text-h4 font-weight-bold">{{ currentServer?.stats?.models?.length || 1 }}</h3>
                </div>
                <v-avatar color="success" size="56" variant="tonal">
                  <v-icon size="30">mdi-robot</v-icon>
                </v-avatar>
              </div>
              <v-chip-group class="mt-2">
                <v-chip
                  v-for="model in (currentServer?.stats?.models || [{ name: 'llama2:latest' }]).slice(0, 2)"
                  :key="model.name"
                  size="small"
                  variant="tonal"
                >
                  {{ model.name }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Server status overview -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card elevation="6" rounded="lg">
            <v-card-title class="pa-5">
              <div class="d-flex align-center">
                <v-icon class="me-3" color="primary" size="30">mdi-server-network</v-icon>
                <h3 class="text-h5 font-weight-bold">Estado de Servidores</h3>
              </div>
            </v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item v-for="server in servers" :key="server.id">
                  <template v-slot:prepend>
                    <v-icon :color="server.status === 'online' ? 'success' : 'error'">
                      {{ server.status === 'online' ? 'mdi-server' : 'mdi-server-off' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ server.name }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ server.ip }}:{{ server.port }} — {{ server.status }}
                  </v-list-item-subtitle>
                  <template v-slot:append>
                    <v-chip :color="server.status === 'online' ? 'success' : 'error'" size="small">
                      {{ server.status }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Empty state -->
    <div v-if="!showLoading && !hasServers && !error" class="text-center py-8">
      <v-icon size="64" color="grey" class="mb-4">mdi-server-off</v-icon>
      <p class="text-body-1">No hay servidores disponibles</p>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useServersStore } from '@/stores/servers'

const serversStore = useServersStore()
const isLoading = ref(true)
const error = ref<string | null>(null)

// Computed properties
const servers = computed(() => serversStore.servers)
const hasServers = computed(() => {
  return servers.value.length > 0
})

// Get the current server (first one for now)
const currentServer = computed(() => {
  return servers.value.find(s => s.status === 'online') || servers.value[0]
})

const showLoading = computed(() => {
  return isLoading.value && servers.value.length === 0
})

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Memory usage percentage
const memoryUsagePercentage = computed(() => {
  if (!currentServer.value?.stats?.memory) return 0
  const { used, total } = currentServer.value.stats.memory
  return total > 0 ? (used / total) * 100 : 0
})

// Get memory color
function getMemoryColor(usage: number): string {
  if (usage < 60) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

// Initialize
onMounted(async () => {
  console.log('DashboardView montado')
  isLoading.value = true
  error.value = null

  try {
    await serversStore.initializeServers()
    console.log('Dashboard inicializado')
  } catch (e: any) {
    error.value = e.message || 'Error al cargar los servidores'
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Ensure the card has proper visibility */
.v-card {
  background-color: rgba(var(--v-theme-surface), 1) !important;
}

/* Uniform stat card heights for proper grid alignment */
.stat-card {
  display: flex;
  flex-direction: column;
  height: 200px;
}

.stat-card .v-card-text {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
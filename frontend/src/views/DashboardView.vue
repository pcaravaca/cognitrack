<template>
  <v-container fluid class="pa-4">
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
      <!-- Server list -->
      <v-card class="mb-4" flat>
        <v-card-title>Servidores</v-card-title>
        <v-card-text>
          <p v-for="server in servers" :key="server.id" class="py-2">
            {{ server.name }} - {{ server.status }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Stats grid -->
      <v-row>
        <v-col v-for="server in servers" :key="server.id" cols="12" md="6" lg="4">
          <v-card class="pa-4">
            <v-card-title>{{ server.name }}</v-card-title>
            <v-card-text>
              <div v-if="server.stats">
                <p><strong>CPU:</strong> {{ server.stats.cpu.usage }}% ({{ server.stats.cpu.model }})</p>
                <p><strong>Memoria:</strong> {{ formatBytes(server.stats.memory.used) }} / {{ formatBytes(server.stats.memory.total) }}</p>
                <p><strong>Disco:</strong> {{ server.stats.disk.usage }}%</p>
                <p><strong>Versión:</strong> {{ server.stats.version }}</p>
                <p><strong>Modelos:</strong> {{ server.stats.models?.length || 0 }}</p>
              </div>
              <div v-else>
                <p>Sin estadísticas disponibles</p>
              </div>
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
const isLoadingComputed = computed(() => serversStore.isLoading)
const hasLoaded = ref(false)

const showLoading = computed(() => {
  const result = isLoading.value || !hasLoaded.value
  return result
})

const hasServers = computed(() => {
  return servers.value.length > 0
})

// Format bytes helper
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Initialize
onMounted(async () => {
  console.log('DashboardView montado')
  isLoading.value = true
  error.value = null

  try {
    await serversStore.initializeServers()
    hasLoaded.value = true
    console.log('Dashboard inicializado')
  } catch (e: any) {
    error.value = e.message || 'Error al cargar los servidores'
    hasLoaded.value = true
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
</style>
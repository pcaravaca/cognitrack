<template>
  <v-container fluid class="dashboard-container pa-0">
    <!-- Loading State -->
    <v-container v-if="isLoading" class="d-flex align-center justify-center loading-container" style="height: 100vh;">
      <v-card class="loading-card" elevation="8" rounded="lg" max-width="600">
        <v-card-text class="pa-8 text-center">
          <div class="loading-icon-container mb-6">
            <v-progress-circular
              :model-value="loadingProgress"
              color="primary"
              size="80"
              width="6"
              indeterminate
              class="loading-spinner"
            >
              <v-icon size="32" color="primary" class="spin">mdi-cog</v-icon>
            </v-progress-circular>
          </div>
          <h2 class="text-h5 mb-4">Cargando CogniTrack</h2>
          <p class="text-body-1 mb-4">{{ loadingMessage }}</p>
          <v-progress-linear
            :model-value="loadingProgress"
            color="primary"
            height="8"
            rounded
            class="mb-4"
          ></v-progress-linear>
          <p class="text-caption text-medium-emphasis">Versión 1.0.0</p>
        </v-card-text>
      </v-card>
    </v-container>
    
    <!-- Error State -->
    <v-container v-else-if="serversStore.error" class="error--text">
      <v-alert type="error" variant="tonal">
        Error al cargar los datos: {{ serversStore.error }}
        <v-btn color="error" @click="initializeDashboard" class="mt-2">
          Reintentar
        </v-btn>
      </v-alert>
    </v-container>
    
    <!-- Empty State -->
    <v-container v-else-if="!serversStore.servers.length" class="text-center">
      <v-alert type="info" variant="tonal">
        No hay servidores configurados.
        <router-link to="/servers/manage">Agregar un servidor</router-link>
      </v-alert>
    </v-container>

    <!-- Main Content -->
    <v-main v-else class="dashboard-content">
      <!-- Server Status Alert -->
      <v-container v-if="serversStore.currentServer && serversStore.currentServer.status === 'offline'" class="mb-4">
        <v-alert type="warning" variant="tonal" class="mb-4">
          <v-icon icon="mdi-information" class="mr-2"></v-icon>
          El servidor {{ serversStore.currentServer.name }} no está disponible.
          Los datos mostrados son simulados.
        </v-alert>
      </v-container>

      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold">Dashboard</h1>
                <p class="text-body-1 text-medium-emphasis">Overview of your server resources and performance</p>
              </div>
              <div class="d-flex gap-2">
                <v-btn
                  color="secondary"
                  variant="outlined"
                  prepend-icon="mdi-test-tube"
                  @click="forceDemoMode"
                >
                  Demo Mode
                </v-btn>
                <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData">
                  Refresh
                </v-btn>
              </div>
            </div>
          </v-col>
        </v-row>

        <!-- Server Status Cards -->
        <v-row class="mb-6">
          <v-col v-for="(stat, index) in serverStats" :key="index" cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-subtitle-1 text-medium-emphasis">{{ stat.title }}</div>
                    <div class="text-h5 font-weight-bold mt-1">{{ stat.value }}</div>
                    <div class="text-caption" :class="stat.trend > 0 ? 'success--text' : 'error--text'">
                      <v-icon :icon="stat.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down'" size="small"></v-icon>
                      {{ Math.abs(stat.trend) }}% {{ stat.trend > 0 ? 'más' : 'menos' }} que ayer
                    </div>
                  </div>
                  <v-avatar :color="stat.color" size="48" variant="tonal">
                    <v-icon :icon="stat.icon" size="24"></v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Charts Row -->
        <v-row class="mb-6">
          <v-col cols="12" lg="8">
            <v-card elevation="2" rounded="lg" class="h-100">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-line</v-icon>
                Resource Usage
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="resourceChart" style="width: 100%; height: 400px;"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" lg="4">
            <v-card elevation="2" rounded="lg" class="h-100">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-pie</v-icon>
                Storage Distribution
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="storageChart" style="width: 100%; height: 400px;"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Processes Table -->
        <v-row>
          <v-col cols="12">
            <v-card elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                Active Processes
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table>
                  <thead>
                    <tr>
                      <th>PID</th>
                      <th>Name</th>
                      <th>User</th>
                      <th>CPU %</th>
                      <th>Memory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="process in processes" :key="process.pid">
                      <td>{{ process.pid }}</td>
                      <td>{{ process.name }}</td>
                      <td>{{ process.user }}</td>
                      <td>
                        <v-progress-linear
                          :model-value="process.cpu"
                          :color="getUsageColor(process.cpu)"
                          height="8"
                          rounded
                        ></v-progress-linear>
                        <span class="text-caption ml-2">{{ process.cpu }}%</span>
                      </td>
                      <td>{{ formatBytes(process.memory) }}</td>
                      <td>
                        <v-chip :color="process.status === 'running' ? 'success' : 'warning'" size="small">
                          {{ process.status }}
                        </v-chip>
                      </td>
                      <td>
                        <v-btn
                          v-if="process.status === 'running'"
                          icon="mdi-stop"
                          size="small"
                          variant="text"
                          color="error"
                          @click="stopProcess(process)"
                        ></v-btn>
                        <v-btn
                          v-else
                          icon="mdi-play"
                          size="small"
                          variant="text"
                          color="success"
                          @click="startProcess(process)"
                        ></v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-container>
</template>

<script setup>
// Vue and Router
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useServersStore } from '@/stores/servers'
import { useAuthStore } from '@/stores/auth'

// Load ECharts from CDN
const loadECharts = () => {
  return new Promise((resolve) => {
    if (window.echarts) {
      resolve(window.echarts)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js'
    script.onload = () => {
      console.log('✅ ECharts cargado correctamente')
      resolve(window.echarts)
    }
    script.onerror = (error) => {
      console.error('❌ Error al cargar ECharts:', error)
      resolve(null)
    }
    document.head.appendChild(script)
  })
}

// Initialize dashboard data
const authStore = useAuthStore()
const serversStore = useServersStore()
const router = useRouter()
const route = useRoute()

// Loading state
const isLoading = ref(false)
const lastUpdateTime = ref('Nunca')
const loadingMessage = ref('Cargando datos del servidor...')
const loadingProgress = ref(0)
const loadingSteps = ref([
  'Verificando autenticación...',
  'Cargando servidores...',
  'Verificando estado de servidores...',
  'Inicializando gráficos...',
  'Cargando datos en tiempo real...'
])

// Loading state management
const startLoading = (message = 'Cargando...') => {
  isLoading.value = true
  loadingMessage.value = message
  loadingProgress.value = 0
}

const updateLoadingProgress = (stepIndex, message) => {
  loadingProgress.value = Math.round((stepIndex / loadingSteps.value.length) * 100)
  loadingMessage.value = message
}

const stopLoading = () => {
  isLoading.value = false
  loadingMessage.value = 'Cargando datos del servidor...'
  loadingProgress.value = 0
}

// Charts
const resourceChart = ref(null)
const storageChart = ref(null)
const resourceChartInstance = ref(null)
const storageChartInstance = ref(null)

// Sample data for demonstration
const serverStats = ref([
  { 
    title: 'CPU Usage', 
    value: '24%', 
    trend: 2.5, 
    icon: 'mdi-cpu-64-bit',
    color: 'primary'
  },
  { 
    title: 'Memory', 
    value: '3.2/16 GB', 
    trend: -1.2, 
    icon: 'mdi-memory',
    color: 'success'
  },
  { 
    title: 'Storage', 
    value: '128/512 GB', 
    trend: 5.3, 
    icon: 'mdi-harddisk',
    color: 'warning'
  },
  { 
    title: 'Network', 
    value: '45.2 Mbps', 
    trend: 12.7, 
    icon: 'mdi-lan',
    color: 'info'
  }
])

const processes = ref([
  { pid: 1234, name: 'nginx', user: 'www-data', cpu: 12.5, memory: 1024 * 1024 * 128, status: 'running' },
  { pid: 2345, name: 'node', user: 'node', cpu: 45.2, memory: 1024 * 1024 * 512, status: 'running' },
  { pid: 3456, name: 'python', user: 'user', cpu: 5.7, memory: 1024 * 1024 * 256, status: 'stopped' },
  { pid: 4567, name: 'redis', user: 'redis', cpu: 2.1, memory: 1024 * 1024 * 64, status: 'running' },
  { pid: 5678, name: 'postgres', user: 'postgres', cpu: 8.9, memory: 1024 * 1024 * 320, status: 'running' }
])

// Methods
const getUsageColor = (usage) => {
  if (usage < 50) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const forceDemoMode = async () => {
  console.log('🎭 Forzando modo demo...')
  
  // Limpiar servidores actuales
  serversStore.servers = []
  
  // Crear servidor demo
  const demoServer = {
    id: 999,
    name: 'Demo Server',
    ip: 'demo.local',
    port: 11434,
    status: 'offline',
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 'Demo Mode',
    lastBackup: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  serversStore.servers.push(demoServer)
  serversStore.currentServer = demoServer
  
  // Forzar actualización de gráficos
  await nextTick()
  updateCharts()
  
  console.log('✅ Modo demo activado - dashboard funcionando sin servidores reales')
}

const refreshData = async () => {
  console.log('🔄 Actualizando datos del dashboard...')
  try {
    // Solo actualizar gráficos si están inicializados
    if (resourceChart.value && resourceChartInstance.value) {
      updateCharts()
    }
  } catch (error) {
    console.error('Error al actualizar datos:', error)
  }
}

const updateCharts = () => {
  if (!window.echarts) return
  
  // Actualizar gráfico de recursos
  if (resourceChartInstance.value) {
    const option = getResourceChartOptions()
    resourceChartInstance.value.setOption(option, true)
  }
  
  // Actualizar gráfico de almacenamiento
  if (storageChartInstance.value) {
    const option = getStorageChartOptions()
    storageChartInstance.value.setOption(option, true)
  }
  
  // Actualizar hora de última actualización
  lastUpdateTime.value = new Date().toLocaleTimeString()
}

const initializeCharts = async () => {
  try {
    // Cargar ECharts si no está cargado
    const echarts = await loadECharts()
    if (!echarts) {
      console.warn('No se pudo cargar ECharts')
      return
    }
    
    // Inicializar gráfico de recursos
    if (resourceChart.value) {
      resourceChartInstance.value = echarts.init(resourceChart.value)
      const option = getResourceChartOptions()
      resourceChartInstance.value.setOption(option)
      
      // Manejar redimensionamiento
      window.addEventListener('resize', () => {
        resourceChartInstance.value?.resize()
      })
    }
    
    // Inicializar gráfico de almacenamiento
    if (storageChart.value) {
      storageChartInstance.value = echarts.init(storageChart.value)
      const option = getStorageChartOptions()
      storageChartInstance.value.setOption(option)
      
      // Manejar redimensionamiento
      window.addEventListener('resize', () => {
        storageChartInstance.value?.resize()
      })
    }
    
    console.log('📊 Gráficos inicializados correctamente')
  } catch (error) {
    console.error('Error al inicializar gráficos:', error)
  }
}

const getResourceChartOptions = () => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['CPU Usage', 'Memory Usage', 'Disk I/O']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%'
      }
    },
    series: [
      {
        name: 'CPU Usage',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 118, 210, 0.8)' },
            { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [30, 25, 40, 35, 50, 45, 30]
      },
      {
        name: 'Memory Usage',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 200, 83, 0.8)' },
            { offset: 1, color: 'rgba(0, 200, 83, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [20, 30, 25, 40, 30, 35, 25]
      },
      {
        name: 'Disk I/O',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new window.echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 171, 0, 0.8)' },
            { offset: 1, color: 'rgba(255, 171, 0, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: [10, 15, 20, 15, 25, 20, 15]
      }
    ]
  }
}

const getStorageChartOptions = () => {
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['System', 'Applications', 'Documents', 'Media', 'Other']
    },
    series: [
      {
        name: 'Storage Usage',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 335, name: 'System' },
          { value: 310, name: 'Applications' },
          { value: 234, name: 'Documents' },
          { value: 135, name: 'Media' },
          { value: 1548, name: 'Other' }
        ]
      }
    ]
  }
}

// Initialize dashboard data
const initializeDashboard = async () => {
  try {
    startLoading('🚀 Inicializando CogniTrack Dashboard...')

    // Paso 1: Verificar autenticación
    updateLoadingProgress(0, loadingSteps.value[0])
    await new Promise(resolve => setTimeout(resolve, 500))

    // Paso 2: Cargar servidores
    updateLoadingProgress(1, loadingSteps.value[1])
    await serversStore.initializeServers()

    // Paso 3: Verificar estado de servidores
    updateLoadingProgress(2, loadingSteps.value[2])
    await new Promise(resolve => setTimeout(resolve, 300))

    // Paso 4: Inicializar gráficos
    updateLoadingProgress(3, loadingSteps.value[3])
    await nextTick()
    await initializeCharts()

    // Paso 5: Iniciar actualización automática
    updateLoadingProgress(4, loadingSteps.value[4])
    startAutoRefresh()

    updateLoadingProgress(5, '✅ ¡Dashboard listo!')
    await new Promise(resolve => setTimeout(resolve, 500))
    stopLoading()

    console.log('✅ Dashboard inicializado correctamente')
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('❌ Error al inicializar el dashboard:', error)
    stopLoading()
    // El error ya está manejado por el store
  }
}

// Initialize charts when component is mounted
onMounted(async () => {
  console.log('🏗️ Montando componente Dashboard...')
  await initializeDashboard()
  
  // Inicializar ECharts
  window.addEventListener('resize', handleResize)
  
  // Iniciar actualización automática
  startAutoRefresh()
})

// Cleanup on unmount
onUnmounted(() => {
  console.log('🗑️ Desmontando componente Dashboard...')
  window.removeEventListener('resize', handleResize)
  
  // Limpiar instancias de gráficos
  if (resourceChartInstance.value) {
    resourceChartInstance.value.dispose()
    resourceChartInstance.value = null
  }
  
  if (storageChartInstance.value) {
    storageChartInstance.value.dispose()
    storageChartInstance.value = null
  }
  
  // Detener actualización automática
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
})

// Handle window resize
const handleResize = () => {
  if (resourceChartInstance.value) {
    resourceChartInstance.value.resize()
  }
  if (storageChartInstance.value) {
    storageChartInstance.value.resize()
  }
}

// Auto-refresh methods
const autoRefreshInterval = ref(null)
const isAutoRefresh = ref(true)
const refreshInterval = ref(30) // segundos

const startAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
  }
  
  if (isAutoRefresh.value) {
    autoRefreshInterval.value = setInterval(() => {
      refreshData()
    }, refreshInterval.value * 1000)
  }
}

const toggleAutoRefresh = () => {
  isAutoRefresh.value = !isAutoRefresh.value
  if (isAutoRefresh.value) {
    startAutoRefresh()
  } else if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value)
    autoRefreshInterval.value = null
  }
}

// Set refresh interval
const setRefreshInterval = (seconds) => {
  refreshInterval.value = seconds
  if (isAutoRefresh.value) {
    startAutoRefresh()
  }
}

// Watch for route changes
watch(() => route.path, async (newPath) => {
  console.log('🔄 Cambio de ruta detectado:', newPath)
  if (newPath === '/dashboard') {
    await initializeDashboard()
  }
}, { immediate: true })

// Process management
const startProcess = (process) => {
  console.log('Starting process:', process.pid)
  // In a real app, this would call an API to start the process
  process.status = 'running'
}

const stopProcess = (process) => {
  console.log('Stopping process:', process.pid)
  // In a real app, this would call an API to stop the process
  process.status = 'stopped'
}

// Expose methods for testing
const testConnection = () => {
  console.log('Testing connection...')
  // Test connection logic here
}

defineExpose({
  testConnection,
  refreshData,
  toggleAutoRefresh
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.dashboard-content {
  padding-top: 64px; /* Adjust based on your app bar height */
  transition: all 0.3s ease;
}

.stat-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1) !important;
}

.loading-container {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.loading-card {
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease-in-out;
}

.loading-icon-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
}

.loading-spinner {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}

.spin {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .dashboard-content {
    padding-top: 56px; /* Adjust for mobile */
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
}
</style>

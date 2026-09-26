<template>
  <v-container fluid class="dashboard-container pa-6">
    <!-- Sin servidor seleccionado -->
    <v-row v-if="!serversStore.currentServer" class="fill-height" align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="text-center pa-8 no-server-card" elevation="12" rounded="xl">
          <div class="pulse-animation mb-6">
            <v-avatar color="primary" size="100" class="mb-4 elevation-8">
              <v-icon size="60">mdi-server-off</v-icon>
            </v-avatar>
          </div>
          <h2 class="text-h4 font-weight-bold mb-4 text-gradient">{{ $t('dashboard.noServerSelected') }}</h2>
          <p class="text-h6 mb-8 text-medium-emphasis">{{ $t('dashboard.selectServerToStart') }}</p>
          <v-btn 
            color="primary" 
            to="/" 
            size="x-large" 
            prepend-icon="mdi-arrow-left"
            class="hover-lift px-8"
            variant="elevated"
            rounded="xl"
          >
            {{ $t('common.back') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dashboard Principal con servidor seleccionado -->
    <div v-else class="dashboard-content">
      <!-- Header del Dashboard -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="dashboard-header" elevation="8" rounded="xl">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between flex-wrap">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="60" class="mr-4 elevation-4">
                    <v-icon size="32">mdi-server</v-icon>
                  </v-avatar>
                  <div>
                    <div class="d-flex align-center gap-3 mb-2">
                      <h1 class="text-h4 font-weight-bold">{{ serversStore.currentServer?.name }}</h1>
                      <v-btn
                        icon="mdi-arrow-left"
                        size="small"
                        variant="text"
                        to="/"
                        :title="$t('common.back')"
                      />
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-2">
                      <v-icon size="16" class="mr-1">mdi-web</v-icon>
                      {{ serversStore.currentServer?.url || 'URL no disponible' }}
                    </div>
                    <div class="d-flex align-center gap-4">
                      <v-chip 
                        :color="serverStatus ? 'success' : 'error'"
                        :prepend-icon="serverStatus ? 'mdi-check-circle' : 'mdi-close-circle'"
                        variant="flat"
                        class="px-4"
                      >
                        {{ serverStatus ? $t('common.connected') : $t('common.disconnected') }}
                      </v-chip>
                      <v-chip 
                        color="info"
                        prepend-icon="mdi-clock-outline"
                        variant="tonal"
                        v-if="lastUpdateTime !== 'Nunca'"
                      >
                        {{ lastUpdateTime }}
                      </v-chip>
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center gap-2">
                  <v-btn
                    :icon="autoRefreshEnabled ? 'mdi-pause' : 'mdi-play'"
                    :color="autoRefreshEnabled ? 'warning' : 'success'"
                    variant="tonal"
                    @click="toggleAutoRefresh"
                  />
                  <v-btn
                    icon="mdi-refresh"
                    color="primary"
                    variant="tonal"
                    :loading="isLoading"
                    @click="refreshData"
                  />
                  <v-btn
                    icon="mdi-cog"
                    color="primary"
                    variant="outlined"
                    @click="openServerConfig"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Métricas Principales -->
      <v-row class="mb-6">
        <!-- CPU Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">USO DE CPU</p>
                  <h3 class="text-h4 font-weight-bold">{{ (serverStats?.cpu?.usage || 0).toFixed(1) }}%</h3>
                </div>
                <v-avatar color="primary" size="56" variant="tonal">
                  <v-icon size="30">mdi-cpu-64-bit</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="serverStats?.cpu?.usage || 0"
                :color="getCpuColor(serverStats?.cpu?.usage || 0)"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                <v-icon size="12" :color="getCpuTrend() > 0 ? 'error' : 'success'">
                  {{ getCpuTrend() > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                {{ Math.abs(getCpuTrend()).toFixed(1) }}% vs último minuto
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Memory Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MEMORIA RAM</p>
                  <h3 class="text-h4 font-weight-bold">{{ formatBytes(serverStats?.memory?.used || 0) }}</h3>
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
                {{ memoryUsagePercentage.toFixed(1) }}% de {{ formatBytes(serverStats?.memory?.total || 0) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Models Count Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MODELOS IA</p>
                  <h3 class="text-h4 font-weight-bold">{{ serverStats?.models?.length || 0 }}</h3>
                </div>
                <v-avatar color="success" size="56" variant="tonal">
                  <v-icon size="30">mdi-robot</v-icon>
                </v-avatar>
              </div>
              <v-chip-group class="mt-2">
                <v-chip 
                  v-for="model in (serverStats?.models || []).slice(0, 2)" 
                  :key="model.name"
                  size="x-small"
                  variant="tonal"
                >
                  {{ model.name.split(':')[0] }}
                </v-chip>
                <v-chip 
                  v-if="(serverStats?.models || []).length > 2"
                  size="x-small"
                  variant="tonal"
                >
                  +{{ (serverStats?.models || []).length - 2 }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- GPU Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">GPU</p>
                  <h3 class="text-h4 font-weight-bold">{{ serverStats?.gpu?.usage || 0 }}%</h3>
                </div>
                <v-avatar color="warning" size="56" variant="tonal">
                  <v-icon size="30">mdi-gpu</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="serverStats?.gpu?.usage || 0"
                color="warning"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ serverStats?.gpu?.name || 'No GPU detectada' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráficos Profesionales -->
      <v-row class="mb-6">
        <!-- Gráfico de Uso de Recursos -->
        <v-col cols="12" lg="8">
          <v-card elevation="6" rounded="lg" class="h-100">
            <v-card-title class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <h3 class="text-h5 font-weight-bold">{{ $t('dashboard.resourceUsage') }}</h3>
                  <p class="text-caption text-medium-emphasis mt-1">{{ $t('dashboard.realTimeMonitoring') }}</p>
                </div>
                <v-btn-toggle
                  v-model="chartTimeRange"
                  mandatory
                  density="compact"
                  variant="outlined"
                >
                  <v-btn value="1h">1H</v-btn>
                  <v-btn value="6h">6H</v-btn>
                  <v-btn value="24h">24H</v-btn>
                </v-btn-toggle>
              </div>
            </v-card-title>
            <v-card-text>
              <canvas ref="resourceChart" height="300"></canvas>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Distribución de Modelos -->
        <v-col cols="12" lg="4">
          <v-card elevation="6" rounded="lg" class="h-100">
            <v-card-title class="pa-5">
              <h3 class="text-h5 font-weight-bold">{{ $t('dashboard.modelDistribution') }}</h3>
              <p class="text-caption text-medium-emphasis mt-1">{{ $t('dashboard.bySize') }}</p>
            </v-card-title>
            <v-card-text class="d-flex align-center justify-center">
              <canvas ref="modelChart" height="250"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Lista de Modelos Mejorada -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="6" rounded="lg">
            <v-card-title class="pa-5 bg-gradient-primary">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar color="white" size="40" class="mr-3 elevation-3">
                    <v-icon color="primary">mdi-robot</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-h5 font-weight-bold text-white">{{ $t('dashboard.availableModels') }}</h3>
                    <p class="text-caption text-white-50 mt-1">
                      {{ serverStats?.models?.length || 0 }} {{ $t('dashboard.modelsInstalled', { count: serverStats?.models?.length || 0 }) }}
                    </p>
                  </div>
                </div>
                <v-spacer />
                <v-text-field
                  v-model="searchModel"
                  prepend-inner-icon="mdi-magnify"
                  :placeholder="$t('dashboard.searchModel')"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mr-3"
                  style="max-width: 300px;"
                />
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="showAddModelDialog = true"
                >
                  {{ $t('dashboard.addModel') }}
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="!isLoading && (!serverStats?.models || serverStats.models.length === 0)" class="text-center pa-16">
                <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-robot-off</v-icon>
                <h3 class="text-h5 text-medium-emphasis mb-2">{{ $t('dashboard.noModels') }}</h3>
                <p class="text-body-1 text-medium-emphasis mb-6">{{ $t('dashboard.addModelToStart') }}</p>
                <v-btn color="primary" size="large" @click="showAddModelDialog = true" prepend-icon="mdi-plus">
                  {{ $t('dashboard.addFirstModel') }}
                </v-btn>
              </div>
              <v-data-table
                v-else
                :headers="modelHeaders"
                :items="filteredModels"
                :search="searchModel"
                :loading="isLoading"
                items-per-page="10"
                class="elevation-0"
              >
                <template v-slot:item.name="{ item }">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="36" class="mr-3">
                      <v-icon>mdi-robot</v-icon>
                    </v-avatar>
                    <div>
                      <div class="font-weight-medium">{{ item.name }}</div>
                      <div class="text-caption text-medium-emphasis">{{ item.digest.substring(0, 12) }}...</div>
                    </div>
                  </div>
                </template>
                <template v-slot:item.size="{ item }">
                  <v-chip size="small" variant="tonal">
                    {{ formatBytes(item.size) }}
                  </v-chip>
                </template>
                <template v-slot:item.modified_at="{ item }">
                  <div class="text-caption">
                    {{ formatDistanceToNow(new Date(item.modified_at), { locale: es, addSuffix: true }) }}
                  </div>
                </template>
                <template v-slot:item.actions="{ item }">
                  <div class="d-flex gap-1">
                    <v-btn icon="mdi-chat" size="small" variant="text" color="primary" @click="openChat(item)" />
                    <v-btn icon="mdi-download" size="small" variant="text" color="info" @click="downloadModel(item)" />
                    <v-btn icon="mdi-delete" size="small" variant="text" color="error" @click="deleteModel(item)" />
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useServersStore } from '@/stores/servers'
import { formatDistanceToNow, format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useI18n } from 'vue-i18n'
import { Chart, registerables } from 'chart.js'

// Registrar todos los componentes de Chart.js
Chart.register(...registerables)

const { t } = useI18n()
const serversStore = useServersStore()
const isLoading = ref(false)
const serverStats = ref(null)
const serverStatus = ref(false)
const lastUpdateTime = ref('Nunca')
const autoRefreshEnabled = ref(true)
const refreshIntervalTime = ref(15000)
const searchModel = ref('')
const showAddModelDialog = ref(false)
const chartTimeRange = ref('1h')
let refreshInterval = null
let chartUpdateInterval = null

// Referencias para los gráficos
const resourceChart = ref(null)
const modelChart = ref(null)
let resourceChartInstance = null
let modelChartInstance = null

// Variables para datos históricos
const historicalData = {
  cpu: [],
  memory: [],
  gpu: []
}

// Headers para la tabla de modelos
const modelHeaders = computed(() => [
  { title: t('dashboard.modelName'), key: 'name', width: '35%' },
  { title: t('dashboard.size'), key: 'size' },
  { title: t('dashboard.modified'), key: 'modified_at' },
  { title: t('dashboard.actions'), key: 'actions', sortable: false, width: '150px' }
])

// Computed properties
const currentServer = computed(() => serversStore.currentServer)

const memoryUsagePercentage = computed(() => {
  if (!serverStats.value?.memory) return 0
  const { used, total } = serverStats.value.memory
  return total > 0 ? (used / total) * 100 : 0
})

const filteredModels = computed(() => {
  return serverStats.value?.models || []
})

// Utility functions
const formatBytes = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`
}

const getCpuColor = (usage) => {
  if (usage < 50) return 'success'
  if (usage < 75) return 'warning'
  return 'error'
}

const getMemoryColor = (usage) => {
  if (usage < 60) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

const getCpuTrend = () => {
  // Simulación de tendencia
  return Math.random() > 0.5 ? Math.random() * 5 : -Math.random() * 5
}

// Model management functions
const openChat = (model) => {
  console.log('Abrir chat con el modelo:', model.name)
}

const downloadModel = (model) => {
  console.log('Descargar modelo:', model.name)
}

const deleteModel = (model) => {
  console.log('Eliminar modelo:', model.name)
}

// Generar etiquetas de tiempo
const generateTimeLabels = () => {
  const labels = []
  const now = new Date()
  const points = 12
  
  let interval = 5 // 5 minutos por defecto
  if (chartTimeRange.value === '6h') {
    interval = 30 // 30 minutos
  } else if (chartTimeRange.value === '24h') {
    interval = 120 // 2 horas
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * interval * 60000))
    labels.push(format(time, 'HH:mm'))
  }
  
  return labels
}

// Generar datos con animación suave
const generateSmoothData = (baseValue, variance = 10) => {
  const data = []
  let currentValue = baseValue
  
  for (let i = 0; i < 12; i++) {
    const change = (Math.random() - 0.5) * variance
    currentValue = Math.max(0, Math.min(100, currentValue + change))
    data.push(Math.round(currentValue * 10) / 10)
  }
  
  return data
}

// Obtener distribución de tamaños de modelos
const getModelSizeDistribution = () => {
  if (!serverStats.value?.models || serverStats.value.models.length === 0) {
    return {
      'Pequeño (<1GB)': 0,
      'Mediano (1-5GB)': 0,
      'Grande (5-10GB)': 0,
      'Muy Grande (>10GB)': 0
    }
  }
  
  const distribution = {
    'Pequeño (<1GB)': 0,
    'Mediano (1-5GB)': 0,
    'Grande (5-10GB)': 0,
    'Muy Grande (>10GB)': 0
  }
  
  serverStats.value.models.forEach(model => {
    const sizeInGB = model.size / (1024 * 1024 * 1024)
    if (sizeInGB < 1) distribution['Pequeño (<1GB)']++
    else if (sizeInGB < 5) distribution['Mediano (1-5GB)']++
    else if (sizeInGB < 10) distribution['Grande (5-10GB)']++
    else distribution['Muy Grande (>10GB)']++
  })
  
  return distribution
}

// Inicializar gráfico de recursos
const initResourceChart = () => {
  if (!resourceChart.value) return
  
  const ctx = resourceChart.value.getContext('2d')
  
  if (resourceChartInstance) {
    resourceChartInstance.destroy()
  }
  
  // Inicializar datos históricos si están vacíos
  if (historicalData.cpu.length === 0) {
    historicalData.cpu = generateSmoothData(30)
    historicalData.memory = generateSmoothData(45)
    historicalData.gpu = generateSmoothData(20)
  }
  
  resourceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(),
      datasets: [
        {
          label: 'CPU',
          data: [...historicalData.cpu],
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Memoria',
          data: [...historicalData.memory],
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'GPU',
          data: [...historicalData.gpu],
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      },
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    }
  })
}

// Inicializar gráfico de modelos
const initModelChart = () => {
  if (!modelChart.value) return
  
  const ctx = modelChart.value.getContext('2d')
  
  if (modelChartInstance) {
    modelChartInstance.destroy()
  }
  
  const modelSizes = getModelSizeDistribution()
  
  modelChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(modelSizes),
      datasets: [{
        data: Object.values(modelSizes),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#F44336'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1500
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            font: {
              size: 12
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Actualizar gráficos con animación
const updateCharts = () => {
  if (resourceChartInstance) {
    // Actualizar datos históricos
    const cpuValue = serverStats.value?.cpu?.usage || historicalData.cpu[historicalData.cpu.length - 1]
    const memValue = serverStats.value?.memory ? memoryUsagePercentage.value : historicalData.memory[historicalData.memory.length - 1]
    const gpuValue = serverStats.value?.gpu?.usage || historicalData.gpu[historicalData.gpu.length - 1]
    
    // Desplazar datos y agregar nuevos
    historicalData.cpu.shift()
    historicalData.cpu.push(cpuValue)
    historicalData.memory.shift()
    historicalData.memory.push(memValue)
    historicalData.gpu.shift()
    historicalData.gpu.push(gpuValue)
    
    // Actualizar gráfico
    resourceChartInstance.data.labels = generateTimeLabels()
    resourceChartInstance.data.datasets[0].data = [...historicalData.cpu]
    resourceChartInstance.data.datasets[1].data = [...historicalData.memory]
    resourceChartInstance.data.datasets[2].data = [...historicalData.gpu]
    resourceChartInstance.update('default')
  }
  
  if (modelChartInstance && serverStats.value?.models) {
    const modelSizes = getModelSizeDistribution()
    modelChartInstance.data.labels = Object.keys(modelSizes)
    modelChartInstance.data.datasets[0].data = Object.values(modelSizes)
    modelChartInstance.update('active')
  }
}

// Data refresh
const refreshData = async () => {
  if (!serversStore.currentServer) return false
  
  try {
    isLoading.value = true
    
    // Check server status
    const status = await serversStore.checkServerStatus()
    serverStatus.value = status
    
    // Get server stats if online
    if (serverStatus.value) {
      const stats = await serversStore.getServerStats()
      if (stats) {
        serverStats.value = stats
      }
    } else {
      serverStats.value = null
    }
    
    // Update last update time
    lastUpdateTime.value = format(new Date(), 'HH:mm:ss')
    
    return true
  } catch (error) {
    console.error('Error refreshing data:', error)
    serverStatus.value = false
    serverStats.value = null
    return false
  } finally {
    isLoading.value = false
  }
}

const openServerConfig = () => {
  console.log('Open server config')
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  } else {
    stopAutoRefresh()
  }
}

// Sistema de auto-actualización
const startAutoRefresh = () => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (chartUpdateInterval) clearInterval(chartUpdateInterval)
  
  // Actualizar gráficos cada segundo para animación suave
  chartUpdateInterval = setInterval(() => {
    if (autoRefreshEnabled.value) {
      updateCharts()
    }
  }, 1000)
  
  // Refrescar datos del servidor cada 15 segundos
  refreshInterval = setInterval(async () => {
    if (autoRefreshEnabled.value) {
      await refreshData()
    }
  }, refreshIntervalTime.value)
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
  if (chartUpdateInterval) {
    clearInterval(chartUpdateInterval)
    chartUpdateInterval = null
  }
}

// Watch para cambios de servidor
watch(() => serversStore.currentServer, async (newServer, oldServer) => {
  if (newServer && (!oldServer || newServer.id !== oldServer.id)) {
    // Limpiar datos anteriores
    serverStats.value = null
    serverStatus.value = false
    lastUpdateTime.value = 'Nunca'
    
    // Reinicializar datos históricos
    historicalData.cpu = []
    historicalData.memory = []
    historicalData.gpu = []
    
    // Cargar nuevos datos
    await refreshData()
    
    // Reinicializar gráficos
    setTimeout(() => {
      initResourceChart()
      initModelChart()
    }, 100)
  }
}, { immediate: false })

// Watch para cambios en el rango de tiempo
watch(chartTimeRange, () => {
  if (resourceChartInstance) {
    resourceChartInstance.data.labels = generateTimeLabels()
    resourceChartInstance.update('none')
  }
})

onMounted(async () => {
  await serversStore.initializeServers()
  
  if (serversStore.currentServer) {
    await refreshData()
    
    // Inicializar gráficos después de un pequeño delay
    setTimeout(() => {
      initResourceChart()
      initModelChart()
      
      if (autoRefreshEnabled.value) {
        startAutoRefresh()
      }
    }, 300)
  }
})

onUnmounted(() => {
  // Limpiar intervalos
  stopAutoRefresh()
  
  // Destruir instancias de gráficos
  if (resourceChartInstance) {
    resourceChartInstance.destroy()
    resourceChartInstance = null
  }
  if (modelChartInstance) {
    modelChartInstance.destroy()
    modelChartInstance = null
  }
})
</script>

<style scoped>
.dashboard-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  min-height: 100vh;
  position: relative;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.dashboard-content {
  position: relative;
  z-index: 1;
}

.no-server-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.stat-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.h-100 {
  height: 100%;
}

.text-white-50 {
  color: rgba(255, 255, 255, 0.5);
}
.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.no-server-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.dashboard-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>

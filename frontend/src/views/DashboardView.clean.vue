<template>
  <!-- Main Dashboard Layout -->
  <v-container fluid class="dashboard-container pa-0">
    <!-- Top Navigation Bar -->
    <v-app-bar color="white" elevation="2" height="64">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold">Server Monitor</v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        placeholder="Search servers or metrics..."
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="mr-4"
        style="max-width: 300px;"
      ></v-text-field>
      
      <!-- Notifications -->
      <v-btn icon class="mr-2">
        <v-badge color="error" content="3" dot>
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
      
      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="px-2">
            <v-avatar size="36" color="primary" class="mr-2">
              <span class="text-white">{{ userInitials }}</span>
            </v-avatar>
            <span class="text-body-1">{{ authStore.user?.username || 'User' }}</span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in userMenu"
            :key="index"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.value"
            @click="handleUserMenu(item.value)"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :value="item"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="$route.path === item.to"
          class="mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="dashboard-content">
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold">Dashboard</h1>
                <p class="text-body-1 text-medium-emphasis">Overview of your server resources and performance</p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData">
                Refresh
              </v-btn>
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
                    <div class="text-overline text-medium-emphasis">{{ stat.title }}</div>
                    <div class="text-h5 font-weight-bold mt-1">{{ stat.value }}</div>
                    <v-chip 
                      :color="stat.trend >= 0 ? 'success' : 'error'" 
                      size="small" 
                      class="mt-2"
                      variant="tonal"
                    >
                      <v-icon start size="small">
                        {{ stat.trend >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                      </v-icon>
                      {{ Math.abs(stat.trend) }}% {{ stat.trend >= 0 ? 'up' : 'down' }}
                    </v-chip>
                  </div>
                  <v-avatar :color="stat.color" size="56" class="elevation-2">
                    <v-icon size="32" color="white">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Resource Usage Graphs -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <v-card class="h-100" elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-line</v-icon>
                Resource Usage
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="resourceChart" style="height: 300px; width: 100%;"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="h-100" elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-pie</v-icon>
                Storage Distribution
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="storageChart" style="height: 300px; width: 100%;"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Active Processes -->
        <v-row>
          <v-col cols="12">
            <v-card elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                Active Processes
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table hover>
                  <thead>
                    <tr>
                      <th>Process</th>
                      <th>User</th>
                      <th>CPU %</th>
                      <th>Memory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(process, i) in activeProcesses" :key="i">
                      <td>
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="primary" class="mr-2">
                            <v-icon color="white" size="small">mdi-cog</v-icon>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium">{{ process.name }}</div>
                            <div class="text-caption text-medium-emphasis">PID: {{ process.pid }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ process.user }}</td>
                      <td>
                        <v-progress-linear
                          :model-value="process.cpu"
                          :color="getUsageColor(process.cpu)"
                          height="8" 
                          rounded
                        ></v-progress-linear>
                        <div class="text-caption text-right">{{ process.cpu }}%</div>
                      </td>
                      <td>
                        <div class="font-weight-medium">{{ formatBytes(process.memory) }}</div>
                        <div class="text-caption text-medium-emphasis">{{ process.memoryPercent }}% of total</div>
                      </td>
                      <td>
                        <v-chip 
                          :color="process.status === 'running' ? 'success' : 'warning'"
                          size="small"
                          variant="tonal"
                        >
                          {{ process.status }}
                        </v-chip>
                      </td>
                      <td>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="stopProcess(process)"
                          :loading="process.status === 'stopping'"
                        >
                          <v-icon>mdi-stop</v-icon>
                        </v-btn>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useServersStore } from '@/stores/servers'
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Register ECharts components
echarts.use([
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

// Stores
const authStore = useAuthStore()
const serversStore = useServersStore()
const router = useRouter()
const route = useRoute()

// Chart refs
const resourceChart = ref(null)
const storageChart = ref(null)
const resourceChartInstance = ref(null)
const storageChartInstance = ref(null)

// UI State
const drawer = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const autoRefreshEnabled = ref(true)
const refreshIntervalTime = ref(15000) // 15 seconds
const refreshInterval = ref(null)
let resizeTimer = null

// Navigation items
const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Servers', icon: 'mdi-server', to: '/servers' },
  { title: 'Models', icon: 'mdi-robot', to: '/models' },
  { title: 'Analytics', icon: 'mdi-chart-bar', to: '/analytics' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
  { title: 'Documentation', icon: 'mdi-help-circle', to: '/docs' },
]

// User menu
const userMenu = [
  { title: 'My Profile', icon: 'mdi-account', value: 'profile' },
  { title: 'Settings', icon: 'mdi-cog', value: 'settings' },
  { title: 'Logout', icon: 'mdi-logout', value: 'logout' },
]

// Server stats
const serverStats = ref([
  { 
    title: 'CPU Usage', 
    value: '24%', 
    trend: 2.5, 
    color: 'primary',
    icon: 'mdi-cpu-64-bit'
  },
  { 
    title: 'Memory', 
    value: '3.2/16 GB', 
    trend: -1.2, 
    color: 'success',
    icon: 'mdi-memory'
  },
  { 
    title: 'Storage', 
    value: '128/512 GB', 
    trend: 8.7, 
    color: 'warning',
    icon: 'mdi-harddisk'
  },
  { 
    title: 'Network', 
    value: '124 Kbps', 
    trend: -3.4, 
    color: 'info',
    icon: 'mdi-lan'
  },
])

// Active processes
const activeProcesses = ref([
  {
    name: 'nginx',
    pid: 1234,
    user: 'www-data',
    cpu: 12.5,
    memory: 256 * 1024 * 1024, // 256MB
    memoryPercent: 1.5,
    status: 'running'
  },
  {
    name: 'node',
    pid: 2345,
    user: 'node',
    cpu: 45.2,
    memory: 1024 * 1024 * 1024, // 1GB
    memoryPercent: 6.2,
    status: 'running'
  },
  {
    name: 'postgres',
    pid: 3456,
    user: 'postgres',
    cpu: 8.1,
    memory: 512 * 1024 * 1024, // 512MB
    memoryPercent: 3.1,
    status: 'idle'
  },
  {
    name: 'redis',
    pid: 4567,
    user: 'redis',
    cpu: 2.3,
    memory: 128 * 1024 * 1024, // 128MB
    memoryPercent: 0.8,
    status: 'sleeping'
  },
])

// Computed
const userInitials = computed(() => {
  if (!authStore.user?.username) return 'U'
  return authStore.user.username
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Methods
function handleUserMenu(action) {
  switch (action) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      authStore.logout()
      break
  }
}

function getUsageColor(usage) {
  if (usage > 80) return 'error'
  if (usage > 50) return 'warning'
  return 'success'
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function stopProcess(process) {
  console.log('Stopping process:', process.pid)
  process.status = 'stopping'
  setTimeout(() => {
    const index = activeProcesses.value.findIndex(p => p.pid === process.pid)
    if (index !== -1) {
      activeProcesses.value.splice(index, 1)
    }
  }, 1000)
}

function initCharts() {
  if (!resourceChart.value || !storageChart.value) return
  
  // Initialize resource usage chart
  const chartInstance = echarts.init(resourceChart.value)
  resourceChartInstance.value = chartInstance
  
  const resourceOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: { backgroundColor: '#6a7985' }
      }
    },
    legend: { data: ['CPU %', 'Memory %', 'Network Kbps'] },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [{
      type: 'category',
      boundaryGap: false,
      data: Array(12).fill(0).map((_, i) => `${i * 5}m`)
    }],
    yAxis: [
      {
        type: 'value',
        name: 'Usage %',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: { formatter: '{value}%' }
      },
      {
        type: 'value',
        name: 'Network',
        min: 0,
        max: 1000,
        interval: 200,
        axisLabel: { formatter: '{value} Kbps' }
      }
    ],
    series: [
      {
        name: 'CPU %',
        type: 'line',
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 118, 210, 0.8)' },
            { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
          ])
        },
        emphasis: { focus: 'series' },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 20)
      },
      {
        name: 'Memory %',
        type: 'line',
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 142, 60, 0.8)' },
            { offset: 1, color: 'rgba(56, 142, 60, 0.1)' }
          ])
        },
        emphasis: { focus: 'series' },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 20) + 10)
      },
      {
        name: 'Network Kbps',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { width: 0 },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 152, 0, 0.8)' },
            { offset: 1, color: 'rgba(255, 152, 0, 0.1)' }
          ])
        },
        emphasis: { focus: 'series' },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 400) + 100)
      }
    ]
  }
  
  chartInstance.setOption(resourceOption)

  // Initialize storage distribution chart
  const storageInstance = echarts.init(storageChart.value)
  storageChartInstance.value = storageInstance
  
  const storageOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['System', 'Applications', 'Data', 'Backups', 'Free']
    },
    series: [{
      name: 'Storage',
      type: 'pie',
      radius: ['50%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: false, position: 'center' },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: { show: false },
      data: [
        { value: 104.8, name: 'System' },
        { value: 235, name: 'Applications' },
        { value: 180, name: 'Data' },
        { value: 98.6, name: 'Backups' },
        { value: 154.8, name: 'Free' }
      ]
    }]
  }
  
  storageInstance.setOption(storageOption)
}

// Handle window resize with debounce
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    resourceChartInstance.value?.resize?.()
    storageChartInstance.value?.resize?.()
  }, 200)
}

// Auto-refresh functionality
function startAutoRefresh() {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
  refreshInterval.value = setInterval(() => {
    refreshData()
  }, refreshIntervalTime.value)
}

function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  } else if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

function refreshData() {
  // Simulate data refresh
  serverStats.value = serverStats.value.map(stat => ({
    ...stat,
    value: stat.title === 'CPU Usage' 
      ? `${Math.floor(Math.random() * 30) + 10}%`
      : stat.value,
    trend: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 10)
  }))
  
  // Re-initialize charts with new data
  if (resourceChart.value && storageChart.value) {
    initCharts()
  }
}

// Lifecycle hooks
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await nextTick() // Wait for DOM to be fully rendered
  initCharts()
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  resourceChartInstance.value?.dispose?.()
  storageChartInstance.value?.dispose?.()
  if (refreshInterval.value) clearInterval(refreshInterval.value)
})

// Expose methods for testing
defineExpose({
  refreshData,
  toggleAutoRefresh
})
</script>

<style scoped>
.dashboard-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-content {
  margin-top: 64px; /* Height of the app bar */
  transition: margin 0.3s;
}

.stat-card {
  transition: transform 0.2s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1) !important;
}

.v-table {
  background: transparent;
}

.v-table thead th {
  font-weight: 600;
  background-color: #f5f7fa;
}

.v-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02);
}
</style>

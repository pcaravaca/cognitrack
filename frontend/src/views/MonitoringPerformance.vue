<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-icon icon="mdi-chart-line" class="me-2"></v-icon>
            Rendimiento del Sistema
          </v-card-title>
          <v-card-text>
            <v-tabs v-model="tab" bg-color="primary">
              <v-tab value="cpu">Uso de CPU</v-tab>
              <v-tab value="memory">Uso de Memoria</v-tab>
              <v-tab value="disk">Uso de Disco</v-tab>
            </v-tabs>

            <v-window v-model="tab" class="mt-4">
              <v-window-item value="cpu">
                <v-card flat>
                  <v-card-text>
                    <div class="chart-container">
                      <canvas ref="cpuChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="memory">
                <v-card flat>
                  <v-card-text>
                    <div class="chart-container">
                      <canvas ref="memoryChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>

              <v-window-item value="disk">
                <v-card flat>
                  <v-card-text>
                    <div class="chart-container">
                      <canvas ref="diskChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Estadísticas del Sistema</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="stat in systemStats" :key="stat.title">
                <template v-slot:prepend>
                  <v-icon :icon="stat.icon" :color="stat.color" class="me-4"></v-icon>
                </template>
                <v-list-item-title>{{ stat.title }}</v-list-item-title>
                <v-list-item-subtitle>{{ stat.value }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Alertas Recientes</v-card-title>
          <v-card-text>
            <v-alert
              v-for="(alert, index) in recentAlerts"
              :key="index"
              :type="alert.type"
              :icon="alert.type === 'warning' ? 'mdi-alert' : 'mdi-information'"
              class="mb-2"
              variant="tonal"
            >
              {{ alert.message }}
              <template v-slot:append>
                <v-btn
                  size="small"
                  variant="text"
                  :icon="alert.expanded ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                  @click="toggleAlert(index)"
                ></v-btn>
              </template>
              <template v-slot:title>
                {{ alert.title }}
                <v-chip size="small" class="ms-2" :color="getAlertColor(alert.type)">
                  {{ alert.time }}
                </v-chip>
              </template>
              <div v-if="alert.expanded" class="mt-2">
                {{ alert.details }}
              </div>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { Chart, registerables } from 'chart.js'

// Registrar componentes de Chart.js
Chart.register(...registerables)

const tab = ref('cpu')
const cpuChart = ref<HTMLCanvasElement | null>(null)
const memoryChart = ref<HTMLCanvasElement | null>(null)
const diskChart = ref<HTMLCanvasElement | null>(null)

// Datos de ejemplo
const systemStats = ref([
  { title: 'Uso de CPU', value: '25%', icon: 'mdi-chip', color: 'primary' },
  { title: 'Uso de Memoria', value: '3.2 GB / 8 GB', icon: 'mdi-memory', color: 'info' },
  { title: 'Uso de Disco', value: '120 GB / 500 GB', icon: 'mdi-harddisk', color: 'success' },
  { title: 'Tiempo Activo', value: '2d 5h 30m', icon: 'mdi-clock-time-eight', color: 'warning' }
])

const recentAlerts = ref([
  {
    type: 'warning',
    title: 'Alto uso de CPU',
    message: 'El uso de CPU ha superado el 80%',
    details: 'El proceso "node" está utilizando el 85% de la CPU. Considere finalizar procesos innecesarios.',
    time: 'Hace 5 min',
    expanded: false
  },
  {
    type: 'info',
    title: 'Actualización disponible',
    message: 'Nueva versión del sistema disponible',
    details: 'Versión 2.3.1 disponible. Incluye mejoras de rendimiento y corrección de errores.',
    time: 'Hace 2 horas',
    expanded: false
  }
])

// Inicializar gráficos
onMounted(() => {
  if (cpuChart.value) initChart(cpuChart.value, 'CPU Usage', [65, 59, 80, 81, 56, 55, 40], 'rgba(54, 162, 235, 0.2)')
  if (memoryChart.value) initChart(memoryChart.value, 'Memory Usage', [28, 48, 40, 19, 86, 27, 90], 'rgba(75, 192, 192, 0.2)')
  if (diskChart.value) initChart(diskChart.value, 'Disk Usage', [45, 35, 50, 60, 55, 65, 70], 'rgba(153, 102, 255, 0.2)')
})

// Limpiar al desmontar
onBeforeUnmount(() => {
  if (cpuChart.value) {
    const chart = Chart.getChart(cpuChart.value)
    if (chart) chart.destroy()
  }
  if (memoryChart.value) {
    const chart = Chart.getChart(memoryChart.value)
    if (chart) chart.destroy()
  }
  if (diskChart.value) {
    const chart = Chart.getChart(diskChart.value)
    if (chart) chart.destroy()
  }
})

// Funciones de utilidad
const initChart = (canvas: HTMLCanvasElement, label: string, data: number[], color: string) => {
  return new Chart(canvas, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: label,
        data: data,
        borderColor: color.replace('0.2', '1'),
        backgroundColor: color,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        }
      }
    }
  })
}

const toggleAlert = (index: number) => {
  recentAlerts.value[index].expanded = !recentAlerts.value[index].expanded
}

const getAlertColor = (type: string) => {
  const colors: Record<string, string> = {
    warning: 'warning',
    error: 'error',
    info: 'info',
    success: 'success'
  }
  return colors[type] || 'info'
}
</script>

<style scoped>
.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}
</style>

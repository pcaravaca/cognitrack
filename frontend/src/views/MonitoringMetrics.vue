<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Métricas del Sistema</h1>
        
        <v-card class="mb-6">
          <v-card-title>Filtros</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="4">
                <v-select
                  v-model="selectedServer"
                  :items="servers"
                  item-title="name"
                  item-value="id"
                  label="Servidor"
                  return-object
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="metricType"
                  :items="metricTypes"
                  label="Tipo de Métrica"
                ></v-select>
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="timeRange"
                  :items="timeRanges"
                  label="Rango de Tiempo"
                ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <v-row>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Gráfico de Métricas</v-card-title>
              <v-card-text>
                <div style="height: 400px;">
                  <canvas ref="metricsChart"></canvas>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="6">
            <v-card>
              <v-card-title>Estadísticas</v-card-title>
              <v-card-text>
                <v-table>
                  <thead>
                    <tr>
                      <th>Métrica</th>
                      <th>Valor</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(stat, i) in stats" :key="i">
                      <td>{{ stat.name }}</td>
                      <td>{{ stat.value }}</td>
                      <td>
                        <v-icon :color="getStatusColor(stat.status)" size="small">
                          {{ getStatusIcon(stat.status) }}
                        </v-icon>
                        {{ stat.status }}
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const selectedServer = ref(null)
const metricType = ref('cpu')
const timeRange = ref('24h')

const servers = [
  { id: 1, name: 'Servidor Web' },
  { id: 2, name: 'Base de Datos' },
  { id: 3, name: 'Servidor de Correo' }
]

const metricTypes = [
  { title: 'Uso de CPU', value: 'cpu' },
  { title: 'Uso de Memoria', value: 'memory' },
  { title: 'Uso de Disco', value: 'disk' },
  { title: 'Uso de Red', value: 'network' }
]

const timeRanges = [
  { title: 'Última hora', value: '1h' },
  { title: 'Últimas 24 horas', value: '24h' },
  { title: 'Últimos 7 días', value: '7d' },
  { title: 'Últimos 30 días', value: '30d' }
]

const stats = ref([
  { name: 'Uso de CPU', value: '45%', status: 'normal' },
  { name: 'Uso de Memoria', value: '68%', status: 'warning' },
  { name: 'Espacio en Disco', value: '82%', status: 'critical' },
  { name: 'Ancho de Banda', value: '32%', status: 'normal' }
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'normal': 'success',
    'warning': 'warning',
    'critical': 'error'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    'normal': 'mdi-check-circle',
    'warning': 'mdi-alert',
    'critical': 'mdi-alert-circle'
  }
  return icons[status] || 'mdi-help-circle'
}

// Inicializar gráficos
onMounted(() => {
  initializeChart()
})

// Observar cambios en los filtros
watch([selectedServer, metricType, timeRange], () => {
  // Actualizar datos del gráfico
  updateChart()
})

const initializeChart = () => {
  // Inicializar gráfico con datos de ejemplo
  // Implementar lógica real aquí
}

const updateChart = () => {
  // Actualizar gráfico según los filtros seleccionados
  // Implementar lógica real aquí
}
</script>

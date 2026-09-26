import { ref } from 'vue'

export function useMetricsService() {
  const metricsData = ref({
    cpu: [],
    memory: [],
    gpu: []
  })

  const getMemoryChartData = (timeRange) => {
    // Generar datos simulados para el gráfico de memoria
    const labels = []
    const data = []
    
    for (let i = 0; i < timeRange; i++) {
      labels.push(`-${timeRange - i}m`)
      data.push(Math.floor(Math.random() * 40 + 40)) // Valores entre 40-80
    }
    
    return {
      labels,
      datasets: [{
        label: 'Memoria',
        data,
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.1)'
      }]
    }
  }

  const getCpuChartData = (timeRange) => {
    // Generar datos simulados para el gráfico de CPU
    const labels = []
    const data = []
    
    for (let i = 0; i < timeRange; i++) {
      labels.push(`-${timeRange - i}m`)
      data.push(Math.floor(Math.random() * 30 + 20)) // Valores entre 20-50
    }
    
    return {
      labels,
      datasets: [{
        label: 'CPU',
        data,
        borderColor: '#2196F3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)'
      }]
    }
  }

  const getGpuChartData = (timeRange) => {
    // Generar datos simulados para el gráfico de GPU
    const labels = []
    const data = []
    
    for (let i = 0; i < timeRange; i++) {
      labels.push(`-${timeRange - i}m`)
      data.push(Math.floor(Math.random() * 60 + 10)) // Valores entre 10-70
    }
    
    return {
      labels,
      datasets: [{
        label: 'GPU',
        data,
        borderColor: '#FF9800',
        backgroundColor: 'rgba(255, 152, 0, 0.1)'
      }]
    }
  }

  return {
    metricsData,
    getMemoryChartData,
    getCpuChartData,
    getGpuChartData
  }
}

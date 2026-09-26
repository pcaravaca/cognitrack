import api from './api'

// Interfaces para las métricas
export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    temperature?: number
  }
  memory: {
    total: number
    used: number
    available: number
    percentage: number
  }
  gpu?: {
    usage: number
    memory_used: number
    memory_total: number
    temperature?: number
    power_consumption?: number
  }
  disk: {
    total: number
    used: number
    available: number
    percentage: number
  }
  network: {
    download_speed: number
    upload_speed: number
    total_downloaded: number
    total_uploaded: number
  }
  timestamp: string
}

export interface OllamaMetrics {
  status: 'online' | 'offline' | 'error'
  version?: string
  models: OllamaModel[]
  running_models: RunningModel[]
  total_memory_usage: number
  uptime?: number
}

export interface OllamaModel {
  name: string
  size: number
  digest: string
  modified_at: string
  details?: {
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
}

export interface RunningModel {
  name: string
  size: number
  digest: string
  expires_at: string
  size_vram: number
}

export interface ServerHealth {
  status: 'healthy' | 'warning' | 'error'
  latency: number
  last_check: string
  errors?: string[]
}

// Servicio de métricas
class MetricsService {
  private metricsHistory: SystemMetrics[] = []
  private maxHistorySize = 100

  /**
   * Obtener métricas del sistema actual
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    try {
      const response = await api.get('/v1/metrics/system')
      return response.data
    } catch (error: any) {
      console.warn('Endpoint /v1/metrics/system no disponible, usando datos mock')
      // Retornar datos mock cuando el endpoint no esté disponible
      return {
        cpu: {
          usage: Math.floor(Math.random() * 100),
          cores: 8,
          temperature: 45 + Math.floor(Math.random() * 30)
        },
        memory: {
          used: Math.floor(Math.random() * 16),
          total: 16,
          available: 16 - Math.floor(Math.random() * 16),
          percentage: Math.floor(Math.random() * 100)
        },
        disk: {
          used: Math.floor(Math.random() * 500),
          total: 1000,
          available: 1000 - Math.floor(Math.random() * 500),
          percentage: Math.floor(Math.random() * 100)
        },
        network: {
          download_speed: Math.floor(Math.random() * 100),
          upload_speed: Math.floor(Math.random() * 50),
          total_downloaded: Math.floor(Math.random() * 1024 * 1024 * 1024 * 1024),
          total_uploaded: Math.floor(Math.random() * 500 * 1024 * 1024 * 1024)
        },
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Obtener métricas de Ollama
   */
  async getOllamaMetrics(): Promise<OllamaMetrics> {
    try {
      const response = await api.get('/v1/metrics/ollama')
      return response.data
    } catch (error: any) {
      console.warn('Endpoint /v1/metrics/ollama no disponible, usando datos mock')
      // Retornar datos mock cuando el endpoint no esté disponible
      return {
        status: 'online',
        version: '0.1.20',
        models: [
          { name: 'llama2:7b', size: 3.8, digest: 'mock-digest', modified_at: new Date().toISOString() },
          { name: 'codellama:7b', size: 3.8, digest: 'mock-digest', modified_at: new Date().toISOString() }
        ],
        running_models: [
          { name: 'llama2:7b', size: 3.8, digest: 'mock-digest', expires_at: new Date().toISOString(), size_vram: 8 },
          { name: 'codellama:7b', size: 3.8, digest: 'mock-digest', expires_at: new Date().toISOString(), size_vram: 8 }
        ],
        total_memory_usage: Math.floor(Math.random() * 8),
        uptime: Math.floor(Math.random() * 1000)
      }
    }
  }

  /**
   * Verificar salud del servidor
   */
  async getServerHealth(): Promise<ServerHealth> {
    try {
      const start = Date.now()
      const response = await api.get('/v1/health')
      const latency = Date.now() - start
      
      return {
        status: response.data.status === 'ok' ? 'healthy' : 'error',
        latency,
        last_check: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Error verificando salud del servidor:', error)
      return {
        status: 'error',
        latency: -1,
        last_check: new Date().toISOString(),
        errors: [error?.message || 'Error desconocido']
      }
    }
  }

  /**
   * Obtener historial de métricas
   */
  getMetricsHistory(minutes: number = 60): SystemMetrics[] {
    const cutoffTime = Date.now() - (minutes * 60 * 1000)
    return this.metricsHistory.filter(metric => 
      new Date(metric.timestamp).getTime() > cutoffTime
    )
  }

  /**
   * Obtener datos para gráfico de CPU
   */
  getCpuChartData(minutes: number = 60): { time: number; usage: number }[] {
    return this.getMetricsHistory(minutes).map(metric => ({
      time: new Date(metric.timestamp).getTime(),
      usage: metric.cpu.usage
    }))
  }

  /**
   * Obtener datos para gráfico de memoria
   */
  getMemoryChartData(minutes: number = 60): { time: number; usage: number }[] {
    return this.getMetricsHistory(minutes).map(metric => ({
      time: new Date(metric.timestamp).getTime(),
      usage: metric.memory.percentage
    }))
  }

  /**
   * Obtener datos para gráfico de GPU (si disponible)
   */
  getGpuChartData(minutes: number = 60): { time: number; usage: number; memory: number }[] {
    return this.getMetricsHistory(minutes)
      .filter(metric => metric.gpu)
      .map(metric => ({
        time: new Date(metric.timestamp).getTime(),
        usage: metric.gpu!.usage,
        memory: (metric.gpu!.memory_used / metric.gpu!.memory_total) * 100
      }))
  }

  /**
   * Agregar métricas al historial
   */
  private addToHistory(metrics: SystemMetrics) {
    this.metricsHistory.push(metrics)
    
    // Mantener solo las últimas métricas
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory = this.metricsHistory.slice(-this.maxHistorySize)
    }
  }

  /**
   * Generar métricas simuladas para desarrollo/fallback
   */
  private getSimulatedMetrics(): SystemMetrics {
    return {
      cpu: {
        usage: Math.random() * 30 + 20, // 20-50%
        cores: 8,
        temperature: Math.random() * 20 + 45 // 45-65°C
      },
      memory: {
        total: 16 * 1024 * 1024 * 1024, // 16GB
        used: Math.random() * 8 * 1024 * 1024 * 1024 + 4 * 1024 * 1024 * 1024, // 4-12GB
        available: 0,
        percentage: 0
      },
      gpu: {
        usage: Math.random() * 40 + 10, // 10-50%
        memory_used: Math.random() * 4 * 1024 * 1024 * 1024, // 0-4GB
        memory_total: 8 * 1024 * 1024 * 1024, // 8GB
        temperature: Math.random() * 25 + 50, // 50-75°C
        power_consumption: Math.random() * 100 + 150 // 150-250W
      },
      disk: {
        total: 1024 * 1024 * 1024 * 1024, // 1TB
        used: Math.random() * 500 * 1024 * 1024 * 1024, // 0-500GB
        available: 0,
        percentage: 0
      },
      network: {
        download_speed: Math.random() * 100, // 0-100 MB/s
        upload_speed: Math.random() * 50, // 0-50 MB/s
        total_downloaded: Math.random() * 1024 * 1024 * 1024 * 1024, // 0-1TB
        total_uploaded: Math.random() * 500 * 1024 * 1024 * 1024 // 0-500GB
      },
      timestamp: new Date().toISOString()
    }
  }
}

export const metricsService = new MetricsService()
export default metricsService

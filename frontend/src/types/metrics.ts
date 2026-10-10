// Tipos para métricas del sistema
export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
    model?: string
    temperature?: number
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
    percentage?: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
    percentage?: number
  }
  network: {
    bytesSent: number
    bytesReceived: number
    in?: number
    out?: number
    connections: number
  }
  gpu?: {
    usage: number
    name?: string
    temperature?: number
    memory?: {
      total: number
      used: number
    }
  }
  models: Array<{
    name: string
    size: number
    modified: string
  }>
  version: string
  status: 'online' | 'offline' | 'error' | 'warning' | 'maintenance' | 'simulated'
  updatedAt: string
  isBackendAvailable?: boolean
  lastChecked?: string
  error?: string
}

// Tipos para métricas de Ollama
export interface OllamaModelMetrics {
  name: string
  size: number
  modified_at: string
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
  }
  expires_at?: string
  lora?: {
    base_model_name: string
  }
  type?: string
}

export interface OllamaProcess {
  name: string
  pid: number
  model_size: number
  memory: {
    utilizations: {
      cpu: number
      vram: number
    }
    num_tensors: number
    sizes: {
      kv: number
      activations: number
    }
  }
  time: number
}

export interface OllamaMetrics {
  server: string
  status: 'online' | 'offline' | 'error'
  models: OllamaModelMetrics[]
  total_memory_usage: number
  processes?: OllamaProcess[]
  uptime: number
  timestamp: string
  error?: string
}

// Respuesta de métricas combinadas
export interface MetricsResponse {
  system: SystemMetrics | null
  ollama: OllamaMetrics | null
}
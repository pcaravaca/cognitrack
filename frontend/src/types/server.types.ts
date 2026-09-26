// Tipos básicos para el servidor
export interface ServerStats {
  cpu: {
    usage: number
    cores: number
    model: string
    temperature?: number
  }
  memory: {
    total: number
    used: number
    free: number
    usage: number
  }
  disk: {
    total: number
    used: number
    free: number
    usage: number
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
  status: 'online' | 'offline' | 'error' | 'warning' | 'maintenance'
  updatedAt: string
  isBackendAvailable?: boolean
  lastChecked?: string
  error?: string
}

export interface Server {
  id: number
  name: string
  ip: string
  port?: number
  status: 'online' | 'offline' | 'error' | 'warning' | 'maintenance'
  isBackendAvailable?: boolean
  lastChecked?: string
  error?: string
  isConnecting?: boolean
  stats?: ServerStats
  models?: Array<{
    name: string
    size: number
    modified: string
  }>
  version?: string
  uptime?: string
  cpu?: number
  memory?: number
  disk?: number
  network?: {
    bytesSent: number
    bytesReceived: number
    in?: number
    out?: number
    connections: number
  }
  lastBackup?: string
  updatedAt: string
  description?: string
  location?: string
  os?: string
  [key: string]: any
}

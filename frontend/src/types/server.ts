export interface Server {
  id: number
  name: string
  ip: string
  port?: number
  status: 'online' | 'offline' | 'maintenance' | 'warning' | 'error'
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
    out: number
    connections: number
  }
  models: any[]
  version: string
  uptime: string
  lastBackup: string
  description?: string
  location?: string
  os?: string
  tags?: string[]
  alerts?: ServerAlert[]
  services?: ServerService[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export interface ServerAlert {
  id: number
  type: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'security'
  level: 'info' | 'warning' | 'error' | 'critical'
  message: string
  timestamp: string
  resolved: boolean
}

export interface ServerResources {
  cpu: {
    cores: number
    usage: number
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
    in: number
    out: number
    connections: number
  }
}

export interface ServerService {
  id: string
  name: string
  status: 'running' | 'stopped' | 'failed' | 'starting' | 'stopping'
  uptime?: string
  cpuUsage?: number
  memoryUsage?: number
  description?: string
}

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Server } from '@/types/server'

export const useServersStore = defineStore('servers', () => {
  const servers = ref<Server[]>([])
  const currentServer = ref<Server | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Función para obtener servidor por ID
  const getServerById = (id: number) => {
    return servers.value.find(server => server.id === id) || null
  }

  // Función para remover servidor
  function removeServer(serverId: number) {
    const index = servers.value.findIndex(s => s.id === serverId)
    if (index !== -1) {
      servers.value.splice(index, 1)
      if (currentServer.value?.id === serverId) {
        currentServer.value = null
      }
    }
  }

  // Función para verificar estado del servidor
  async function checkServerStatus(serverId: number): Promise<'online' | 'offline'> {
    return Math.random() > 0.5 ? 'online' : 'offline'
  }

  // Función para inicializar servidores con datos de ejemplo
  function initializeServers() {
    console.log(' Inicializando servidores...')
    servers.value = [
      {
        id: 1,
        name: 'Servidor de Producción',
        ip: '192.168.0.104',
        status: 'online',
        cpu: 25,
        memory: 60,
        disk: 45,
        uptime: '15d 6h 23m',
        lastBackup: '2023-05-15T08:30:00Z'
      },
      {
        id: 2,
        name: 'Servidor de Desarrollo',
        ip: '192.168.0.105',
        status: 'warning',
        cpu: 85,
        memory: 75,
        disk: 30,
        uptime: '7d 2h 10m',
        lastBackup: '2023-05-10T14:15:00Z'
      }
    ]
  }

  // Cargar servidores del localStorage al iniciar
  function loadServers() {
    const savedServers = localStorage.getItem('ollamaServers')
    if (savedServers) {
      try {
        const parsed = JSON.parse(savedServers)
        servers.value = parsed.map((s: any) => ({
          ...s,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date()
        }))
        
        // Cargar el servidor por defecto o el primero
        const defaultServer = servers.value.find(s => s.isDefault) || servers.value[0]
        if (defaultServer) {
          setCurrentServer(defaultServer.id)
        }
      } catch (e) {
        console.error('Error al cargar servidores:', e)
        servers.value = []
      }
    }
  }

  // Guardar servidores en localStorage
  function saveServers() {
    localStorage.setItem('ollamaServers', JSON.stringify(servers.value))
  }

  // Obtener un servidor por ID
  function getServerById(id: string): Server | undefined {
    return servers.value.find(s => s.id === id)
  }

  // Establecer el servidor actual
  function setCurrentServer(id: string) {
    const server = getServerById(id)
    if (server) {
      currentServer.value = server
      localStorage.setItem('currentServerId', id)
    }
  }

  // Crear un nuevo servidor
  function createServer(serverData: Omit<Server, 'id' | 'createdAt' | 'updatedAt'>) {
    const newServer: Server = {
      ...serverData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    // Si es el primer servidor, marcarlo como predeterminado
    if (servers.value.length === 0) {
      newServer.isDefault = true
    }
    
    servers.value.push(newServer)
    saveServers()
    setCurrentServer(newServer.id)
    return newServer
  }

  // Actualizar un servidor existente
  function updateServer(id: string, updates: Partial<Omit<Server, 'id'>>) {
    const index = servers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      servers.value[index] = {
        ...servers.value[index],
        ...updates,
        updatedAt: new Date()
      }
      saveServers()
      
      // Si es el servidor actual, actualizarlo
      if (currentServer.value?.id === id) {
        currentServer.value = { ...servers.value[index] }
      }
      
      return servers.value[index]
    }
    return null
  }

  // Eliminar un servidor
  function deleteServer(id: string) {
    const index = servers.value.findIndex(s => s.id === id)
    if (index !== -1) {
      // Si es el servidor actual, cambiar al predeterminado
      if (currentServer.value?.id === id) {
        const otherServer = servers.value.find(s => s.id !== id)
        if (otherServer) {
          setCurrentServer(otherServer.id)
        } else {
          currentServer.value = null
        }
      }
      
      // Eliminar el servidor
      servers.value.splice(index, 1)
      saveServers()
      return true
    }
    return false
  }

  // Obtener la URL base del servidor actual
  function getCurrentServerUrl(): string | null {
    if (!currentServer.value) {
      return null
    }
    return currentServer.value.url
  }

  // Construir una URL completa para una ruta de API específica
  function buildApiUrl(path: string): string | null {
    const baseUrl = getCurrentServerUrl()
    if (!baseUrl) {
      return null
    }
    // Asegurar que el path no comience con barra si la URL base ya termina con una
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path
    return `${baseUrl}/api/${normalizedPath}`
  }
  
  // Obtener estadísticas del servidor
  async function getServerStats() {
    isLoading.value = true
    error.value = null
    
    if (!currentServer.value) {
      error.value = 'No hay servidor seleccionado'
      return null
    }
    
    // Usar las URLs construidas con los datos del servidor actual
    try {
      // Hacer las peticiones al servidor configurado por el usuario
      const tagsUrl = buildApiUrl('tags')
      const versionUrl = buildApiUrl('version')
      
      if (!tagsUrl || !versionUrl) {
        throw new Error('URL del servidor inválida')
      }
      
      const [modelsRes, versionRes] = await Promise.all([
        fetch(tagsUrl),
        fetch(versionUrl)
      ])

      if (!modelsRes.ok || !versionRes.ok) {
        throw new Error('Error al obtener datos del servidor')
      }

      const modelsData = await modelsRes.json()
      const versionData = await versionRes.json()

      return {
        models: modelsData.models || [],
        version: versionData.version || 'Desconocida',
        totalMemory: versionData.total_memory || 0,
        freeMemory: versionData.free_memory || 0,
        lastChecked: new Date()
      }
    } catch (err) {
      console.error('Error al obtener estadísticas:', err)
      error.value = 'Error al conectar con el servidor'
      return null
    } finally {
      isLoading.value = false
    }
  }

  // Generar un ID único
  function generateId() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15)
  }

  // Función para inicializar manualmente
  function initializeServers() {
    console.log('🚀 Inicializando conexión con servidor Ollama...')
    loadServers()
  }

  return {
    servers,
    currentServer,
    isLoading,
    error,
    initializeServers,
    loadServers,
    getServerById,
    setCurrentServer,
    createServer,
    updateServer,
    deleteServer,
    checkServerStatus,
    getServerStats,
    // Computed properties
    defaultServer: computed(() => servers.value.find(s => s.isDefault)),
    onlineServers: computed(() => 
      servers.value.filter(s => s.lastChecked && new Date(s.lastChecked).getTime() > Date.now() - 30000)
    )
  }
})

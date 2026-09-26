import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Server } from '@/types/server'

export const useServersStore = defineStore('servers', () => {
  const servers = ref<Server[]>([])
  const currentServer = ref<Server | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getServerById = (id: number) => {
    return servers.value.find(server => server.id === id) || null
  }

  const fetchServers = async () => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: Implementar llamada real a la API
      // const response = await serverService.getServers()
      // servers.value = response.data
      
      // Datos de prueba
      servers.value = [
        {
          id: 1,
          name: 'Servidor de Producción',
          ip: '192.168.1.100',
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
          ip: '192.168.1.101',
          status: 'warning',
          cpu: 85,
          memory: 75,
          disk: 30,
          uptime: '7d 2h 10m',
          lastBackup: '2023-05-10T14:15:00Z'
        }
      ]
    } catch (err) {
      error.value = 'Error al cargar los servidores'
      console.error('Error fetching servers:', err)
    } finally {
      isLoading.value = false
    }
  }

  const fetchServer = async (id: number) => {
    isLoading.value = true
    error.value = null
    try {
      // TODO: Implementar llamada real a la API
      // const response = await serverService.getServer(id)
      // currentServer.value = response.data
      
      // Datos de prueba
      const server = servers.value.find(s => s.id === id)
      if (server) {
        currentServer.value = { ...server }
      } else {
        // Si no está en la lista, simulamos una carga
        currentServer.value = {
          id,
          name: `Servidor ${id}`,
          ip: `192.168.1.${id}`,
          status: 'online',
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
          disk: Math.floor(Math.random() * 100),
          uptime: '1d 2h 30m',
          lastBackup: new Date().toISOString()
        }
      }
    } catch (err) {
      error.value = 'Error al cargar el servidor'
      console.error(`Error fetching server ${id}:`, err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    servers,
    currentServer,
    isLoading,
    error,
    getServerById,
    fetchServers,
    fetchServer
  }
})

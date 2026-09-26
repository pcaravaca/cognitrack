import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Server, ServerStats } from '@/types/server.types'

// Clave para almacenar los servidores en localStorage
const SERVERS_STORAGE_KEY = 'cognitrack_servers';

// Función para verificar un servidor Ollama
async function checkOllamaServer(ip: string, port: number = 11434): Promise<{ success: boolean; error?: string }> {
  const isDevelopment = import.meta.env.DEV;
  
  if (isDevelopment) {
    console.warn('Modo desarrollo: Usando datos simulados para el servidor Ollama');
    return new Promise((resolve) => {
      setTimeout(() => resolve({ success: true }), 500);
    });
  }

  try {
    const response = await fetch(`http://${ip}:${port}/api/tags`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      return { 
        success: false, 
        error: error.error || `Error: ${response.status} ${response.statusText}`
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error al verificar el servidor Ollama:', error);
    return {
      success: false,
      error: (error instanceof Error ? error.message : 'Error desconocido al verificar el servidor Ollama') || undefined
    };
  }
}

// Función para cargar servidores desde localStorage
function loadServersFromStorage(): Server[] {
  try {
    const saved = localStorage.getItem(SERVERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error al cargar servidores desde localStorage:', error);
  }
  return [];
}

// Función para guardar servidores en localStorage
function saveServersToStorage(servers: Server[]): void {
  try {
    localStorage.setItem(SERVERS_STORAGE_KEY, JSON.stringify(servers));
  } catch (error) {
    console.error('Error al guardar servidores en localStorage:', error);
  }
}

export const useServersStore = defineStore('servers', () => {
  // Estado
  const servers = ref<Server[]>([]);
  const currentServer = ref<Server | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const connectionStatus = ref<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const connectionError = ref<string | null>(null);
  const isBackendAvailable = ref(true);
  const lastBackendCheck = ref<Date | null>(null);

  // Getters computados
  const onlineServers = computed(() => 
    servers.value.filter((s: Server) => s.status === 'online')
  );
  
  const offlineServers = computed(() => 
    servers.value.filter((s: Server) => s.status === 'offline')
  );
  
  const errorServers = computed(() => 
    servers.value.filter((s: Server) => s.status === 'error')
  );

  // Acciones
  async function initializeServers() {
    try {
      console.log('🔍 Inicializando servidores...');
      const isDevelopment = import.meta.env.DEV;
      
      // Cargar servidores guardados o usar el servidor local por defecto
      const storedServers = loadServersFromStorage();
      
      if (storedServers.length > 0) {
        servers.value = storedServers;
      } else {
        // Crear un servidor local por defecto
        const defaultServer: Server = {
          id: 1,
          name: 'Servidor Local',
          ip: 'localhost',
          port: 11434,
          status: 'online',
          isBackendAvailable: true,
          lastChecked: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(isDevelopment ? {
            stats: {
              cpu: { 
                usage: 45, 
                cores: 8, 
                model: 'Intel(R) Core(TM) i7-10700K',
                temperature: 65
              },
              memory: { 
                total: 32 * 1024 * 1024 * 1024, 
                used: 12 * 1024 * 1024 * 1024, 
                free: 20 * 1024 * 1024 * 1024, 
                usage: 37.5 
              },
              disk: { 
                total: 1000 * 1024 * 1024 * 1024, 
                used: 250 * 1024 * 1024 * 1024, 
                free: 750 * 1024 * 1024 * 1024, 
                usage: 25 
              },
              network: { 
                bytesSent: 1024 * 1024, 
                bytesReceived: 2 * 1024 * 1024, 
                connections: 5,
                in: 1024 * 1024,
                out: 512 * 1024
              },
              models: [{
                name: 'llama2:latest',
                size: 3826562609,
                modified: new Date().toISOString()
              }],
              version: '0.1.0',
              status: 'online',
              updatedAt: new Date().toISOString(),
              isBackendAvailable: true,
              lastChecked: new Date().toISOString()
            }
          } : {})
        };
        servers.value = [defaultServer];
        saveServersToStorage(servers.value);
      }
      
      // En modo desarrollo, no es necesario verificar el servidor
      if (isDevelopment) {
        console.log('🔧 Modo desarrollo: Usando datos simulados');
        return;
      }
      
      // Verificar estado de los servidores
      for (const server of servers.value) {
        try {
          const { success, error } = await checkOllamaServer(server.ip, server.port);
          console.log(`Estado del servidor ${server.name}:`, { success, error });
          
          await updateServer(server.id, {
            status: success ? 'online' : 'offline',
            isBackendAvailable: success,
            lastChecked: new Date().toISOString(),
            error: error || undefined
          });
          
          if (success) {
            // Intentar obtener estadísticas si el servidor está en línea
            try {
              await getServerStats(server.id);
            } catch (statsError) {
              console.warn(`No se pudieron obtener estadísticas para ${server.name}:`, statsError);
            }
          }
        } catch (serverError) {
          console.error(`Error al verificar servidor ${server.name}:`, serverError);
          await updateServer(server.id, {
            status: 'error',
            isBackendAvailable: false,
            lastChecked: new Date().toISOString(),
            error: (serverError instanceof Error ? serverError.message : 'Error desconocido al verificar el servidor') || undefined
          });
        }
      }
      
    } catch (error) {
      console.error('Error al inicializar servidores:', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  // Función para actualizar un servidor
  async function updateServer(serverId: number, updates: Partial<Server>): Promise<void> {
    const index = servers.value.findIndex(s => s.id === serverId);
    if (index !== -1) {
      servers.value[index] = { ...servers.value[index], ...updates, updatedAt: new Date().toISOString() };
      saveServersToStorage(servers.value);
    }
  }

  // Función para obtener estadísticas del servidor
  async function getServerStats(serverId?: number): Promise<ServerStats> {
    const server = serverId ? servers.value.find(s => s.id === serverId) : currentServer.value;
    if (!server) {
      throw new Error('Servidor no encontrado');
    }

    // En desarrollo, retornar datos simulados
    if (import.meta.env.DEV) {
      console.log('🔧 Modo desarrollo: Usando datos simulados para estadísticas');
      const now = new Date().toISOString();
      const stats: ServerStats = {
        cpu: { 
          usage: Math.floor(Math.random() * 100),
          cores: 8,
          model: 'Intel(R) Core(TM) i7-10700K',
          temperature: Math.floor(Math.random() * 30) + 40 // 40-70°C
        },
        memory: {
          total: 32 * 1024 * 1024 * 1024,
          used: 8 * 1024 * 1024 * 1024 + Math.floor(Math.random() * 4 * 1024 * 1024 * 1024),
          free: 24 * 1024 * 1024 * 1024 - Math.floor(Math.random() * 4 * 1024 * 1024 * 1024),
          usage: 25 + Math.floor(Math.random() * 20) // 25-45%
        },
        disk: {
          total: 1000 * 1024 * 1024 * 1024,
          used: 200 * 1024 * 1024 * 1024 + Math.floor(Math.random() * 100 * 1024 * 1024 * 1024),
          free: 800 * 1024 * 1024 * 1024 - Math.floor(Math.random() * 100 * 1024 * 1024 * 1024),
          usage: 20 + Math.floor(Math.random() * 10) // 20-30%
        },
        network: {
          bytesSent: 1024 * 1024 + Math.floor(Math.random() * 1024 * 1024),
          bytesReceived: 2 * 1024 * 1024 + Math.floor(Math.random() * 1024 * 1024),
          connections: 5 + Math.floor(Math.random() * 10) // 5-15 conexiones
        },
        models: [{
          name: 'llama2:latest',
          size: 3826562609,
          modified: new Date().toISOString()
        }],
        version: '0.1.0',
        status: 'online',
        updatedAt: now,
        isBackendAvailable: true,
        lastChecked: now
      };

      await updateServer(server.id, { stats });
      return stats;
    }

    // Código para producción
    try {
      const response = await fetch(`http://${server.ip}:${server.port || 11434}/api/tags`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const stats: ServerStats = {
        cpu: { 
          usage: 0, 
          cores: 8, 
          model: 'Desconocido',
          temperature: 0
        },
        memory: { 
          total: 0, 
          used: 0, 
          free: 0, 
          usage: 0 
        },
        disk: { 
          total: 0, 
          used: 0, 
          free: 0, 
          usage: 0 
        },
        network: { 
          bytesSent: 0, 
          bytesReceived: 0, 
          connections: 0 
        },
        models: data.models || [],
        version: '0.1.0',
        status: 'online',
        updatedAt: new Date().toISOString(),
        isBackendAvailable: true,
        lastChecked: new Date().toISOString()
      };

      await updateServer(server.id, { stats });
      return stats;
      
    } catch (error) {
      console.error('Error al obtener estadísticas del servidor:', error);
      throw error;
    }
  }

  // Retornar el store
  return {
    // Estado
    servers,
    currentServer,
    isLoading,
    error,
    connectionStatus,
    connectionError,
    
    // Getters
    onlineServers,
    offlineServers,
    errorServers,
    
    // Acciones
    initializeServers,
    updateServer,
    getServerStats,
    
    // Utilidades
    loadServersFromStorage,
    saveServersToStorage,
    checkOllamaServer,
    
    // Propiedades computadas
    isBackendAvailable: computed(() => isBackendAvailable.value),
    lastBackendCheck: computed(() => lastBackendCheck.value)
  };
});
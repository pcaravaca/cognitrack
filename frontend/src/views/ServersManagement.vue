<template>
  <v-container fluid class="servers-management">
    <v-row>
      <v-col cols="12">
        <!-- Header con acciones principales / Header with main actions -->
        <div class="d-flex justify-space-between align-center mb-6">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              🌐 {{ $t('servers.management.title') }}
            </h1>
            <p class="text-subtitle-1 text-medium-emphasis">
              {{ $t('servers.management.subtitle') }}
            </p>
          </div>
          
          <div class="d-flex gap-2">
            <!-- Botón de descubrimiento automático / Auto-discovery button -->
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-radar"
              :loading="discovering"
              @click="discoverServers"
            >
              {{ $t('servers.actions.discover') }}
            </v-btn>
            
            <!-- Botón para agregar servidor manualmente / Add server manually button -->
            <v-btn
              color="success"
              variant="outlined"
              prepend-icon="mdi-plus"
              @click="showAddDialog = true"
            >
              {{ $t('servers.actions.add') }}
            </v-btn>
          </div>
        </div>
        
        <!-- Estado del descubrimiento / Discovery status -->
        <v-alert
          v-if="discoveryStatus"
          :type="discoveryStatus.type"
          :title="discoveryStatus.title"
          :text="discoveryStatus.message"
          class="mb-4"
          closable
          @click:close="discoveryStatus = null"
        />
        
        <!-- Mensaje de error de inicialización -->
        <v-alert
          v-if="initializationError"
          type="error"
          class="mb-4"
          :title="$t('common.error')"
          :text="initializationError"
          closable
          @click:close="initializationError = null"
        />
        
        <!-- Lista de servidores / Servers list -->
        <v-card class="mb-4">
          <v-card-title class="d-flex align-center">
            <v-icon class="me-2">mdi-server-network</v-icon>
            {{ $t('servers.list.title') }}
            <v-spacer />
            <v-chip
              :color="servers.length > 0 ? 'success' : 'warning'"
              variant="flat"
              size="small"
            >
              {{ servers.length }} {{ $t('servers.list.count') }}
            </v-chip>
          </v-card-title>
          
          <!-- Mensaje cuando no hay servidores -->
          <v-card-text v-if="!loadingServers && servers.length === 0">
            <v-alert
              type="info"
              variant="tonal"
              class="mb-0"
            >
              <template v-slot:title>
                <div class="d-flex align-center">
                  <v-icon class="me-2">mdi-information</v-icon>
                  No hay servidores configurados
                </div>
              </template>
              <p>No se encontraron servidores Ollama activos. Puede agregar un servidor manualmente o intentar descubrirlos automáticamente.</p>
              <v-btn
                color="primary"
                variant="tonal"
                class="mt-3"
                @click="showAddDialog = true"
              >
                <v-icon start>mdi-plus</v-icon>
                Agregar servidor
              </v-btn>
            </v-alert>
          </v-card-text>
          
          <v-data-table
            :headers="tableHeaders"
            :items="servers"
            :loading="loadingServers"
            class="elevation-0"
            item-value="id"
          >
            <!-- Estado del servidor / Server status -->
            <template #item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                variant="flat"
                size="small"
                :prepend-icon="getStatusIcon(item.status)"
              >
                {{ item.status ? $t(`servers.status.${item.status}`, item.status) : $t('servers.status.unknown') }}
              </v-chip>
            </template>
            
            <!-- Información del servidor / Server info -->
            <template #item.info="{ item }">
              <div>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ item.host_ip }}:{{ item.port }}
                </div>
                <div v-if="item.description" class="text-caption text-medium-emphasis">
                  {{ item.description }}
                </div>
              </div>
            </template>
            
            <!-- Modelos disponibles / Available models -->
            <template #item.models="{ item }">
              <v-chip-group v-if="item.models && item.models.length > 0">
                <v-chip
                  v-for="model in item.models.slice(0, 3)"
                  :key="model.name"
                  size="x-small"
                  variant="outlined"
                >
                  {{ model.name }}
                </v-chip>
                <v-chip
                  v-if="item.models.length > 3"
                  size="x-small"
                  variant="text"
                >
                  +{{ item.models.length - 3 }}
                </v-chip>
              </v-chip-group>
              <span v-else class="text-medium-emphasis">
                {{ $t('servers.list.noModels') }}
              </span>
            </template>
            
            <!-- Ruta del proxy / Proxy route -->
            <template #item.proxy_route="{ item }">
              <v-code class="text-caption">
                {{ item.proxy_route }}
              </v-code>
            </template>
            
            <!-- Servidor activo / Active server -->
            <template #item.active="{ item }">
              <v-switch
                :model-value="activeServerId === item.id"
                color="success"
                hide-details
                @update:model-value="setActiveServer(item.id)"
              />
            </template>
            
            <!-- Acciones / Actions -->
            <template #item.actions="{ item }">
              <div class="d-flex gap-1">
                <!-- Test de conexión / Connection test -->
                <v-btn
                  icon="mdi-lan-connect"
                  variant="text"
                  size="small"
                  color="primary"
                  :loading="testingConnection === item.id"
                  @click="testConnection(item)"
                >
                  <v-icon>mdi-lan-connect</v-icon>
                  <v-tooltip activator="parent">
                    {{ $t('servers.actions.test') }}
                  </v-tooltip>
                </v-btn>
                
                <!-- Editar servidor / Edit server -->
                <v-btn
                  icon="mdi-pencil"
                  variant="text"
                  size="small"
                  color="primary"
                  @click="editServer(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                  <v-tooltip activator="parent">
                    {{ $t('servers.actions.edit') }}
                  </v-tooltip>
                </v-btn>
                
                <!-- Eliminar servidor / Delete server -->
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="error"
                  @click="confirmDelete(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                  <v-tooltip activator="parent">
                    {{ $t('servers.actions.delete') }}
                  </v-tooltip>
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Diálogo para agregar servidor / Add server dialog -->
    <v-dialog v-model="showAddDialog" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">
            <v-icon class="me-2">mdi-plus</v-icon>
            {{ editingServer ? $t('servers.dialog.editTitle') : $t('servers.dialog.addTitle') }}
          </span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="serverForm" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="serverForm.name"
                  :label="$t('servers.form.name')"
                  :rules="nameRules"
                  prepend-icon="mdi-server"
                  variant="outlined"
                  required
                />
              </v-col>
              
              <v-col cols="8">
                <v-text-field
                  v-model="serverForm.host_ip"
                  :label="$t('servers.form.hostIp')"
                  :rules="ipRules"
                  prepend-icon="mdi-ip-network"
                  variant="outlined"
                  placeholder="192.168.1.100"
                  required
                />
              </v-col>
              
              <v-col cols="4">
                <v-text-field
                  v-model.number="serverForm.port"
                  :label="$t('servers.form.port')"
                  :rules="portRules"
                  prepend-icon="mdi-network-outline"
                  variant="outlined"
                  type="number"
                  placeholder="11434"
                  required
                />
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="serverForm.description"
                  :label="$t('servers.form.description')"
                  prepend-icon="mdi-text"
                  variant="outlined"
                  rows="2"
                  :placeholder="$t('servers.form.descriptionPlaceholder')"
                />
              </v-col>
              
              <v-col cols="12">
                <v-switch
                  v-model="serverForm.enabled"
                  :label="$t('servers.form.enabled')"
                  color="success"
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="cancelEdit">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="primary"
            :loading="savingServer"
            :disabled="!validForm"
            @click="saveServer"
          >
            {{ editingServer ? $t('common.update') : $t('common.add') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Diálogo de confirmación de eliminación / Delete confirmation dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon class="me-2" color="error">mdi-delete</v-icon>
          {{ $t('servers.delete.title') }}
        </v-card-title>
        
        <v-card-text>
          {{ $t('servers.delete.message', { name: serverToDelete?.name }) }}
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn
            color="error"
            :loading="deletingServer"
            @click="deleteServer"
          >
            {{ $t('common.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
// Definir componentes
const components = {
  VDataTable
}

defineExpose({
  components
})
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useServersStore } from '@/stores/servers'

// Importar componentes de Vuetify necesarios
import { VDataTable } from 'vuetify/labs/VDataTable'

const { t } = useI18n()
const serversStore = useServersStore()

// Estado local / Local state
const loadingServers = ref(false)
const discovering = ref(false)
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const showDeleteDialog = ref(false)
const activeServerId = ref(null)
const testingConnection = ref(null)
const editingServer = ref(null)
const savingServer = ref(false)
const deletingServer = ref(false)
const serverForm = ref({
  id: null,
  name: '',
  host_ip: '',
  port: 11434,
  description: '',
  enabled: true
})
const discoveryStatus = ref(null)
const servers = ref([])
const serverToDelete = ref(null)
const initializationError = ref(null)

// Reglas de validación / Validation rules
const nameRules = [
  v => !!v || t('servers.validation.nameRequired'),
  v => v.length >= 3 || t('servers.validation.nameMinLength')
]

const ipRules = [
  v => !!v || t('servers.validation.ipRequired'),
  v => /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(v) || t('servers.validation.ipInvalid')
]

const portRules = [
  v => !!v || t('servers.validation.portRequired'),
  v => (v >= 1 && v <= 65535) || t('servers.validation.portRange')
]

// Cabeceras de la tabla / Table headers
const tableHeaders = computed(() => [
  { title: t('servers.table.status'), key: 'status', width: '100px' },
  { title: t('servers.table.info'), key: 'info' },
  { title: t('servers.table.models'), key: 'models' },
  { title: t('servers.table.proxyRoute'), key: 'proxy_route', width: '150px' },
  { title: t('servers.table.active'), key: 'active', width: '100px' },
  { title: t('servers.table.actions'), key: 'actions', width: '150px', sortable: false }
])

// Métodos / Methods
const loadServers = async () => {
  loadingServers.value = true
  initializationError.value = null
  
  try {
    // Simular carga de servidores desde API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Usar solo localhost como servidor predeterminado
    servers.value = [
      {
        id: 'local-server',
        name: 'Servidor Local',
        host_ip: 'localhost',
        port: 11434,
        description: 'Servidor Ollama local',
        status: 'offline', // Empezar como offline hasta verificar
        proxy_route: '/api/ollama/',
        enabled: true,
        models: []
      }
    ]
    
    // Establecer como servidor activo
    activeServerId.value = 'local-server'
    
    // Verificar el estado del servidor con un timeout
    const checkServerStatus = async () => {
      const server = servers.value[0]
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout
      
      try {
        const response = await fetch(`http://${server.host_ip}:${server.port}/api/tags`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal
        })
        
        if (response.ok) {
          server.status = 'online'
          const data = await response.json()
          if (data.models) {
            server.models = data.models.map(model => ({
              name: model.name || 'modelo_desconocido',
              size: model.size ? `${Math.round(model.size / 1e9)}GB` : 'N/A'
            }))
          }
        } else {
          server.status = 'offline'
        }
      } catch (error) {
        console.warn('No se pudo conectar al servidor local:', error)
        server.status = 'offline'
      } finally {
        clearTimeout(timeoutId)
      }
    }
    
    // Ejecutar la verificación en segundo plano
    checkServerStatus().catch(error => {
      console.warn('Error al verificar el estado del servidor:', error)
    })
    
  } catch (error) {
    console.error('Error cargando servidores:', error)
  } finally {
    loadingServers.value = false
  }
}

const discoverServers = async () => {
  discovering.value = true
  try {
    discoveryStatus.value = {
      type: 'info',
      title: t('servers.discovery.scanning'),
      message: t('servers.discovery.scanningMessage')
    }
    
    // Simular descubrimiento automático
    // Simulate automatic discovery
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const newServers = [
      {
        id: 'server2',
        name: 'Servidor Auto-detectado',
        host_ip: '192.168.1.150',
        port: 11434,
        description: 'Detectado automáticamente en la red',
        status: 'online',
        proxy_route: '/api/server2/',
        enabled: true,
        models: [
          { name: 'llama2', size: '7B' }
        ]
      }
    ]
    
    // Agregar nuevos servidores encontrados
    // Add newly found servers
    servers.value.push(...newServers)
    
    discoveryStatus.value = {
      type: 'success',
      title: t('servers.discovery.completed'),
      message: t('servers.discovery.foundServers', { count: newServers.length })
    }
    
  } catch (error) {
    discoveryStatus.value = {
      type: 'error',
      title: t('servers.discovery.error'),
      message: error.message
    }
  } finally {
    discovering.value = false
  }
}

const testConnection = async (server) => {
  testingConnection.value = server.id
  try {
    // Simular test de conexión
    // Simulate connection test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Actualizar estado del servidor
    // Update server status
    const serverIndex = servers.value.findIndex(s => s.id === server.id)
    if (serverIndex >= 0) {
      servers.value[serverIndex].status = 'online'
    }
    
  } catch (error) {
    console.error('Error probando conexión:', error)
  } finally {
    testingConnection.value = null
  }
}

const setActiveServer = async (serverId) => {
  try {
    activeServerId.value = serverId
    // Actualizar en el store
    // Update in store
    // await serversStore.setActiveServer(serverId)
  } catch (error) {
    console.error('Error estableciendo servidor activo:', error)
  }
}

const editServer = (server) => {
  editingServer.value = server
  serverForm.value = { ...server }
  showAddDialog.value = true
}

const saveServer = async () => {
  savingServer.value = true
  try {
    if (editingServer.value) {
      // Actualizar servidor existente
      // Update existing server
      const serverIndex = servers.value.findIndex(s => s.id === editingServer.value.id)
      if (serverIndex >= 0) {
        servers.value[serverIndex] = { ...editingServer.value, ...serverForm.value }
      }
    } else {
      // Agregar nuevo servidor
      // Add new server
      const newServer = {
        ...serverForm.value,
        id: `server-${Date.now()}`,
        status: 'unknown',
        proxy_route: `/api/server${servers.value.length + 1}/`,
        models: []
      }
      servers.value.push(newServer)
    }
    
    showAddDialog.value = false
    editingServer.value = null
    
  } catch (error) {
    console.error('Error guardando servidor:', error)
  } finally {
    savingServer.value = false
  }
}

const cancelEdit = () => {
  showAddDialog.value = false
  editingServer.value = null
  serverForm.value = {
    name: '',
    host_ip: '',
    port: 11434,
    description: '',
    enabled: true
  }
}

const confirmDelete = (server) => {
  serverToDelete.value = server
  showDeleteDialog.value = true
}

const deleteServer = async () => {
  deletingServer.value = true
  try {
    servers.value = servers.value.filter(s => s.id !== serverToDelete.value.id)
    
    // Si era el servidor activo, cambiar a otro
    // If it was the active server, switch to another
    if (activeServerId.value === serverToDelete.value.id) {
      activeServerId.value = servers.value.length > 0 ? servers.value[0].id : null
    }
    
    showDeleteDialog.value = false
    serverToDelete.value = null
    
  } catch (error) {
    console.error('Error eliminando servidor:', error)
  } finally {
    deletingServer.value = false
  }
}

// Funciones utilitarias / Utility functions
const getStatusColor = (status) => {
  const colors = {
    online: 'success',
    offline: 'error',
    unknown: 'warning'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    online: 'mdi-check-circle',
    offline: 'mdi-close-circle',
    unknown: 'mdi-help-circle'
  }
  return status && status in icons ? icons[status] : 'mdi-help-circle'
}

// Lifecycle hooks
onMounted(async () => {
  try {
    await loadServers()
  } catch (error) {
    console.error('Error al cargar servidores:', error)
    initializationError.value = 'No se pudieron cargar los servidores. Por favor, intente nuevamente.'
  }
})
</script>

<style scoped>
.servers-management {
  padding: 24px;
}

.v-code {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 2px 6px;
  font-family: 'Roboto Mono', monospace;
}

.gap-1 {
  gap: 4px;
}

.gap-2 {
  gap: 8px;
}
</style>

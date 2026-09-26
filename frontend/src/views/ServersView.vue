<template>
  <v-container fluid>
    <!-- Encabezado -->
    <v-row class="mb-6" align="center">
      <v-col>
        <h1 class="text-h4 font-weight-bold">Gestión de Servidores</h1>
        <p class="text-caption text-medium-emphasis">
          Administra tus servidores Ollama
        </p>
      </v-col>
      <v-col cols="auto" class="d-flex gap-2">
        <v-btn
          color="secondary"
          prepend-icon="mdi-magnify-scan"
          @click="discoverServers"
          :loading="isDiscovering"
        >
          Descubrir Red
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openServerForm()"
        >
          Agregar Manual
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tarjetas de estado de servidores -->
    <v-row class="mb-6" dense>
      <v-col
        v-for="server in serversStore.servers"
        :key="server.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :color="getServerCardColor(server)"
          :dark="isServerActive(server)"
          class="server-card"
          elevation="4"
          @click="selectServer(server)"
        >
          <v-card-text>
            <div class="d-flex justify-space-between align-start">
              <div>
                <div class="d-flex align-center mb-2">
                  <v-icon
                    :color="isServerActive(server) ? 'white' : 'success'"
                    class="mr-2"
                  >
                    mdi-server
                  </v-icon>
                  <h3 class="text-h6 font-weight-medium">
                    {{ server.name }}
                    <v-chip
                      v-if="server.isDefault"
                      size="x-small"
                      color="white"
                      text-color="primary"
                      class="ml-2"
                    >
                      Predeterminado
                    </v-chip>
                  </h3>
                </div>
                <p class="text-body-2 mb-1">
                  <v-icon small class="mr-1">mdi-link</v-icon>
                  {{ server.url }}
                </p>
                <p
                  v-if="server.description"
                  class="text-caption mb-2"
                >
                  {{ server.description }}
                </p>
                <div class="d-flex align-center">
                  <v-chip
                    size="x-small"
                    :color="isServerActive(server) ? 'white' : 'grey'"
                    :text-color="isServerActive(server) ? 'primary' : 'white'"
                    class="mr-2"
                  >
                    {{ isServerActive(server) ? 'En línea' : 'Sin verificar' }}
                  </v-chip>
                  <span class="text-caption">
                    {{ formatDate(server.updatedAt) }}
                  </span>
                </div>
              </div>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    icon
                    v-bind="props"
                    variant="text"
                    @click.stop
                  >
                    <v-icon>mdi-dots-vertical</v-icon>
                  </v-btn>
                </template>
                <v-list density="compact">
                  <v-list-item
                    v-if="!server.isDefault"
                    @click="setAsDefault(server.id)"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-star</v-icon>
                    </template>
                    <v-list-item-title>Establecer como predeterminado</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openServerForm(server)">
                    <template v-slot:prepend>
                      <v-icon>mdi-pencil</v-icon>
                    </template>
                    <v-list-item-title>Editar</v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item
                    :disabled="server.isDefault"
                    @click="confirmDelete(server)"
                  >
                    <template v-slot:prepend>
                      <v-icon>mdi-delete</v-icon>
                    </template>
                    <v-list-item-title>Eliminar</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de formulario de servidor -->
    <v-dialog v-model="showServerForm" max-width="600px">
      <v-card>
        <v-card-title>
          {{ editingServer ? 'Editar Servidor' : 'Nuevo Servidor' }}
        </v-card-title>
        <v-card-text>
          <v-form v-model="isFormValid" @submit.prevent="saveServer">
            <v-text-field
              v-model="serverForm.name"
              label="Nombre del servidor"
              :rules="[v => !!v || 'El nombre es requerido']"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="serverForm.url"
              label="URL del servidor"
              :rules="[
                v => !!v || 'La URL es requerida',
                v => isValidUrl(v) || 'URL no válida'
              ]"
              placeholder="https://ejemplo-servidor.com o /api"
              required
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="serverForm.apiKey"
              label="Clave API (opcional)"
              type="password"
              class="mb-4"
            ></v-text-field>

            <v-textarea
              v-model="serverForm.description"
              label="Descripción (opcional)"
              rows="2"
              class="mb-4"
            ></v-textarea>

            <v-checkbox
              v-model="serverForm.isDefault"
              label="Establecer como servidor predeterminado"
              hide-details
              class="mb-4"
            ></v-checkbox>

            <v-alert
              v-if="formError"
              type="error"
              class="mb-4"
            >
              {{ formError }}
            </v-alert>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                text
                @click="showServerForm = false"
                :disabled="isSaving"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="primary"
                type="submit"
                :loading="isSaving"
                :disabled="!isFormValid"
              >
                {{ editingServer ? 'Guardar Cambios' : 'Agregar Servidor' }}
              </v-btn>
            </v-card-actions>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo de confirmación de eliminación -->
    <v-dialog v-model="showDeleteConfirm" max-width="400px">
      <v-card>
        <v-card-title>¿Eliminar servidor?</v-card-title>
        <v-card-text>
          ¿Estás seguro de que deseas eliminar el servidor
          <strong>{{ serverToDelete?.name }}</strong
          >? Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" @click="deleteServer" :loading="isDeleting"
            >Eliminar</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Diálogo de servidores descubiertos -->
    <v-dialog v-model="showDiscoveryDialog" max-width="600px" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon class="mr-3">mdi-magnify-scan</v-icon>
          Servidores Descubiertos
        </v-card-title>
        <v-card-text>
          <p class="text-body-2 mb-4">
            Se encontraron {{ discoveredServers.length }} servidores Ollama en la red.
            Selecciona cuáles deseas agregar:
          </p>
          
          <v-list>
            <v-list-item
              v-for="server in discoveredServers"
              :key="server.ip"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-avatar color="success">
                  <v-icon>mdi-server</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title>{{ server.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ server.ip }}:11434</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn
                  color="primary"
                  size="small"
                  prepend-icon="mdi-plus"
                  @click="addDiscoveredServer(server)"
                >
                  Agregar
                </v-btn>
              </template>
            </v-list-item>
          </v-list>
          
          <v-alert
            v-if="formError"
            type="error"
            class="mt-4"
          >
            {{ formError }}
          </v-alert>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            text
            @click="showDiscoveryDialog = false"
          >
            Cerrar
          </v-btn>
          <v-btn
            color="primary"
            @click="addAllDiscoveredServers"
            :disabled="discoveredServers.length === 0"
          >
            Agregar Todos
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useServersStore } from '@/stores/servers'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// Importar la configuración de servidores para los valores por defecto
import { OLLAMA_SERVERS } from '../config/ollama'

const serversStore = useServersStore()
const router = useRouter()

// Estado del formulario
const showServerForm = ref(false)
const isFormValid = ref(false)
const isSaving = ref(false)
const formError = ref('')
const editingServer = ref(null)

// Estado de eliminación
const showDeleteConfirm = ref(false)
const serverToDelete = ref(null)
const isDeleting = ref(false)

// Estado de descubrimiento
const isDiscovering = ref(false)
const discoveredServers = ref([])
const showDiscoveryDialog = ref(false)

// Formulario de servidor
const serverForm = ref({
  name: '',
  url: '',
  apiKey: '',
  description: '',
  isDefault: false
})

// Abrir el formulario para editar o crear un servidor
function openServerForm(server = null) {
  if (server) {
    editingServer.value = server
    serverForm.value = {
      name: server.name,
      url: server.url,
      apiKey: server.apiKey || '',
      description: server.description || '',
      isDefault: server.isDefault || false
    }
  } else {
    editingServer.value = null
    serverForm.value = {
      name: '',
      url: '',
      apiKey: '',
      description: '',
      isDefault: serversStore.servers.length === 0 // Si no hay servidores, marcar como predeterminado
    }
  }
  formError.value = ''
  showServerForm.value = true
}

// Guardar el servidor
async function saveServer() {
  if (!isFormValid.value) return

  isSaving.value = true
  formError.value = ''

  try {
    const serverData = {
      ...(editingServer.value || {}), // Mantener el ID si estamos editando
      name: serverForm.value.name,
      baseUrl: serverForm.value.url.endsWith('/')
        ? serverForm.value.url.slice(0, -1)
        : serverForm.value.url,
      url: serverForm.value.url.endsWith('/')
        ? serverForm.value.url.slice(0, -1)
        : serverForm.value.url,
      apiKey: serverForm.value.apiKey || '',
      description: serverForm.value.description || '',
      isDefault: serverForm.value.isDefault,
      // Asegurar que los endpoints estén definidos
      endpoints: {
        ...OLLAMA_SERVERS.local.endpoints,
        ...(editingServer.value?.endpoints || {})
      }
    }

    // Usar la función saveServer del store
    await serversStore.saveServer(serverData)
    
    // Si es el servidor actual, actualizar la referencia
    if (editingServer.value && editingServer.value.id && serversStore.currentServer?.id) {
      if (editingServer.value.id === serversStore.currentServer.id) {
        serversStore.setCurrentServer(editingServer.value.id)
      }
    }

    showServerForm.value = false
  } catch (error) {
    console.error('Error al guardar el servidor:', error)
    formError.value = error.message || 'Error al guardar el servidor'
  } finally {
    isSaving.value = false
  }
}

// Función para descubrir servidores en la red
async function discoverServers() {
  try {
    isDiscovering.value = true
    console.log('🔍 Iniciando descubrimiento de servidores...')

    // Llamar a la función de descubrimiento del store
    const discovered = await serversStore.discoverServers()

    // Filtrar servidores que ya existen
    const existingIps = new Set(serversStore.servers.map(s => `${s.ip}:${s.port || '11434'}`))
    const newServers = discovered.filter(server => !existingIps.has(`${server.ip}:${server.port || '11434'}`))

    if (newServers.length > 0) {
      discoveredServers.value = newServers
      showDiscoveryDialog.value = true
      console.log(`✅ ${newServers.length} servidores nuevos encontrados`)
    } else {
      console.log('ℹ️ No se encontraron servidores nuevos')
      // Mostrar notificación
      formError.value = 'No se encontraron servidores nuevos en la red'
      setTimeout(() => {
        formError.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('❌ Error al descubrir servidores:', error)
    formError.value = 'Error al descubrir servidores en la red'
  } finally {
    isDiscovering.value = false
  }
}

// Función para agregar un servidor descubierto
async function addDiscoveredServer(server) {
  try {
    const serverData = {
      name: server.name,
      ip: server.ip,
      port: server.port || '11434',
      url: `http://${server.ip}:${server.port || '11434'}`,
      baseUrl: `http://${server.ip}:${server.port || '11434'}`,
      description: 'Servidor descubierto automáticamente',
      isDefault: serversStore.servers.length === 0,
      endpoints: OLLAMA_SERVERS.local.endpoints
    }

    await serversStore.saveServer(serverData)
    console.log('✅ Servidor agregado exitosamente:', server.name)

    // Remover de la lista de descubiertos
    discoveredServers.value = discoveredServers.value.filter(s => s.ip !== server.ip || s.port !== server.port)

    // Si no quedan más servidores, cerrar el diálogo
    if (discoveredServers.value.length === 0) {
      showDiscoveryDialog.value = false
    }
  } catch (error) {
    console.error('❌ Error al agregar servidor:', error)
    formError.value = 'Error al agregar el servidor'
  }
}

// Confirmar eliminación de servidor
function confirmDelete(server) {
  serverToDelete.value = server
  showDeleteConfirm.value = true
}

// Eliminar servidor
async function deleteServer() {
  if (!serverToDelete.value) return

  isDeleting.value = true

  try {
    const success = serversStore.deleteServer(serverToDelete.value.id)
    if (success) {
      showDeleteConfirm.value = false
      serverToDelete.value = null
    } else {
      throw new Error('No se pudo eliminar el servidor')
    }
  } catch (error) {
    console.error('Error al eliminar el servidor:', error)
    formError.value = error.message || 'Error al eliminar el servidor'
  } finally {
    isDeleting.value = false
  }
}

// Establecer como servidor predeterminado
async function setAsDefault(serverId) {
  try {
    // Actualizar todos los servidores para marcar solo el seleccionado como predeterminado
    serversStore.servers.forEach(server => {
      if (server.isDefault && server.id !== serverId) {
        serversStore.updateServer(server.id, { isDefault: false })
      }
    })
    
    // Establecer el nuevo servidor como predeterminado
    await serversStore.updateServer(serverId, { isDefault: true })
  } catch (error) {
    console.error('Error al establecer el servidor predeterminado:', error)
  }
}

// Seleccionar un servidor
function selectServer(server) {
  serversStore.setCurrentServer(server.id)
  router.push('/dashboard')
}

// Verificar si un servidor está activo
function isServerActive(server) {
  return server === serversStore.currentServer
}

// Obtener el color de la tarjeta del servidor
function getServerCardColor(server) {
  if (isServerActive(server)) {
    return 'primary'
  }
  return 'grey-lighten-4'
}

// Validar URL
function isValidUrl(string) {
  try {
    // eslint-disable-next-line no-new
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Formatear fecha
function formatDate(date) {
  if (!date) return 'Nunca'
  return format(new Date(date), 'PPPpp', { locale: es })
}

// Cargar servidores al montar el componente
onMounted(() => {
  // Inicializar el store si es necesario
  if (!serversStore.currentServer && serversStore.servers.length > 0) {
    serversStore.setCurrentServer(serversStore.servers[0].id)
  }

  // No abrir formulario automáticamente - permitir descubrimiento primero
  // El usuario puede agregar servidores manualmente usando el botón "Agregar Manual"
})
</script>

<style scoped>
.server-card {
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  border-left: 4px solid transparent;
}

.server-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2) !important;
}

.v-card--reveal {
  align-items: center;
  bottom: 0;
  justify-content: center;
  opacity: 0.9;
  position: absolute;
  width: 100%;
}
</style>

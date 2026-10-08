<template>
  <v-container fluid class="pa-4">
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbs" class="px-0 py-2">
      <template v-slot:divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <!-- Header with server info and actions -->
    <v-card class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between flex-wrap">
          <div class="d-flex align-center">
            <v-avatar :color="getStatusColor(server.status)" size="56" class="mr-4">
              <v-icon dark size="32" :icon="getStatusIcon(server.status)" />
            </v-avatar>
            <div>
              <div class="d-flex align-center">
                <h1 class="text-h4 font-weight-bold mr-2">{{ server.name }}</h1>
                <v-chip 
                  :color="getStatusColor(server.status)" 
                  size="small"
                  class="ml-2"
                  label
                >
                  {{ getStatusText(server.status) }}
                </v-chip>
              </div>
              <div class="text-subtitle-1 text-medium-emphasis">
                {{ server.ip }}
              </div>
              <div class="d-flex align-center mt-1">
                <v-chip
                  size="small"
                  color="primary"
                  class="mr-2"
                  label
                >
                  {{ server.os || 'Linux' }}
                </v-chip>
                <v-chip
                  v-if="server.tags && server.tags.length"
                  v-for="tag in server.tags"
                  :key="tag"
                  size="small"
                  variant="outlined"
                  class="mr-2"
                >
                  {{ tag }}
                </v-chip>
              </div>
            </div>
          </div>
          <div class="mt-4 mt-sm-0">
            <v-btn
              color="primary"
              variant="tonal"
              class="mr-2 mb-2"
              :loading="refreshing"
              @click="refreshServer"
            >
              <v-icon start>mdi-refresh</v-icon>
              Actualizar
            </v-btn>
            <v-menu>
              <template v-slot:activator="{ props: menu }">
                <v-tooltip text="Más acciones" location="bottom">
                  <template v-slot:activator="{ props: tooltip }">
                    <v-btn
                      v-bind="{ ...tooltip, ...menu }"
                      color="grey-darken-1"
                      variant="outlined"
                      class="mb-2"
                    >
                      <v-icon>mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
              </template>
              <v-list density="compact">
                <v-list-item @click="editServer">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-pencil" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Editar servidor</v-list-item-title>
                </v-list-item>
                <v-list-item @click="restartServer">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-restart" class="mr-2"></v-icon>
                  </template>
                  <v-list-item-title>Reiniciar servidor</v-list-item-title>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item @click="showShutdownDialog" class="text-warning">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-power" class="mr-2" color="warning"></v-icon>
                  </template>
                  <v-list-item-title>Apagar servidor</v-list-item-title>
                </v-list-item>
                <v-divider class="my-1"></v-divider>
                <v-list-item @click="showDeleteDialog" class="text-error">
                  <template v-slot:prepend>
                    <v-icon icon="mdi-delete" class="mr-2" color="error"></v-icon>
                  </template>
                  <v-list-item-title>Eliminar servidor</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Stats cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 text-medium-emphasis">Uso de CPU</div>
                <div class="text-h6">{{ server.cpuUsage }}%</div>
                <div class="text-caption">{{ server.cpuCores }} núcleos</div>
              </div>
              <v-progress-circular
                :model-value="server.cpuUsage"
                :color="getUsageColor(server.cpuUsage)"
                :size="70"
                :width="6"
                class="mr-2"
              >
                <span class="text-caption">{{ server.cpuUsage }}%</span>
              </v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 text-medium-emphasis">Uso de Memoria</div>
                <div class="text-h6">{{ server.memoryUsage }}%</div>
                <div class="text-caption">
                  {{ formatBytes(server.memoryUsed * 1024 * 1024 * 1024) }} / {{ formatBytes(server.memoryTotal * 1024 * 1024 * 1024) }}
                </div>
              </div>
              <v-progress-circular
                :model-value="server.memoryUsage"
                :color="getUsageColor(server.memoryUsage)"
                :size="70"
                :width="6"
                class="mr-2"
              >
                <span class="text-caption">{{ server.memoryUsage }}%</span>
              </v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 text-medium-emphasis">Uso de Disco</div>
                <div class="text-h6">{{ server.diskUsage }}%</div>
                <div class="text-caption">
                  {{ formatBytes(server.diskUsed * 1024 * 1024 * 1024) }} / {{ formatBytes(server.diskTotal * 1024 * 1024 * 1024) }}
                </div>
              </div>
              <v-progress-circular
                :model-value="server.diskUsage"
                :color="getUsageColor(server.diskUsage)"
                :size="70"
                :width="6"
                class="mr-2"
              >
                <span class="text-caption">{{ server.diskUsage }}%</span>
              </v-progress-circular>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <div class="text-subtitle-2 text-medium-emphasis">Tiempo de actividad</div>
                <div class="text-h6">{{ server.uptime || 'N/A' }}</div>
                <div class="text-caption">
                  Última actualización: {{ formatDate(server.lastUpdated) }}
                </div>
              </div>
              <v-avatar color="primary" variant="tonal" size="56">
                <v-icon>mdi-clock-outline</v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6">
      <v-tab value="overview">Resumen</v-tab>
      <v-tab value="metrics">Métricas</v-tab>
      <v-tab value="services">Servicios</v-tab>
      <v-tab value="alerts">Alertas</v-tab>
      <v-tab value="settings">Configuración</v-tab>
      <v-tab value="chat">Chat con Modelos</v-tab>
    </v-tabs>

    <!-- Tab content -->
    <v-window v-model="activeTab">
      <!-- Overview Tab -->
      <v-window-item value="overview">
        <v-row>
          <v-col cols="12" md="8">
            <v-card class="mb-6">
              <v-card-title class="text-h5">
                {{ server.name || 'Servidor Ollama' }}
                <v-chip class="ml-2" color="primary" size="small">
                  {{ server.isLocal ? 'Local' : 'Remoto' }}
                </v-chip>
              </v-card-title>
              <v-card-text>
                <v-tabs v-model="metricsTab" color="primary">
                  <v-tab value="cpu">CPU</v-tab>
                  <v-tab value="memory">Memoria</v-tab>
                  <v-tab value="disk">Disco</v-tab>
                  <v-tab value="network">Red</v-tab>
                </v-tabs>
                <v-window v-model="metricsTab">
                  <v-window-item value="cpu">
                    <div class="chart-container" style="height: 300px;">
                      <!-- CPU Chart Placeholder -->
                      <v-skeleton-loader type="image" class="mt-4"></v-skeleton-loader>
                    </div>
                  </v-window-item>
                  <v-window-item value="memory">
                    <div class="chart-container" style="height: 300px;">
                      <!-- Memory Chart Placeholder -->
                      <v-skeleton-loader type="image" class="mt-4"></v-skeleton-loader>
                    </div>
                  </v-window-item>
                  <v-window-item value="disk">
                    <div class="chart-container" style="height: 300px;">
                      <!-- Disk Chart Placeholder -->
                      <v-skeleton-loader type="image" class="mt-4"></v-skeleton-loader>
                    </div>
                  </v-window-item>
                  <v-window-item value="network">
                    <div class="chart-container" style="height: 300px;">
                      <!-- Network Chart Placeholder -->
                      <v-skeleton-loader type="image" class="mt-4"></v-skeleton-loader>
                    </div>
                  </v-window-item>
                </v-window>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="mb-6">
              <v-card-title>Información del Sistema</v-card-title>
              <v-card-text>
                <v-list density="compact" class="pa-0">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-server" class="mr-2"></v-icon>
                    </template>
                    <v-list-item-title>Sistema Operativo</v-list-item-title>
                    <v-list-item-subtitle>{{ server.os || 'Desconocido' }}</v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-chip" class="mr-2"></v-icon>
                    </template>
                    <v-list-item-title>CPU</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ server.cpuModel || 'Desconocido' }} ({{ server.cpuCores }} núcleos)
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-memory" class="mr-2"></v-icon>
                    </template>
                    <v-list-item-title>Memoria</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatBytes(server.memoryTotal * 1024 * 1024 * 1024) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-harddisk" class="mr-2"></v-icon>
                    </template>
                    <v-list-item-title>Almacenamiento</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatBytes(server.diskTotal * 1024 * 1024 * 1024) }} total
                    </v-list-item-subtitle>
                  </v-list-item>
                  <v-divider class="my-2"></v-divider>
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-update" class="mr-2"></v-icon>
                    </template>
                    <v-list-item-title>Última actualización</v-list-item-title>
                    <v-list-item-subtitle>
                      {{ formatDate(server.lastUpdated) }} ({{ formatTimeAgo(server.lastUpdated) }})
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-window-item>

      <!-- Other tabs will be implemented in the next part -->
      <v-window-item value="metrics">
        <!-- Metrics tab content will be added in the next part -->
      </v-window-item>
      
      <v-window-item value="services">
        <!-- Services tab content will be added in the next part -->
      </v-window-item>
      
      <v-window-item value="alerts">
        <!-- Alerts tab content will be added in the next part -->
      </v-window-item>
      
      <v-window-item value="settings">
        <!-- Settings tab content will be added in the next part -->
      </v-window-item>
      
      <!-- Chat with Models Tab -->
      <v-window-item value="chat" class="h-100">
        <v-card class="h-100 d-flex flex-column">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-robot</v-icon>
            Chat con Modelos Ollama
            <v-spacer></v-spacer>
            <v-chip v-if="availableModels.length > 0" color="primary" variant="tonal" size="small">
              {{ availableModels.length }} modelos disponibles
            </v-chip>
            <v-progress-circular
              v-else
              indeterminate
              size="20"
              width="2"
              color="primary"
              class="mr-2"
            ></v-progress-circular>
          </v-card-title>
          <v-card-text class="flex-grow-1 pa-0 d-flex" style="min-height: 500px;">
            <ChatInterface 
              v-if="availableModels.length > 0"
              :models="availableModels"
              :server-url="`http://${server.ip}:11434`"
              class="flex-grow-1"
            />
            <v-alert
              v-else
              type="info"
              variant="tonal"
              class="ma-4 w-100"
            >
              No se encontraron modelos disponibles en este servidor. Asegúrate de tener al menos un modelo descargado en Ollama.
            </v-alert>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteConfirm" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar eliminación</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea eliminar el servidor <strong>{{ server.name }}</strong>?
          Esta acción no se puede deshacer y se perderán todos los datos de monitoreo asociados.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showDeleteConfirm = false">Cancelar</v-btn>
          <v-btn color="error" variant="text" @click="deleteServer" :loading="deleting">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Shutdown Confirmation Dialog -->
    <v-dialog v-model="showShutdownConfirm" max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar apagado</v-card-title>
        <v-card-text>
          ¿Está seguro de que desea apagar el servidor <strong>{{ server.name }}</strong>?
          Esta acción detendrá todos los servicios en ejecución.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="showShutdownConfirm = false">Cancelar</v-btn>
          <v-btn color="warning" variant="text" @click="shutdownServer" :loading="shuttingDown">Apagar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// Importación corregida para usar useServersStore
import ChatInterface from '@/components/chat/ChatInterface.vue';
import { useAppStore } from '@/stores/app';
import { useServersStore } from '@/stores/servers';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default defineComponent({
  name: 'ServerDetail',
  
  setup() {
    const route = useRoute();
    const router = useRouter();
    const appStore = useAppStore();
    const serversStore = useServersStore();

    // State - Usar interface Server consistente
    const server = ref<any>({
      id: 1,
      name: 'Servidor de Producción',
      ip: '192.168.1.100',
      status: 'online',
      cpu: 45,
      memory: 39,
      disk: 35,
      uptime: '15d 6h 23m',
      lastBackup: new Date().toISOString(),
      os: 'Ubuntu 22.04 LTS',
      tags: ['web', 'database', 'production'],
      description: 'Servidor principal de producción'
    });

    const loading = ref(true);
    const refreshing = ref(false);
    const deleting = ref(false);
    const shuttingDown = ref(false);
    const savingSettings = ref(false);
    const activeTab = ref('overview');
    const availableModels = ref([]);
    const loadingModels = ref(false);
    const metricsTab = ref('cpu');
    const detailedMetricsTab = ref('cpu');
    const settingsTab = ref('general');
    const showDeleteConfirm = ref(false);
    const showShutdownConfirm = ref(false);
    const showRestartConfirm = ref(false);
    const originalStatus = ref('online');
    const isSettingsFormValid = ref(false);
    const isSSHFormValid = ref(false);
    const showPassword = ref(false);
    const showPassphrase = ref(false);
    const sshKeyFile = ref(null);

    // Computed
    const breadcrumbs = computed(() => [
      { title: 'Inicio', disabled: false, to: '/' },
      { title: 'Servidores', disabled: false, to: '/servers' },
      { title: server.value.name, disabled: true, to: '' },
    ]);

    const environmentOptions = [
      { title: 'Producción', value: 'production' },
      { title: 'Pruebas', value: 'staging' },
      { title: 'Desarrollo', value: 'development' },
      { title: 'Otro', value: 'other' },
    ];

    const alertTypes = [
      { title: 'Crítico', value: 'critical' },
      { title: 'Advertencia', value: 'warning' },
      { title: 'Informativo', value: 'info' },
    ];

    const processesHeaders = [
      { title: 'PID', key: 'pid' },
      { title: 'Nombre', key: 'name' },
      { title: 'Usuario', key: 'user' },
      { title: 'CPU %', key: 'cpu' },
      { title: 'Memoria %', key: 'memory' },
      { title: 'Tiempo', key: 'time' },
      { title: 'Comando', key: 'command' },
    ];

    const servicesHeaders = [
      { title: 'Nombre', key: 'name' },
      { title: 'Estado', key: 'status' },
      { title: 'Descripción', key: 'description' },
      { title: 'Acciones', key: 'actions', sortable: false },
    ];

    const alertsHeaders = [
      { title: 'Severidad', key: 'severity' },
      { title: 'Mensaje', key: 'message' },
      { title: 'Origen', key: 'source' },
      { title: 'Fecha', key: 'date' },
      { title: 'Estado', key: 'status' },
    ];

    // Methods
    const loadServer = async (id: string) => {
      try {
        loading.value = true;
        
        // Intentar obtener servidor del store
        const serverId = parseInt(id);
        const foundServer = serversStore.getServerById(serverId);
        if (foundServer) {
          server.value = foundServer;
          // Verificar estado del servidor
          await serversStore.checkServerStatus(foundServer.id);
        } else {
          // Si no existe, crear uno básico
          server.value = {
            id: serverId,
            name: `Servidor ${id}`,
            ip: 'localhost',
            status: 'offline',
            cpu: 0,
            memory: 0,
            disk: 0,
            uptime: '0h 0m',
            lastBackup: new Date().toISOString()
          };
        }
        
        // Update page title
        appStore.setPageTitle(server.value.name);
      } catch (error) {
        console.error('Error loading server:', error);
        appStore.showError('No se pudo cargar la información del servidor');
      } finally {
        loading.value = false;
      }
    };

    const refreshServer = async () => {
      try {
        refreshing.value = true;
        await loadServer(route.params.id as string);
        appStore.showSuccess('Servidor actualizado correctamente');
      } catch (error) {
        console.error('Error refreshing server:', error);
        appStore.showError('Error al actualizar el servidor');
      } finally {
        refreshing.value = false;
      }
    };

    const deleteServer = async () => {
      try {
        deleting.value = true;
        
        // Remover servidor del store
        if (server.value) {
          serversStore.removeServer(server.value.id);
          appStore.showSuccess('Servidor eliminado correctamente');
          router.push('/servers');
        }
      } catch (error) {
        console.error('Error deleting server:', error);
        appStore.showError('No se pudo eliminar el servidor');
      } finally {
        deleting.value = false;
        showDeleteConfirm.value = false;
      }
    };

    const shutdownServer = async () => {
      try {
        shuttingDown.value = true;
        
        // Simular apagado del servidor
        if (server.value) {
          server.value.status = 'maintenance';
          await new Promise(resolve => setTimeout(resolve, 2000));
          server.value.status = 'offline';
        }
        
        appStore.showSuccess('Comando de apagado enviado correctamente');
      } catch (error) {
        console.error('Error shutting down server:', error);
        appStore.showError('Error al apagar el servidor');
      } finally {
        shuttingDown.value = false;
        showShutdownConfirm.value = false;
      }
    };

    const restartServer = async () => {
      try {
        if (server.value) {
          originalStatus.value = server.value.status;
          server.value.status = 'maintenance';
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Verificar estado después del reinicio
          const newStatus = await serversStore.checkServerStatus(server.value.id);
          server.value.status = newStatus;
        }
        
        appStore.showSuccess('Comando de reinicio enviado correctamente');
        showRestartConfirm.value = false;
        await refreshServer();
      } catch (error) {
        console.error('Error restarting server:', error);
        appStore.showError('Error al reiniciar el servidor');
      } finally {
        showRestartConfirm.value = false;
      }
    };

    const saveSettings = async () => {
      try {
        savingSettings.value = true;
        // TODO: Call API to save settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        appStore.showSuccess('Configuración guardada correctamente');
      } catch (error) {
        console.error('Error saving settings:', error);
        appStore.showError('No se pudo guardar la configuración');
      } finally {
        savingSettings.value = false;
      }
    };

    const startService = async (service: any) => {
      try {
        service.status = 'starting';
        // TODO: Call API to start service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        service.status = 'running';
        appStore.showSuccess(`Servicio ${service.name} iniciado correctamente`);
      } catch (error) {
        console.error('Error starting service:', error);
        service.status = 'stopped';
        appStore.showError(`No se pudo iniciar el servicio ${service.name}`);
      }
    };

    const stopService = async (service: any) => {
      try {
        service.status = 'stopping';
        // TODO: Call API to stop service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        service.status = 'stopped';
        appStore.showSuccess(`Servicio ${service.name} detenido correctamente`);
      } catch (error) {
        console.error('Error stopping service:', error);
        service.status = 'running';
        appStore.showError(`No se pudo detener el servicio ${service.name}`);
      }
    };

    const restartService = async (service: any) => {
      try {
        const originalStatus = service.status;
        service.status = 'restarting';
        
        // TODO: Call API to restart service
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        service.status = 'running';
        appStore.showSuccess(`Servicio ${service.name} reiniciado correctamente`);
      } catch (error) {
        console.error('Error restarting service:', error);
        service.status = originalStatus;
        appStore.showError(`No se pudo reiniciar el servicio ${service.name}`);
      }
    };

    const editServer = () => {
      router.push(`/server/${route.params.id}/edit`);
    };

    const showDeleteDialog = () => {
      showDeleteConfirm.value = true;
    };

    const showShutdownDialog = () => {
      showShutdownConfirm.value = true;
    };

    const toggleSSHAuthMethod = () => {
      // Reset fields when toggling auth method
      if (server.value.useSSHKey) {
        server.value.sshKeyPath = '';
        server.value.sshKeyPassphrase = '';
      } else {
        server.value.sshPassword = '';
      }
    };

    // Utility functions
    const formatBytes = (bytes: number, decimals = 2) => {
      if (bytes === 0) return '0 Bytes';
      
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'PPpp', { locale: es });
    };

    const formatTimeAgo = (dateString: string) => {
      if (!dateString) return '';
      
      const now = new Date();
      const date = new Date(dateString);
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) return 'hace unos segundos';
      if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} minutos`;
      if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} horas`;
      return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    };

    const getStatusColor = (status: string) => {
      const statusMap: Record<string, string> = {
        'online': 'success',
        'offline': 'error',
        'maintenance': 'warning',
        'degraded': 'warning',
        'unknown': 'grey',
      };
      return statusMap[status] || 'grey';
    };

    const getStatusIcon = (status: string) => {
      const iconMap: Record<string, string> = {
        'online': 'mdi-server',
        'offline': 'mdi-server-off',
        'maintenance': 'mdi-server-remove',
        'degraded': 'mdi-alert-circle',
        'unknown': 'mdi-help-circle',
      };
      return iconMap[status] || 'mdi-help-circle';
    };

    const getStatusText = (status: string) => {
      const textMap: Record<string, string> = {
        'online': 'En línea',
        'offline': 'Desconectado',
        'maintenance': 'En mantenimiento',
        'degraded': 'Degradado',
        'unknown': 'Desconocido',
      };
      return textMap[status] || 'Desconocido';
    };

    const getEnvironmentColor = (env: string) => {
      const envMap: Record<string, string> = {
        'production': 'error',
        'staging': 'warning',
        'development': 'info',
        'other': 'grey',
      };
      return envMap[env] || 'grey';
    };

    const getEnvironmentName = (env: string) => {
      const envMap: Record<string, string> = {
        'production': 'Producción',
        'staging': 'Pruebas',
        'development': 'Desarrollo',
        'other': 'Otro',
      };
      return envMap[env] || 'Desconocido';
    };

    const getUsageColor = (usage: number) => {
      if (usage >= 90) return 'error';
      if (usage >= 70) return 'warning';
      return 'success';
    };

    const getServiceStatusColor = (status: string) => {
      const statusMap: Record<string, string> = {
        'running': 'success',
        'stopped': 'error',
        'starting': 'warning',
        'stopping': 'warning',
        'restarting': 'info',
        'failed': 'error',
      };
      return statusMap[status] || 'grey';
    };

    const getServiceStatusText = (status: string) => {
      const textMap: Record<string, string> = {
        'running': 'En ejecución',
        'stopped': 'Detenido',
        'starting': 'Iniciando',
        'stopping': 'Deteniendo',
        'restarting': 'Reiniciando',
        'failed': 'Falló',
      };
      return textMap[status] || 'Desconocido';
    };

    // Lifecycle hooks
    const fetchAvailableModels = async () => {
      if (!server.value?.ip) return;
      
      try {
        loadingModels.value = true;
        const response = await fetch(`http://${server.value.ip}:11434/api/tags`);
        if (response.ok) {
          const data = await response.json();
          availableModels.value = data.models || [];
        }
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        loadingModels.value = false;
      }
    };

    // Watch for server changes to refresh models
    watch(() => server.value, (newVal) => {
      if (newVal?.ip) {
        fetchAvailableModels();
      }
    }, { immediate: true });

    onMounted(async () => {
      const serverId = route.params.id as string;
      if (serverId) {
        loadServer(serverId);
      } else {
        appStore.showError('ID de servidor no especificado');
        router.push('/servers');
      }
      
      // Establecer el título de la página
      if (appStore.setPageTitle) {
        appStore.setPageTitle('Detalles del Servidor');
      }
    });

    return {
      // State
      server,
      loading,
      refreshing,
      deleting,
      shuttingDown,
      savingSettings,
      activeTab,
      availableModels: availableModels as unknown as Array<{name: string}>,
      loadingModels,
      metricsTab,
      detailedMetricsTab,
      settingsTab,
      showDeleteConfirm,
      showShutdownConfirm,
      isSettingsFormValid,
      isSSHFormValid,
      showPassword,
      showPassphrase,
      sshKeyFile,
      
      // Computed
      breadcrumbs,
      environmentOptions,
      alertTypes,
      processesHeaders,
      servicesHeaders,
      alertsHeaders,
      
      // Methods
      refreshServer,
      deleteServer,
      shutdownServer,
      restartServer,
      saveSettings,
      startService,
      stopService,
      restartService,
      editServer,
      showDeleteDialog,
      showShutdownDialog,
      toggleSSHAuthMethod,
      formatBytes,
      formatDate,
      formatTimeAgo,
      getStatusColor,
      getStatusIcon,
      getStatusText,
      getEnvironmentColor,
      getEnvironmentName,
      getUsageColor,
      getServiceStatusColor,
      getServiceStatusText,
    };
  },
});
</script>

<style scoped>
.chart-container {
  position: relative;
  width: 100%;
  min-height: 200px;
}

.v-progress-circular {
  transition: all 0.3s ease;
}

.v-breadcrumbs :deep(.v-breadcrumbs-item) {
  opacity: 1;
  color: rgba(var(--v-theme-on-background), var(--v-medium-emphasis-opacity));
}

.v-breadcrumbs :deep(.v-breadcrumbs-item--disabled) {
  opacity: 0.6;
}
</style>

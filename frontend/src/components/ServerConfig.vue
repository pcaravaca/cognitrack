<template>
  <v-dialog v-model="dialog" max-width="600">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon icon="mdi-server" class="mr-2"></v-icon>
        Configuración del servidor
        <v-spacer></v-spacer>
        <v-btn icon @click="dialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      
      <v-card-text>
        <v-form @submit.prevent="saveConfig">
          <v-text-field
            v-model="serverName"
            label="Nombre del servidor"
            variant="outlined"
            class="mb-4"
            :rules="[v => !!v || 'El nombre es requerido']"
            required
          ></v-text-field>
          
          <v-text-field
            v-model="serverUrl"
            label="URL del servidor"
            variant="outlined"
            class="mb-4"
            placeholder="https://ejemplo-servidor.com o /api"
            :rules="[v => !!v || 'La URL es requerida']"
            required
          ></v-text-field>
          
          <v-alert
            v-if="error"
            type="error"
            variant="tonal"
            class="mb-4"
          >
            {{ error }}
          </v-alert>
          
          <v-alert
            v-if="success"
            type="success"
            variant="tonal"
            class="mb-4"
          >
            Configuración guardada correctamente
          </v-alert>
          
          <v-card-actions class="px-0">
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              variant="text"
              @click="dialog = false"
              :disabled="isLoading"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="primary"
              type="submit"
              :loading="isLoading"
              :disabled="isLoading"
            >
              Guardar
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineExpose, defineEmits } from 'vue';
import { useServersStore } from '@/stores/servers';

const emit = defineEmits(['saved']);
const serversStore = useServersStore();

const dialog = ref(false);
const serverName = ref('');
const serverUrl = ref('');
const isLoading = ref(false);
const error = ref('');
const success = ref(false);

// Exponer el método para abrir el diálogo
function open() {
  resetForm();
  if (serversStore.currentServer) {
    serverName.value = serversStore.currentServer.name;
    serverUrl.value = serversStore.currentServer.baseUrl || '';
  }
  dialog.value = true;
  error.value = '';
  success.value = false;
}

function resetForm() {
  serverName.value = '';
  serverUrl.value = '';
  error.value = '';
  success.value = false;
}

async function saveConfig() {
  if (!serverName.value || !serverUrl.value) {
    error.value = 'Por favor completa todos los campos requeridos';
    return;
  }

  try {
    isLoading.value = true;
    error.value = '';
    success.value = false;
    
    console.log('💾 Guardando configuración de servidor:', { 
      nombre: serverName.value, 
      url: serverUrl.value 
    });
    
    // Guardar la URL original para referencia pero siempre usar el proxy
    const originalUrl = serverUrl.value.trim();
    
    // Para todas las conexiones, siempre forzar el uso del proxy de Nginx
    // independientemente de lo que el usuario ingrese
    const baseUrl = '/api';
    
    console.log(`📍 URL original: ${originalUrl}`);
    console.log(`📍 Usando proxy: ${baseUrl} (la URL original se guarda solo como referencia)`);
    
    // Extraer hostname y puerto solo para información
    let hostname = 'ollama-server';
    let port = '80'; // Puerto de Nginx
    
    console.log(`📍 URL normalizada: ${baseUrl}`);
    
    // Crear objeto servidor completo
    let server;
    
    try {
      // Validar URL - si es una ruta relativa como /api, la convertimos a URL absoluta
      let urlObj;
      if (baseUrl.startsWith('/')) {
        // Es una ruta relativa, usar el origen actual
        urlObj = new URL(baseUrl, window.location.origin);
      } else {
        // Es una URL absoluta
        urlObj = new URL(baseUrl);
      }
      
      server = {
        id: serversStore.currentServer?.id || `server-${Date.now()}`,
        name: serverName.value,
        baseUrl: baseUrl,
        originalUrl: originalUrl, // Guardamos la URL original como referencia
        hostname: hostname,
        port: port,
        wsUrl: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`,
        updatedAt: new Date().toISOString(),
        endpoints: {
          version: 'version',
          tags: 'tags',
          generate: 'generate',
          chat: 'chat',
          embeddings: 'embeddings',
          status: 'status'
        },
        timeout: 30000,
        retries: 3,
        retryDelay: 1000
      };
      
      console.log(`📍 Configuración del servidor:
`, JSON.stringify(server, null, 2));
    } catch (err) {
      console.error(`❌ Error al crear objeto URL: ${err.message}`);
      throw new Error(`URL inválida: ${baseUrl}. Formato correcto: http://servidor:puerto`);
    }
    
    // Guardar el servidor en el store
    const saved = serversStore.saveServer(server);
    
    if (!saved) {
      throw new Error('No se pudo guardar la configuración del servidor');
    }
    
    // Establecer como servidor actual
    serversStore.setCurrentServer(server);
    
    // Probar la conexión
    console.log('🔗 Probando conexión con el servidor...');
    const connected = await serversStore.testConnection(server);
    
    if (!connected) {
      throw new Error('No se pudo conectar al servidor');
    }
    
    console.log('✅ Servidor guardado y conexión verificada correctamente');
    success.value = true;
    emit('saved');
    
    // Cerrar el diálogo después de 1.5 segundos
    setTimeout(() => {
      dialog.value = false;
    }, 1500);
    
  } catch (err) {
    console.error('❌ Error al guardar la configuración:', err);
    error.value = `No se pudo conectar al servidor. ${err.message || 'Verifica la URL e inténtalo de nuevo.'}`;
  } finally {
    isLoading.value = false;
  }
}

// Cerrar el diálogo cuando se guarda correctamente
watch(dialog, (newVal) => {
  if (!newVal) {
    resetForm();
  }
});

// Exponer el método open
defineExpose({
  open
});
</script>

<style scoped>
.v-card {
  border-radius: 8px;
}

.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-form {
  padding: 8px 0;
}
</style>

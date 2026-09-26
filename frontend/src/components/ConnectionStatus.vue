<template>
  <v-card class="mb-4">
    <v-card-title class="d-flex align-center">
      <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
      Estado de la conexión
      <v-spacer></v-spacer>
      <v-btn
        color="primary"
        size="small"
        :loading="isLoading"
        :disabled="isLoading"
        @click="testConnection"
      >
        <v-icon start>mdi-refresh</v-icon>
        Probar conexión
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <v-alert
        v-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ error }}
      </v-alert>
      
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon>mdi-server-network</v-icon>
          </template>
          <v-list-item-title>Servidor</v-list-item-title>
          <v-list-item-subtitle>{{ currentServer?.name || 'No configurado' }}</v-list-item-subtitle>
          <v-list-item-subtitle>{{ currentServer?.baseUrl || 'Sin URL definida' }}</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item>
          <template v-slot:prepend>
            <v-icon>mdi-connection</v-icon>
          </template>
          <v-list-item-title>Estado</v-list-item-title>
          <v-list-item-subtitle>
            <v-chip :color="statusColor" size="small">
              {{ statusText }}
            </v-chip>
          </v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item v-if="lastCheck">
          <template v-slot:prepend>
            <v-icon>mdi-clock-outline</v-icon>
          </template>
          <v-list-item-title>Última verificación</v-list-item-title>
          <v-list-item-subtitle>{{ lastCheck }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
    
    <v-card-actions>
      <v-btn
        color="primary"
        variant="text"
        @click="$emit('configure')"
      >
        <v-icon start>mdi-cog</v-icon>
        Configurar servidor
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useServersStore } from '@/stores/servers';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['configure']);

const serversStore = useServersStore();
const { currentServer, connectionStatus, connectionError } = storeToRefs(serversStore);

const isLoading = ref(false);
const lastCheck = ref(null);
const localError = ref('');

const statusText = computed(() => {
  const statusMap = {
    'disconnected': 'Desconectado',
    'connecting': 'Conectando...',
    'connected': 'Conectado',
    'error': 'Error de conexión'
  };
  return statusMap[connectionStatus.value] || 'Desconocido';
});

const statusColor = computed(() => {
  const colorMap = {
    'disconnected': 'warning',
    'connecting': 'info',
    'connected': 'success',
    'error': 'error'
  };
  return colorMap[connectionStatus.value || 'disconnected'] || 'grey';
});

const statusIcon = computed(() => {
  const iconMap = {
    'disconnected': 'mdi-close-network',
    'connecting': 'mdi-dots-horizontal-circle',
    'connected': 'mdi-check-network',
    'error': 'mdi-alert-circle'
  };
  return iconMap[connectionStatus.value || 'disconnected'] || 'mdi-help-circle';
});

const error = computed(() => (connectionError.value || localError.value) || '');

async function testConnection() {
  try {
    isLoading.value = true;
    localError.value = '';
    
    await serversStore.testConnection();
    lastCheck.value = new Date().toLocaleString();
  } catch (err) {
    localError.value = 'No se pudo conectar al servidor. Verifica la URL e inténtalo de nuevo.';
    console.error('Error al probar la conexión:', err);
  } finally {
    isLoading.value = false;
  }
}

// Probar la conexión al cargar el componente
onMounted(async () => {
  await testConnection();
});
</script>

<style scoped>
.v-card {
  border-radius: 8px;
  overflow: hidden;
}

.v-card-title {
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}

.v-list-item {
  padding-left: 0;
}
</style>

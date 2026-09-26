<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Alertas</h1>
        
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar alertas"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" prepend-icon="mdi-filter-variant">
              Filtros
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="alerts"
            :search="search"
            :items-per-page="10"
            class="elevation-1"
          >
            <template v-slot:item.severity="{ item }">
              <v-chip :color="getSeverityColor(item.raw.severity)" size="small">
                {{ item.raw.severity }}
              </v-chip>
            </template>
            <template v-slot:item.status="{ item }">
              <v-chip :color="getStatusColor(item.raw.status)" size="small">
                {{ item.raw.status }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                size="small"
                class="me-2"
                @click="viewAlertDetails(item.raw)"
              >
                mdi-eye
              </v-icon>
              <v-icon
                size="small"
                @click="acknowledgeAlert(item.raw)"
                :disabled="item.raw.status === 'Reconocida'"
              >
                mdi-check
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const search = ref('')

const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Mensaje', key: 'message' },
  { title: 'Severidad', key: 'severity' },
  { title: 'Origen', key: 'source' },
  { title: 'Fecha', key: 'date' },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', sortable: false }
]

const alerts = ref([
  { 
    id: 'ALERT-001', 
    message: 'Alto uso de CPU (95%)', 
    severity: 'Alta', 
    source: 'Servidor Web', 
    date: '2025-07-21 10:30:45',
    status: 'Activa'
  },
  // Más alertas de ejemplo...
])

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    'Crítica': 'error',
    'Alta': 'error',
    'Media': 'warning',
    'Baja': 'info'
  }
  return colors[severity] || 'grey'
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Activa': 'error',
    'Reconocida': 'warning',
    'Resuelta': 'success'
  }
  return colors[status] || 'grey'
}

const viewAlertDetails = (alert: any) => {
  // Lógica para ver detalles de la alerta
  console.log('Ver alerta:', alert)
}

const acknowledgeAlert = (alert: any) => {
  // Lógica para reconocer alerta
  console.log('Reconocer alerta:', alert)
  alert.status = 'Reconocida'
}
</script>

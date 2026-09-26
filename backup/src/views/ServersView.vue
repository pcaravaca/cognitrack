<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Servidores</h1>
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar servidor"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" prepend-icon="mdi-plus">
              Agregar Servidor
            </v-btn>
          </v-card-title>
          <v-data-table
            :headers="headers"
            :items="servers"
            :search="search"
            :items-per-page="10"
            class="elevation-1"
          >
            <template v-slot:item.status="{ value }">
              <v-chip :color="getStatusColor(value)" size="small">
                {{ value }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                size="small"
                class="me-2"
                @click="editServer(item)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                size="small"
                @click="deleteServer(item)"
              >
                mdi-delete
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
  { title: 'Nombre', key: 'name' },
  { title: 'Dirección IP', key: 'ip' },
  { title: 'Sistema Operativo', key: 'os' },
  { title: 'Ubicación', key: 'location' },
  { title: 'Estado', key: 'status' },
  { title: 'Acciones', key: 'actions', sortable: false }
]

const servers = ref([
  {
    id: 1,
    name: 'Servidor Web',
    ip: '192.168.1.10',
    os: 'Ubuntu 22.04',
    location: 'Centro de Datos A',
    status: 'Activo'
  },
  {
    id: 2,
    name: 'Base de Datos',
    ip: '192.168.1.11',
    os: 'Ubuntu 20.04',
    location: 'Centro de Datos B',
    status: 'Activo'
  },
  {
    id: 3,
    name: 'Servidor de Correo',
    ip: '192.168.1.12',
    os: 'Debian 11',
    location: 'Centro de Datos A',
    status: 'Mantenimiento'
  }
])

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Activo': 'success',
    'Inactivo': 'error',
    'Mantenimiento': 'warning',
    'Crítico': 'error'
  }
  return colors[status] || 'grey'
}

const editServer = (server: any) => {
  // Lógica para editar servidor
  console.log('Editar servidor:', server)
}

const deleteServer = (server: any) => {
  // Lógica para eliminar servidor
  console.log('Eliminar servidor:', server)
}
</script>

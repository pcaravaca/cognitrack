<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Gestión de Roles</h1>
        
        <v-card>
          <v-card-title>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar roles"
              single-line
              hide-details
              class="mr-4"
            ></v-text-field>
            <v-spacer></v-spacer>
            <v-btn color="primary" prepend-icon="mdi-plus" @click="openRoleDialog()">
              Nuevo Rol
            </v-btn>
          </v-card-title>
          
          <v-data-table
            :headers="headers"
            :items="roles"
            :search="search"
            :items-per-page="10"
            class="elevation-1"
          >
            <template v-slot:item.permissions="{ item }">
              <v-chip
                v-for="(permission, i) in item.raw.permissions"
                :key="i"
                size="small"
                class="ma-1"
              >
                {{ permission }}
              </v-chip>
            </template>
            <template v-slot:item.actions="{ item }">
              <v-icon
                size="small"
                class="me-2"
                @click="editRole(item.raw)"
              >
                mdi-pencil
              </v-icon>
              <v-icon
                size="small"
                @click="deleteRole(item.raw)"
                :disabled="item.raw.isSystem"
              >
                mdi-delete
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de Rol -->
    <v-dialog v-model="roleDialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedRole.name"
                  label="Nombre del Rol"
                  :disabled="editedRole.isSystem"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="editedRole.description"
                  label="Descripción"
                  :disabled="editedRole.isSystem"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-card variant="outlined">
                  <v-card-title>Permisos</v-card-title>
                  <v-card-text>
                    <v-row>
                      <v-col
                        v-for="(permissionGroup, groupName) in permissionGroups"
                        :key="groupName"
                        cols="12" md="6" lg="4"
                      >
                        <v-card variant="flat" class="mb-4">
                          <v-card-subtitle class="text-uppercase font-weight-bold">
                            {{ groupName }}
                          </v-card-subtitle>
                          <v-card-text>
                            <v-checkbox
                              v-for="permission in permissionGroup"
                              :key="permission.value"
                              v-model="editedRole.permissions"
                              :label="permission.title"
                              :value="permission.value"
                              :disabled="editedRole.isSystem"
                              hide-details
                              class="mt-0"
                            ></v-checkbox>
                          </v-card-text>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeRoleDialog">
            Cancelar
          </v-btn>
          <v-btn 
            color="blue-darken-1" 
            variant="text" 
            @click="saveRole"
            :disabled="!isFormValid"
          >
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const roleDialog = ref(false)
const editedIndex = ref(-1)
const defaultRole = {
  id: null,
  name: '',
  description: '',
  permissions: [] as string[],
  isSystem: false
}

const editedRole = ref({...defaultRole})

const headers = [
  { title: 'Nombre', key: 'name' },
  { title: 'Descripción', key: 'description' },
  { title: 'Permisos', key: 'permissions', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false }
]

const roles = ref([
  { 
    id: 1, 
    name: 'Administrador', 
    description: 'Acceso completo al sistema',
    permissions: ['users.manage', 'roles.manage', 'servers.manage', 'monitoring.view', 'settings.manage'],
    isSystem: true
  },
  { 
    id: 2, 
    name: 'Supervisor', 
    description: 'Puede ver y gestionar servidores',
    permissions: ['servers.manage', 'monitoring.view'],
    isSystem: false
  },
  { 
    id: 3, 
    name: 'Usuario', 
    description: 'Acceso básico al sistema',
    permissions: ['monitoring.view'],
    isSystem: false
  }
])

const permissionGroups = {
  'Usuarios': [
    { title: 'Ver usuarios', value: 'users.view' },
    { title: 'Crear usuarios', value: 'users.create' },
    { title: 'Editar usuarios', value: 'users.edit' },
    { title: 'Eliminar usuarios', value: 'users.delete' }
  ],
  'Roles': [
    { title: 'Ver roles', value: 'roles.view' },
    { title: 'Crear roles', value: 'roles.create' },
    { title: 'Editar roles', value: 'roles.edit' },
    { title: 'Eliminar roles', value: 'roles.delete' }
  ],
  'Servidores': [
    { title: 'Ver servidores', value: 'servers.view' },
    { title: 'Agregar servidores', value: 'servers.create' },
    { title: 'Editar servidores', value: 'servers.edit' },
    { title: 'Eliminar servidores', value: 'servers.delete' }
  ],
  'Monitorización': [
    { title: 'Ver monitorización', value: 'monitoring.view' },
    { title: 'Gestionar alertas', value: 'alerts.manage' }
  ],
  'Configuración': [
    { title: 'Gestionar configuración', value: 'settings.manage' }
  ]
}

const formTitle = computed(() => {
  return editedIndex.value === -1 ? 'Nuevo Rol' : 'Editar Rol'
})

const isFormValid = computed(() => {
  return editedRole.value.name.trim() !== '' && editedRole.value.permissions.length > 0
})

const openRoleDialog = (role = null) => {
  if (role) {
    editedIndex.value = roles.value.findIndex(r => r.id === role.id)
    editedRole.value = { ...role }
  } else {
    editedIndex.value = -1
    editedRole.value = { ...defaultRole }
  }
  roleDialog.value = true
}

const closeRoleDialog = () => {
  roleDialog.value = false
  setTimeout(() => {
    editedRole.value = { ...defaultRole }
    editedIndex.value = -1
  }, 300)
}

const saveRole = () => {
  if (editedIndex.value > -1) {
    // Actualizar rol existente
    Object.assign(roles.value[editedIndex.value], editedRole.value)
  } else {
    // Crear nuevo rol
    const newRole = {
      ...editedRole.value,
      id: Math.max(...roles.value.map(r => r.id), 0) + 1
    }
    roles.value.push(newRole)
  }
  closeRoleDialog()
}

const editRole = (role: any) => {
  openRoleDialog(role)
}

const deleteRole = (role: any) => {
  if (confirm(¿Está seguro de eliminar el rol ""?)) {
    const index = roles.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      roles.value.splice(index, 1)
    }
  }
}
</script>

<template>
  <v-app-bar color="primary" dark flat height="64">
    <!-- Botón para alternar el menú lateral -->
    <v-app-bar-nav-icon @click="toggleDrawer" />

    <!-- Logo y título de la aplicación -->
    <v-toolbar-title class="font-weight-bold d-flex align-center">
      <router-link to="/dashboard" class="text-white text-decoration-none d-flex align-center">
        <img src="/cognitrack-logo.svg" alt="CogniTrack Logo" class="mr-2" style="width: 32px; height: 32px;">
        CogniTrack
      </router-link>
    </v-toolbar-title>

    <v-spacer />

    <!-- Menú de usuario -->
    <v-menu offset-y left transition="slide-y-transition">
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props" variant="text" class="text-none">
          <v-avatar size="32" class="mr-2">
            <v-icon>mdi-account-circle</v-icon>
          </v-avatar>
          {{ userFullName || 'Usuario' }}
          <v-icon end>mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-card min-width="200">
        <v-list>
          <v-list-item>
            <v-list-item-title class="text-subtitle-2 text-medium-emphasis">
              {{ user?.email || 'usuario@ejemplo.com' }}
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ user?.role === 'admin' ? 'Administrador' : 'Usuario' }}
            </v-list-item-subtitle>
          </v-list-item>

          <v-divider class="my-2" />

          <v-list-item link to="/profile" prepend-icon="mdi-account-cog">
            <v-list-item-title>Perfil</v-list-item-title>
          </v-list-item>

          <v-list-item link to="/settings" prepend-icon="mdi-cog">
            <v-list-item-title>Configuración</v-list-item-title>
          </v-list-item>

          <v-list-item 
            @click="logout" 
            prepend-icon="mdi-logout"
            class="text-error"
          >
            <v-list-item-title>Cerrar sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-menu>
  </v-app-bar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Obtener datos del usuario
const user = computed(() => authStore.user)
const userFullName = computed(() => authStore.userFullName)

// Alternar el menú lateral (se implementará en el componente padre)
const emit = defineEmits(['toggle-drawer'])
const toggleDrawer = () => {
  emit('toggle-drawer')
}

// Cerrar sesión
const logout = async () => {
  try {
    await authStore.logout()
    // El router guard se encargará de redirigir al landing
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
/* Estilos específicos para la barra de navegación */
.v-toolbar {
  box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

/* Asegurar que el título sea clickeable */
.v-toolbar-title a {
  display: inline-block;
  height: 100%;
  display: flex;
  align-items: center;
}

/* Ajustes para el menú de usuario */
.v-menu__content {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Mejorar la apariencia de los elementos de la lista */
.v-list-item {
  min-height: 44px;
}

/* Estilo para el botón de cerrar sesión */
.text-error {
  color: rgb(var(--v-theme-error));
}

/* Transición suave para el menú */
.slide-y-transition-enter-active,
.slide-y-transition-leave-active {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.slide-y-transition-enter-from,
.slide-y-transition-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

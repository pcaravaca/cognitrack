<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Iniciar sesión</v-toolbar-title>
            <v-spacer />
          </v-toolbar>
          
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="form.username"
                label="Nombre de usuario"
                name="username"
                prepend-icon="mdi-account"
                type="text"
                :error-messages="errors.username"
                :disabled="loading"
                required
                autofocus
              />

              <v-text-field
                v-model="form.password"
                id="password"
                label="Contraseña"
                name="password"
                prepend-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                :type="showPassword ? 'text' : 'password'"
                :error-messages="errors.password"
                :disabled="loading"
                required
                @click:append-inner="showPassword = !showPassword"
              />

              <div class="d-flex align-center justify-space-between mt-2">
                <v-checkbox
                  v-model="form.rememberMe"
                  label="Recordarme"
                  color="primary"
                  hide-details
                  :disabled="loading"
                />

                <v-btn
                  variant="text"
                  color="primary"
                  :disabled="loading"
                  to="/forgot-password"
                  class="text-none"
                >
                  ¿Olvidó su contraseña?
                </v-btn>
              </div>

              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                :disabled="loading"
                block
                class="mt-6"
                size="large"
              >
                Iniciar sesión
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="px-4 pb-4">
            <v-spacer />
            <span class="text-caption text-medium-emphasis mr-2">
              ¿No tienes una cuenta?
            </span>
            <v-btn
              variant="text"
              color="primary"
              to="/register"
              class="text-none"
              :disabled="loading"
            >
              Regístrate
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Versión de la aplicación -->
        <div class="text-center mt-4">
          <v-chip size="small" variant="outlined" color="grey">
            v{{ appVersion }}
          </v-chip>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useAppStore } from '@/stores/app'

// Store y enrutamiento
const authStore = useAuthStore()
const appStore = useAppStore()
const router = useRouter()
const route = useRoute()

// Estado del formulario
const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

// Estado de la UI
const loading = ref(false)
const showPassword = ref(false)
const errors = reactive({
  username: '',
  password: ''
})

// Datos de la aplicación
const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'

// Métodos
const login = async () => {
  // Validación básica
  let isValid = true
  
  if (!form.username.trim()) {
    errors.username = 'El nombre de usuario es requerido'
    isValid = false
  } else {
    errors.username = ''
  }
  
  if (!form.password) {
    errors.password = 'La contraseña es requerida'
    isValid = false
  } else {
    errors.password = ''
  }
  
  if (!isValid) return
  
  try {
    loading.value = true
    
    // Intentar iniciar sesión
    const result = await authStore.login({
      username: form.username,
      password: form.password
    })
    
    if (result.success) {
      // Redirigir a la ruta previa o al dashboard
      const redirectTo = route.query.redirect || '/'
      router.push(redirectTo as string)
      
      // Mostrar mensaje de bienvenida
      appStore.showSuccess(`¡Bienvenido ${authStore.userFullName}!`)
    } else {
      // Mostrar error de autenticación
      errors.password = result.error || 'Error al iniciar sesión'
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error)
    appStore.showError('Ocurrió un error al intentar iniciar sesión')
  } finally {
    loading.value = false
  }
}

// Limpiar errores al cambiar los campos
const clearError = (field: string) => {
  if (errors[field as keyof typeof errors]) {
    errors[field as keyof typeof errors] = ''
  }
}

// Enfoque automático al cargar la página
onMounted(() => {
  // Si ya está autenticado, redirigir al dashboard
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
/* Estilos específicos para la vista de login */
.v-card {
  border-radius: 8px;
  overflow: hidden;
}

.v-toolbar {
  box-shadow: none;
}

/* Efecto de hover en el botón de inicio de sesión */
.v-btn--elevated {
  transition: transform 0.2s, box-shadow 0.2s;
}

.v-btn--elevated:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Ajustes para móviles */
@media (max-width: 600px) {
  .v-container {
    padding: 16px;
  }
  
  .v-card {
    margin-top: 32px;
  }
}

/* Animación de carga */
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.v-btn--loading:before {
  animation: pulse 1.5s infinite;
}

/* Mejoras de accesibilidad */
:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}
</style>

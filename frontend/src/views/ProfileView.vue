<template>
  <v-container fluid class="profile-view">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-avatar size="80" class="mr-4">
            <v-icon size="48">mdi-account-circle</v-icon>
          </v-avatar>
          <div>
            <h1 class="text-h4 font-weight-bold">{{ t('profile.title') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">{{ t('profile.subtitle') }}</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Información Personal -->
      <v-col cols="12" md="8">
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-account-edit</v-icon>
            {{ t('profile.personalInfo') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="updateProfile">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileForm.firstName"
                    :label="t('profile.firstName')"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="profileForm.lastName"
                    :label="t('profile.lastName')"
                    :rules="[rules.required]"
                    variant="outlined"
                    prepend-inner-icon="mdi-account"
                  />
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="profileForm.email"
                    :label="t('profile.email')"
                    :rules="[rules.required, rules.email]"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="profileForm.bio"
                    :label="t('profile.bio')"
                    variant="outlined"
                    prepend-inner-icon="mdi-text"
                    rows="3"
                    max-rows="5"
                  />
                </v-col>
              </v-row>
              <v-btn 
                type="submit" 
                color="primary" 
                :loading="updating"
                class="mt-4"
              >
                <v-icon start>mdi-content-save</v-icon>
                {{ t('profile.saveChanges') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Cambiar Contraseña -->
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-lock-reset</v-icon>
            {{ t('profile.changePassword') }}
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="changePassword">
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="passwordForm.currentPassword"
                    :label="t('profile.currentPassword')"
                    :rules="[rules.required]"
                    type="password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="passwordForm.newPassword"
                    :label="t('profile.newPassword')"
                    :rules="[rules.required, rules.minLength(8)]"
                    type="password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-plus"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="passwordForm.confirmPassword"
                    :label="t('profile.confirmPassword')"
                    :rules="[rules.required, rules.passwordMatch]"
                    type="password"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-check"
                  />
                </v-col>
              </v-row>
              <v-btn 
                type="submit" 
                color="primary" 
                :loading="changingPassword"
                class="mt-4"
              >
                <v-icon start>mdi-shield-check</v-icon>
                {{ t('profile.updatePassword') }}
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Panel Lateral -->
      <v-col cols="12" md="4">
        <!-- Información de la Cuenta -->
        <v-card class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            {{ t('profile.accountInfo') }}
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-shield-account</v-icon>
                </template>
                <v-list-item-title>{{ t('profile.role') }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip 
                    :color="user?.role === 'admin' ? 'primary' : 'secondary'"
                    size="small"
                  >
                    {{ t(`profile.roles.${user?.role || 'user'}`) }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-calendar-plus</v-icon>
                </template>
                <v-list-item-title>{{ t('profile.memberSince') }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(user?.createdAt || new Date()) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon>mdi-clock-outline</v-icon>
                </template>
                <v-list-item-title>{{ t('profile.lastLogin') }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(user?.lastLogin || new Date()) }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Preferencias -->
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-cog</v-icon>
            {{ t('profile.preferences') }}
          </v-card-title>
          <v-card-text>
            <v-select
              v-model="language"
              :items="languages"
              :label="t('profile.language')"
              variant="outlined"
              prepend-inner-icon="mdi-translate"
              @update:model-value="updateLanguage"
            />
            <v-select
              v-model="theme"
              :items="themes"
              :label="t('profile.theme')"
              variant="outlined"
              prepend-inner-icon="mdi-palette"
              @update:model-value="updateTheme"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'

const { t, locale } = useI18n()
const authStore = useAuthStore()

// Estados reactivos
const updating = ref(false)
const changingPassword = ref(false)
const language = ref(locale.value)
const theme = ref('light')

// Usuario actual
const user = computed(() => authStore.user)

// Formularios
const profileForm = ref({
  firstName: user.value?.firstName || 'Peter',
  lastName: user.value?.lastName || 'Caravaca',
  email: user.value?.email || 'peter@cognitrack.com',
  bio: user.value?.bio || ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Opciones
const languages = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' }
]

const themes = [
  { title: t('profile.themes.light'), value: 'light' },
  { title: t('profile.themes.dark'), value: 'dark' }
]

// Reglas de validación
const rules = {
  required: (value: string) => !!value || t('validation.required'),
  email: (value: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || t('validation.email')
  },
  minLength: (min: number) => (value: string) => 
    value.length >= min || t('validation.minLength', { min }),
  passwordMatch: (value: string) => 
    value === passwordForm.value.newPassword || t('validation.passwordMatch')
}

// Métodos
const updateProfile = async () => {
  updating.value = true
  try {
    // Simulación de actualización
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mostrar mensaje de éxito (se puede implementar con Vuetify snackbar)
    console.log('Perfil actualizado exitosamente')
  } catch (error) {
    console.error('Error actualizando perfil:', error)
  } finally {
    updating.value = false
  }
}

const changePassword = async () => {
  changingPassword.value = true
  try {
    // Simulación de cambio de contraseña
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Limpiar formulario
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
    
    console.log('Contraseña actualizada exitosamente')
  } catch (error) {
    console.error('Error cambiando contraseña:', error)
  } finally {
    changingPassword.value = false
  }
}

const updateLanguage = (newLanguage: string) => {
  locale.value = newLanguage
  // Guardar preferencia (localStorage, API, etc.)
}

const updateTheme = (newTheme: string) => {
  // Implementar cambio de tema
  console.log('Tema cambiado a:', newTheme)
}

const formatDate = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const currentLocale = locale.value === 'es' ? es : enUS
  return format(dateObj, 'PPP', { locale: currentLocale })
}

onMounted(() => {
  // Cargar preferencias del usuario
})
</script>

<style scoped>
.profile-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>

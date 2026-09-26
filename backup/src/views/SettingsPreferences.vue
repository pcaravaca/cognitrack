<template>
  <v-container fluid class="pa-4">
    <v-row>
      <v-col cols="12" md="8" offset-md="2">
        <v-card>
          <v-card-title>Preferencias del Sistema</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="isFormValid" @submit.prevent="savePreferences">
              <v-tabs v-model="tab" color="primary">
                <v-tab value="general">General</v-tab>
                <v-tab value="notifications">Notificaciones</v-tab>
                <v-tab value="appearance">Apariencia</v-tab>
                <v-tab value="backup">Respaldo</v-tab>
              </v-tabs>

              <v-window v-model="tab" class="mt-4">
                <!-- Pestaña General -->
                <v-window-item value="general">
                  <v-card variant="flat">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="preferences.appName"
                            label="Nombre de la Aplicación"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-text-field
                            v-model="preferences.timezone"
                            label="Zona Horaria"
                            :items="timezones"
                            required
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            v-model="preferences.welcomeMessage"
                            label="Mensaje de Bienvenida"
                            rows="2"
                          ></v-textarea>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="preferences.defaultLanguage"
                            :items="languages"
                            label="Idioma por Defecto"
                            item-title="name"
                            item-value="code"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="preferences.dateFormat"
                            :items="dateFormats"
                            label="Formato de Fecha"
                            required
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>

                <!-- Pestaña Notificaciones -->
                <v-window-item value="notifications">
                  <v-card variant="flat">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-switch
                            v-model="preferences.emailNotifications"
                            label="Habilitar notificaciones por correo electrónico"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" v-if="preferences.emailNotifications">
                          <v-text-field
                            v-model="preferences.notificationEmail"
                            label="Correo electrónico para notificaciones"
                            type="email"
                            :rules="emailRules"
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12">
                          <v-divider class="my-4"></v-divider>
                          <h4 class="text-subtitle-1 mb-2">Alertas</h4>
                          <v-switch
                            v-model="preferences.alertEmail"
                            label="Recibir alertas por correo electrónico"
                            color="primary"
                            hide-details
                            class="mt-0"
                          ></v-switch>
                          <v-switch
                            v-model="preferences.alertPush"
                            label="Recibir notificaciones push"
                            color="primary"
                            hide-details
                          ></v-switch>
                          <v-switch
                            v-model="preferences.dailySummary"
                            label="Recibir resumen diario"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="preferences.alertSeverity"
                            :items="alertSeverities"
                            label="Nivel mínimo de severidad para notificaciones"
                            multiple
                            chips
                          ></v-select>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>

                <!-- Pestaña Apariencia -->
                <v-window-item value="appearance">
                  <v-card variant="flat">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="preferences.theme"
                            :items="themes"
                            label="Tema de la Aplicación"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                          <v-select
                            v-model="preferences.density"
                            :items="densities"
                            label="Densidad de la Interfaz"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="preferences.darkMode"
                            label="Modo Oscuro"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="preferences.compactSidebar"
                            label="Barra lateral compacta"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="preferences.showAvatars"
                            label="Mostrar avatares de usuario"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>

                <!-- Pestaña Respaldo -->
                <v-window-item value="backup">
                  <v-card variant="flat">
                    <v-card-text>
                      <v-row>
                        <v-col cols="12">
                          <v-alert
                            type="info"
                            variant="tonal"
                            class="mb-4"
                          >
                            Configura las preferencias de respaldo automático del sistema.
                          </v-alert>
                        </v-col>
                        <v-col cols="12">
                          <v-switch
                            v-model="preferences.autoBackup"
                            label="Habilitar respaldo automático"
                            color="primary"
                            hide-details
                          ></v-switch>
                        </v-col>
                        <v-col cols="12" md="6" v-if="preferences.autoBackup">
                          <v-select
                            v-model="preferences.backupFrequency"
                            :items="backupFrequencies"
                            label="Frecuencia de Respaldo"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" md="6" v-if="preferences.autoBackup">
                          <v-text-field
                            v-model="preferences.backupLocation"
                            label="Ubicación del Respaldo"
                            required
                            append-inner-icon="mdi-folder"
                            @click:append-inner="selectBackupLocation"
                            readonly
                          ></v-text-field>
                        </v-col>
                        <v-col cols="12" v-if="preferences.autoBackup">
                          <v-select
                            v-model="preferences.backupRetention"
                            :items="backupRetentions"
                            label="Retención de Respaldo"
                            required
                          ></v-select>
                        </v-col>
                        <v-col cols="12" class="mt-4">
                          <v-btn
                            color="primary"
                            prepend-icon="mdi-backup-restore"
                            @click="createBackup"
                            :loading="isCreatingBackup"
                          >
                            Crear Respaldo Ahora
                          </v-btn>
                          <v-btn
                            color="secondary"
                            prepend-icon="mdi-restore"
                            class="ml-4"
                            @click="restoreBackup"
                            :disabled="!hasBackups"
                          >
                            Restaurar desde Respaldo
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-window-item>
              </v-window>

              <v-card-actions class="mt-4">
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  type="submit"
                  :loading="isSaving"
                  :disabled="!isFormValid"
                >
                  Guardar Cambios
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="resetForm"
                  :disabled="!isFormDirty"
                >
                  Deshacer Cambios
                </v-btn>
              </v-card-actions>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Diálogo de selección de ubicación de respaldo -->
    <v-dialog v-model="locationDialog" max-width="500px">
      <v-card>
        <v-card-title>Seleccionar ubicación de respaldo</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="backupPath"
            label="Ruta del directorio"
            required
            readonly
            append-inner-icon="mdi-folder"
            @click:append-inner="browseForBackupLocation"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="locationDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmBackupLocation">Seleccionar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tab = ref('general')
const isFormValid = ref(false)
const isSaving = ref(false)
const isCreatingBackup = ref(false)
const locationDialog = ref(false)
const backupPath = ref('')

const preferences = ref({
  // General
  appName: 'CogniTrack2',
  timezone: 'America/Mexico_City',
  welcomeMessage: 'Bienvenido al Panel de Control de CogniTrack2',
  defaultLanguage: 'es-MX',
  dateFormat: 'DD/MM/YYYY',
  
  // Notificaciones
  emailNotifications: true,
  notificationEmail: '',
  alertEmail: true,
  alertPush: true,
  dailySummary: true,
  alertSeverity: ['medium', 'high', 'critical'],
  
  // Apariencia
  theme: 'default',
  darkMode: false,
  density: 'comfortable',
  compactSidebar: false,
  showAvatars: true,
  
  // Respaldo
  autoBackup: true,
  backupFrequency: 'daily',
  backupLocation: '',
  backupRetention: '30d'
})

const originalPreferences = JSON.parse(JSON.stringify(preferences.value))

const timezones = [
  'America/Mexico_City',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'UTC',
  'Europe/Madrid'
]

const languages = [
  { name: 'Español (México)', code: 'es-MX' },
  { name: 'English (US)', code: 'en-US' }
]

const dateFormats = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'YYYY-MM-DD',
  'DD MMM YYYY',
  'MMMM DD, YYYY'
]

const alertSeverities = [
  { title: 'Bajo', value: 'low' },
  { title: 'Medio', value: 'medium' },
  { title: 'Alto', value: 'high' },
  { title: 'Crítico', value: 'critical' }
]

const themes = [
  'Default',
  'Blue',
  'Green',
  'Red',
  'Purple',
  'Dark'
]

const densities = [
  { title: 'Compacto', value: 'compact' },
  { title: 'Cómodo', value: 'comfortable' },
  { title: 'Espaciado', value: 'spacious' }
]

const backupFrequencies = [
  { title: 'Diario', value: 'daily' },
  { title: 'Semanal', value: 'weekly' },
  { title: 'Mensual', value: 'monthly' }
]

const backupRetentions = [
  { title: '7 días', value: '7d' },
  { title: '14 días', value: '14d' },
  { title: '30 días', value: '30d' },
  { title: '60 días', value: '60d' },
  { title: '90 días', value: '90d' }
]

const emailRules = [
  (v: string) => !!v || 'El correo electrónico es requerido',
  (v: string) => /.+@.+\..+/.test(v) || 'El correo electrónico debe ser válido'
]

const isFormDirty = computed(() => {
  return JSON.stringify(preferences.value) !== JSON.stringify(originalPreferences)
})

const hasBackups = computed(() => {
  // Lógica para verificar si hay respaldos disponibles
  return false
})

const savePreferences = async () => {
  isSaving.value = true
  try {
    // Simular guardado asíncrono
    await new Promise(resolve => setTimeout(resolve, 1000))
    // Actualizar las preferencias originales
    Object.assign(originalPreferences, JSON.parse(JSON.stringify(preferences.value)))
    // Mostrar notificación de éxito
    console.log('Preferencias guardadas correctamente')
  } catch (error) {
    console.error('Error al guardar las preferencias:', error)
  } finally {
    isSaving.value = false
  }
}

const resetForm = () => {
  preferences.value = JSON.parse(JSON.stringify(originalPreferences))
}

const selectBackupLocation = () => {
  backupPath.value = preferences.value.backupLocation
  locationDialog.value = true
}

const browseForBackupLocation = () => {
  // En una aplicación real, esto abriría un diálogo del sistema de archivos
  // Aquí simulamos la selección de una ruta
  backupPath.value = 'C:/Backups/CogniTrack2'
}

const confirmBackupLocation = () => {
  preferences.value.backupLocation = backupPath.value
  locationDialog.value = false
}

const createBackup = async () => {
  isCreatingBackup.value = true
  try {
    // Simular creación de respaldo
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Respaldo creado correctamente')
  } catch (error) {
    console.error('Error al crear el respaldo:', error)
  } finally {
    isCreatingBackup.value = false
  }
}

const restoreBackup = () => {
  // Lógica para restaurar desde un respaldo
  console.log('Iniciando restauración desde respaldo...')
}

// Cargar preferencias guardadas al iniciar el componente
onMounted(() => {
  // Aquí iría la lógica para cargar las preferencias guardadas
  console.log('Cargando preferencias...')
})
</script>

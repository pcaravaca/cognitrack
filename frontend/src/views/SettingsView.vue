<template>
  <v-container fluid class="settings-view">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon size="48" class="mr-4" color="primary">mdi-cog</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">{{ t('settings.title') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">{{ t('settings.subtitle') }}</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Panel de Navegación -->
      <v-col cols="12" md="3">
        <v-card>
          <v-list>
            <v-list-item
              v-for="section in settingSections"
              :key="section.key"
              :active="activeSection === section.key"
              @click="activeSection = section.key"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon :icon="section.icon" />
              </template>
              <v-list-item-title>{{ t(section.label) }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <!-- Panel de Contenido -->
      <v-col cols="12" md="9">
        <!-- Configuración General -->
        <v-card v-show="activeSection === 'general'" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-tune</v-icon>
            {{ t('settings.sections.general') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="generalSettings.appName"
                  :label="t('settings.appName')"
                  variant="outlined"
                  prepend-inner-icon="mdi-application"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="generalSettings.defaultLanguage"
                  :items="languages"
                  :label="t('settings.defaultLanguage')"
                  variant="outlined"
                  prepend-inner-icon="mdi-translate"
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="generalSettings.timezone"
                  :items="timezones"
                  :label="t('settings.timezone')"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-outline"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="generalSettings.enableNotifications"
                  :label="t('settings.enableNotifications')"
                  color="primary"
                  inset
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Configuración de Servidores -->
        <v-card v-show="activeSection === 'servers'" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-server</v-icon>
            {{ t('settings.sections.servers') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="serverSettings.defaultPort"
                  :label="t('settings.defaultPort')"
                  type="number"
                  variant="outlined"
                  prepend-inner-icon="mdi-port"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="serverSettings.connectionTimeout"
                  :label="t('settings.connectionTimeout')"
                  type="number"
                  suffix="segundos"
                  variant="outlined"
                  prepend-inner-icon="mdi-timer"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="serverSettings.refreshInterval"
                  :label="t('settings.refreshInterval')"
                  type="number"
                  suffix="segundos"
                  variant="outlined"
                  prepend-inner-icon="mdi-refresh"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="serverSettings.autoDiscovery"
                  :label="t('settings.autoDiscovery')"
                  color="primary"
                  inset
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Configuración de Monitoreo -->
        <v-card v-show="activeSection === 'monitoring'" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-monitor-eye</v-icon>
            {{ t('settings.sections.monitoring') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select
                  v-model="monitoringSettings.updateFrequency"
                  :items="updateFrequencies"
                  :label="t('settings.updateFrequency')"
                  variant="outlined"
                  prepend-inner-icon="mdi-update"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="monitoringSettings.dataRetention"
                  :label="t('settings.dataRetention')"
                  type="number"
                  suffix="días"
                  variant="outlined"
                  prepend-inner-icon="mdi-database"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="monitoringSettings.realTimeUpdates"
                  :label="t('settings.realTimeUpdates')"
                  color="primary"
                  inset
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="monitoringSettings.enableAlerts"
                  :label="t('settings.enableAlerts')"
                  color="primary"
                  inset
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Configuración de Seguridad -->
        <v-card v-show="activeSection === 'security'" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-check</v-icon>
            {{ t('settings.sections.security') }}
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="securitySettings.sessionTimeout"
                  :label="t('settings.sessionTimeout')"
                  type="number"
                  suffix="minutos"
                  variant="outlined"
                  prepend-inner-icon="mdi-clock-alert"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="securitySettings.maxLoginAttempts"
                  :label="t('settings.maxLoginAttempts')"
                  type="number"
                  variant="outlined"
                  prepend-inner-icon="mdi-account-lock"
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="securitySettings.requireStrongPasswords"
                  :label="t('settings.requireStrongPasswords')"
                  color="primary"
                  inset
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="securitySettings.enableTwoFactor"
                  :label="t('settings.enableTwoFactor')"
                  color="primary"
                  inset
                />
              </v-col>
              <v-col cols="12">
                <v-switch
                  v-model="securitySettings.logSecurityEvents"
                  :label="t('settings.logSecurityEvents')"
                  color="primary"
                  inset
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Configuración de Base de Datos -->
        <v-card v-show="activeSection === 'database'" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-database-cog</v-icon>
            {{ t('settings.sections.database') }}
          </v-card-title>
          <v-card-text>
            <v-alert
              type="info"
              variant="tonal"
              class="mb-4"
            >
              {{ t('settings.databaseInfo') }}
            </v-alert>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="databaseSettings.server"
                  :label="t('settings.databaseServer')"
                  variant="outlined"
                  prepend-inner-icon="mdi-server-network"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="databaseSettings.database"
                  :label="t('settings.databaseName')"
                  variant="outlined"
                  prepend-inner-icon="mdi-database"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="databaseSettings.connectionString"
                  :label="t('settings.connectionString')"
                  variant="outlined"
                  readonly
                  prepend-inner-icon="mdi-connection"
                />
              </v-col>
              <v-col cols="12">
                <v-btn 
                  color="primary" 
                  variant="outlined" 
                  prepend-icon="mdi-connection"
                  @click="testDatabaseConnection"
                  :loading="testingConnection"
                >
                  {{ t('settings.testConnection') }}
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Botones de Acción -->
        <v-card>
          <v-card-text>
            <div class="d-flex justify-end gap-3">
              <v-btn 
                color="error" 
                variant="outlined"
                prepend-icon="mdi-restore"
                @click="resetToDefaults"
              >
                {{ t('settings.resetDefaults') }}
              </v-btn>
              <v-btn 
                color="primary"
                prepend-icon="mdi-content-save"
                @click="saveSettings"
                :loading="saving"
              >
                {{ t('settings.saveSettings') }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Estados reactivos
const activeSection = ref('general')
const saving = ref(false)
const testingConnection = ref(false)

// Secciones de configuración
const settingSections = [
  { key: 'general', label: 'settings.sections.general', icon: 'mdi-tune' },
  { key: 'servers', label: 'settings.sections.servers', icon: 'mdi-server' },
  { key: 'monitoring', label: 'settings.sections.monitoring', icon: 'mdi-monitor-eye' },
  { key: 'security', label: 'settings.sections.security', icon: 'mdi-shield-check' },
  { key: 'database', label: 'settings.sections.database', icon: 'mdi-database-cog' }
]

// Configuraciones
const generalSettings = ref({
  appName: 'CogniTrack',
  defaultLanguage: 'es',
  timezone: 'America/Mexico_City',
  enableNotifications: true
})

const serverSettings = ref({
  defaultPort: 11434,
  connectionTimeout: 10,
  refreshInterval: 30,
  autoDiscovery: true
})

const monitoringSettings = ref({
  updateFrequency: 'real-time',
  dataRetention: 30,
  realTimeUpdates: true,
  enableAlerts: true
})

const securitySettings = ref({
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  requireStrongPasswords: true,
  enableTwoFactor: false,
  logSecurityEvents: true
})

const databaseSettings = ref({
  server: '10.10.1.21',
  database: 'CogniTrack',
  connectionString: 'sqlserver://sa:***@10.10.1.21:1433?database=CogniTrack'
})

// Opciones
const languages = [
  { title: 'Español', value: 'es' },
  { title: 'English', value: 'en' }
]

const timezones = [
  { title: 'América/Ciudad de México', value: 'America/Mexico_City' },
  { title: 'América/New York', value: 'America/New_York' },
  { title: 'Europa/Madrid', value: 'Europe/Madrid' },
  { title: 'UTC', value: 'UTC' }
]

const updateFrequencies = [
  { title: 'Tiempo Real', value: 'real-time' },
  { title: '30 segundos', value: '30s' },
  { title: '1 minuto', value: '1m' },
  { title: '5 minutos', value: '5m' }
]

// Métodos
const saveSettings = async () => {
  saving.value = true
  try {
    // Simular guardado de configuraciones
    await new Promise(resolve => setTimeout(resolve, 1500))
    console.log('Configuraciones guardadas exitosamente')
    
    // Aquí se enviarían las configuraciones al backend
    const allSettings = {
      general: generalSettings.value,
      servers: serverSettings.value,
      monitoring: monitoringSettings.value,
      security: securitySettings.value,
      database: databaseSettings.value
    }
    
    console.log('Configuraciones:', allSettings)
  } catch (error) {
    console.error('Error guardando configuraciones:', error)
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  // Restablecer valores por defecto
  if (confirm(t('settings.confirmReset'))) {
    generalSettings.value = {
      appName: 'CogniTrack',
      defaultLanguage: 'es',
      timezone: 'America/Mexico_City',
      enableNotifications: true
    }
    
    serverSettings.value = {
      defaultPort: 11434,
      connectionTimeout: 10,
      refreshInterval: 30,
      autoDiscovery: true
    }
    
    monitoringSettings.value = {
      updateFrequency: 'real-time',
      dataRetention: 30,
      realTimeUpdates: true,
      enableAlerts: true
    }
    
    securitySettings.value = {
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
      enableTwoFactor: false,
      logSecurityEvents: true
    }
  }
}

const testDatabaseConnection = async () => {
  testingConnection.value = true
  try {
    // Simular prueba de conexión
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Conexión exitosa a la base de datos')
  } catch (error) {
    alert('Error conectando a la base de datos')
  } finally {
    testingConnection.value = false
  }
}
</script>

<style scoped>
.settings-view {
  max-width: 1400px;
  margin: 0 auto;
}

.gap-3 {
  gap: 12px;
}
</style>

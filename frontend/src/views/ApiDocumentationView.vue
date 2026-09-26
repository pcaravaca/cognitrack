<template>
  <v-container fluid class="api-docs-view">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon size="48" class="mr-4" color="primary">mdi-api</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">{{ t('apiDocs.title') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">{{ t('apiDocs.subtitle') }}</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Navegación lateral -->
      <v-col cols="12" md="3">
        <v-card class="sticky-nav">
          <v-list>
            <v-list-subheader>{{ t('apiDocs.apiSections.title') }}</v-list-subheader>
            <v-list-item
              v-for="section in apiSections"
              :key="section.key"
              :active="activeSection === section.key"
              @click="scrollToSection(section.key)"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon size="small">{{ section.icon }}</v-icon>
              </template>
              <v-list-item-title class="text-body-2">{{ t(section.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <!-- Información del API -->
          <v-divider class="my-2" />
          <v-card-text>
            <div class="text-caption text-medium-emphasis mb-2">{{ t('apiDocs.version') }}</div>
            <v-chip color="primary" size="small" class="mb-3">v2.0.0</v-chip>
            
            <div class="text-caption text-medium-emphasis mb-2">{{ t('apiDocs.baseUrl') }}</div>
            <v-code class="text-caption">{{ baseUrl }}/api/v1</v-code>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Contenido principal -->
      <v-col cols="12" md="9">
        <!-- Introducción -->
        <v-card id="introduction" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-information</v-icon>
            {{ t('apiDocs.introduction.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('apiDocs.introduction.description') }}</p>
            
            <v-alert type="info" variant="tonal" class="my-4">
              <div class="font-weight-medium">{{ t('apiDocs.introduction.features') }}</div>
              <ul class="mt-2">
                <li>{{ t('apiDocs.introduction.feature1') }}</li>
                <li>{{ t('apiDocs.introduction.feature2') }}</li>
                <li>{{ t('apiDocs.introduction.feature3') }}</li>
                <li>{{ t('apiDocs.introduction.feature4') }}</li>
              </ul>
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Autenticación -->
        <v-card id="authentication" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-shield-key</v-icon>
            {{ t('apiDocs.authentication.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('apiDocs.authentication.description') }}</p>
            
            <v-code-block 
              language="bash" 
              :code="authExample"
              class="mb-4"
            />
            
            <v-alert type="warning" variant="tonal">
              {{ t('apiDocs.authentication.warning') }}
            </v-alert>
          </v-card-text>
        </v-card>

        <!-- Endpoints de Sistema -->
        <v-card id="system-endpoints" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-monitor</v-icon>
            {{ t('apiDocs.endpoints.system.title') }}
          </v-card-title>
          <v-card-text>
            <!-- GET /api/v1/metrics/system -->
            <div class="endpoint-item mb-6">
              <div class="d-flex align-center mb-3">
                <v-chip color="success" size="small" class="mr-3">GET</v-chip>
                <code class="text-body-1">/api/v1/metrics/system</code>
              </div>
              <p class="text-body-2 mb-3">{{ t('apiDocs.endpoints.system.getMetrics.description') }}</p>
              
              <v-tabs v-model="systemTab" class="mb-4">
                <v-tab value="response">{{ t('apiDocs.response') }}</v-tab>
                <v-tab value="example">{{ t('apiDocs.example') }}</v-tab>
              </v-tabs>
              
              <v-tabs-window v-model="systemTab">
                <v-tabs-window-item value="response">
                  <v-code-block 
                    language="json" 
                    :code="systemResponseSchema"
                  />
                </v-tabs-window-item>
                <v-tabs-window-item value="example">
                  <v-code-block 
                    language="json" 
                    :code="systemResponseExample"
                  />
                </v-tabs-window-item>
              </v-tabs-window>
            </div>
          </v-card-text>
        </v-card>

        <!-- Endpoints de Ollama -->
        <v-card id="ollama-endpoints" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-robot</v-icon>
            {{ t('apiDocs.endpoints.ollama.title') }}
          </v-card-title>
          <v-card-text>
            <!-- GET /api/v1/ollama/tags -->
            <div class="endpoint-item mb-6">
              <div class="d-flex align-center mb-3">
                <v-chip color="success" size="small" class="mr-3">GET</v-chip>
                <code class="text-body-1">/api/v1/ollama/tags</code>
              </div>
              <p class="text-body-2 mb-3">{{ t('apiDocs.endpoints.ollama.getTags.description') }}</p>
              
              <!-- Parámetros -->
              <div class="mb-4">
                <h4 class="text-subtitle-1 mb-2">{{ t('apiDocs.parameters') }}</h4>
                <v-table density="compact">
                  <thead>
                    <tr>
                      <th>{{ t('apiDocs.paramName') }}</th>
                      <th>{{ t('apiDocs.paramType') }}</th>
                      <th>{{ t('apiDocs.paramRequired') }}</th>
                      <th>{{ t('apiDocs.paramDescription') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><code>server</code></td>
                      <td>string</td>
                      <td>{{ t('apiDocs.yes') }}</td>
                      <td>{{ t('apiDocs.endpoints.ollama.getTags.serverParam') }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </div>

              <v-tabs v-model="ollamaTab" class="mb-4">
                <v-tab value="response">{{ t('apiDocs.response') }}</v-tab>
                <v-tab value="example">{{ t('apiDocs.example') }}</v-tab>
                <v-tab value="curl">cURL</v-tab>
              </v-tabs>
              
              <v-tabs-window v-model="ollamaTab">
                <v-tabs-window-item value="response">
                  <v-code-block 
                    language="json" 
                    :code="ollamaResponseSchema"
                  />
                </v-tabs-window-item>
                <v-tabs-window-item value="example">
                  <v-code-block 
                    language="json" 
                    :code="ollamaResponseExample"
                  />
                </v-tabs-window-item>
                <v-tabs-window-item value="curl">
                  <v-code-block 
                    language="bash" 
                    :code="ollamaCurlExample"
                  />
                </v-tabs-window-item>
              </v-tabs-window>
            </div>

            <!-- GET /api/v1/metrics/ollama -->
            <div class="endpoint-item mb-6">
              <div class="d-flex align-center mb-3">
                <v-chip color="success" size="small" class="mr-3">GET</v-chip>
                <code class="text-body-1">/api/v1/metrics/ollama</code>
              </div>
              <p class="text-body-2 mb-3">{{ t('apiDocs.endpoints.ollama.getMetrics.description') }}</p>
              
              <v-code-block 
                language="json" 
                :code="ollamaMetricsExample"
              />
            </div>
          </v-card-text>
        </v-card>

        <!-- Códigos de Error -->
        <v-card id="error-codes" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-alert-circle</v-icon>
            {{ t('apiDocs.errorCodes.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('apiDocs.errorCodes.description') }}</p>
            
            <v-table>
              <thead>
                <tr>
                  <th>{{ t('apiDocs.errorCodes.code') }}</th>
                  <th>{{ t('apiDocs.errorCodes.description') }}</th>
                  <th>{{ t('apiDocs.errorCodes.solution') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="error in errorCodes" :key="error.code">
                  <td>
                    <v-chip :color="getErrorColor(error.code)" size="small">
                      {{ error.code }}
                    </v-chip>
                  </td>
                  <td>{{ t(error.description) }}</td>
                  <td class="text-body-2">{{ t(error.solution) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>

        <!-- Probador de API -->
        <v-card id="api-tester" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-play-circle</v-icon>
            {{ t('apiDocs.tester.title') }}
          </v-card-title>
          <v-card-text>
            <p class="mb-4">{{ t('apiDocs.tester.description') }}</p>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedEndpoint"
                  :items="testEndpoints"
                  :label="t('apiDocs.tester.selectEndpoint')"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6" v-if="selectedEndpoint === '/api/v1/ollama/tags'">
                <v-text-field
                  v-model="serverParam"
                  label="Server IP:Port"
                  placeholder="192.168.0.104:11434"
                  variant="outlined"
                />
              </v-col>
            </v-row>
            
            <v-btn 
              color="primary" 
              prepend-icon="mdi-send"
              @click="testEndpoint"
              :loading="testing"
              :disabled="!selectedEndpoint"
            >
              {{ t('apiDocs.tester.test') }}
            </v-btn>
            
            <v-code-block 
              v-if="testResponse"
              language="json" 
              :code="testResponse"
              class="mt-4"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Configuración base
const baseUrl = ref(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081')

// Estados reactivos
const activeSection = ref('introduction')
const systemTab = ref('response')
const ollamaTab = ref('response')
const selectedEndpoint = ref('')
const serverParam = ref('192.168.0.104:11434')
const testing = ref(false)
const testResponse = ref('')

// Secciones de navegación
const apiSections = [
  { key: 'introduction', title: 'apiDocs.introduction.title', icon: 'mdi-information' },
  { key: 'authentication', title: 'apiDocs.authentication.title', icon: 'mdi-shield-key' },
  { key: 'system-endpoints', title: 'apiDocs.endpoints.system.title', icon: 'mdi-monitor' },
  { key: 'ollama-endpoints', title: 'apiDocs.endpoints.ollama.title', icon: 'mdi-robot' },
  { key: 'error-codes', title: 'apiDocs.errorCodes.title', icon: 'mdi-alert-circle' },
  { key: 'api-tester', title: 'apiDocs.tester.title', icon: 'mdi-play-circle' }
]

// Endpoints para pruebas
const testEndpoints = [
  { title: 'Sistema - Métricas', value: '/api/v1/metrics/system' },
  { title: 'Ollama - Tags', value: '/api/v1/ollama/tags' },
  { title: 'Ollama - Métricas', value: '/api/v1/metrics/ollama' }
]

// Códigos de error
const errorCodes = [
  {
    code: 200,
    description: 'apiDocs.errorCodes.200',
    solution: 'apiDocs.errorCodes.200solution'
  },
  {
    code: 400,
    description: 'apiDocs.errorCodes.400',
    solution: 'apiDocs.errorCodes.400solution'
  },
  {
    code: 401,
    description: 'apiDocs.errorCodes.401',
    solution: 'apiDocs.errorCodes.401solution'
  },
  {
    code: 404,
    description: 'apiDocs.errorCodes.404',
    solution: 'apiDocs.errorCodes.404solution'
  },
  {
    code: 500,
    description: 'apiDocs.errorCodes.500',
    solution: 'apiDocs.errorCodes.500solution'
  },
  {
    code: 502,
    description: 'apiDocs.errorCodes.502',
    solution: 'apiDocs.errorCodes.502solution'
  }
]

// Ejemplos de código
const authExample = computed(() => `curl -X GET "${baseUrl.value}/api/v1/metrics/system" \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"`)

const systemResponseSchema = `{
  "cpu": {
    "usage": "number",
    "cores": "number"
  },
  "memory": {
    "used": "number",
    "total": "number",
    "percentage": "number"
  },
  "disk": {
    "used": "number",
    "total": "number",
    "percentage": "number"
  },
  "timestamp": "string"
}`

const systemResponseExample = `{
  "cpu": {
    "usage": 45.2,
    "cores": 8
  },
  "memory": {
    "used": 8589934592,
    "total": 17179869184,
    "percentage": 50.0
  },
  "disk": {
    "used": 107374182400,
    "total": 1073741824000,
    "percentage": 10.0
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`

const ollamaResponseSchema = `{
  "models": [
    {
      "name": "string",
      "model": "string",
      "size": "number",
      "digest": "string",
      "details": {
        "parent_model": "string",
        "format": "string",
        "family": "string",
        "families": ["string"],
        "parameter_size": "string",
        "quantization_level": "string"
      },
      "expires_at": "string",
      "size_vram": "number"
    }
  ]
}`

const ollamaResponseExample = `{
  "models": [
    {
      "name": "llama3.2:latest",
      "model": "llama3.2:latest",
      "size": 2019393189,
      "digest": "a80c4f17acd55265feec403c7aef86be0c25983ab279d83f3bcd3abbcb5b8b72",
      "details": {
        "parent_model": "",
        "format": "gguf",
        "family": "llama",
        "families": ["llama"],
        "parameter_size": "3.2B",
        "quantization_level": "Q4_0"
      },
      "expires_at": "2024-12-25T10:17:11.906312474-06:00",
      "size_vram": 0
    }
  ]
}`

const ollamaCurlExample = computed(() => `curl -X GET "${baseUrl.value}/api/v1/ollama/tags?server=192.168.0.104:11434" \\
  -H "Accept: application/json"`)

const ollamaMetricsExample = `{
  "server": "192.168.0.104:11434",
  "status": "online",
  "models": 3,
  "memory_usage": 2048,
  "gpu_usage": 75.5,
  "timestamp": "2024-01-15T10:30:00Z"
}`

// Métodos
const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

const getErrorColor = (code: number) => {
  if (code >= 200 && code < 300) return 'success'
  if (code >= 400 && code < 500) return 'warning'
  if (code >= 500) return 'error'
  return 'info'
}

const testEndpoint = async () => {
  testing.value = true
  testResponse.value = ''
  
  try {
    let url = `${baseUrl.value}${selectedEndpoint.value}`
    
    if (selectedEndpoint.value === '/api/v1/ollama/tags' && serverParam.value) {
      url += `?server=${serverParam.value}`
    }
    
    const response = await fetch(url)
    const data = await response.json()
    
    testResponse.value = JSON.stringify(data, null, 2)
  } catch (error) {
    testResponse.value = JSON.stringify({
      error: 'Failed to fetch',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, null, 2)
  } finally {
    testing.value = false
  }
}

// Observer para actualizar sección activa
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { threshold: 0.5 }
  )
  
  apiSections.forEach((section) => {
    const element = document.getElementById(section.key)
    if (element) observer?.observe(element)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.api-docs-view {
  max-width: 1400px;
  margin: 0 auto;
}

.sticky-nav {
  position: sticky;
  top: 20px;
}

.endpoint-item {
  border-left: 3px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.v-code {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}
</style>

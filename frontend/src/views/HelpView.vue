<template>
  <v-container fluid class="help-view">
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-6">
          <v-icon size="48" class="mr-4" color="primary">mdi-help-circle</v-icon>
          <div>
            <h1 class="text-h4 font-weight-bold">{{ t('help.title') }}</h1>
            <p class="text-body-1 text-medium-emphasis mb-0">{{ t('help.subtitle') }}</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Navegación lateral -->
      <v-col cols="12" md="3">
        <v-card class="sticky-nav">
          <v-list>
            <v-list-subheader>{{ t('help.sections.title') }}</v-list-subheader>
            <v-list-item
              v-for="section in helpSections"
              :key="section.key"
              :active="activeSection === section.key"
              @click="scrollToSection(section.key)"
              color="primary"
            >
              <template v-slot:prepend>
                <v-icon size="small" :icon="section.icon" />
              </template>
              <v-list-item-title class="text-body-2">{{ t(section.title) }}</v-list-item-title>
            </v-list-item>
          </v-list>

          <!-- Búsqueda rápida -->
          <v-divider class="my-2" />
          <v-card-text>
            <v-text-field
              v-model="searchQuery"
              :label="t('help.search')"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
            />
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Contenido principal -->
      <v-col cols="12" md="9">
        <!-- Introducción -->
        <v-card id="getting-started" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-rocket-launch</v-icon>
            {{ t('help.gettingStarted.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.gettingStarted.description') }}</p>
            
            <v-stepper non-linear>
              <v-stepper-header>
                <v-stepper-item
                  v-for="(step, index) in gettingStartedSteps"
                  :key="index"
                  :complete="index < 3"
                  :value="index + 1"
                >
                  {{ t(step.title) }}
                </v-stepper-item>
              </v-stepper-header>

              <v-stepper-window>
                <v-stepper-window-item
                  v-for="(step, index) in gettingStartedSteps"
                  :key="index"
                  :value="index + 1"
                >
                  <div class="pa-4">
                    <h4 class="text-subtitle-1 mb-2">{{ t(step.title) }}</h4>
                    <p>{{ t(step.description) }}</p>
                    <v-alert
                      v-if="step.tip"
                      type="info"
                      variant="tonal"
                      class="mt-3"
                    >
                      <strong>💡 {{ t('help.tip') }}:</strong> {{ t(step.tip) }}
                    </v-alert>
                  </div>
                </v-stepper-window-item>
              </v-stepper-window>
            </v-stepper>
          </v-card-text>
        </v-card>

        <!-- Dashboard -->
        <v-card id="dashboard" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-view-dashboard</v-icon>
            {{ t('help.dashboard.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.dashboard.description') }}</p>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-img
                    src="/dashboard-preview.png"
                    height="200"
                    cover
                    class="bg-grey-lighten-3"
                  >
                    <div class="d-flex align-center justify-center h-100">
                      <v-icon size="64" color="grey-lighten-1">mdi-image</v-icon>
                    </div>
                  </v-img>
                  <v-card-text>
                    <h4 class="text-subtitle-1">{{ t('help.dashboard.overview') }}</h4>
                    <p class="text-body-2">{{ t('help.dashboard.overviewDesc') }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <div class="feature-list">
                  <div v-for="feature in dashboardFeatures" :key="feature.key" class="d-flex mb-3">
                    <v-icon :color="feature.color" class="mr-3" :icon="feature.icon" />
                    <div>
                      <div class="font-weight-medium">{{ t(feature.title) }}</div>
                      <div class="text-body-2 text-medium-emphasis">{{ t(feature.description) }}</div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Gestión de Servidores -->
        <v-card id="servers" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-server-network</v-icon>
            {{ t('help.servers.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.servers.description') }}</p>
            
            <v-expansion-panels>
              <v-expansion-panel v-for="serverTopic in serverTopics" :key="serverTopic.key">
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" :icon="serverTopic.icon" />
                    {{ t(serverTopic.title) }}
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p>{{ t(serverTopic.description) }}</p>
                  
                  <div v-if="serverTopic.steps">
                    <h5 class="text-subtitle-2 mb-2">{{ t('help.steps') }}:</h5>
                    <ol>
                      <li v-for="step in serverTopic.steps" :key="step" class="mb-1">
                        {{ t(step) }}
                      </li>
                    </ol>
                  </div>
                  
                  <v-alert
                    v-if="serverTopic.warning"
                    type="warning"
                    variant="tonal"
                    class="mt-3"
                  >
                    {{ t(serverTopic.warning) }}
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Monitoreo -->
        <v-card id="monitoring" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-monitor-eye</v-icon>
            {{ t('help.monitoring.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.monitoring.description') }}</p>
            
            <v-tabs v-model="monitoringTab">
              <v-tab value="metrics">{{ t('help.monitoring.metrics') }}</v-tab>
              <v-tab value="alerts">{{ t('help.monitoring.alerts') }}</v-tab>
              <v-tab value="performance">{{ t('help.monitoring.performance') }}</v-tab>
            </v-tabs>
            
            <v-window v-model="monitoringTab" class="mt-4">
              <v-window-item value="metrics">
                <div class="monitoring-content">
                  <h4 class="text-subtitle-1 mb-3">{{ t('help.monitoring.metricsTitle') }}</h4>
                  <p>{{ t('help.monitoring.metricsDesc') }}</p>
                  
                  <v-list>
                    <v-list-item v-for="metric in availableMetrics" :key="metric.key">
                      <template v-slot:prepend>
                        <v-icon :color="metric.color" :icon="metric.icon" />
                      </template>
                      <v-list-item-title>{{ t(metric.name) }}</v-list-item-title>
                      <v-list-item-subtitle>{{ t(metric.description) }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
              </v-window-item>

              <v-window-item value="alerts">
                <div class="monitoring-content">
                  <h4 class="text-subtitle-1 mb-3">{{ t('help.monitoring.alertsTitle') }}</h4>
                  <p>{{ t('help.monitoring.alertsDesc') }}</p>
                  
                  <v-alert type="info" variant="tonal" class="mb-4">
                    {{ t('help.monitoring.alertsNote') }}
                  </v-alert>
                </div>
              </v-window-item>

              <v-window-item value="performance">
                <div class="monitoring-content">
                  <h4 class="text-subtitle-1 mb-3">{{ t('help.monitoring.performanceTitle') }}</h4>
                  <p>{{ t('help.monitoring.performanceDesc') }}</p>
                </div>
              </v-window-item>
            </v-window>
          </v-card-text>
        </v-card>

        <!-- Solución de Problemas -->
        <v-card id="troubleshooting" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-wrench</v-icon>
            {{ t('help.troubleshooting.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.troubleshooting.description') }}</p>
            
            <v-expansion-panels multiple>
              <v-expansion-panel v-for="issue in commonIssues" :key="issue.key">
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon class="mr-2" :color="issue.severity === 'high' ? 'error' : 'warning'">
                      {{ issue.icon }}
                    </v-icon>
                    {{ t(issue.title) }}
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="mb-3">
                    <strong>{{ t('help.troubleshooting.problem') }}:</strong>
                    <p>{{ t(issue.problem) }}</p>
                  </div>
                  
                  <div class="mb-3">
                    <strong>{{ t('help.troubleshooting.solution') }}:</strong>
                    <ol>
                      <li v-for="step in issue.solution" :key="step" class="mb-1">
                        {{ t(step) }}
                      </li>
                    </ol>
                  </div>
                  
                  <v-alert
                    v-if="issue.note"
                    :type="issue.severity === 'high' ? 'error' : 'warning'"
                    variant="tonal"
                  >
                    <strong>{{ t('help.note') }}:</strong> {{ t(issue.note) }}
                  </v-alert>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- FAQ -->
        <v-card id="faq" class="mb-6">
          <v-card-title>
            <v-icon class="mr-2">mdi-frequently-asked-questions</v-icon>
            {{ t('help.faq.title') }}
          </v-card-title>
          <v-card-text>
            <v-expansion-panels>
              <v-expansion-panel v-for="faq in frequentlyAsked" :key="faq.key">
                <v-expansion-panel-title>
                  {{ t(faq.question) }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <p>{{ t(faq.answer) }}</p>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>

        <!-- Contacto y Soporte -->
        <v-card id="support">
          <v-card-title>
            <v-icon class="mr-2">mdi-lifebuoy</v-icon>
            {{ t('help.support.title') }}
          </v-card-title>
          <v-card-text>
            <p>{{ t('help.support.description') }}</p>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon size="48" color="primary" class="mb-3">mdi-email</v-icon>
                    <h4 class="text-subtitle-1 mb-2">{{ t('help.support.email') }}</h4>
                    <p class="text-body-2">peter@cognitrack.com</p>
                    <v-btn color="primary" variant="outlined" size="small">
                      {{ t('help.support.sendEmail') }}
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <v-col cols="12" md="6">
                <v-card variant="outlined">
                  <v-card-text class="text-center">
                    <v-icon size="48" color="success" class="mb-3">mdi-github</v-icon>
                    <h4 class="text-subtitle-1 mb-2">{{ t('help.support.github') }}</h4>
                    <p class="text-body-2">github.com/pcaravaca/cognitrack</p>
                    <v-btn color="success" variant="outlined" size="small">
                      {{ t('help.support.viewRepo') }}
                    </v-btn>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// Estados reactivos
const activeSection = ref('getting-started')
const searchQuery = ref('')
const monitoringTab = ref('metrics')

// Secciones de ayuda
const helpSections = [
  { key: 'getting-started', title: 'help.gettingStarted.title', icon: 'mdi-rocket-launch' },
  { key: 'dashboard', title: 'help.dashboard.title', icon: 'mdi-view-dashboard' },
  { key: 'servers', title: 'help.servers.title', icon: 'mdi-server-network' },
  { key: 'monitoring', title: 'help.monitoring.title', icon: 'mdi-monitor-eye' },
  { key: 'troubleshooting', title: 'help.troubleshooting.title', icon: 'mdi-wrench' },
  { key: 'faq', title: 'help.faq.title', icon: 'mdi-frequently-asked-questions' },
  { key: 'support', title: 'help.support.title', icon: 'mdi-lifebuoy' }
]

// Pasos de inicio
const gettingStartedSteps = [
  {
    title: 'help.gettingStarted.step1.title',
    description: 'help.gettingStarted.step1.description',
    tip: 'help.gettingStarted.step1.tip'
  },
  {
    title: 'help.gettingStarted.step2.title',
    description: 'help.gettingStarted.step2.description',
    tip: 'help.gettingStarted.step2.tip'
  },
  {
    title: 'help.gettingStarted.step3.title',
    description: 'help.gettingStarted.step3.description'
  },
  {
    title: 'help.gettingStarted.step4.title',
    description: 'help.gettingStarted.step4.description'
  }
]

// Características del dashboard
const dashboardFeatures = [
  {
    key: 'realtime',
    icon: 'mdi-update',
    color: 'success',
    title: 'help.dashboard.features.realtime',
    description: 'help.dashboard.features.realtimeDesc'
  },
  {
    key: 'metrics',
    icon: 'mdi-chart-line',
    color: 'primary',
    title: 'help.dashboard.features.metrics',
    description: 'help.dashboard.features.metricsDesc'
  },
  {
    key: 'alerts',
    icon: 'mdi-bell',
    color: 'warning',
    title: 'help.dashboard.features.alerts',
    description: 'help.dashboard.features.alertsDesc'
  },
  {
    key: 'models',
    icon: 'mdi-robot',
    color: 'info',
    title: 'help.dashboard.features.models',
    description: 'help.dashboard.features.modelsDesc'
  }
]

// Temas de servidores
const serverTopics = [
  {
    key: 'add',
    icon: 'mdi-server-plus',
    title: 'help.servers.add.title',
    description: 'help.servers.add.description',
    steps: [
      'help.servers.add.step1',
      'help.servers.add.step2',
      'help.servers.add.step3',
      'help.servers.add.step4'
    ]
  },
  {
    key: 'configure',
    icon: 'mdi-cog',
    title: 'help.servers.configure.title',
    description: 'help.servers.configure.description',
    warning: 'help.servers.configure.warning'
  },
  {
    key: 'monitor',
    icon: 'mdi-eye',
    title: 'help.servers.monitor.title',
    description: 'help.servers.monitor.description'
  }
]

// Métricas disponibles
const availableMetrics = [
  {
    key: 'cpu',
    icon: 'mdi-memory',
    color: 'primary',
    name: 'help.metrics.cpu',
    description: 'help.metrics.cpuDesc'
  },
  {
    key: 'memory',
    icon: 'mdi-chip',
    color: 'success',
    name: 'help.metrics.memory',
    description: 'help.metrics.memoryDesc'
  },
  {
    key: 'gpu',
    icon: 'mdi-expansion-card',
    color: 'warning',
    name: 'help.metrics.gpu',
    description: 'help.metrics.gpuDesc'
  },
  {
    key: 'models',
    icon: 'mdi-robot',
    color: 'info',
    name: 'help.metrics.models',
    description: 'help.metrics.modelsDesc'
  }
]

// Problemas comunes
const commonIssues = [
  {
    key: 'connection',
    icon: 'mdi-lan-disconnect',
    severity: 'high',
    title: 'help.troubleshooting.connection.title',
    problem: 'help.troubleshooting.connection.problem',
    solution: [
      'help.troubleshooting.connection.solution1',
      'help.troubleshooting.connection.solution2',
      'help.troubleshooting.connection.solution3'
    ],
    note: 'help.troubleshooting.connection.note'
  },
  {
    key: 'slow',
    icon: 'mdi-speedometer-slow',
    severity: 'medium',
    title: 'help.troubleshooting.slow.title',
    problem: 'help.troubleshooting.slow.problem',
    solution: [
      'help.troubleshooting.slow.solution1',
      'help.troubleshooting.slow.solution2',
      'help.troubleshooting.slow.solution3'
    ]
  },
  {
    key: 'models',
    icon: 'mdi-robot-off',
    severity: 'medium',
    title: 'help.troubleshooting.models.title',
    problem: 'help.troubleshooting.models.problem',
    solution: [
      'help.troubleshooting.models.solution1',
      'help.troubleshooting.models.solution2'
    ]
  }
]

// Preguntas frecuentes
const frequentlyAsked = [
  {
    key: 'what',
    question: 'help.faq.what.question',
    answer: 'help.faq.what.answer'
  },
  {
    key: 'requirements',
    question: 'help.faq.requirements.question',
    answer: 'help.faq.requirements.answer'
  },
  {
    key: 'multiple',
    question: 'help.faq.multiple.question',
    answer: 'help.faq.multiple.answer'
  },
  {
    key: 'security',
    question: 'help.faq.security.question',
    answer: 'help.faq.security.answer'
  },
  {
    key: 'backup',
    question: 'help.faq.backup.question',
    answer: 'help.faq.backup.answer'
  }
]

// Métodos
const scrollToSection = (sectionId: string) => {
  activeSection.value = sectionId
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
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
  
  helpSections.forEach((section) => {
    const element = document.getElementById(section.key)
    if (element) observer?.observe(element)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.help-view {
  max-width: 1400px;
  margin: 0 auto;
}

.sticky-nav {
  position: sticky;
  top: 20px;
}

.monitoring-content {
  padding: 16px 0;
}

.feature-list {
  padding: 8px 0;
}
</style>

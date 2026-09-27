// @ts-nocheck
// 1. Importaciones principales de Vue
import { createApp } from 'vue'

// 2. Importar estilos de Tailwind CSS
import './style.css'

// 3. Importaciones de Vuetify (deben ir después de Tailwind)
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

// 4. Estilos de Vuetify y Material Design Icons
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

// 5. Estilos globales personalizados (si existen)
import '@/assets/styles/global.scss'
import '@/assets/styles/main.scss'

// 5. Vue i18n para traducción
import { createI18n } from 'vue-i18n'
import es from './locales/es.json' assert { type: 'json' }
import en from './locales/en.json' assert { type: 'json' }

// 6. Otras dependencias
import { createPinia } from 'pinia'

// 7. Componentes de la aplicación
import App from './App.vue'
import router from './router'
import VCodeBlock from '@/components/common/VCodeBlock.vue'

// Crea la aplicación
const app = createApp(App)

// Configura i18n
const i18n = createI18n({
  locale: 'es', // idioma por defecto
  fallbackLocale: 'en',
  messages: {
    es,
    en
  },
  legacy: false, // usar Composition API
  globalInjection: true
})

// Configura Pinia
const pinia = createPinia()
app.use(pinia)
app.use(i18n)

// Configuración del tema claro
const lightTheme = {
  dark: false,
  colors: {
    background: '#f5f5f5',
    surface: '#FFFFFF',
    'surface-variant': '#E8E8E8',
    'on-surface': '#213547',
    primary: '#1976D2',
    'primary-darken-1': '#1565C0',
    secondary: '#424242',
    'secondary-darken-1': '#333333',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-error': '#FFFFFF',
    'on-info': '#FFFFFF',
    'on-success': '#FFFFFF',
    'on-warning': '#000000',
  },
}

// Configuración del tema oscuro
const darkTheme = {
  dark: true,
  colors: {
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2D2D2D',
    'on-surface': '#E0E0E0',
    primary: '#7FB3D5',
    'primary-darken-1': '#5D8FB8',
    secondary: '#A0A0A0',
    'secondary-darken-1': '#7A7A7A',
    error: '#CF6679',
    info: '#75C7FB',
    success: '#81C784',
    warning: '#FFB74D',
    'on-primary': '#000000',
    'on-secondary': '#000000',
    'on-error': '#000000',
    'on-info': '#000000',
    'on-success': '#000000',
    'on-warning': '#000000',
  },
  variables: {
    'border-color': '#333333',
    'border-opacity': 0.5,
    'high-emphasis-opacity': 0.87,
    'medium-emphasis-opacity': 0.6,
    'disabled-opacity': 0.38,
    'idle-opacity': 0.04,
    'hover-opacity': 0.08,
    'focus-opacity': 0.12,
    'selected-opacity': 0.12,
    'activated-opacity': 0.12,
    'pressed-opacity': 0.16,
    'dragged-opacity': 0.08,
  }
}

// Configura Vuetify
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: lightTheme,
      dark: darkTheme,
    },
  },
  defaults: {
    VBtn: {
      color: 'primary',
      variant: 'tonal',
      rounded: 'sm',
    },
    VCard: {
      elevation: 0,
      rounded: 'lg',
      color: 'surface',
    },
    VSheet: {
      elevation: 0,
      rounded: 'lg',
      color: 'surface',
    },
  },
})

app.use(vuetify)

// Registrar componentes globales
app.component('VCodeBlock', VCodeBlock)

// Configura el router (esto debe ir después de Pinia e i18n)
app.use(router)

// Monta la aplicación
app.mount('#app')

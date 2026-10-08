// @ts-nocheck
// 1. Importaciones principales de Vue
import { createApp } from 'vue'

// 2. Importar estilos de Vuetify (debe ir antes de Tailwind)
// Importar CSS directamente (NO dentro de .sass porque @import de CSS en .sass no funciona en Vite 4)
import 'vuetify/dist/vuetify.css'
import './styles/vuetify.sass'

// 2b. Importar estilos de Tailwind CSS
import './style.css'

// 3. Estilos globales personalizados (si existen)
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

// 8. Configuración de Vuetify (incluye iconos MDI y componentes de labs)
import vuetify from './plugins/vuetify'

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

// Configura Vuetify (usa la configuración de plugins/vuetify.ts con iconos MDI)
app.use(vuetify)

// Registrar componentes globales
app.component('VCodeBlock', VCodeBlock)

// Configura el router (esto debe ir después de Pinia e i18n)
app.use(router)

// Monta la aplicación
app.mount('#app')

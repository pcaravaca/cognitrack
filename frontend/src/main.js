import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import vuetify from './plugins/vuetify'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

const app = createApp(App)

// Importante: el orden de los plugins puede afectar el comportamiento
app.use(pinia)  // Pinia debe ir antes de Vuetify
app.use(vuetify)
app.use(router)  // Añadir el router para habilitar la navegación

app.mount('#app')

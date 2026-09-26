import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTheme } from 'vuetify'
import type { ThemeDefinition } from 'vuetify'

// Definir temas personalizados
const lightTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',
    secondary: '#424242',
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#f5f5f5',
    surface: '#ffffff',
    'on-surface': '#000000',
    'on-background': '#000000',
  }
} as const

const darkTheme = {
  dark: true,
  colors: {
    primary: '#2196F3',
    secondary: '#424242',
    accent: '#FF4081',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#121212',
    surface: '#1E1E1E',
    'on-surface': '#FFFFFF',
    'on-background': '#FFFFFF',
  }
} as const

export const useAppStore = defineStore('app', () => {
  // Estado de la aplicación
  const loading = ref(false)
  const darkMode = ref(false)
  const drawer = ref(true)
  const miniVariant = ref(false)
  const pageTitle = ref('CogniTrack')
  const notifications = ref<Array<{
    id: number
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout: number
  }>>([])
  
  // Usar el tema de Vuetify
  const theme = useTheme()
  
  // Computed properties
  const currentTheme = computed(() => darkMode.value ? 'dark' : 'light')
  
  // Métodos
  const toggleTheme = () => {
    darkMode.value = !darkMode.value
    const themeName = darkMode.value ? 'dark' : 'light'
    theme.global.name.value = themeName
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', String(darkMode.value))
    
    // Aplicar tema personalizado
    if (themeName === 'light') {
      Object.assign(theme.themes.value.light, lightTheme)
    } else {
      Object.assign(theme.themes.value.dark, darkTheme)
    }
  }
  
  const toggleDrawer = () => {
    drawer.value = !drawer.value
  }
  
  const toggleMiniVariant = () => {
    miniVariant.value = !miniVariant.value
  }
  
  // Establecer el título de la página
  const setPageTitle = (title: string) => {
    pageTitle.value = title
    document.title = `${title} | CogniTrack`
  }
  
  // Mostrar notificación
  const showNotification = (options: {
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
    timeout?: number
  }) => {
    const id = Date.now()
    const notification = {
      id,
      type: options.type,
      message: options.message,
      timeout: options.timeout || 5000
    }
    
    notifications.value.push(notification)
    
    // Eliminar notificación después del tiempo especificado
    if (notification.timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.timeout)
    }
    
    return id
  }
  
  // Métodos de conveniencia para tipos de notificación
  const showSuccess = (message: string, timeout?: number) => {
    return showNotification({
      type: 'success',
      message,
      timeout
    })
  }
  
  const showError = (message: string, timeout?: number) => {
    return showNotification({
      type: 'error',
      message,
      timeout: timeout || 10000 // Errores duran más por defecto
    })
  }
  
  const showInfo = (message: string, timeout?: number) => {
    return showNotification({
      type: 'info',
      message,
      timeout
    })
  }
  
  const showWarning = (message: string, timeout?: number) => {
    return showNotification({
      type: 'warning',
      message,
      timeout
    })
  }
  
  // Eliminar notificación
  const removeNotification = (id: number) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  // Inicialización
  const init = () => {
    // Cargar preferencia de tema
    const savedDarkMode = localStorage.getItem('darkMode')
    if (savedDarkMode !== null) {
      darkMode.value = savedDarkMode === 'true'
      theme.global.name.value = darkMode.value ? 'dark' : 'light'
    }
    
    // Aplicar temas personalizados
    theme.themes.value.light = lightTheme
    theme.themes.value.dark = darkTheme
  }
  
  // Inicializar al crear el store
  init()
  
  return {
    // Estado
    loading,
    darkMode,
    drawer,
    miniVariant,
    pageTitle,
    setPageTitle,
    notifications,
    
    // Computed
    currentTheme,
    
    // Métodos
    toggleTheme,
    toggleDrawer,
    toggleMiniVariant,
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeNotification,
    init
  }
})

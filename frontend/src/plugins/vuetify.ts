// Importaciones de Vuetify
import { createVuetify } from 'vuetify'
import type { ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import { VDataTable } from 'vuetify/labs/VDataTable'

// Definición del tema claro
const lightTheme: ThemeDefinition = {
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
}

// Definición del tema oscuro
const darkTheme: ThemeDefinition = {
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
}

// Configuración de Vuetify
export default createVuetify({
  // Componentes y directivas
  components: {
    ...components,
    VDataTable,
  },
  directives,
  
  // Configuración de iconos
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi }
  },
  
  // Configuración del tema
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: lightTheme,
      dark: darkTheme
    }
  },
  
  // Configuración por defecto de los componentes
  defaults: {
    VBtn: {
      variant: 'flat',
      height: '44px',
      rounded: 'md',
      size: 'small',
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      hideDetails: 'auto',
    },
    VCard: {
      rounded: 'lg',
      elevation: 0,
      class: 'border',
    },
  },
})

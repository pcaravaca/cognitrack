// Configuración de la aplicación
const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'CogniTrack',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    environment: import.meta.env.MODE || 'development',
  },
  
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
  },
  
  auth: {
    enabled: import.meta.env.VITE_AUTH_ENABLED === 'true',
    auth0: {
      domain: import.meta.env.VITE_AUTH0_DOMAIN || '',
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
      audience: import.meta.env.VITE_AUTH0_AUDIENCE || '',
    },
  },
  
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    logging: import.meta.env.VITE_ENABLE_LOGGING !== 'false',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
  
  // Función para verificar si estamos en desarrollo
  isDevelopment: () => import.meta.env.DEV,
  
  // Función para verificar si estamos en producción
  isProduction: () => import.meta.env.PROD,
};

export default config;

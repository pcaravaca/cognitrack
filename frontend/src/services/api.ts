import axios, { AxiosRequestConfig } from 'axios'
import { useAuthStore } from '@/stores/auth'

// Extender la interfaz de configuración de Axios para incluir la propiedad retry
declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: number;
    _retry?: boolean;
  }
}

// Configuración base de axios
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor de peticiones - agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    // No inyectar token en endpoints de login/logout (enviarían token viejo inválido)
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/logout')) {
      return config
    }
    const token = localStorage.getItem('cognitrack_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuestas - manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    
    // Si es una ruta de login/logout o ya se reintentó, no manejamos el error aquí
    if (!originalRequest || originalRequest.url?.includes('/auth/') || originalRequest._retry) {
      return Promise.reject(error)
    }
    
    // Manejar errores de red
    if (error.code === 'ECONNABORTED' || !error.response) {
      console.error('❌ Error de conexión con el servidor')
      return Promise.reject({
        message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
        isNetworkError: true
      })
    }
    
    const { status, data } = error.response
    
    // Manejar códigos de estado específicos
    switch (status) {
      case 401: // No autorizado
        if (!originalRequest.url.includes('/public/')) {
          console.warn('🔒 Token inválido o expirado')
          // No llamar a logout directamente para evitar dependencias circulares
          localStorage.removeItem('cognitrack_token')
          
          // Si la página actual no es el login, redirigir
          if (!window.location.pathname.includes('/login')) {
            window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}&session=expired`
          }
        }
        break
        
      case 403: // Prohibido
        console.warn('⛔ Acceso denegado')
        if (window.location.pathname !== '/unauthorized') {
          window.location.href = '/unauthorized'
        }
        break
        
      case 404: // No encontrado
        console.warn('🔍 Recurso no encontrado:', originalRequest.url)
        break
        
      case 429: // Demasiadas solicitudes
        console.warn('🐌 Demasiadas solicitudes, por favor espera')
        return Promise.reject({
          message: 'Has realizado demasiadas solicitudes. Por favor, espera un momento antes de intentar nuevamente.',
          isRateLimit: true
        })
        
      case 500: // Error interno del servidor
      case 502: // Bad Gateway
      case 503: // Service Unavailable
      case 504: // Gateway Timeout
        console.error('🔴 Error del servidor:', status, data?.message || 'Error desconocido')
        return Promise.reject({
          message: 'Error en el servidor. Por favor, inténtalo de nuevo más tarde.',
          isServerError: true,
          status
        })
        
      default:
        console.error(`Error ${status}:`, data?.message || 'Error desconocido')
    }
    
    // Si es un error de validación, devolver los errores específicos
    if (status === 422 && data?.errors) {
      return Promise.reject({
        message: 'Error de validación',
        errors: data.errors,
        isValidationError: true
      })
    }
    
    // Para otros errores, devolver un mensaje genérico
    return Promise.reject({
      message: data?.message || 'Ha ocurrido un error inesperado',
      status,
      data: data
    })
  }
)

export default api

// Servicios específicos de la API
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials, {
      // No incluir el token para la petición de login
      headers: { Authorization: '' },
      // No reintentar automáticamente en caso de error
      retry: 0
    }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  verifyToken: () =>
    api.get('/auth/verify'),
  
  getCurrentUser: () =>
    api.get('/auth/me', {
      // Reintentar una vez si falla
      retry: 1,
      // Tiempo de espera más corto para esta petición
      timeout: 5000
    }),
    
  refreshToken: () =>
    api.post('/auth/refresh', null, {
      // No incluir el token actual para evitar bucles
      headers: { Authorization: '' }
    })
}

export const systemAPI = {
  getHealth: () =>
    api.get('/health'),
  
  getMetrics: () =>
    api.get('/metrics')
}

export const ollamaAPI = {
  getVersion: () =>
    api.get('/version'),
    
  getModels: () =>
    api.get('/models'),
    
  getProcesses: () =>
    api.get('/processes')
}

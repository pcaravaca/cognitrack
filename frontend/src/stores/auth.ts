import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authAPI } from '@/services/api'
import api from '@/services/api'
import { useServersStore } from './servers'
import type { LoginCredentials, User, AuthResponse } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('cognitrack_token'))
  const savedReturnUrl = localStorage.getItem('cognitrack_return_url')
  const returnUrl = ref<string | null>(
    (savedReturnUrl && 
     savedReturnUrl !== 'false' && 
     savedReturnUrl !== 'null' && 
     savedReturnUrl.trim() !== '' &&
     !savedReturnUrl.includes('/false'))
      ? savedReturnUrl
      : null
  )
  const isLoading = ref<boolean>(false)
  const loginError = ref<string | null>(null)
  
  // Set return URL for redirect after login
  function setReturnUrl(url: string | null) {
    if (url && 
        url !== 'false' && 
        url !== 'null' && 
        url.trim() !== '' && 
        !url.includes('/false')) {
      returnUrl.value = url
      localStorage.setItem('cognitrack_return_url', url)
    } else {
      returnUrl.value = null
      localStorage.removeItem('cognitrack_return_url')
    }
  }

  const isAuthenticated = computed(() => !!token.value)
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
  })

  interface LoginResult {
    success: boolean;
    user?: User | null;
    redirectTo?: string;
    error?: string;
  }
  
  interface ApiAuthResponse {
    user: User;
    token: string;
    expiresIn?: number;
    tokenType?: string;
  }

  async function login(credentials: LoginCredentials): Promise<LoginResult> {
    console.log('[AUTH] Iniciando proceso de login...', { username: credentials.username })
    isLoading.value = true
    loginError.value = null
    
    try {
      console.log('[AUTH] Enviando credenciales a la API...')
      const response = await authAPI.login(credentials)
      console.log('[AUTH] Respuesta de la API recibida:', response.status, response.data ? 'con datos' : 'sin datos')
      
      if (response.data) {
        console.log('[AUTH] Datos de autenticación recibidos:', response.data)
        const { token: authToken, user: userData } = response.data as ApiAuthResponse
        console.log('[AUTH] Token recibido:', authToken ? '***' + authToken.slice(-8) : 'No hay token')
        console.log('[AUTH] Datos de usuario recibidos:', userData)
        
        // Mapear el usuario del backend
        const userProfile: User = {
          id: userData.id || userData.username,
          username: userData.username,
          email: userData.email || `${userData.username}@cognitrack.local`,
          displayName: userData.displayName || userData.username,
          role: userData.role || 'user',
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          permissions: userData.permissions || [],
          settings: userData.settings || {},
          isActive: userData.isActive !== false
        }
        
        // Guardar token y actualizar headers
        token.value = authToken
        user.value = userProfile
        localStorage.setItem('cognitrack_token', authToken)
        api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
        
        // Obtener datos completos del usuario
        console.log('[AUTH] Obteniendo datos completos del usuario...')
        try {
          await fetchCurrentUser()
          console.log('[AUTH] Datos de usuario actualizados correctamente')
        } catch (fetchError) {
          console.error('[AUTH] Error al obtener datos del usuario:', fetchError)
          throw fetchError
        }
        
        // Verificar si hay una URL de retorno guardada y válida
        let redirectTo = '/dashboard' // Ruta por defecto
        
        if (returnUrl.value && 
            returnUrl.value !== 'false' && 
            returnUrl.value !== '/false' &&
            !returnUrl.value.includes('false')) {
          redirectTo = returnUrl.value
          console.log(`🔀 Redirigiendo a URL guardada: ${redirectTo}`)
        } else {
          console.log('🔀 Usando ruta por defecto (dashboard)')
        }
        
        // Limpiar la URL de retorno después de usarla
        setReturnUrl(null)
        
        // Inicializar servidores después del login exitoso
        try {
          console.log('🔄 Inicializando servidores después del login...')
          const serversStore = useServersStore()
          await serversStore.initializeServers()
          console.log('✅ Servidores inicializados correctamente')
        } catch (serverError) {
          console.warn('⚠️ Error al inicializar servidores después del login:', serverError)
          // No fallar el login si hay error en la inicialización de servidores
        }
        
        console.log(`✅ Login exitoso. Redirigiendo a: ${redirectTo}`)
        return { 
          success: true, 
          user: userProfile, 
          redirectTo: redirectTo.startsWith('/') ? redirectTo : `/${redirectTo}`
        }
      } else {
        return {
          success: false,
          error: 'No se recibieron datos de autenticación',
          user: null
        }
      }
    } catch (error: any) {
      console.error('[AUTH] Error completo en login:', error)
      console.error('[AUTH] Error response data:', error.response?.data)
      console.error('[AUTH] Error status:', error.response?.status)
      console.error('[AUTH] Error headers:', error.response?.headers)
      
      let errorMessage = 'Error de conexión. Verifica tu conexión a internet.'
      
      if (error.response) {
        console.log(`[AUTH] Error HTTP ${error.response.status}:`, error.response.data)
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Solicitud incorrecta'
            break
          case 401:
            errorMessage = error.response.data?.message || 'Credenciales incorrectas'
            break
          case 403:
            errorMessage = error.response.data?.message || 'Acceso no autorizado'
            break
          case 404:
            errorMessage = 'El servicio de autenticación no está disponible'
            break
          case 429:
            errorMessage = 'Demasiados intentos. Intenta más tarde'
            break
          case 500:
            errorMessage = 'Error interno del servidor. Por favor, inténtalo de nuevo más tarde.'
            break
          default:
            errorMessage = error.response.data?.message || `Error en el servidor (${error.response.status})`
        }
      } else if (error.request) {
        console.error('[AUTH] No se recibió respuesta del servidor:', error.request)
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.'
      } else {
        console.error('[AUTH] Error al configurar la solicitud:', error.message)
        errorMessage = `Error de configuración: ${error.message}`
      }
      
      loginError.value = errorMessage
      return { 
        success: false, 
        error: errorMessage,
        user: null
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      if (token.value) {
        // Notificar al servidor sobre el logout
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar estado siempre
      user.value = null
      token.value = null
      loginError.value = null
      
      // Eliminar token de localStorage
      localStorage.removeItem('cognitrack_token')
      
      // Headers se limpian automáticamente por el interceptor
      
      // Redirigir a landing
      window.location.href = '/'
    }
  }

  // Bandera para evitar múltiples verificaciones simultáneas
  let isCheckingAuth = false
  
  async function checkAuth(): Promise<boolean> {
    // Si ya estamos verificando, no hacer nada
    if (isCheckingAuth) {
      console.log('⏳ Verificación de autenticación ya en curso...')
      return isAuthenticated.value
    }
    
    if (!token.value) {
      console.log('❌ No hay token de autenticación')
      return false
    }
    
    isCheckingAuth = true
    
    try {
      console.log('🔍 Verificando autenticación con el servidor...')
      await fetchCurrentUser()
      console.log('✅ Autenticación verificada correctamente')
      return true
    } catch (error: any) {
      console.error('❌ Error al verificar autenticación:', error)
      // No llamar a logout() aquí para evitar bucles, solo limpiar el token
      if (error?.response?.status === 401) {
        console.log('🔒 Token inválido o expirado')
        token.value = null
        localStorage.removeItem('cognitrack_token')
        user.value = null
      }
      return false
    } finally {
      isCheckingAuth = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (!token.value) {
      console.log('⚠️ No hay token para obtener el usuario actual')
      return
    }
    
    try {
      console.log('🔍 Obteniendo datos del usuario actual...')
      const response = await authAPI.getCurrentUser()
      
      if (response.data) {
        console.log('✅ Datos del usuario recibidos:', response.data)
        const userData = response.data
        
        // Mapear datos del usuario al formato esperado por el frontend
        const mappedUser: User = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          displayName: userData.username, // Usar username como displayName por defecto
          firstName: userData.full_name?.split(' ')[0] || userData.username,
          lastName: userData.full_name?.split(' ').slice(1).join(' ') || '',
          role: userData.is_admin ? 'admin' : 'user',
          createdAt: userData.created_at || new Date().toISOString(),
          lastLogin: new Date().toISOString(),
          permissions: [],
          settings: {},
          isActive: true,
          avatar: undefined
        }
        
        console.log('👤 Usuario mapeado:', mappedUser)
        user.value = mappedUser
      } else {
        console.warn('⚠️ No se recibieron datos del usuario')
        throw new Error('No se recibieron datos del usuario')
      }
    } catch (error: any) {
      console.error('❌ Error al obtener el usuario actual:', error)
      
      // Limpiar el token si hay un error de autenticación
      if (error.response?.status === 401) {
        console.log('🔒 Token inválido o expirado, cerrando sesión...')
        // No llamar a logout() aquí para evitar bucles, checkAuth lo manejará
        token.value = null
        localStorage.removeItem('cognitrack_token')
      }
      
      // Relanzar el error para que sea manejado por checkAuth
      throw error
    }
  }

  return {
    user,
    token,
    returnUrl,
    isAuthenticated,
    userFullName,
    isLoading,
    loginError,
    login,
    logout,
    checkAuth,
    fetchCurrentUser,
    setReturnUrl
  }
})

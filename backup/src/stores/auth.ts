import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { LoginCredentials, User } from '@/types/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const returnUrl = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value)
  const userFullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
  })

  async function login(credentials: LoginCredentials) {
    try {
      // TODO: Implementar llamada real a la API
      // const response = await authService.login(credentials)
      
      // Simular respuesta exitosa
      const response = {
        data: {
          token: 'dummy-jwt-token',
          user: {
            id: 1,
            username: credentials.username,
            email: 'usuario@ejemplo.com',
            firstName: 'Usuario',
            lastName: 'Demo',
            role: 'admin'
          }
        }
      }

      // Actualizar estado
      user.value = response.data.user
      token.value = response.data.token
      
      // Guardar token en localStorage
      localStorage.setItem('token', response.data.token)
      
      // Redirigir a la ruta previa o al dashboard
      router.push(returnUrl.value || '/')
      return { success: true }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      return { 
        success: false, 
        error: 'Credenciales inválidas. Por favor, intente nuevamente.'
      }
    }
  }

  function logout() {
    // Limpiar estado
    user.value = null
    token.value = null
    
    // Eliminar token de localStorage
    localStorage.removeItem('token')
    
    // Redirigir a login
    router.push('/login')
  }

  async function checkAuth() {
    if (!token.value) return false
    
    try {
      // TODO: Implementar verificación de token con el backend
      // const response = await authService.me()
      
      // Simular respuesta exitosa
      const response = {
        data: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin'
        }
      }
      
      user.value = response.data
      return true
    } catch (error) {
      console.error('Error al verificar autenticación:', error)
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userFullName,
    login,
    logout,
    checkAuth
  }
})

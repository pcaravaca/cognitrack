/**
 * Módulo de autenticación para Vuex
 * Authentication module for Vuex
 */
import axios from 'axios'
import router from '@/router'

// Estado inicial / Initial state
const state = {
  user: null,
  token: localStorage.getItem('cognitrack_token') || null,
  isAuthenticated: false,
  isLoading: false,
  loginError: null
}

// Getters
const getters = {
  isAuthenticated: (state) => {
    return !!state.token && !!state.user
  },
  currentUser: (state) => state.user,
  isAdmin: (state) => {
    return state.user ? state.user.is_admin : false
  },
  token: (state) => state.token,
  isLoading: (state) => state.isLoading,
  loginError: (state) => state.loginError
}

// Mutations
const mutations = {
  SET_LOADING(state, loading) {
    state.isLoading = loading
  },
  
  SET_USER(state, user) {
    state.user = user
    state.isAuthenticated = !!user
  },
  
  SET_TOKEN(state, token) {
    state.token = token
    if (token) {
      localStorage.setItem('cognitrack_token', token)
      // Configurar header de autorización por defecto
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      localStorage.removeItem('cognitrack_token')
      delete axios.defaults.headers.common['Authorization']
    }
  },
  
  SET_LOGIN_ERROR(state, error) {
    state.loginError = error
  },
  
  CLEAR_AUTH(state) {
    state.user = null
    state.token = null
    state.isAuthenticated = false
    state.loginError = null
    localStorage.removeItem('cognitrack_token')
    delete axios.defaults.headers.common['Authorization']
  }
}

// Actions
const actions = {
  /**
   * Inicializar autenticación desde localStorage
   * Initialize authentication from localStorage
   */
  async initAuth({ commit, state }) {
    if (state.token) {
      try {
        // Verificar si el token es válido
        // Verify if token is valid
        const response = await axios.get('/api/auth/verify-token')
        if (response.data.valid) {
          // Obtener información del usuario
          // Get user information
          const userResponse = await axios.get('/api/auth/me')
          commit('SET_USER', userResponse.data)
          
          // Configurar header de autorización
          // Set authorization header
          axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`
          
          return true
        } else {
          // Token inválido, limpiar
          // Invalid token, clear
          commit('CLEAR_AUTH')
          return false
        }
      } catch (error) {
        console.error('Error verificando token:', error)
        commit('CLEAR_AUTH')
        return false
      }
    }
    return false
  },

  /**
   * Iniciar sesión
   * Login user
   */
  async loginUser({ commit }, credentials) {
    commit('SET_LOADING', true)
    commit('SET_LOGIN_ERROR', null)

    try {
      // Preparar datos para FormData (OAuth2PasswordRequestForm)
      // Prepare data for FormData (OAuth2PasswordRequestForm)
      const formData = new FormData()
      formData.append('username', credentials.username)
      formData.append('password', credentials.password)

      const response = await axios.post('/api/auth/login', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const { access_token, user } = response.data

      // Guardar token y usuario
      // Save token and user
      commit('SET_TOKEN', access_token)
      commit('SET_USER', user)

      console.log('✅ Login exitoso:', user.username)
      return true

    } catch (error) {
      console.error('❌ Error en login:', error)
      
      let errorMessage = 'Error de conexión'
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Credenciales incorrectas'
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.statusText}`
        }
      }
      
      commit('SET_LOGIN_ERROR', errorMessage)
      throw new Error(errorMessage)
      
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * Cerrar sesión
   * Logout user
   */
  async logoutUser({ commit, state }) {
    try {
      if (state.token) {
        // Notificar al servidor sobre el logout
        // Notify server about logout
        await axios.post('/api/auth/logout')
      }
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      // Limpiar estado local siempre
      // Always clear local state
      commit('CLEAR_AUTH')
      
      // Redireccionar a landing
      // Redirect to landing
      if (router.currentRoute.path !== '/') {
        router.push('/')
      }
    }
  },

  /**
   * Cambiar contraseña del usuario actual
   * Change current user password
   */
  async changePassword({ commit }, passwordData) {
    commit('SET_LOADING', true)

    try {
      await axios.put('/api/auth/change-password', {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      })

      return { success: true, message: 'Contraseña actualizada correctamente' }

    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      
      let errorMessage = 'Error cambiando contraseña'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      
      throw new Error(errorMessage)
      
    } finally {
      commit('SET_LOADING', false)
    }
  },

  /**
   * Actualizar información del usuario actual
   * Update current user information
   */
  async refreshUser({ commit, state }) {
    if (!state.token) return false

    try {
      const response = await axios.get('/api/auth/me')
      commit('SET_USER', response.data)
      return true
    } catch (error) {
      console.error('Error actualizando usuario:', error)
      // Si falla, probablemente el token expiró
      // If it fails, token probably expired
      commit('CLEAR_AUTH')
      return false
    }
  },

  /**
   * Crear nuevo usuario (solo admins)
   * Create new user (admins only)
   */
  async createUser({ commit }, userData) {
    commit('SET_LOADING', true)

    try {
      const response = await axios.post('/api/auth/users', userData)
      return response.data

    } catch (error) {
      console.error('Error creando usuario:', error)
      
      let errorMessage = 'Error creando usuario'
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      }
      
      throw new Error(errorMessage)
      
    } finally {
      commit('SET_LOADING', false)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}

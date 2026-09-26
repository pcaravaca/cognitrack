// Tipos para el usuario
export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'guest'
  avatar?: string
  createdAt?: string
  updatedAt?: string
}

// Credenciales de inicio de sesión
export interface LoginCredentials {
  username: string
  password: string
  rememberMe?: boolean
}

// Respuesta de autenticación
export interface AuthResponse {
  user: User
  token: string
  expiresIn?: number
  tokenType?: string
}

// Estado de autenticación
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

// Payload para registro de usuario
export interface RegisterPayload {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  [key: string]: any
}

// Errores de validación
export interface ValidationError {
  field: string
  message: string
}

// Respuesta de error de la API
export interface ApiError {
  message: string
  status?: number
  errors?: ValidationError[]
}

// Tipo para los permisos de usuario
export type UserRole = 'admin' | 'user' | 'guest'

// Tipo para la configuración de rutas protegidas
export interface RouteMeta {
  requiresAuth?: boolean
  roles?: UserRole[]
  title?: string
  [key: string]: any
}

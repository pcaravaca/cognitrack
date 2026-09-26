import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LandingView from '../views/LandingView.vue'
import DashboardView from '../views/DashboardView.vue'
import ServerDetailView from '../views/ServerDetailView.vue'
import ServersManagement from '../views/ServersManagement.vue'
import ProfileView from '../views/ProfileView.vue'
import SettingsView from '../views/SettingsView.vue'
import ApiDocumentationView from '../views/ApiDocumentationView.vue'
import HelpView from '../views/HelpView.vue'
import MonitoringPerformance from '../views/MonitoringPerformance.vue'
import MonitoringMetrics from '../views/MonitoringMetrics.vue'
import MonitoringAlerts from '../views/MonitoringAlerts.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL || '/'),
  routes: [
    // Ruta raíz que redirige a /landing
    {
      path: '/',
      redirect: '/landing',
      meta: { requiresAuth: false }
    },
    // Ruta principal de landing
    {
      path: '/landing',
      name: 'landing',
      component: LandingView,
      meta: { requiresAuth: false }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/server/:id',
      name: 'serverDetail',
      component: ServerDetailView,
      meta: { requiresAuth: true }
    },
    {
      path: '/servers',
      name: 'servers',
      redirect: { name: 'dashboard' },
      meta: { requiresAuth: true }
    },
    {
      path: '/models',
      name: 'models',
      redirect: { name: 'dashboard' },
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/docs',
      name: 'docs',
      component: HelpView,
      meta: { requiresAuth: false }
    },
    {
      path: '/servers/manage',
      name: 'serversManagement',
      component: ServersManagement,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/monitoring',
      name: 'monitoring',
      component: MonitoringPerformance,
      meta: { requiresAuth: true }
    },
    {
      path: '/metrics',
      name: 'metrics',
      component: MonitoringMetrics,
      meta: { requiresAuth: true }
    },
    {
      path: '/logs',
      name: 'logs',
      component: MonitoringAlerts,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    },
    {
      path: '/documentation',
      redirect: { name: 'docs' },
      meta: { requiresAuth: false }
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/api-docs',
      name: 'apiDocumentation',
      component: ApiDocumentationView,
      meta: { requiresAuth: true }
    },
    {
      path: '/help',
      name: 'help',
      component: HelpView,
      meta: { requiresAuth: false }
    },
    {
      path: '/login',
      redirect: '/'
    }
  ]
})

// Guard de navegación global para proteger rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Si se intenta acceder a la raíz o a /false, redirigir a /landing
  if (to.path === '/' || to.path === '/false') {
    console.log('🔄 Redirigiendo a la landing page desde:', to.path)
    return next('/landing')
  }
  
  // Si la ruta es inválida o contiene 'false', redirigir a landing
  if (to.path.includes('false')) {
    console.warn('⚠️ Ruta inválida detectada, redirigiendo a landing:', to.path)
    return next('/landing')
  }
  
  // Permitir acceso a la landing page sin autenticación
  if (to.name === 'landing') {
    // Limpiar cualquier estado de autenticación previo
    if (authStore.token) {
      console.log('🔐 Usuario autenticado, limpiando estado previo...')
      authStore.logout()
    }
    console.log('🏠 Mostrando landing page')
    return next()
  }
  
  // Si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    // Si no hay token, redirigir a landing
    if (!authStore.token) {
      console.log('🔐 No hay token, redirigiendo a login...')
      return next({ name: 'landing', query: { redirect: to.fullPath } })
    }
    
    // Verificar autenticación si no hay usuario cargado
    if (!authStore.user) {
      try {
        console.log('🔄 Verificando autenticación...')
        const isValid = await authStore.checkAuth()
        if (!isValid) {
          console.log('❌ Autenticación inválida')
          return next({ name: 'landing', query: { session: 'expired' } })
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        return next({ name: 'landing', query: { error: 'auth-check-failed' } })
      }
    }
    
    // Si la ruta requiere privilegios de admin
    if (to.meta.requiresAdmin && authStore.user?.role !== 'admin') {
      console.warn('⚠️ Acceso denegado: se requieren privilegios de administrador')
      return next({ name: 'landing' })
    }
  }
  
  // Continuar a la ruta solicitada
  next()
})

export default router

<template>
  <div class="landing-page">
    <!-- Modern Hero Section -->
    <section class="hero-section">
      <v-container class="fill-height hero-container" fluid>
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" lg="8" xl="6" class="text-center">
            <div class="hero-content" style="position: relative; z-index: 10;">
              <!-- Brand Logo -->
              <div class="brand-logo mb-12">
                <div class="logo-icon-wrapper">
                  <v-avatar size="140" class="elevation-12 logo-avatar">
                    <v-icon size="80" color="white">mdi-brain</v-icon>
                  </v-avatar>
                </div>
                <h1 class="hero-title font-weight-black mt-6">
                  CogniTrack
                </h1>
                <p class="hero-subtitle mt-4">
                  {{ $t('landing.subtitle') }}
                </p>
              </div>
              
              <!-- Feature Cards -->
              <div class="features-grid mb-12">
                <v-row justify="center" no-gutters>
                  <v-col cols="6" sm="4" lg="2" v-for="feature in features" :key="feature.icon" class="pa-2">
                    <v-card class="feature-card" elevation="8" rounded="xl">
                      <v-card-text class="text-center pa-4">
                        <v-avatar size="50" :color="feature.color" class="mb-3">
                          <v-icon size="28" color="white" :icon="feature.icon" />
                        </v-avatar>
                        <p class="feature-title">{{ feature.title }}</p>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </div>
              
              <!-- CTA Button -->
              <div class="cta-section">
                <v-btn
                  x-large
                  color="primary"
                  elevation="16"
                  class="login-btn cta-button mega-button"
                  rounded="lg"
                  size="x-large"
                  height="80"
                  width="280"
                  @click.stop="openLoginDialog"
                  :loading="loading"
                  :disabled="loading"
                  style="position: relative; z-index: 100; pointer-events: auto;"
                >
                  <v-icon left size="32">mdi-rocket-launch</v-icon>
                  <span class="text-h5 font-weight-bold">{{ $t('auth.login') }}</span>
                </v-btn>
                
                <p class="cta-subtitle mt-4">{{ $t('landing.ctaSubtitle') }}</p>
              </div>
            </div>
          </v-col>
          
          <v-col cols="12" md="6" class="d-none d-md-block" style="padding: 0; margin: 0;">
            <div class="hero-animation">
              <div class="monitoring-dashboard-preview">
                <v-card class="preview-card elevation-12" outlined style="margin: 0; padding: 0;">
                  <v-card-title class="preview-card-title justify-center pa-2">
                  <div class="preview-title-row">
                    <v-icon color="success" class="mr-2">mdi-monitor-dashboard</v-icon>
                    <span>Dashboard Preview</span>
                  </div>
                </v-card-title>
                  <v-card-text style="padding: 24px;">
                    <div class="metrics-preview">
                      <div class="metric-item" v-for="metric in previewMetrics" :key="metric.label">
                        <v-progress-circular
                          :value="metric.value"
                          :color="metric.color"
                          size="60"
                          width="6"
                        >
                          <div class="progress-value">{{ metric.value }}%</div>
                        </v-progress-circular>
                        <p class="caption metric-label">{{ metric.label }}</p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-container>
      
      <!-- Background Animation -->
      <div class="background-animation">
        <div class="floating-particles">
          <div 
            v-for="n in 20" 
            :key="n" 
            class="particle"
            :style="getParticleStyle(n)"
          ></div>
        </div>
      </div>
    </section>

    <!-- Login Dialog -->
    <v-dialog v-model="showLoginDialog" max-width="500" persistent>
      <v-card class="login-card">
        <v-card-title class="justify-center pb-0">
          <div class="text-center">
            <v-avatar size="80" class="mb-4" color="primary">
              <v-icon size="40" color="white">mdi-account-circle</v-icon>
            </v-avatar>
            <h3 class="headline">{{ $t('auth.welcome') }}</h3>
            <p class="body-2 text--secondary">{{ $t('auth.loginMessage') }}</p>
          </div>
        </v-card-title>
        
        <v-card-text class="pb-0">
          <v-form ref="loginForm" v-model="loginValid" @submit.prevent="login">
            <v-text-field
              v-model="credentials.username"
              :label="$t('auth.username')"
              prepend-inner-icon="mdi-account"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-3"
              :disabled="loading"
            ></v-text-field>
            
            <v-text-field
              v-model="credentials.password"
              :label="$t('auth.password')"
              prepend-inner-icon="mdi-lock"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showPassword ? 'text' : 'password'"
              :rules="[rules.required]"
              outlined
              dense
              class="mb-3"
              :disabled="loading"
              @click:append="showPassword = !showPassword"
              @keyup.enter="login"
            ></v-text-field>
            
            <v-alert
              v-if="loginError"
              type="error"
              dense
              outlined
              class="mb-3"
            >
              {{ loginError }}
            </v-alert>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="px-6 pb-6">
          <v-btn
            text
            :disabled="loading"
            @click="showLoginDialog = false"
          >
            {{ $t('common.cancel') }}
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            :loading="authStore.isLoading || loading"
            :disabled="!loginValid || authStore.isLoading || loading"
            @click="login"
          >
            <v-icon left>mdi-login</v-icon>
            {{ $t('common.login') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Features Section -->
    <section class="features-section py-16">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="text-center mb-8">
            <h2 class="display-1 font-weight-light">
              {{ $t('landing.featuresTitle') }}
            </h2>
            <p class="headline text--secondary">
              {{ $t('landing.featuresSubtitle') }}
            </p>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col 
            cols="12" 
            md="4" 
            v-for="feature in detailedFeatures" 
            :key="feature.title"
          >
            <v-card class="feature-card h-100" elevation="4" hover>
              <div class="feature-icon-container">
                <v-avatar size="80" :color="feature.color" class="white--text">
                  <v-icon size="40" :icon="feature.icon" />
                </v-avatar>
              </div>
              <v-card-title class="justify-center">
                <h3>{{ feature.title }}</h3>
              </v-card-title>
              <v-card-text class="text-center">
                <p>{{ feature.description }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </section>

    <!-- Footer -->
    <footer class="landing-footer">
      <v-container>
        <v-row>
          <v-col cols="12" class="text-center">
            <p class="body-2 text--secondary mb-2">
              © 2024 CogniTrack - Multi-Platform AI Monitoring System
            </p>
            <p class="caption text--secondary">
              Developed by Peter Caravaca
            </p>
          </v-col>
        </v-row>
      </v-container>
    </footer>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

export default {
  name: 'LandingView',
  setup() {
    const authStore = useAuthStore();
    const router = useRouter();
    
    // Si ya está autenticado, redirigir al dashboard
    onMounted(() => {
      if (authStore.isAuthenticated) {
        router.push('/dashboard');
      }
    });
    
    return { 
      authStore,
      router 
    };
  },
  mounted() {
    // Verificar si hay un token en el almacenamiento local
    const token = localStorage.getItem('cognitrack_token')
    const redirect = this.$route.query.redirect
    const error = this.$route.query.error
    const session = this.$route.query.session

    // Mostrar mensajes de error si existen
    if (error === 'auth-check-failed') {
      this.loginError = 'Error al verificar la sesión. Por favor, inicia sesión nuevamente.'
    } else if (session === 'expired') {
      this.loginError = 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    }

    // Si hay un token, verificar autenticación
    if (token) {
      this.authStore.checkAuth()
        .then(isValid => {
          // Si el token es válido y hay una redirección, ir a esa ruta
          if (isValid && redirect) {
            this.$router.push(redirect)
          } else if (isValid) {
            // Si el token es válido pero no hay redirección, ir al dashboard
            this.$router.push({ name: 'dashboard' })
          }
        })
        .catch(error => {
          console.error('Error al verificar autenticación:', error)
          // Limpiar token inválido
          localStorage.removeItem('cognitrack_token')
        })
    } else if (redirect) {
      // Si hay una redirección pero no hay token, guardar para después del login
      this.authStore.setReturnUrl(redirect)
    }
  },
  data() {
    return {
      showLoginDialog: false,
      showPassword: false,
      loginValid: false,
      loading: false,
      loginError: '',
      credentials: {
        username: '',
        password: ''
      },
      rules: {
        required: value => !!value || this.$t('validation.required') || 'Campo requerido'
      },
      features: [
        {
          icon: 'mdi-monitor-dashboard',
          title: 'Monitoring',
          color: 'primary'
        },
        {
          icon: 'mdi-server-network',
          title: 'Multi-Server',
          color: 'success'
        },
        {
          icon: 'mdi-chart-line',
          title: 'Analytics',
          color: 'info'
        }
      ],
      previewMetrics: [
        { label: 'CPU', value: 75, color: 'primary' },
        { label: 'Memory', value: 60, color: 'success' },
        { label: 'GPU', value: 45, color: 'warning' }
      ],
      detailedFeatures: [
        {
          title: 'Real-time Monitoring',
          description: 'Monitor your Ollama servers in real-time with comprehensive metrics and health checks.',
          icon: 'mdi-chart-timeline-variant',
          color: '#e91e63'
        },
        {
          title: 'Multi-Server Management',
          description: 'Manage multiple Ollama servers from a single dashboard with automatic discovery.',
          icon: 'mdi-server-network',
          color: 'success'
        },
        {
          title: 'Advanced Analytics',
          description: 'Get insights with detailed analytics, performance metrics, and comparative analysis.',
          icon: 'mdi-chart-areaspline',
          color: 'info'
        },
        {
          title: 'Automatic Discovery',
          description: 'Automatically discover Ollama servers in your network with smart detection.',
          icon: 'mdi-radar',
          color: 'orange'
        },
        {
          title: 'Load Balancing',
          description: 'Intelligently distribute workloads across your server infrastructure.',
          icon: 'mdi-scale-balance',
          color: 'deep-purple'
        },
        {
          title: 'Security & Auth',
          description: 'Enterprise-grade security with user authentication and role-based access.',
          icon: 'mdi-shield-check',
          color: 'red'
        }
      ]
    }
  },

mounted() {
  console.log('LandingView montado correctamente');
  
  // Agregar evento click nativo como backup
  this.$nextTick(() => {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', () => {
        console.log('Evento nativo capturado');
        this.openLoginDialog();
      });
    }
  });
},

methods: {
  openLoginDialog() {
    console.log('🚀 BOTÓN LOGIN CLICKEADO - Abriendo diálogo');
    this.showLoginDialog = true;
    this.loginError = '';
    this.credentials.username = '';
    this.credentials.password = '';
  },
     
    
    async login() {
      console.log('Starting login process...');
      
      // Validación básica
      if (!this.credentials.username || !this.credentials.password) {
        this.loginError = this.$t('auth.completeFields') || 'Por favor completa todos los campos';
        return false;
      }
      
      // Iniciar carga
      this.loading = true;
      this.loginError = '';
      
      try {
        // Usar el store de autenticación real
        const result = await this.authStore.login({
          username: this.credentials.username,
          password: this.credentials.password
        });
        
        if (result?.success) {
          console.log('✅ Login successful, redirecting to:', result.redirectTo || '/dashboard');
          this.showLoginDialog = false;
          
          // Usar la URL de retorno proporcionada por el store o ir al dashboard
          const redirectTo = result.redirectTo || '/dashboard';
          
          // Usar el router para navegación SPA cuando sea posible
          if (redirectTo.startsWith('/')) {
            this.$router.push(redirectTo);
          } else {
            // Para rutas absolutas, hacer recarga completa
            window.location.href = redirectTo;
          }
          
          return true;
        } else {
          this.loginError = result?.error || this.$t('auth.loginError') || 'Error de autenticación';
          console.error('❌ Login failed:', this.loginError);
          return false;
        }
      } catch (error) {
        console.error(' Login error:', error);
        console.error('❌ Login error:', error);
        this.loginError = this.$t('auth.connectionError') || 'Error de conexión con el servidor';
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    getParticleStyle(index) {
      const delay = Math.random() * 20;
      const duration = 20 + Math.random() * 10;
      const size = Math.random() * 4 + 2;
      
      return {
        left: Math.random() * 100 + '%',
        animationDelay: delay + 's',
        animationDuration: duration + 's',
        width: size + 'px',
        height: size + 'px'
      };
    }
  }
}
</script>

<style lang="scss">
// Estilos de contraste para Landing Page
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
  overflow: hidden;
  color: white;
  display: flex;
  flex-direction: column;
}

.hero-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.hero-container {
  padding: 0 !important;
  margin: 0 !important;
  flex: 1;
}

.fill-height {
  height: 100% !important;
  min-height: 100vh;
}

.hero-title {
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.1rem;
  font-weight: 300;
  margin-bottom: 32px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  line-height: 1.5;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 64px;
  padding: 0 20px;
}

.feature-card {
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(15px);
  border-radius: 20px !important;
  padding: 32px !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    background: rgba(0, 0, 0, 0.4) !important;
    border-color: rgba(255, 255, 255, 0.2);
  }
}

/* Feature card mini-titles */
.feature-title {
  font-size: 1.1rem !important;
  font-weight: 600;
  margin: 0 !important;
  line-height: 1.3;
  color: white;
}

.login-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 6px 20px rgba(30, 60, 114, 0.6) !important;
  background: linear-gradient(45deg, #2a5298 0%, #4c7fcf 100%) !important;
}

.mega-button {
  font-size: 1.5rem !important;
  letter-spacing: 1px;
  text-transform: uppercase;
  font-weight: 800 !important;
  box-shadow: 0 8px 32px rgba(30, 60, 114, 0.4) !important;
  
  &:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 12px 40px rgba(30, 60, 114, 0.7) !important;
  }
}

.feature-item {
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-8px);
}

.hero-animation {
  animation: float 6s ease-in-out infinite;
}

.monitoring-dashboard-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  width: 100%;
  padding: 0 16px;
}

.preview-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 100%;
  max-width: 500px;
}

.preview-card-title {
  background: rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
}

.preview-title-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.metrics-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem 0;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.progress-value {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  user-select: none;
}

.metric-label {
  font-weight: 500;
  color: #666;
  user-select: none;
}

/* Align progress circular items horizontally on larger screens */
@media (min-width: 960px) {
  .metrics-preview {
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
  }
  
  .metric-item {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }
}

.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  pointer-events: none;
}

.floating-particles .particle {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float-particle linear infinite;
  pointer-events: none;
}

.login-card {
  border-radius: 20px !important;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(15px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.features-section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
}

.feature-card {
  border-radius: 16px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(0, 0, 0, 0.3) !important;
  backdrop-filter: blur(12px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  background: rgba(0, 0, 0, 0.4) !important;
  backdrop-filter: blur(15px);
  border-color: rgba(255, 255, 255, 0.4);
}

.feature-icon-container {
  display: flex;
  justify-content: center;
  padding-top: 1.5rem;
}

.landing-footer {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  padding: 2rem 0;
}

/* Animaciones */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(103, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(103, 126, 234, 0.8);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes float-particle {
  0% {
    transform: translateY(100vh) rotate(0deg);
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
  }
}

/* Media queries */
@media (max-width: 960px) {
  .hero-content {
    padding: 2rem 1rem;
  }
  
  .display-2 {
    font-size: 2.5rem !important;
  }
  
  .metrics-preview {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>

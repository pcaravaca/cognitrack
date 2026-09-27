<template>
  <v-container fluid class="dashboard-container pa-4 pa-sm-6">
    <!-- Debug Info - Solo en desarrollo -->
    <v-card v-if="isDev" class="debug-info" color="warning" variant="tonal" density="compact" style="position: fixed; bottom: 16px; right: 16px; z-index: 1000;">
      <v-card-text class="pa-2 text-caption d-flex align-center">
        <v-icon icon="mdi-bug" size="small" class="me-1"></v-icon>
        <span class="me-2">DEBUG</span>
        <v-chip size="x-small" class="mx-1" color="primary" text-color="white">
          {{ serversStore.servers?.length || 0 }} servidores
        </v-chip>
        <v-chip size="x-small" class="mx-1" :color="isLoading ? 'error' : 'success'" text-color="white">
          {{ isLoading ? 'Cargando...' : 'Listo' }}
        </v-chip>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <v-fade-transition mode="out-in">
      <v-row v-if="isLoading || !hasLoaded" class="fill-height" align="center" justify="center" style="min-height: 70vh;">
        <v-col cols="12" sm="8" md="6" lg="4" class="text-center">
          <v-card class="pa-6" elevation="12" rounded="xl" :loading="isLoading">
            <v-progress-circular
              v-if="isLoading"
              indeterminate
              color="primary"
              size="64"
              width="4"
              class="mb-4"
            />
            <div v-else class="pulse-animation">
              <v-avatar color="primary" size="100" class="mb-4 elevation-8">
                <v-icon size="60">mdi-server</v-icon>
              </v-avatar>
            </div>
            
            <h2 class="text-h4 font-weight-bold mb-3">Cargando CogniTrack</h2>
            <p class="text-body-1 mb-6">{{ loadingMessage || 'Inicializando el panel de control...' }}</p>
            
            <v-progress-linear
              :model-value="loadingProgress"
              color="primary"
              height="8"
              rounded
              class="mb-4"
              :indeterminate="loadingProgress === 0"
            />
            
            <div class="d-flex align-center justify-center">
              <v-icon icon="mdi-github" size="small" class="me-1"></v-icon>
              <span class="text-caption text-medium-emphasis">v1.0.0</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-fade-transition>
    
    <!-- Main Content -->
    <v-fade-transition>
      <div v-if="!isLoading && hasLoaded" class="dashboard-content">
        <!-- Header del Dashboard -->
        <v-row class="mb-6">
          <v-col cols="12">
            <v-card class="dashboard-header" elevation="8" rounded="xl" :class="{ 'glass-effect': $vuetify.theme.global.current.dark }">
              <v-card-text class="pa-6">
                <div class="d-flex align-center justify-space-between flex-wrap">
                  <div class="d-flex align-center">
                    <v-avatar color="primary" size="64" class="mr-4 elevation-4">
                      <v-icon size="32">mdi-monitor-dashboard</v-icon>
                    </v-avatar>
                    <div>
                      <h1 class="text-h4 font-weight-bold mb-1">Panel de Control</h1>
                      <p class="text-body-1 text-medium-emphasis d-flex align-center">
                        <v-icon size="small" class="me-1" :color="serversStore.servers?.length ? 'success' : 'warning'">
                          {{ serversStore.servers?.length ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                        {{ serversStore.servers?.length ? `Monitoreando ${serversStore.servers.length} servidor${serversStore.servers.length !== 1 ? 'es' : ''}` : 'No hay servidores configurados' }}
                      </p>
                    </div>
                  </div>
                  <div class="d-flex align-center gap-2 mt-4 mt-sm-0">
                    <v-tooltip location="bottom" :text="isRefreshing ? 'Actualizando...' : 'Actualizar ahora'">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          color="primary"
                          variant="tonal"
                          icon
                          :loading="isRefreshing"
                          :disabled="isRefreshing"
                          @click="refreshServers"
                          size="large"
                          class="elevation-2"
                        >
                          <v-icon>mdi-refresh</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                    
                    <v-btn
                      color="primary"
                      variant="flat"
                      prepend-icon="mdi-server-plus"
                      to="/servers/manage"
                      size="large"
                      class="elevation-2"
                    >
                      Gestionar Servidores
                    </v-btn>
                  </div>
                </div>
                
                <!-- Stats Overview -->
                <v-row class="mt-6">
                  <v-col cols="6" sm="3" v-for="(stat, index) in [
                    { title: 'Servidores', value: serversStore.servers?.length || 0, icon: 'mdi-server', color: 'primary' },
                    { title: 'En línea', value: serversStore.servers?.filter(s => isServerActive(s)).length || 0, icon: 'mdi-check-circle', color: 'success' },
                    { title: 'Modelos', value: serversStore.servers?.reduce((acc, s) => acc + (s.stats?.models?.length || 0), 0) || 0, icon: 'mdi-database', color: 'indigo' },
                    { title: 'Uso CPU', value: `${Math.round(serversStore.servers?.reduce((acc, s) => acc + (s.stats?.cpu?.usage || 0), 0) / (serversStore.servers?.length || 1))}%` || 'N/A', icon: 'mdi-chip', color: 'amber' }
                  ]" :key="index" class="py-1">
                    <v-card variant="flat" class="pa-3 rounded-lg" :color="$vuetify.theme.global.current.dark ? 'grey-darken-3' : 'grey-lighten-4'">
                      <div class="d-flex align-center">
                        <v-avatar :color="stat.color" size="48" class="me-3" variant="tonal">
                          <v-icon :color="stat.color">{{ stat.icon }}</v-icon>
                        </v-avatar>
                        <div>
                          <div class="text-caption text-medium-emphasis">{{ stat.title }}</div>
                          <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
                        </div>
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Sin servidores -->
        <v-fade-transition>
          <v-row v-if="!serversStore.servers?.length" class="fill-height" align="center" justify="center" style="min-height: 50vh;">
            <v-col cols="12" sm="10" md="8" lg="6" xl="5">
              <v-card class="text-center pa-6 pa-md-10" elevation="12" rounded="xl" :class="{ 'glass-effect': $vuetify.theme.global.current.dark }">
                <div class="pulse-animation mb-6">
                  <v-avatar color="primary" size="120" class="mb-4 elevation-8" variant="tonal">
                    <v-icon size="64" color="primary">mdi-server-off</v-icon>
                  </v-avatar>
                </div>
                <h2 class="text-h4 font-weight-bold mb-4">Sin servidores configurados</h2>
                <p class="text-body-1 text-medium-emphasis mb-8">
                  Parece que aún no has añadido ningún servidor Ollama. 
                  Comienza añadiendo tu primer servidor para monitorear su estado, 
                  recursos y modelos de IA.
                </p>
                <div class="d-flex flex-wrap justify-center gap-4">
                  <v-btn 
                    color="primary" 
                    to="/servers/manage" 
                    size="large" 
                    prepend-icon="mdi-plus"
                    class="elevation-2 px-6"
                    rounded="lg"
                  >
                    Añadir Servidor
                  </v-btn>
                  <v-btn 
                    color="secondary" 
                    variant="outlined"
                    to="/documentation" 
                    size="large" 
                    prepend-icon="mdi-help-circle"
                    class="px-6"
                    rounded="lg"
                  >
                    Ver Documentación
                  </v-btn>
                </div>
                
                <v-divider class="my-8"></v-divider>
                
                <div class="text-center">
                  <p class="text-caption text-medium-emphasis mb-2">¿Neitas ayuda para empezar?</p>
                  <v-btn 
                    color="primary" 
                    variant="text"
                    size="small"
                    prepend-icon="mdi-email"
                    class="text-none"
                    href="mailto:soporte@cognitrack.com"
                  >
                    Contactar al soporte
                  </v-btn>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-fade-transition>

        <!-- Lista de servidores -->
        <v-row v-if="serversStore.servers?.length > 0" class="mb-6">
          <v-col cols="12" class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5 font-weight-bold mb-0">Tus Servidores</h2>
            <div class="d-flex align-center">
              <v-chip 
                size="small" 
                variant="tonal" 
                color="primary" 
                class="me-2"
                :prepend-icon="isRefreshing ? 'mdi-loading mdi-spin' : 'mdi-refresh'"
                @click="refreshServers"
                :disabled="isRefreshing"
              >
                {{ isRefreshing ? 'Actualizando...' : 'Actualizar' }}
              </v-chip>
              <v-chip 
                size="small" 
                variant="outlined" 
                color="success"
                prepend-icon="mdi-check-circle"
              >
                {{ serversStore.servers.filter(s => isServerActive(s)).length }} en línea
              </v-chip>
            </div>
          </v-col>
          
          <v-col 
            v-for="server in serversStore.servers" 
            :key="server.id" 
            cols="12" 
            sm="6" 
            lg="4"
            xl="3"
            class="d-flex"
          >
            <v-card 
              class="server-card h-100 w-100 transition-swing"
              :class="[ 
                { 'active': isServerActive(server) },
                { 'elevation-8': isServerActive(server) },
                { 'glass-effect': $vuetify.theme.global.current.dark && !isServerActive(server) }
              ]"
              :color="isServerActive(server) ? getServerCardColor(server) : ''"
              :variant="isServerActive(server) ? 'elevated' : 'elevated'"
              :dark="isServerActive(server)"
              elevation="2"
              @mouseenter="hoveredServer = server.id"
              @mouseleave="hoveredServer = null"
            >
              <v-card-item class="pa-4 pb-2">
                <div class="d-flex align-start">
                  <v-avatar 
                    :color="isServerActive(server) ? 'white' : 'primary'" 
                    size="52"
                    class="me-4 elevation-2 transition-swing"
                    :class="{ 'scale-105': hoveredServer === server.id }"
                  >
                    <v-icon size="28" :color="isServerActive(server) ? 'primary' : 'white'">mdi-server</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <div class="d-flex align-center flex-wrap">
                      <h3 class="text-h6 font-weight-bold mb-0 text-truncate" style="max-width: 200px;">
                        {{ server.name || 'Servidor sin nombre' }}
                      </h3>
                      <v-chip 
                        v-if="isServerActive(server)" 
                        size="x-small" 
                        :color="getServerStatusColor(server)"
                        class="ms-2"
                        text-color="white"
                        density="comfortable"
                        :prepend-icon="getServerStatusIcon(server)"
                      >
                        {{ getServerStatusText(server) }}
                      </v-chip>
                    </div>
                    <div class="d-flex align-center mt-1">
                      <v-icon size="small" class="me-1" :color="isServerActive(server) ? 'white' : 'text-medium-emphasis'" icon="mdi-ip-network"></v-icon>
                      <span class="text-caption" :class="{ 'text-white': isServerActive(server), 'text-medium-emphasis': !isServerActive(server) }">
                        {{ server.ip }}:{{ server.port }}
                      </span>
                      <v-tooltip location="top" text="Copiar dirección">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            icon
                            size="x-small"
                            variant="text"
                            class="ms-1"
                            @click.stop="copyToClipboard(`${server.ip}:${server.port}`)"
                          >
                            <v-icon size="small" :color="isServerActive(server) ? 'white' : 'text-medium-emphasis'">mdi-content-copy</v-icon>
                          </v-btn>
                        </template>
                      </v-tooltip>
                    </div>
                  </div>
                  
                  <!-- Menú de acciones -->
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        v-bind="props"
                        icon
                        size="small"
                        variant="text"
                        :color="isServerActive(server) ? 'white' : 'grey-darken-1'"
                        class="ms-2"
                        @click.stop
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    
                    <v-list density="compact" :color="$vuetify.theme.global.current.dark ? 'grey-darken-4' : 'white'" elevation="2" rounded="lg">
                      <v-list-item 
                        v-for="(action, i) in [
                          { title: 'Actualizar', icon: 'mdi-refresh', action: () => refreshServer(server) },
                          { title: 'Editar', icon: 'mdi-pencil', action: () => $router.push(`/server/${server.id}/edit`) },
                          { title: 'Eliminar', icon: 'mdi-delete', color: 'error', action: () => confirmDeleteServer(server) }
                        ]" 
                        :key="i"
                        :value="i"
                        @click="action.action()"
                        class="px-4 py-1"
                        :class="{ 'text-error': action.color === 'error' }"
                      >
                        <template v-slot:prepend>
                          <v-icon :icon="action.icon" :color="action.color"></v-icon>
                        </template>
                        <v-list-item-title :class="{ 'text-error': action.color === 'error' }">{{ action.title }}</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-card-item>

              <v-divider :color="isServerActive(server) ? 'rgba(255,255,255,0.12)' : ''"></v-divider>
              
              <v-card-text class="pa-4">
                <!-- Uso de CPU -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="small" class="me-1" :color="isServerActive(server) ? 'white' : 'primary'">mdi-chip</v-icon>
                      <span class="text-caption font-weight-medium" :class="{ 'text-white': isServerActive(server) }">CPU</span>
                    </div>
                    <span class="text-caption font-weight-bold" :class="{ 'text-white': isServerActive(server) }">
                      {{ server.stats?.cpu?.usage ? Math.round(server.stats.cpu.usage) : 0 }}%
                      <span v-if="server.stats?.cpu?.cores" class="text-caption text-medium-emphasis ms-1">
                        ({{ server.stats.cpu.cores }} núcleos)
                      </span>
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="server.stats?.cpu?.usage || 0"
                    :color="getCpuColor(server.stats?.cpu?.usage || 0)"
                    height="6"
                    rounded
                    class="mb-1"
                    :bg-color="isServerActive(server) ? 'rgba(255,255,255,0.1)' : 'grey-lighten-3'"
                    :bg-opacity="isServerActive(server) ? 1 : 0.7"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption" :class="{ 'text-white': isServerActive(server), 'text-medium-emphasis': !isServerActive(server) }">
                      {{ server.stats?.cpu?.model || 'CPU' }}
                    </span>
                    <v-chip 
                      size="x-small" 
                      variant="tonal" 
                      :color="getCpuColor(server.stats?.cpu?.usage || 0)"
                      class="px-1"
                      density="compact"
                    >
                      <v-icon size="small" class="me-1">mdi-speedometer</v-icon>
                      {{ getCpuLoadLevel(server.stats?.cpu?.usage || 0) }}
                    </v-chip>
                  </div>
                </div>

                <!-- Uso de Memoria -->
                <div class="mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="small" class="me-1" :color="isServerActive(server) ? 'white' : 'indigo'">mdi-memory</v-icon>
                      <span class="text-caption font-weight-medium" :class="{ 'text-white': isServerActive(server) }">Memoria</span>
                    </div>
                    <span class="text-caption font-weight-bold" :class="{ 'text-white': isServerActive(server) }">
                      {{ server.stats?.memory?.usage ? Math.round(server.stats.memory.usage) : 0 }}%
                    </span>
                  </div>
                  <v-progress-linear
                    :model-value="server.stats?.memory?.usage || 0"
                    :color="getMemoryColor(server.stats?.memory?.usage || 0)"
                    height="6"
                    rounded
                    class="mb-1"
                    :bg-color="isServerActive(server) ? 'rgba(255,255,255,0.1)' : 'grey-lighten-3'"
                    :bg-opacity="isServerActive(server) ? 1 : 0.7"
                  ></v-progress-linear>
                  <div class="d-flex justify-space-between">
                    <span class="text-caption" :class="{ 'text-white': isServerActive(server), 'text-medium-emphasis': !isServerActive(server) }">
                      {{ formatBytes(server.stats?.memory?.used || 0) }} / {{ formatBytes(server.stats?.memory?.total || 0) }}
                    </span>
                    <span class="text-caption" :class="{ 'text-white': isServerActive(server), 'text-medium-emphasis': !isServerActive(server) }">
                      {{ Math.round((server.stats?.memory?.used || 0) / (server.stats?.memory?.total || 1) * 100) || 0 }}%
                    </span>
                  </div>
                </div>

                <!-- Modelos -->
                <div v-if="server.stats?.models?.length" class="mb-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center">
                      <v-icon size="small" class="me-1" :color="isServerActive(server) ? 'white' : 'deep-purple'">mdi-database</v-icon>
                      <span class="text-caption font-weight-medium" :class="{ 'text-white': isServerActive(server) }">
                        Modelos ({{ server.stats.models.length }})
                      </span>
                    </div>
                    <v-tooltip location="top" text="Ver todos los modelos">
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          size="x-small"
                          variant="text"
                          icon
                          :color="isServerActive(server) ? 'white' : 'primary'"
                          @click.stop="viewModels(server)"
                        >
                          <v-icon size="small">mdi-arrow-right</v-icon>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                  
                  <div class="model-chips">
                    <v-chip
                      v-for="(model, index) in server.stats.models.slice(0, 3)"
                      :key="index"
                      size="x-small"
                      :variant="isServerActive(server) ? 'outlined' : 'tonal'"
                      :color="isServerActive(server) ? 'white' : 'deep-purple'"
                      :class="{ 'me-1 mb-1': true, 'text-white': isServerActive(server) }"
                      density="comfortable"
                      :prepend-icon="getModelIcon(model)"
                    >
                      {{ formatModelName(model.name) }}
                    </v-chip>
                    
                    <v-chip
                      v-if="server.stats.models.length > 3"
                      size="x-small"
                      :variant="isServerActive(server) ? 'outlined' : 'tonal'"
                      :color="isServerActive(server) ? 'white' : 'grey'"
                      class="mb-1"
                      density="comfortable"
                    >
                      +{{ server.stats.models.length - 3 }} más
                    </v-chip>
                  </div>
                </div>
              </v-card-text>

              <v-card-actions class="px-4 pb-3 pt-0">
                <v-spacer></v-spacer>
                <v-tooltip location="top" text="Actualizar estado">
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      size="small"
                      icon
                      :color="isServerActive(server) ? 'white' : 'grey-darken-1'"
                      variant="text"
                      :loading="server.refreshing"
                      @click.stop="refreshServer(server)"
                      class="me-1"
                    >
                      <v-icon size="20">mdi-refresh</v-icon>
                    </v-btn>
                  </template>
                </v-tooltip>
                
                <v-btn
                  size="small"
                  :color="isServerActive(server) ? 'white' : 'primary'"
                  :variant="isServerActive(server) ? 'outlined' : 'flat'"
                  :to="`/server/${server.id}`"
                  class="text-none px-4"
                  rounded="lg"
                  :prepend-icon="isServerActive(server) ? 'mdi-arrow-right' : ''"
                  :append-icon="!isServerActive(server) ? 'mdi-arrow-right' : ''"
                >
                  {{ isServerActive(server) ? 'Detalles' : 'Ver detalles' }}
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <!-- Status Alert - Refreshing -->
        <v-slide-y-transition>
          <v-alert
            v-if="isRefreshing"
              type="info"
              variant="tonal"
              class="mb-6"
              border="start"
              border-color="primary"
              density="comfortable"
              closable
            >
              <template v-slot:prepend>
                <v-progress-circular
                  indeterminate
                  color="primary"
                  size="24"
                  class="me-3"
                />
              </template>
              <div class="d-flex align-center flex-wrap gap-2">
                <span class="font-weight-medium">Actualizando estado de los servidores</span>
                <v-progress-linear
                  indeterminate
                  color="primary"
                  class="ms-3 flex-grow-1"
                  style="max-width: 200px;"
                />
              </div>
            </v-alert>
          </v-slide-y-transition>
          
          <!-- Connection Error Alert -->
          <v-slide-y-transition>
            <v-alert
              v-if="serverConnectionError && !isRefreshing"
              type="error"
              variant="tonal"
              class="mb-6"
              border="start"
              border-color="error"
              elevation="2"
              closable
              @click:close="serverConnectionError = false"
            >
              <template v-slot:prepend>
                <v-icon size="24" class="me-3">mdi-alert-circle</v-icon>
              </template>
              <div class="d-flex flex-column">
                <span class="font-weight-medium mb-2">Error de conexión con el servidor Ollama</span>
                <p class="mb-0 text-body-2">
                  No se pudo conectar al servidor Ollama en localhost:11434. 
                  Por favor verifica que el servidor esté en ejecución y accesible.
                </p>
                <div class="mt-3 d-flex flex-wrap gap-2">
                  <v-btn
                    color="error"
                    variant="outlined"
                    size="small"
                    @click="refreshServers"
                    :loading="isRefreshing"
                    :disabled="isRefreshing"
                  >
                    <v-icon start>mdi-refresh</v-icon>
                    Reintentar
                  </v-btn>
                  <v-btn
                    color="primary"
                    variant="text"
                    size="small"
                    to="/servers/manage"
                  >
                    <v-icon start>mdi-cog</v-icon>
                    Configurar Servidores
                  </v-btn>
                </div>
              </div>
            </v-alert>
          </v-slide-y-transition>

          <!-- General Error Alert -->
          <v-slide-y-transition>
            <v-alert
              v-if="error && !serverConnectionError"
              type="error"
              variant="tonal"
              class="mb-6"
              border="start"
              border-color="error"
              closable
              @click:close="error = null"
            >
              <template v-slot:prepend>
                <v-icon size="24" class="me-3">mdi-alert</v-icon>
              </template>
              {{ error }}
            </v-alert>
          </v-slide-y-transition>

          <!-- Debug Info (solo en desarrollo) -->
          <v-card v-if="isDev" class="mb-6 pa-4" color="grey-lighten-4">
            <div class="text-caption">
              <strong>DEBUG:</strong> 
              isLoading: {{ isLoading }} | 
              hasLoaded: {{ hasLoaded }} | 
              showLoading: {{ showLoading }} | 
              hasServers: {{ hasServers }} | 
              servers: {{ serversStore.servers.length }}
            </div>
          </v-card>

          <!-- Server List Content -->
          <v-slide-y-transition>
            <div>
              <div v-if="hasServers && !serverConnectionError" class="server-list-container">
                <ServerList 
                  @select="handleServerSelect" 
                />
              </div>
              <!-- Empty State -->
              <div v-else-if="!isRefreshing && !hasServers && !serverConnectionError">
                <v-card 
                  class="text-center pa-12 empty-state-card" 
                  variant="flat"
                  rounded="lg"
                >
                  <div class="empty-state-content">
                    <v-avatar color="primary" size="120" class="mb-6">
                      <v-icon size="64">mdi-server-network-off</v-icon>
                    </v-avatar>
                    <h3 class="text-h5 mb-3 font-weight-bold">No hay servidores configurados</h3>
                    <p class="text-body-1 text-medium-emphasis mb-6 mx-auto" style="max-width: 500px;">
                      Comienza agregando tu primer servidor Ollama para monitorear su estado y gestionar tus modelos de IA
                    </p>
                    <v-btn
                      color="primary"
                      size="large"
                      prepend-icon="mdi-plus"
                      to="/servers/manage"
                      class="elevation-2"
                    >
                      Agregar Servidor
                    </v-btn>
                  </div>
                </v-card>
              </div>
            </div>
          </v-slide-y-transition>
        </div>
      </v-fade-transition>

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top right"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          :color="snackbar.color === 'error' ? 'white' : 'white'"
          @click="snackbar.show = false"
          icon
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useServersStore } from '@/stores/servers'
import ServerList from '@/components/dashboard/ServerList.vue'

// Configuración de entorno
const isDev = import.meta.env.DEV

// Router & Store
const router = useRouter()
const serversStore = useServersStore()

// State
const isLoading = ref(true)
const isRefreshing = ref(false)
const hasLoaded = ref(false)
const loadingProgress = ref(0)
const loadingMessage = ref('Cargando configuración...')
const error = ref<string | null>(null)
const serverConnectionError = ref(false)

// Snackbar state
const snackbar = ref({
  show: false,
  text: '',
  color: 'success',
  timeout: 3000
})

// Auto-refresh interval
let refreshInterval: ReturnType<typeof setInterval> | null = null

// Computed
const showLoading = computed(() => {
  const result = isLoading.value || !hasLoaded.value
  console.log('🔍 showLoading computed:', { 
    isLoading: isLoading.value, 
    hasLoaded: hasLoaded.value,
    result 
  })
  return result
})

const hasServers = computed(() => {
  const result = serversStore.servers.length > 0
  console.log('📊 hasServers computed:', result, 'total:', serversStore.servers.length)
  return result
})

// Watch para debugging
watch(() => isLoading.value, (newVal) => {
  console.log('👀 isLoading cambió a:', newVal)
})

watch(() => hasLoaded.value, (newVal) => {
  console.log('👀 hasLoaded cambió a:', newVal)
})

watch(() => showLoading.value, (newVal) => {
  console.log('👀 showLoading cambió a:', newVal)
})

// Verificar si un servidor está activo
const isServerActive = (server: any): boolean => {
  if (!server) return false;
  // Verificar si el servidor tiene un estado directo
  if (server.status === 'online') return true;
  // Verificar si el servidor tiene stats con estado
  if (server.stats && (server.stats.status === 'online' || server.stats.status === 'healthy')) return true;
  // Verificar por otros indicadores de actividad
  if (server.lastSeen) {
    const lastSeen = new Date(server.lastSeen).getTime();
    const now = Date.now();
    // Considerar activo si se ha visto en los últimos 5 minutos
    return (now - lastSeen) < (5 * 60 * 1000);
  }
  return false;
};

// Métodos auxiliares
const showNotification = (text: string, color: 'success' | 'error' | 'info' | 'warning' = 'info') => {
  snackbar.value = {
    show: true,
    text,
    color,
    timeout: 3000
  }
}

// Initialize dashboard
const initializeDashboard = async () => {
  console.log('🔄 Inicializando dashboard...')
  isLoading.value = true
  loadingMessage.value = 'Cargando configuración...'
  loadingProgress.value = 20

  try {
    // Cargar servidores
    if (serversStore && typeof serversStore.initializeServers === 'function') {
      await serversStore.initializeServers();
    }
    loadingProgress.value = 50
    loadingMessage.value = 'Conectando con los servidores...'

    // Actualizar estado de los servidores
    await refreshServers()
    loadingProgress.value = 80

    // Iniciar actualización automática si hay servidores
    if (serversStore.servers?.length > 0) {
      startAutoRefresh()
    }

    hasLoaded.value = true
    loadingProgress.value = 100
    loadingMessage.value = '¡Listo!'
    
    console.log('✅ Dashboard inicializado correctamente')
  } catch (error) {
    console.error('❌ Error al inicializar el dashboard:', error)
    showNotification('Error al cargar el dashboard', 'error')
  } finally {
    isLoading.value = false
  }
}

// Actualizar estado de servidores
const refreshServers = async () => {
  if (isRefreshing.value) {
    console.log('⚠️ Ya hay una actualización en progreso')
    return
  }
  
  try {
    isRefreshing.value = true
    serverConnectionError.value = false
    error.value = null
    
    console.log('🔄 Actualizando estado de los servidores...')
    
    let hasConnectionIssues = false
    
    // Actualizar estadísticas de cada servidor
    const updatePromises = serversStore.servers.map(async (server) => {
      try {
        await serversStore.getServerStats(server.id)
        
        if (server.status === 'offline' || !server.isBackendAvailable) {
          hasConnectionIssues = true
        }
      } catch (err) {
        console.warn(`⚠️ No se pudo actualizar el servidor ${server.name}:`, err)
        hasConnectionIssues = true
      }
    })
    
    await Promise.allSettled(updatePromises)
    
    // Solo mostrar error en producción
    if (!isDev) {
      serverConnectionError.value = hasConnectionIssues
      
      if (hasConnectionIssues) {
        console.warn('⚠️ Se detectaron problemas de conexión con uno o más servidores')
        showNotification('Algunos servidores no están disponibles', 'warning')
      } else {
        showNotification('Servidores actualizados correctamente', 'success')
      }
    } else {
      console.log('🔧 Modo desarrollo: Actualización simulada completada')
      showNotification('Servidores actualizados (modo desarrollo)', 'info')
    }
    
    console.log('✅ Actualización de servidores completada')
  } catch (err) {
    console.error('❌ Error al actualizar servidores:', err)
    error.value = 'Error al actualizar los servidores'
    showNotification('Error al actualizar los servidores', 'error')
    
    if (!isDev) {
      serverConnectionError.value = true
    }
  } finally {
    isRefreshing.value = false
  }
}

// Auto-refresh
const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  
  console.log('⏰ Iniciando auto-refresh cada 30 segundos')
  
  // Refresh cada 30 segundos
  refreshInterval = setInterval(() => {
    if (!isRefreshing.value && hasServers.value && !serverConnectionError.value) {
      console.log('🔄 Auto-refresh activado')
      refreshServers()
    }
  }, 30000)
}

// Detener auto-refresh
const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
    console.log('⏰ Auto-refresh detenido')
  }
}

// Seleccionar servidor
const handleServerSelect = (server: any) => {
  console.log('🔘 Seleccionando servidor:', server?.name || 'Desconocido')
  try {
    if (!server) {
      console.error('❌ No se proporcionó un servidor válido')
      showNotification('Error: Servidor no válido', 'error')
      return
    }

    // Actualizar el servidor actual en el store
    // Verificamos si el store tiene la propiedad currentServer
    if ('currentServer' in serversStore) {
      // Usamos el operador de aserción no nula (!) ya que estamos seguros de que existe
      serversStore.currentServer = server;
    }
    
    // Navegar a la vista de detalles del servidor
    router.push(`/server/${server.id}`)
    
    // Mostrar notificación
    showNotification(`Conectado a ${server.name}`, 'success')
    
    console.log('✅ Servidor seleccionado correctamente')
  } catch (error) {
    console.error('❌ Error al seleccionar el servidor:', error)
    showNotification('Error al conectar al servidor', 'error')
  }
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎬 DashboardView montado')
  initializeDashboard()
})

onUnmounted(() => {
  console.log('🔚 DashboardView desmontado')
  stopAutoRefresh()
})

// Métodos adicionales
const hoveredServer = ref<string | null>(null);

// Obtener color del estado del servidor
// Formatear bytes a representación legible
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const getServerStatusColor = (server: any) => {
  if (!server.stats) return 'grey';
  if (server.stats.status === 'online') return 'success';
  if (server.stats.status === 'warning') return 'warning';
  if (server.stats.status === 'error') return 'error';
  return 'grey';
};

// Obtener ícono del estado del servidor
const getServerStatusIcon = (server: any) => {
  if (!server.stats) return 'mdi-help-circle';
  if (server.stats.status === 'online') return 'mdi-check-circle';
  if (server.stats.status === 'warning') return 'mdi-alert-circle';
  if (server.stats.status === 'error') return 'mdi-close-circle';
  return 'mdi-help-circle';
};

// Obtener texto del estado del servidor
const getServerStatusText = (server: any) => {
  if (!server.stats) return 'Desconocido';
  if (server.stats.status === 'online') return 'En línea';
  if (server.stats.status === 'warning') return 'Advertencia';
  if (server.stats.status === 'error') return 'Error';
  return 'Desconocido';
};

// Obtener nivel de carga de la CPU
const getCpuLoadLevel = (usage: number) => {
  if (!usage) return 'Bajo';
  if (usage < 50) return 'Bajo';
  if (usage < 80) return 'Medio';
  return 'Alto';
};

// Obtener color de la memoria según el uso

const getCpuColor = (usage: number): string => {
  if (usage < 30) return 'success';
  if (usage < 70) return 'warning';
  return 'error';
};

const getMemoryColor = (usage: number) => {
  if (usage < 60) return 'primary';
  if (usage < 85) return 'warning';
  return 'error';
};

// Obtener color de la tarjeta del servidor según su estado
const getServerCardColor = (server: any): string => {
  if (server.status === 'online') return '#22c55e';
  if (server.status === 'warning') return '#f59e0b';
  if (server.status === 'error' || server.status === 'critical') return '#ef4444';
  return '#6b7280';
};

// Formatear nombre del modelo
const formatModelName = (name: string) => {
  if (!name) return '';
  // Extraer solo el nombre del modelo sin la ruta
  const parts = name.split('/');
  return parts[parts.length - 1].split(':')[0];
};

// Obtener ícono para el tipo de modelo
const getModelIcon = (model: any) => {
  const name = model.name.toLowerCase();
  if (name.includes('llama')) return 'mdi-robot';
  if (name.includes('code') || name.includes('coder')) return 'mdi-code-braces';
  if (name.includes('gpt') || name.includes('chat')) return 'mdi-message-text';
  return 'mdi-database';
};

// Ver modelos del servidor
const viewModels = (server: any) => {
  router.push(`/server/${server.id}?tab=models`);
};

// Copiar al portapapeles
const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  showNotification('Copiado al portapapeles', 'success');
};

// Confirmar eliminación de servidor
const confirmDeleteServer = (server: any) => {
  // Implementar lógica de confirmación
  console.log('Eliminar servidor:', server.id);
};
</script>

<style scoped lang="scss">
.dashboard-container {
  max-width: 1800px;
  margin: 0 auto;
  padding-bottom: 80px; // Espacio para el debug info
}

// Efecto de vidrio para el tema oscuro
.glass-effect {
  background: rgba(30, 30, 30, 0.5) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  
  &.v-card {
    background: rgba(30, 30, 30, 0.5) !important;
  }
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
  opacity: 0.9;
  max-width: 200px;
}

/* Estilos para las tarjetas de servidor */
.server-card {
  transition: transform 0.2s ease-in-out;
}

.server-card:hover {
  transform: translateY(-4px);
}

/* Estilos para los indicadores de estado */
.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
}

.status-online {
  background-color: #4caf50;
}

.status-offline {
  background-color: #f44336;
}

.status-warning {
  background-color: #ff9800;
}

/* Animación de carga */
@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.loading-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

/* Ajustes responsivos */
@media (max-width: 960px) {
  .server-card {
    margin-bottom: 16px;
  }
}

/* Ajustes para el tema oscuro */
:deep(.v-theme--dark) .server-card {
  background-color: rgba(255, 255, 255, 0.05);
}

:deep(.v-theme--light) .server-card {
  background-color: #ffffff;
}

/* Mejoras de accesibilidad */
:focus-visible {
  outline: 2px solid var(--v-primary-base);
  outline-offset: 2px;
}

/* Transiciones suaves */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.v-main {
  display: block !important;
  opacity: 1 !important;
}

/* Asegurar que el contenedor principal ocupe el espacio disponible */
.dashboard-content {
  display: block !important;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  background-color: transparent;
  opacity: 1 !important;
}

/* Forzar visibilidad de elementos */
.v-main__wrap {
  display: block !important;
  width: 100%;
  height: 100%;
  min-height: 100vh;
  opacity: 1 !important;
  visibility: visible !important;
}

/* Asegurar que el contenido sea visible */
.v-application__wrap {
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Forzar visibilidad del contenido principal */
.v-application {
  min-height: 100vh !important;
  display: flex !important;
  flex-direction: column !important;
  opacity: 1 !important;
  visibility: visible !important;
}

.dashboard-content {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.server-list-container {
  width: 100%;
  min-height: 300px;
  margin-top: 20px;
}

/* Estilos para la tarjeta de carga */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-card {
  max-width: 500px;
  width: 100%;
  margin: 0 auto;
}

/* Asegurar que el contenedor principal ocupe todo el espacio disponible */
:deep(.v-application__wrap) {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Estilos para el contenedor de la lista de servidores */
.servers-container {
  flex: 1;
  width: 100%;
  padding: 20px;
}

/* Estilos para el encabezado */
.header-card {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Estilos para el modo oscuro */
.theme--dark .header-card {
  background-color: rgba(30, 30, 30, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Asegurar que el contenido principal sea visible */
.v-main__wrap {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  max-width: 100%;
  position: relative;
}

/* Layout principal */
.dashboard-content {
  min-height: 100vh;
  background: rgb(var(--v-theme-background));
  transition: background-color 0.3s ease;
}

/* Header Card */
.header-card {
  background: rgb(var(--v-theme-surface));
  transition: all 0.3s ease;
}

.header-info {
  flex: 1;
  min-width: 250px;
}

/* Loading Container */
.loading-container {
  background: linear-gradient(135deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-background)) 100%);
}

.loading-card {
  overflow: hidden;
  position: relative;
  background: rgb(var(--v-theme-surface));
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.loading-icon-container {
  position: relative;
}

.loading-spinner {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1;
    transform: scale(1);
  }
  50% { 
    opacity: 0.8;
    transform: scale(1.05);
  }
}

/* Empty State */
.empty-state-card {
  background: rgb(var(--v-theme-surface));
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.12);
  transition: all 0.3s ease;
}

.empty-state-card:hover {
  border-color: rgb(var(--v-theme-primary));
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.1);
}

.empty-state-icon {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.empty-state-card:hover .empty-state-icon {
  opacity: 1;
  transform: scale(1.1);
}

/* Transitions */
.v-fade-transition-enter-active,
.v-fade-transition-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-fade-transition-enter-from,
.v-fade-transition-leave-to {
  opacity: 0;
}

.v-slide-y-transition-enter-active,
.v-slide-y-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-slide-y-transition-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.v-slide-y-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Buttons */
.v-btn {
  text-transform: none;
  letter-spacing: 0.01em;
  font-weight: 500;
  transition: all 0.2s ease;
}

.v-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

/* Cards */
.v-card {
  transition: all 0.3s ease;
}

/* Focus styles para accesibilidad */
:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
  border-radius: 4px;
}

/* Responsive */
@media (max-width: 960px) {
  .v-container {
    padding: 12px !important;
  }
  
  .header-info {
    min-width: 100%;
    margin-bottom: 16px;
  }
  
  .empty-state-card {
    padding: 32px 16px !important;
  }
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
  
  .text-h5 {
    font-size: 1.25rem !important;
  }
  
  .loading-card {
    margin: 16px;
    max-width: calc(100% - 32px) !important;
  }
}

/* Dark mode adjustments */
.v-theme--dark .loading-card,
.v-theme--dark .header-card,
.v-theme--dark .empty-state-card {
  background: rgba(var(--v-theme-surface), 0.95);
}

/* Mejora de rendimiento */
.dashboard-content,
.v-card,
.v-btn {
  will-change: transform;
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
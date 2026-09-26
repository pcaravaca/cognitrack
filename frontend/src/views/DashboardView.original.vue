<template>
  <!-- Main Dashboard Layout -->
  <v-container fluid class="dashboard-container pa-0">
    <!-- Top Navigation Bar -->
    <v-app-bar color="white" elevation="2" height="64">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="font-weight-bold">Server Monitor</v-toolbar-title>
      
      <v-spacer></v-spacer>
      
      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        density="compact"
        variant="outlined"
        placeholder="Search servers or metrics..."
        prepend-inner-icon="mdi-magnify"
        hide-details
        class="mr-4"
        style="max-width: 300px;"
      ></v-text-field>
      
      <!-- Notifications -->
      <v-btn icon class="mr-2">
        <v-badge color="error" content="3" dot>
          <v-icon>mdi-bell-outline</v-icon>
        </v-badge>
      </v-btn>
      
      <!-- User Menu -->
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn variant="text" v-bind="props" class="px-2">
            <v-avatar size="36" color="primary" class="mr-2">
              <span class="text-white">{{ userInitials }}</span>
            </v-avatar>
            <span class="text-body-1">Admin User</span>
            <v-icon end>mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in userMenu"
            :key="index"
            :prepend-icon="item.icon"
            :title="item.title"
            :value="item.value"
            @click="handleUserMenu(item.value)"
          ></v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Sidebar Navigation -->
    <v-navigation-drawer v-model="drawer" temporary>
      <v-list>
        <v-list-item
          v-for="(item, i) in navItems"
          :key="i"
          :value="item"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :active="$route.path === item.to"
          class="mb-1"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="dashboard-content">
      <v-container fluid class="pa-6">
        <!-- Page Header -->
        <v-row class="mb-6">
          <v-col cols="12">
            <div class="d-flex align-center justify-space-between">
              <div>
                <h1 class="text-h4 font-weight-bold">Dashboard</h1>
                <p class="text-body-1 text-medium-emphasis">Overview of your server resources and performance</p>
              </div>
              <v-btn color="primary" prepend-icon="mdi-refresh" @click="refreshData">
                Refresh
              </v-btn>
            </div>
          </v-col>
        </v-row>

        <!-- Server Status Cards -->
        <v-row class="mb-6">
          <v-col v-for="(stat, index) in serverStats" :key="index" cols="12" sm="6" md="3">
            <v-card class="stat-card" elevation="2" rounded="lg">
              <v-card-text class="pa-4">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <div class="text-overline text-medium-emphasis">{{ stat.title }}</div>
                    <div class="text-h5 font-weight-bold mt-1">{{ stat.value }}</div>
                    <v-chip 
                      :color="stat.trend >= 0 ? 'success' : 'error'" 
                      size="small" 
                      class="mt-2"
                      variant="tonal"
                    >
                      <v-icon start size="small">
                        {{ stat.trend >= 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                      </v-icon>
                      {{ Math.abs(stat.trend) }}% {{ stat.trend >= 0 ? 'up' : 'down' }}
                    </v-chip>
                  </div>
                  <v-avatar :color="stat.color" size="56" class="elevation-2">
                    <v-icon size="32" color="white">{{ stat.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Resource Usage Graphs -->
        <v-row class="mb-6">
          <v-col cols="12" md="8">
            <v-card class="h-100" elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-line</v-icon>
                Resource Usage
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="resourceChart" style="height: 300px; width: 100%;"></div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="h-100" elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-chart-pie</v-icon>
                Storage Distribution
              </v-card-title>
              <v-card-text class="pa-0">
                <div ref="storageChart" style="height: 300px; width: 100%;"></div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Active Processes -->
        <v-row>
          <v-col cols="12">
            <v-card elevation="2" rounded="lg">
              <v-card-title class="pa-4">
                <v-icon start>mdi-format-list-bulleted</v-icon>
                Active Processes
              </v-card-title>
              <v-card-text class="pa-0">
                <v-table hover>
                  <thead>
                    <tr>
                      <th>Process</th>
                      <th>User</th>
                      <th>CPU %</th>
                      <th>Memory</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(process, i) in activeProcesses" :key="i">
                      <td>
                        <div class="d-flex align-center">
                          <v-avatar size="32" color="primary" class="mr-2">
                            <v-icon color="white" size="small">mdi-cog</v-icon>
                          </v-avatar>
                          <div>
                            <div class="font-weight-medium">{{ process.name }}</div>
                            <div class="text-caption text-medium-emphasis">PID: {{ process.pid }}</div>
                          </div>
                        </div>
                      </td>
                      <td>{{ process.user }}</td>
                      <td>
                        <v-progress-linear
                          :model-value="process.cpu"
                          :color="getUsageColor(process.cpu)"
                          height="8" 
                          rounded
                        ></v-progress-linear>
                        <div class="text-caption text-right">{{ process.cpu }}%</div>
                      </td>
                      <td>
                        <div class="font-weight-medium">{{ formatBytes(process.memory) }}</div>
                        <div class="text-caption text-medium-emphasis">{{ process.memoryPercent }}% of total</div>
                      </td>
                      <td>
                        <v-chip 
                          :color="process.status === 'running' ? 'success' : 'warning'"
                          size="small"
                          variant="tonal"
                        >
                          {{ process.status }}
                        </v-chip>
                      </td>
                      <td>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click="stopProcess(process)"
                        >
                          <v-icon>mdi-stop</v-icon>
                        </v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-container>

  <!-- Vista general de todos los servidores -->
  <v-container v-if="!serversStore.currentServer" fluid class="dashboard-container pa-6">
    <div class="dashboard-content">
      <!-- Header del Dashboard General -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card class="dashboard-header" elevation="8" rounded="xl">
            <v-card-text class="pa-6">
              <div class="d-flex align-center justify-space-between flex-wrap">
                <div>
                  <h1 class="text-h3 font-weight-bold mb-2">{{ $t('dashboard.title') }}</h1>
                  <p class="text-h6 text-medium-emphasis">
                    {{ $t('dashboard.overview') }} - {{ serversStore.servers.length }} {{ $t('dashboard.serversConfigured') }}
                  </p>
                </div>
                <div class="d-flex gap-2">
                  <v-btn
                    color="primary"
                    prepend-icon="mdi-plus"
                    to="/servers/manage"
                    variant="elevated"
                    rounded="xl"
                  >
                    {{ $t('servers.addServer') }}
                  </v-btn>
                  <v-btn
                    :icon="autoRefreshEnabled ? 'mdi-pause' : 'mdi-play'"
                    :color="autoRefreshEnabled ? 'warning' : 'success'"
                    variant="tonal"
                    @click="toggleAutoRefresh"
                    v-tooltip="autoRefreshEnabled ? $t('dashboard.pauseRefresh') : $t('dashboard.resumeRefresh')"
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Sin servidores configurados -->
      <v-row v-if="serversStore.servers.length === 0" class="mt-12" align="center" justify="center">
        <v-col cols="12" sm="8" md="6" lg="4">
          <v-card class="text-center pa-8 no-server-card" elevation="12" rounded="xl">
            <div class="pulse-animation mb-6">
              <v-avatar color="primary" size="100" class="mb-4 elevation-8">
                <v-icon size="60">mdi-server-off</v-icon>
              </v-avatar>
            </div>
            <h2 class="text-h4 font-weight-bold mb-4 text-gradient">{{ $t('dashboard.noServersTitle') }}</h2>
            <p class="text-h6 mb-8 text-medium-emphasis">{{ $t('dashboard.noServersDescription') }}</p>
            <v-btn 
              color="primary" 
              to="/servers/manage" 
              size="x-large" 
              prepend-icon="mdi-plus"
              class="hover-lift px-8"
              variant="elevated"
              rounded="xl"
            >
              {{ $t('dashboard.addFirstServer') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <!-- Grid de servidores -->
      <v-row v-else>
        <v-col 
          v-for="server in serversStore.servers" 
          :key="server.id"
          cols="12" 
          md="6" 
          lg="4"
          class="mb-4"
        >
          <v-card 
            class="server-card h-100" 
            elevation="4" 
            rounded="xl"
            @click="navigateToServerDetail(server.id)"
            :class="{ 'server-active': serverStats[server.id]?.online }"
          >
            <v-card-text class="pa-4">
              <!-- Header del servidor -->
              <div class="d-flex align-center justify-space-between mb-4">
                <div class="d-flex align-center">
                  <v-avatar color="primary" size="40" class="mr-3">
                    <v-icon size="20">mdi-server</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-h6 font-weight-bold">{{ server.name }}</h3>
                    <p class="text-caption text-medium-emphasis mb-0">{{ server.url }}</p>
                  </div>
                </div>
                <v-chip 
                  :color="serverStats[server.id]?.online ? 'success' : 'error'"
                  size="small"
                  variant="tonal"
                >
                  <v-icon start size="12">{{ serverStats[server.id]?.online ? 'mdi-check' : 'mdi-close' }}</v-icon>
                  {{ serverStats[server.id]?.online ? $t('common.online') : $t('common.offline') }}
                </v-chip>
              </div>

              <!-- Métricas del servidor -->
              <v-row class="mb-4" v-if="serverStats[server.id]?.online">
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">CPU</div>
                  <div class="text-h6 font-weight-bold" :class="getResourceColor(serverStats[server.id]?.cpu || 0)">
                    {{ Math.round(serverStats[server.id]?.cpu || 0) }}%
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">{{ $t('dashboard.memory') }}</div>
                  <div class="text-h6 font-weight-bold" :class="getResourceColor(serverStats[server.id]?.memory || 0)">
                    {{ Math.round(serverStats[server.id]?.memory || 0) }}%
                  </div>
                </v-col>
                <v-col cols="4" class="text-center">
                  <div class="text-caption text-medium-emphasis">GPU</div>
                  <div class="text-h6 font-weight-bold" :class="getResourceColor(serverStats[server.id]?.gpu || 0)">
                    {{ Math.round(serverStats[server.id]?.gpu || 0) }}%
                  </div>
                </v-col>
              </v-row>

              <!-- Gráfico del servidor -->
              <div class="chart-container" style="height: 200px;">
                <canvas :ref="el => serverChartRefs[server.id] = el"></canvas>
              </div>

              <!-- Información adicional -->
              <div v-if="serverStats[server.id]?.online" class="mt-3">
                <div class="d-flex align-center justify-space-between text-caption">
                  <span class="text-medium-emphasis">{{ $t('dashboard.models') }}</span>
                  <span class="font-weight-medium">{{ serverStats[server.id]?.modelCount || 0 }}</span>
                </div>
                <div class="d-flex align-center justify-space-between text-caption mt-1">
                  <span class="text-medium-emphasis">{{ $t('dashboard.lastUpdate') }}</span>
                  <span class="font-weight-medium">{{ formatLastUpdate(serverStats[server.id]?.lastUpdate) }}</span>
                </div>
              </div>

              <!-- Estado offline -->
              <div v-else class="text-center py-8">
                <v-icon size="48" color="error" class="mb-2">mdi-server-off</v-icon>
                <p class="text-body-2 text-medium-emphasis">{{ $t('dashboard.serverOffline') }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>

  <!-- Vista detallada del servidor actual -->
  <v-container v-else fluid class="pa-0">
    <div class="dashboard-content">
      <!-- Header con información del servidor -->
      <v-row class="mb-6" align="center">
        <v-col cols="12">
          <v-card class="server-header-card" elevation="8" rounded="lg">
            <v-card-text class="pa-6">
              <v-row align="center">
                <v-col cols="12" md="6">
                  <div>
                    <div class="d-flex align-center mb-3">
                      <v-menu>
                        <template v-slot:activator="{ props }">
                          <v-btn
                            v-bind="props"
                            variant="text"
                            size="x-large"
                            class="text-h5 font-weight-bold mr-2"
                          >
                            {{ serversStore.currentServer?.name || 'Servidor no disponible' }}
                            <v-icon right>mdi-menu-down</v-icon>
                          </v-btn>
                        </template>
                        <v-list>
                          <v-list-item
                            v-for="server in serversStore.servers"
                            :key="server.id"
                            :active="server.id === serversStore.currentServer?.id"
                            @click="serversStore.selectServer(server.id)"
                          >
                            <template v-slot:prepend>
                              <v-avatar color="primary" size="32">
                                <v-icon size="18">mdi-server</v-icon>
                              </v-avatar>
                            </template>
                            <v-list-item-title>{{ server.name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ server.url }}</v-list-item-subtitle>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                    <div class="text-body-2 text-medium-emphasis mb-2">
                      <v-icon size="16" class="mr-1">mdi-web</v-icon>
                      {{ serversStore.currentServer?.url || 'URL no disponible' }}
                    </div>
                    <div class="d-flex align-center gap-4">
                      <v-chip 
                        :color="serverStatus ? 'success' : 'error'"
                        :prepend-icon="serverStatus ? 'mdi-check-circle' : 'mdi-close-circle'"
                        variant="flat"
                        class="px-4"
                      >
                        {{ serverStatus ? $t('common.connected') : $t('common.disconnected') }}
                      </v-chip>
                      <v-chip 
                        color="info"
                        prepend-icon="mdi-clock-outline"
                        variant="tonal"
                        v-if="lastUpdateTime !== 'Nunca'"
                      >
                        {{ lastUpdateTime }}
                      </v-chip>
                    </div>
                  </div>
                </v-col>
                <v-col cols="12" md="6" class="d-flex align-center justify-end gap-2">
                  <v-btn
                    :icon="autoRefreshEnabled ? 'mdi-pause' : 'mdi-play'"
                    :color="autoRefreshEnabled ? 'warning' : 'success'"
                    variant="tonal"
                    @click="toggleAutoRefresh"
                  />
                  <v-btn
                    icon="mdi-refresh"
                    color="primary"
                    variant="tonal"
                    :loading="isLoading"
                    @click="refreshData"
                  />
                  <v-btn
                    icon="mdi-cog"
                    color="primary"
                    variant="outlined"
                    @click="openServerConfig"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Métricas Principales -->
      <v-row class="mb-6">
        <!-- CPU Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">USO DE CPU</p>
                  <h3 class="text-h4 font-weight-bold">{{ (serverStats?.cpu?.usage || 0).toFixed(1) }}%</h3>
                </div>
                <v-avatar color="primary" size="56" variant="tonal">
                  <v-icon size="30">mdi-cpu-64-bit</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="serverStats?.cpu?.usage || 0"
                :color="getCpuColor(serverStats?.cpu?.usage || 0)"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                <v-icon size="12" :color="getCpuTrend() > 0 ? 'error' : 'success'">
                  {{ getCpuTrend() > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                {{ Math.abs(getCpuTrend()).toFixed(1) }}% vs último minuto
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Memory Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MEMORIA RAM</p>
                  <h3 class="text-h4 font-weight-bold">{{ formatBytes(serverStats?.memory?.used || 0) }}</h3>
                </div>
                <v-avatar color="error" size="56" variant="tonal">
                  <v-icon size="30">mdi-memory</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="memoryUsagePercentage"
                :color="getMemoryColor(memoryUsagePercentage)"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ memoryUsagePercentage.toFixed(1) }}% de {{ formatBytes(serverStats?.memory?.total || 0) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Models Count Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">MODELOS IA</p>
                  <h3 class="text-h4 font-weight-bold">{{ serverStats?.models?.length || 0 }}</h3>
                </div>
                <v-avatar color="success" size="56" variant="tonal">
                  <v-icon size="30">mdi-robot</v-icon>
                </v-avatar>
              </div>
              <v-chip-group class="mt-2">
                <v-chip 
                  v-for="model in (serverStats?.models || []).slice(0, 2)" 
                  :key="model.name"
                  size="x-small"
                  variant="tonal"
                >
                  {{ model.name.split(':')[0] }}
                </v-chip>
                <v-chip 
                  v-if="(serverStats?.models || []).length > 2"
                  size="x-small"
                  variant="tonal"
                >
                  +{{ (serverStats?.models || []).length - 2 }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- GPU Usage Card -->
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" elevation="6" rounded="lg">
            <v-card-text class="pa-5">
              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <p class="text-caption text-medium-emphasis mb-1">GPU</p>
                  <h3 class="text-h4 font-weight-bold">{{ serverStats?.gpu?.usage || 0 }}%</h3>
                </div>
                <v-avatar color="warning" size="56" variant="tonal">
                  <v-icon size="30">mdi-gpu</v-icon>
                </v-avatar>
              </div>
              <v-progress-linear
                :model-value="serverStats?.gpu?.usage || 0"
                color="warning"
                height="8"
                rounded
                class="mb-2"
              />
              <p class="text-caption text-medium-emphasis">
                {{ serverStats?.gpu?.name || 'No GPU detectada' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Gráficos Profesionales -->
      <v-row class="mb-6">
        <!-- Gráfico de Uso de Recursos -->
        <v-col cols="12" lg="8">
          <v-card elevation="6" rounded="lg" class="h-100">
            <v-card-title class="pa-5">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <h3 class="text-h5 font-weight-bold">Uso de Recursos</h3>
                  <p class="text-caption text-medium-emphasis mt-1">Monitoreo en tiempo real</p>
                </div>
                <v-btn-toggle
                  v-model="chartTimeRange"
                  mandatory
                  density="compact"
                  variant="outlined"
                >
                  <v-btn value="1h">1H</v-btn>
                  <v-btn value="6h">6H</v-btn>
                  <v-btn value="24h">24H</v-btn>
                </v-btn-toggle>
              </div>
            </v-card-title>
            <v-card-text>
              <canvas ref="resourceChart" height="300"></canvas>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Distribución de Modelos -->
        <v-col cols="12" lg="4">
          <v-card elevation="6" rounded="lg" class="h-100">
            <v-card-title class="pa-5">
              <h3 class="text-h5 font-weight-bold">Distribución de Modelos</h3>
              <p class="text-caption text-medium-emphasis mt-1">Por tamaño</p>
            </v-card-title>
            <v-card-text class="d-flex align-center justify-center">
              <canvas ref="modelChart" height="250"></canvas>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Lista de Modelos Mejorada -->
      <v-row>
        <v-col cols="12">
          <v-card elevation="6" rounded="lg">
            <v-card-title class="pa-5 bg-gradient-primary">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-avatar color="white" size="40" class="mr-3 elevation-3">
                    <v-icon color="primary">mdi-robot</v-icon>
                  </v-avatar>
                  <div>
                    <h3 class="text-h5 font-weight-bold text-white">Modelos Disponibles</h3>
                    <p class="text-caption text-white-50 mt-1">
                      {{ serverStats?.models?.length || 0 }} modelo{{ (serverStats?.models?.length || 0) !== 1 ? 's' : '' }} instalado{{ (serverStats?.models?.length || 0) !== 1 ? 's' : '' }}
                    </p>
                </div>
                </div>
                <v-spacer />
                <v-text-field
                  v-model="searchModel"
                  prepend-inner-icon="mdi-magnify"
                  placeholder="Buscar modelo..."
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mr-3"
                  style="max-width: 300px;"
                />
                <v-btn
                  color="primary"
                  prepend-icon="mdi-plus"
                  @click="showAddModelDialog = true"
                >
                  Agregar Modelo
                </v-btn>
              </div>
            </v-card-title>
            <v-card-text>
              <div v-if="!isLoading && (!serverStats?.models || serverStats.models.length === 0)" class="text-center pa-16">
                <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-robot-off</v-icon>
                <h3 class="text-h5 text-medium-emphasis mb-2">No hay modelos disponibles</h3>
                <p class="text-body-1 text-medium-emphasis mb-6">Agrega un nuevo modelo para comenzar</p>
                <v-btn color="primary" size="large" @click="showAddModelDialog = true" prepend-icon="mdi-plus">
                  Agregar Primer Modelo
                </v-btn>
              </div>
              <v-list v-else-if="serverStats?.models && serverStats.models.length > 0" class="pa-0">
                <v-list-item
                  v-for="model in filteredModels"
                  :key="model.name"
                  class="model-list-item"
                >
                  <template v-slot:prepend>
                    <v-avatar :color="getModelTypeColor(model.name)" size="48" class="mr-4">
                      <v-icon>{{ getModelTypeIcon(model.name) }}</v-icon>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="text-h6 font-weight-bold">
                    {{ model.name.split(':')[0] }}
                    <v-chip size="small" color="info" variant="tonal" class="ml-2">
                      {{ model.name.includes(':') ? model.name.split(':')[1] : 'latest' }}
                    </v-chip>
                    <v-chip 
                      v-if="model.inUse" 
                      size="small" 
                      color="warning" 
                      variant="flat" 
                      class="ml-2"
                    >
                      <v-icon start size="x-small">mdi-account-circle</v-icon>
                      En uso por: {{ model.usedBy || 'Usuario' }}
                    </v-chip>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    <v-icon size="14" class="mr-1">mdi-harddisk</v-icon>
                    {{ formatBytes(model.size) }}
                    <v-icon size="14" class="mx-2">mdi-calendar</v-icon>
                    {{ formatDate(model.modified_at) }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="d-flex gap-1">
                      <v-btn
                        icon="mdi-chat"
                        variant="text" 
                        size="small"
                        color="primary"
                        @click.stop="openModelChat(model)"
                        v-tooltip="'Chat con ' + model.name"
                      />
                      <v-btn
                        v-if="model.running"
                        icon="mdi-stop"
                        variant="text" 
                        size="small"
                        color="warning"
                        @click.stop="stopModel(model)"
                        v-tooltip="'Detener modelo'"
                      />
                      <v-btn
                        v-else
                        icon="mdi-play"
                        variant="text" 
                        size="small"
                        color="success"
                        @click.stop="runModel(model)"
                        v-tooltip="'Ejecutar modelo'"
                      />
                      <v-btn
                        icon="mdi-delete"
                        variant="text" 
                        size="small"
                        color="error"
                        @click.stop="confirmRemoveModel(model)"
                        v-tooltip="'Eliminar modelo'"
                      />
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Diálogo de configuración del servidor -->
      <server-config 
        ref="serverConfig" 
        @saved="onServerConfigSaved"
      />
      
      <!-- Diálogo de chat con modelo -->
      <model-chat-dialog
        v-model="showChatDialog"
        :model="selectedModelForChat"
        :server-id="currentServer?.id"
      />
    </div>
  </v-container>
</template>

<script setup>
// Vue and Router
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// Pinia Stores
import { useServersStore } from '@/stores/servers'
import { useAuthStore } from '@/stores/auth'

// ECharts
import * as echarts from 'echarts/core'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

// Register ECharts components
echarts.use([
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DatasetComponent,
  CanvasRenderer
])

// Component State
const authStore = useAuthStore()
const serversStore = useServersStore()
const router = useRouter()
const route = useRoute()

// UI State
const drawer = ref(false)
const searchQuery = ref('')
const searchModel = ref('')
const isLoading = ref(false)
const serverStatus = ref(false)
const connectionStatus = ref(null)
const showAddModelDialog = ref(false)
const showChatDialog = ref(false)
const selectedModelForChat = ref(null)
const chartTimeRange = ref('1h')
const lastUpdateTime = ref('Nunca')
const animatedModelsCount = ref(0)

// Charts
const resourceChart = ref(null)
const storageChart = ref(null)
const resourceChartInstance = ref(null)
const storageChartInstance = ref(null)

// Auto-refresh
const autoRefreshEnabled = ref(true)
const refreshIntervalTime = ref(15000) // 15 seconds
const refreshInterval = ref(null)

// Server Data
const serverStats = ref([
  { 
    title: 'CPU Usage', 
    value: '24%', 
    trend: 2.5, 
    color: 'primary',
    icon: 'mdi-cpu-64-bit'
  },
  { 
    title: 'Memory', 
    value: '3.2/16 GB', 
    trend: -1.2, 
    color: 'success',
    icon: 'mdi-memory'
  },
  { 
    title: 'Storage', 
    value: '128/512 GB', 
    trend: 8.7, 
    color: 'warning',
    icon: 'mdi-harddisk'
  },
  { 
    title: 'Network', 
    value: '124 Kbps', 
    trend: -3.4, 
    color: 'info',
    icon: 'mdi-lan'
  }
])
const currentServer = computed(() => serversStore.currentServer)

// User data
const userInitials = computed(() => {
  if (!authStore.user) return 'AU'
  return authStore.user.displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

// Navigation items
const navItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/dashboard' },
  { title: 'Servers', icon: 'mdi-server', to: '/servers' },
  { title: 'Models', icon: 'mdi-robot', to: '/models' },
  { title: 'Analytics', icon: 'mdi-chart-bar', to: '/analytics' },
  { title: 'Settings', icon: 'mdi-cog', to: '/settings' },
  { title: 'Documentation', icon: 'mdi-help-circle', to: '/docs' },
]

// User menu
const userMenu = [
  { title: 'My Profile', icon: 'mdi-account', value: 'profile' },
  { title: 'Settings', icon: 'mdi-cog', value: 'settings' },
  { title: 'Logout', icon: 'mdi-logout', value: 'logout' },
]

// Server stats (initialized above)
  },
])

// Active processes
const activeProcesses = ref([
  {
    name: 'nginx',
    pid: 1234,
    user: 'www-data',
    cpu: 12.5,
    memory: 256 * 1024 * 1024, // 256MB
    memoryPercent: 1.5,
    status: 'running'
  },
  {
    name: 'node',
    pid: 2345,
    user: 'node',
    cpu: 45.2,
    memory: 1024 * 1024 * 1024, // 1GB
    memoryPercent: 6.2,
    status: 'running'
  },
  {
    name: 'postgres',
    pid: 3456,
    user: 'postgres',
    cpu: 8.1,
    memory: 512 * 1024 * 1024, // 512MB
    memoryPercent: 3.1,
    status: 'idle'
  },
  {
    name: 'redis',
    pid: 4567,
    user: 'redis',
    cpu: 2.3,
    memory: 128 * 1024 * 1024, // 128MB
    memoryPercent: 0.8,
    status: 'sleeping'
  },
])

// Methods
function handleUserMenu(action) {
  switch (action) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      authStore.logout()
      break
  }
}

function getUsageColor(usage) {
  if (usage > 80) return 'error'
  if (usage > 50) return 'warning'
  return 'success'
}

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

function stopProcess(process) {
  // TODO: Implement process stopping
  console.log('Stopping process:', process.pid)
  process.status = 'stopping'
  setTimeout(() => {
    const index = activeProcesses.value.findIndex(p => p.pid === process.pid)
    if (index !== -1) {
      activeProcesses.value.splice(index, 1)
    }
  }, 1000)
}

function initCharts() {
  // Initialize resource usage chart
  const chartInstance = echarts.init(resourceChart.value)
  resourceChartInstance.value = chartInstance
  const resourceOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['CPU %', 'Memory %', 'Network Kbps']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: Array(12).fill(0).map((_, i) => `${i * 5}m`)
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Usage %',
        min: 0,
        max: 100,
        interval: 20,
        axisLabel: {
          formatter: '{value}%'
        }
      },
      {
        type: 'value',
        name: 'Network',
        min: 0,
        max: 1000,
        interval: 200,
        axisLabel: {
          formatter: '{value} Kbps'
        }
      }
    ],
    series: [
      {
        name: 'CPU %',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(25, 118, 210, 0.8)' },
            { offset: 1, color: 'rgba(25, 118, 210, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 30) + 20)
      },
      {
        name: 'Memory %',
        type: 'line',
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(56, 142, 60, 0.8)' },
            { offset: 1, color: 'rgba(56, 142, 60, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 20) + 10)
      },
      {
        name: 'Network Kbps',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          width: 0
        },
        showSymbol: false,
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 152, 0, 0.8)' },
            { offset: 1, color: 'rgba(255, 152, 0, 0.1)' }
          ])
        },
        emphasis: {
          focus: 'series'
        },
        data: Array(12).fill(0).map(() => Math.floor(Math.random() * 400) + 100)
      }
    ]
  }
  chartInstance.setOption(resourceOption)

  // Initialize storage distribution chart
  const storageChart = echarts.init(storageChart.value)
  storageChartInstance.value = storageChart
  const storageOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 10,
      data: ['System', 'Applications', 'Data', 'Backups', 'Free']
    },
    series: [
      {
        name: 'Storage',
        type: 'pie',
        radius: ['50%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 104.8, name: 'System' },
          { value: 235, name: 'Applications' },
          { value: 180, name: 'Data' },
          { value: 98.6, name: 'Backups' },
          { value: 154.8, name: 'Free' }
        ]
      }
  }
  storageChart.setOption(storageOption)
}

// Handle window resize with debounce
let resizeTimer = null
const handleResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    resourceChartInstance.value?.resize?.()
    storageChartInstance.value?.resize?.()
  }, 200)
}

// Initialize charts when component is mounted
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  await nextTick() // Wait for DOM to be fully rendered
  initCharts()
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
})

// Cleanup on component unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (resizeTimer) clearTimeout(resizeTimer)
  resourceChartInstance.value?.dispose?.()
  storageChartInstance.value?.dispose?.()
  if (refreshInterval.value) clearInterval(refreshInterval.value)
})

// Chart instances
const resourceChart = ref(null)
const storageChart = ref(null)
const resourceChartInstance = ref(null)
const storageChartInstance = ref(null)

// Auto-refresh state
const autoRefreshEnabled = ref(true)
const refreshIntervalTime = ref(15000) // 15 seconds
const refreshInterval = ref(null)

// Component state
const drawer = ref(false)
const searchQuery = ref('')
const isLoading = ref(false)
const serverStatus = ref(false)
const searchModel = ref('')
const connectionStatus = ref(null)
const showAddModelDialog = ref(false)
const showChatDialog = ref(false)
const selectedModelForChat = ref(null)
const chartTimeRange = ref('1h')
const lastUpdateTime = ref('Nunca')
const animatedModelsCount = ref(0)

function startAutoRefresh() {
  if (refreshInterval.value) clearInterval(refreshInterval.value)
  refreshInterval.value = setInterval(() => {
    refreshData()
  }, refreshIntervalTime.value)
}

function toggleAutoRefresh() {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  } else if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

function refreshData() {
  // Simulate data refresh
  serverStats.value = serverStats.value.map(stat => ({
    ...stat,
    value: stat.title === 'CPU Usage' 
      ? `${Math.floor(Math.random() * 30) + 10}%`
      : stat.value,
    trend: Math.random() > 0.5 
      ? Math.random() * 10 
      : -Math.random() * 10
  }))
  
  // Re-initialize charts with new data
  if (resourceChart.value && storageChart.value) {
    initCharts()
  }
}

// Expose methods for testing
defineExpose({
  refreshData,
  toggleAutoRefresh
})
// Import other necessary components and utilities
import { format, parseISO, subHours } from 'date-fns'
import { es } from 'date-fns/locale'
import { Chart, registerables } from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'
import { useMetricsService } from '@/services/metricsService'
import ConnectionStatus from '@/components/ConnectionStatus.vue'
import ServerConfig from '@/components/ServerConfig.vue'
import ModelChatDialog from '@/components/ModelChatDialog.vue'

// Register Chart.js components
Chart.register(...registerables)

// Component state
const isLoading = ref(false)
const serverStatus = ref(false)
const searchModel = ref('')
const connectionStatus = ref(null)
const serverConfig = ref(null)
const showAddModelDialog = ref(false)
const showChatDialog = ref(false)
const selectedModelForChat = ref(null)
const chartTimeRange = ref('1h')
const lastUpdateTime = ref('Nunca')
const animatedModelsCount = ref(0)
const animatedMemoryPercentage = ref(0)
const connectionLatency = ref(0)
let refreshInterval = null

// Referencias para los gráficos
const resourceChart = ref(null)
const modelChart = ref(null)
let resourceChartInstance = null
let modelChartInstance = null

// Variables para métricas reales del sistema
const systemMetrics = ref(null)
const ollamaMetrics = ref(null)
const serverHealth = ref(null)
const realTimeData = ref({
  cpu: [],
  memory: [],
  gpu: []
})

// Encabezados de la tabla de modelos
const modelHeaders = [
  { 
    title: 'Nombre', 
    key: 'name',
    sortable: true
  },
  { 
    title: 'Tamaño', 
    key: 'size',
    sortable: true,
    align: 'end'
  },
  { 
    title: 'Descargado', 
    key: 'downloaded_at',
    sortable: true
  },
  { 
    title: 'Modificado', 
    key: 'modified_at',
    sortable: true
  },
  {
    title: 'Acciones',
    key: 'actions',
    sortable: false,
    align: 'end',
    width: '150px'
  }
]

// Propiedades computadas con métricas reales
const memoryUsagePercentage = computed(() => {
  if (systemMetrics.value?.memory) {
    return systemMetrics.value.memory.percentage
  }
  if (!serverStats.value?.total_memory) return 0
  return (serverStats.value.used_memory / serverStats.value.total_memory) * 100
})

const cpuUsagePercentage = computed(() => {
  return systemMetrics.value?.cpu?.usage || 0
})

const gpuUsagePercentage = computed(() => {
  return systemMetrics.value?.gpu?.usage || 0
})

const systemStatus = computed(() => {
  if (serverHealth.value?.status === 'healthy') return 'online'
  if (serverHealth.value?.status === 'warning') return 'warning'
  return 'offline'
})

// Funciones para obtener colores e iconos de modelos
const getModelTypeColor = (modelName) => {
  const name = modelName.toLowerCase()
  if (name.includes('llama')) return 'deep-purple'
  if (name.includes('mistral')) return 'blue'
  if (name.includes('codellama') || name.includes('code')) return 'green'
  if (name.includes('phi')) return 'orange'
  if (name.includes('gemma')) return 'pink'
  return 'primary'
}

const getModelTypeIcon = (modelName) => {
  const name = modelName.toLowerCase()
  if (name.includes('code')) return 'mdi-code-tags'
  if (name.includes('chat') || name.includes('instruct')) return 'mdi-chat'
  if (name.includes('vision')) return 'mdi-eye'
  return 'mdi-brain'
}

const getVersionColor = (modelName) => {
  const version = modelName.includes(':') ? modelName.split(':')[1] : 'latest'
  if (version === 'latest') return 'success'
  if (version.includes('b') || version.includes('billion')) return 'info'
  return 'secondary'
}

// Modelos filtrados por búsqueda
const filteredModels = computed(() => {
  if (!serverStats.value?.models || !Array.isArray(serverStats.value.models)) return []
  const search = searchModel.value?.toLowerCase() || ''
  return serverStats.value.models.filter(model => 
    model.name.toLowerCase().includes(search)
  )
})

// Modelos recientes (últimos 5)
const recentModels = computed(() => {
  if (!serverStats.value?.models?.length || !Array.isArray(serverStats.value.models)) return []
  return [...serverStats.value.models]
    .sort((a, b) => new Date(b.modified_at || 0) - new Date(a.modified_at || 0))
    .slice(0, 5)
})

// Datos reales para gráficos del sistema
const memoryUsageData = computed(() => {
  return metricsService.getMemoryChartData(60) // Último hora
})

const cpuUsageData = computed(() => {
  return metricsService.getCpuChartData(60) // Último hora
})

const gpuUsageData = computed(() => {
  return metricsService.getGpuChartData(60) // Último hora
})

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'PPpp', { locale: es })
  } catch {
    return dateString
  }
}

// Función para animar contadores
function animateCounter(from, to, duration, callback) {
  const start = Date.now()
  const animate = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const easeOut = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(from + (to - from) * easeOut)
    callback(current)
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    }
  }
  requestAnimationFrame(animate)
}

// Función para actualizar contadores animados
function updateAnimatedCounters() {
  const targetModels = serverStats.value?.models?.length || 0
  const targetMemory = memoryUsagePercentage.value
  
  animateCounter(animatedModelsCount.value, targetModels, 1000, (value) => {
    animatedModelsCount.value = value
  })
  
  animateCounter(animatedMemoryPercentage.value, targetMemory, 1500, (value) => {
    animatedMemoryPercentage.value = value
  })
}

// Métodos para manejar modelos
const startChat = (model) => {
  console.log('Iniciando chat con el modelo:', model.name)
  // Navegar a la vista de chat con el modelo seleccionado
  // router.push({ name: 'chat', query: { model: model.name } })
}

const downloadModel = async (model) => {
  try {
    isLoading.value = true
    console.log('Descargando modelo:', model.name)
    // Implementar lógica de descarga de modelo
    // await serversStore.downloadModel(model.name)
    await refreshData()
  } catch (error) {
    console.error('Error al descargar el modelo:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteModel = async (model) => {
  if (!confirm(`¿Estás seguro de que deseas eliminar el modelo ${model.name}?`)) {
    return
  }
  
  try {
    isLoading.value = true
    console.log('Eliminando modelo:', model.name)
    // Implementar lógica de eliminación de modelo
    // await serversStore.deleteModel(model.name)
    await refreshData()
  } catch (error) {
    console.error('Error al eliminar el modelo:', error)
  } finally {
    isLoading.value = false
  }
}

// Función para navegar al detalle del servidor
const navigateToServerDetail = (serverId) => {
  router.push({ name: 'server-detail', params: { id: serverId } })
}

// Funciones para manejar modelos
const openModelChat = (model) => {
  selectedModelForChat.value = model
  showChatDialog.value = true
  console.log('💬 Abriendo chat con modelo:', model.name)
}

const stopModel = async (model) => {
  console.log('⏹️ Deteniendo modelo:', model.name)
  // TODO: Implementar API call para detener modelo
  model.running = false
}

const runModel = async (model) => {
  console.log('▶️ Ejecutando modelo:', model.name)
  // TODO: Implementar API call para ejecutar modelo
  model.running = true
}

const confirmRemoveModel = (model) => {
  if (confirm(`¿Estás seguro de que deseas eliminar el modelo ${model.name}?`)) {
    // TODO: Implementar eliminación real del modelo
    console.log('🗑️ Eliminando modelo:', model.name)
    if (serverStats.value?.models) {
      const index = serverStats.value.models.findIndex(m => m.name === model.name)
      if (index !== -1) {
        serverStats.value.models.splice(index, 1)
      }
    }
  }
}

// Funciones de utilidad para colores
const getCpuColor = (usage) => {
  if (usage < 50) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

const getMemoryColor = (usage) => {
  if (usage < 50) return 'success'
  if (usage < 80) return 'warning'
  return 'error'
}

const getCpuTrend = () => {
  // TODO: Implement CPU trend calculation based on historical data
  return Math.random() * 10 - 5
}


// Generar etiquetas de tiempo
const generateTimeLabels = () => {
  const labels = []
  const now = new Date()
  const range = chartTimeRange.value
  
  let points = 12
  let interval = 5 // minutos
  
  if (range === '6h') {
    points = 12
    interval = 30
  } else if (range === '24h') {
    points = 12
    interval = 120
  }
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now.getTime() - (i * interval * 60000))
    labels.push(format(time, 'HH:mm'))
  }
  
  return labels
}

// Generar datos aleatorios para el gráfico con variación suave
const generateRandomData = (points) => {
  const data = []
  let lastValue = Math.random() * 40 + 30
  
  for (let i = 0; i < points; i++) {
    // Cambio aleatorio suave entre -5 y +5
    const change = (Math.random() - 0.5) * 10
    lastValue = Math.max(0, Math.min(100, lastValue + change))
    data.push(lastValue)
  }
  
  return data
}

// Obtener distribución de tamaños de modelos
const getModelSizeDistribution = () => {
  if (!serverStats.value?.models) {
    return {
      'Pequeño (<1GB)': 0,
      'Mediano (1-5GB)': 0,
      'Grande (5-10GB)': 0,
      'Muy Grande (>10GB)': 0
    }
  }
  
  const distribution = {
    'Pequeño (<1GB)': 0,
    'Mediano (1-5GB)': 0,
    'Grande (5-10GB)': 0,
    'Muy Grande (>10GB)': 0
  }
  
  serverStats.value.models.forEach(model => {
    const sizeInGB = model.size / (1024 * 1024 * 1024)
    if (sizeInGB < 1) distribution['Pequeño (<1GB)']++
    else if (sizeInGB < 5) distribution['Mediano (1-5GB)']++
    else if (sizeInGB < 10) distribution['Grande (5-10GB)']++
    else distribution['Muy Grande (>10GB)']++
  })
  
  return distribution
}

// Inicializar gráfico de recursos
const initResourceChart = () => {
  if (!resourceChart.value) return
  
  const ctx = resourceChart.value.getContext('2d')
  
  if (resourceChartInstance) {
    resourceChartInstance.destroy()
  }
  
  resourceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: generateTimeLabels(),
      datasets: [
        {
          label: 'CPU',
          data: generateRandomData(12),
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Memoria',
          data: generateRandomData(12),
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'GPU',
          data: generateRandomData(12),
          borderColor: '#FF9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}%`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          }
        },
        y: {
          beginAtZero: true,
          max: 100,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    }
  })
}

// Inicializar gráfico de modelos
const initModelChart = () => {
  if (!modelChart.value) return
  
  const ctx = modelChart.value.getContext('2d')
  
  if (modelChartInstance) {
    modelChartInstance.destroy()
  }
  
  const modelSizes = getModelSizeDistribution()
  
  modelChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(modelSizes),
      datasets: [{
        data: Object.values(modelSizes),
        backgroundColor: [
          '#4CAF50',
          '#2196F3',
          '#FF9800',
          '#F44336',
          '#9C27B0'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (context) => {
              const label = context.label || ''
              const value = context.parsed || 0
              const total = context.dataset.data.reduce((a, b) => a + b, 0)
              const percentage = ((value / total) * 100).toFixed(1)
              return `${label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

// Almacenar datos históricos simulados
const historicalData = {
  cpu: [],
  memory: [],
  gpu: []
}

// Generar nuevo punto de datos basado en el último valor
const generateNextDataPoint = (lastValue) => {
  const change = (Math.random() - 0.5) * 10
  return Math.max(0, Math.min(100, lastValue + change))
}

// Actualizar gráficos con animación
const updateCharts = () => {
  if (resourceChartInstance) {
    const labels = generateTimeLabels()
    resourceChartInstance.data.labels = labels
    
    // Simular datos en tiempo real con animación suave
    if (serverStats.value?.cpu?.usage !== undefined) {
      // Usar datos reales del servidor si están disponibles
      historicalData.cpu.push(serverStats.value.cpu.usage)
      if (historicalData.cpu.length > 12) historicalData.cpu.shift()
      resourceChartInstance.data.datasets[0].data = [...historicalData.cpu]
    } else if (historicalData.cpu.length > 0) {
      // Generar datos simulados basados en el último valor
      const lastCpu = historicalData.cpu[historicalData.cpu.length - 1]
      historicalData.cpu.push(generateNextDataPoint(lastCpu))
      if (historicalData.cpu.length > 12) historicalData.cpu.shift()
      resourceChartInstance.data.datasets[0].data = [...historicalData.cpu]
    } else {
      // Inicializar con datos aleatorios
      historicalData.cpu = generateRandomData(12)
      resourceChartInstance.data.datasets[0].data = [...historicalData.cpu]
    }
    
    // Aplicar la misma lógica para memoria
    const memUsage = memoryUsagePercentage.value
    if (memUsage !== undefined && memUsage > 0) {
      historicalData.memory.push(memUsage)
      if (historicalData.memory.length > 12) historicalData.memory.shift()
      resourceChartInstance.data.datasets[1].data = [...historicalData.memory]
    } else if (historicalData.memory.length > 0) {
      const lastMem = historicalData.memory[historicalData.memory.length - 1]
      historicalData.memory.push(generateNextDataPoint(lastMem))
      if (historicalData.memory.length > 12) historicalData.memory.shift()
      resourceChartInstance.data.datasets[1].data = [...historicalData.memory]
    } else {
      historicalData.memory = generateRandomData(12)
      resourceChartInstance.data.datasets[1].data = [...historicalData.memory]
    }
    
    // Aplicar la misma lógica para GPU
    if (serverStats.value?.gpu?.usage !== undefined) {
      historicalData.gpu.push(serverStats.value.gpu.usage)
      if (historicalData.gpu.length > 12) historicalData.gpu.shift()
      resourceChartInstance.data.datasets[2].data = [...historicalData.gpu]
    } else if (historicalData.gpu.length > 0) {
      const lastGpu = historicalData.gpu[historicalData.gpu.length - 1]
      historicalData.gpu.push(generateNextDataPoint(lastGpu))
      if (historicalData.gpu.length > 12) historicalData.gpu.shift()
      resourceChartInstance.data.datasets[2].data = [...historicalData.gpu]
    } else {
      historicalData.gpu = generateRandomData(12)
      resourceChartInstance.data.datasets[2].data = [...historicalData.gpu]
    }
    
    // Actualizar con animación suave
    resourceChartInstance.update('default')
  }
  
  if (modelChartInstance && serverStats.value?.models) {
    const modelSizes = getModelSizeDistribution()
    modelChartInstance.data.labels = Object.keys(modelSizes)
    modelChartInstance.data.datasets[0].data = Object.values(modelSizes)
    modelChartInstance.update('active')
  }
}

// Métodos para manejar la configuración del servidor
const openServerConfig = () => {
  if (serverConfig.value) {
    serverConfig.value.open()
  }
}

const onServerConfigSaved = async () => {
  // Recargar datos después de guardar la configuración
  await refreshData()
}

// Función para cargar métricas del sistema
const loadSystemMetrics = async () => {
  if (!currentServer.value) return
  
  try {
    const metrics = await metricsService.getSystemMetrics(currentServer.value.id)
    
    // Actualizar datos en tiempo real
    if (!realTimeData.value) {
      realTimeData.value = {
        cpu: [],
        memory: [],
        gpu: []
      }
    }
    
    // Agregar nuevos puntos de datos
    if (metrics.cpu !== undefined) {
      realTimeData.value.cpu.push(metrics.cpu)
      if (realTimeData.value.cpu.length > 50) {
        realTimeData.value.cpu.shift()
      }
    }
    
    if (metrics.memory !== undefined) {
      realTimeData.value.memory.push(metrics.memory)
      if (realTimeData.value.memory.length > 50) {
        realTimeData.value.memory.shift()
      }
    }
    
    if (metrics.gpu !== undefined) {
      realTimeData.value.gpu.push(metrics.gpu)
      if (realTimeData.value.gpu.length > 50) {
        realTimeData.value.gpu.shift()
      }
    }
    
    // Actualizar gráficos con nuevos datos
    updateCharts()
  } catch (error) {
    console.error('Error loading system metrics:', error)
  }
}

// Cargar datos iniciales
const loadInitialData = async () => {
  if (!currentServer.value) return
  
  isLoading.value = true
  try {
    await Promise.all([
      loadStats(),
      loadServerData(),
      loadSystemMetrics()
    ])
    realTimeData.value.memory = metricsService.getMemoryChartData(60)
    realTimeData.value.gpu = metricsService.getGpuChartData(60)
    
    return true
  } catch (error) {
    console.error('Error cargando métricas del sistema:', error)
    return false
  }
}

// Función para cargar métricas de Ollama
const loadOllamaMetrics = async () => {
  try {
    const metrics = await metricsService.getOllamaMetrics()
    ollamaMetrics.value = metrics
    return true
  } catch (error) {
    console.error('Error cargando métricas de Ollama:', error)
    return false
  }
}

// Función para verificar salud del servidor
const checkServerHealth = async () => {
  try {
    const health = await metricsService.getServerHealth()
    serverHealth.value = health
    connectionLatency.value = health.latency
    return health.status === 'healthy'
  } catch (error) {
    console.error('Error verificando salud del servidor:', error)
    serverHealth.value = {
      status: 'error',
      latency: -1,
      last_check: new Date().toISOString(),
      errors: [error.message]
    }
    return false
  }
}

const refreshData = async () => {
  if (!serversStore.currentServer) {
    console.error('❌ No hay servidor actual seleccionado');
    return false;
  }
  
  console.log('🔄 Iniciando refreshData para servidor:', serversStore.currentServer.name);
  
  try {
    isLoading.value = true;
    console.log('⏳ Cargando métricas en paralelo...');
    
    // Cargar todas las métricas en paralelo
    const [systemSuccess, ollamaSuccess, healthSuccess, serverSuccess] = await Promise.allSettled([
      loadSystemMetrics(),
      loadOllamaMetrics(),
      checkServerHealth(),
      serversStore.checkServerStatus()
    ])
    
    console.log('📊 Resultados de métricas:', {
      system: systemSuccess.status,
      ollama: ollamaSuccess.status,
      health: healthSuccess.status,
      server: serverSuccess.status,
      serverValue: serverSuccess.status === 'fulfilled' ? serverSuccess.value : 'error'
    });
    
    // Verificar estado del servidor
    serverStatus.value = serverSuccess.status === 'fulfilled' ? serverSuccess.value : false
    console.log('🌐 Estado del servidor:', serverStatus.value);
    
    // Si el servidor está en línea, obtener estadísticas adicionales
    if (serverStatus.value) {
      console.log('📈 Obteniendo estadísticas del servidor...');
      const stats = await serversStore.getServerStats();
      console.log('📈 Estadísticas obtenidas:', stats);
      
      if (stats) {
        const oldStats = serverStats.value
        serverStats.value = stats;
        
        // Animar contadores si hay cambios
        if (!oldStats || oldStats.models?.length !== stats.models?.length) {
          updateAnimatedCounters()
        }
        console.log('✅ Datos del servidor actualizados correctamente');
      } else {
        console.warn('⚠️ No se pudieron obtener estadísticas del servidor');
      }
    } else {
      serverStats.value = null;
      console.log('❌ Servidor fuera de línea, limpiando datos');
    }
    
    // Actualizar tiempo de última actualización
    lastUpdateTime.value = format(new Date(), 'HH:mm:ss')
    console.log('🕒 Última actualización:', lastUpdateTime.value);
    
    const success = systemSuccess.status === 'fulfilled' || serverStatus.value;
    console.log('✅ RefreshData completado, éxito:', success);
    return success;
  } catch (error) {
    console.error('❌ Error al actualizar datos:', error);
    serverStatus.value = false;
    serverStats.value = null;
    connectionLatency.value = 0
    
    return false;
  } finally {
    isLoading.value = false;
  }
}

const loadData = async () => {
  try {
    isLoading.value = true;
    await refreshData();
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
  } finally {
    isLoading.value = false;
  }
};

// Sistema de actualización automática inteligente
const autoRefreshEnabled = ref(true)
const refreshIntervalTime = ref(15000) // 15 segundos por defecto
let chartUpdateInterval = null
let consecutiveErrors = 0
const maxConsecutiveErrors = 3

const startAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
  if (chartUpdateInterval) {
    clearInterval(chartUpdateInterval)
  }
  
  // Actualizar gráficos cada segundo para animación fluida
  chartUpdateInterval = setInterval(() => {
    if (autoRefreshEnabled.value) {
      updateCharts()
    }
  }, 1000)
  
  // Actualizar datos del servidor con el intervalo configurado
  refreshInterval = setInterval(async () => {
    if (autoRefreshEnabled.value) {
      const success = await refreshData()
      
      if (!success) {
        consecutiveErrors++
        if (consecutiveErrors >= maxConsecutiveErrors) {
          autoRefreshEnabled.value = false
          clearInterval(refreshInterval)
          clearInterval(chartUpdateInterval)
          refreshInterval = null
          chartUpdateInterval = null
          console.error('Auto-actualización detenida después de múltiples errores')
        }
      } else {
        consecutiveErrors = 0
      }
    }
  }, refreshIntervalTime.value)
}

const toggleAutoRefresh = () => {
  autoRefreshEnabled.value = !autoRefreshEnabled.value
  if (!autoRefreshEnabled.value && refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  } else if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
}

// Cambiar intervalo de actualización
const setRefreshInterval = (seconds) => {
  refreshIntervalTime.value = seconds * 1000
  if (autoRefreshEnabled.value) {
    startAutoRefresh()
  }
}

// Watcher para detectar cambios en el servidor actual
watch(() => serversStore.currentServer, async (newServer, oldServer) => {
  console.log('🔍 WATCHER - Servidor actual:', newServer?.name || 'NULL');
  console.log('🔍 WATCHER - Servidor anterior:', oldServer?.name || 'NULL');
  console.log('🔍 WATCHER - Condición cumplida:', !!(newServer && (!oldServer || newServer.id !== oldServer.id)));
  
  if (newServer && (!oldServer || newServer.id !== oldServer.id)) {
    console.log('🔄 Servidor cambiado a:', newServer.name);
    // Limpiar datos anteriores
    serverStats.value = null;
    serverStatus.value = false;
    lastUpdateTime.value = 'Nunca';
    
    // Cargar datos del nuevo servidor
    await refreshData();
  }
}, { immediate: false });

// Watcher para cambios en el rango de tiempo del gráfico
watch(chartTimeRange, () => {
  updateCharts()
})

// Watcher para actualizar gráficos cuando cambian los datos
watch([serverStats, realTimeData], () => {
  updateCharts()
}, { deep: true })

onMounted(() => {
  // Limpiar servidor actual para mostrar vista general
  serversStore.currentServer = null;
  
  // Inicializar servidores desde localStorage antes de cargar datos
  serversStore.initializeServers();
  loadData();
  startAutoRefresh();
});

// Limpiar intervalos al desmontar el componente
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
  if (chartUpdateInterval) {
    clearInterval(chartUpdateInterval);
    chartUpdateInterval = null;
  }
  if (resourceChartInstance) {
    resourceChartInstance.destroy();
    resourceChartInstance = null;
  }
  if (modelChartInstance) {
    modelChartInstance.destroy();
    modelChartInstance = null;
  }
});

// Exponer métodos para pruebas
const testConnection = async () => {
  if (connectionStatus.value) {
    return await connectionStatus.value.testConnection();
  }
  return false;
};

defineExpose({
  testConnection
});
</script>

<style scoped>
/* Contenedor principal del dashboard */
.dashboard-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  min-height: 100vh;
  position: relative;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

/* Tarjeta sin servidor */
.no-server-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
}

/* Animación de pulso */
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Texto con gradiente */
.text-gradient {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Efecto hover lift */
.hover-lift {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

/* Wrapper de conexión */
.connection-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.update-chip {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%);
  }
}

/* Tarjetas de estadísticas mejoradas */
.stat-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Iconos con animación de pulso */
.pulse-icon {
  animation: gentlePulse 3s infinite;
}

.pulse-success {
  animation: pulseSuccess 2s infinite;
}

.pulse-error {
  animation: pulseError 2s infinite;
}

@keyframes gentlePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

@keyframes pulseSuccess {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
}

@keyframes pulseError {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 0 8px rgba(244, 67, 54, 0);
  }
}

/* Wrapper del icono de estadística */
.stat-icon-wrapper {
  position: relative;
}

/* Badge de estadística */
.stat-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: linear-gradient(45deg, #FF6B6B, #FF8E8E);
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

/* Animación de contadores */
.counter-animation {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Barra de progreso con glow */
.progress-glow {
  position: relative;
  overflow: visible !important;
}

.progress-glow::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: inherit;
  filter: blur(4px);
  opacity: 0.4;
  z-index: -1;
}

/* Icono de estado con animación */
.status-icon {
  animation: statusPulse 1s infinite alternate;
}

@keyframes statusPulse {
  from { opacity: 1; }
  to { opacity: 0.7; }
}

/* Tarjeta de modelos */
.models-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Header con gradiente */
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.bg-gradient::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Campo de búsqueda */
.search-field .v-field {
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 12px !important;
}

.search-field .v-field--focused {
  background: rgba(255, 255, 255, 0.3) !important;
}

/* Tabla de modelos */
.models-table {
  background: transparent;
}

.models-table .v-data-table__wrapper {
  border-radius: 0 0 20px 20px;
  overflow: hidden;
}

/* Fila de modelo */
.model-row {
  transition: all 0.2s ease;
}

.model-row:hover {
  transform: scale(1.02);
}

/* Avatar de modelo */
.model-avatar {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.model-row:hover .model-avatar {
  transform: rotate(10deg) scale(1.1);
}

/* Nombre de modelo */
.model-name {
  background: linear-gradient(45deg, #333, #666);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Versión del modelo */
.model-version {
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Texto de versión */
.version-text {
  background: linear-gradient(45deg, #1976d2, #42a5f5);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Roboto Mono', monospace;
}

/* Acciones de modelo */
.model-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.model-row:hover .model-actions {
  opacity: 1;
}

/* Responsivo */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 8px !important;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
  
  .connection-wrapper {
    flex-direction: column;
    gap: 12px;
  }
  
  .update-chip {
    position: static;
    transform: none;
  }
}

/* Animaciones de entrada */
.v-enter-active, .v-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.v-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.v-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Personalización de Vuetify */
.v-card {
  height: 100%;
}

/* Loading skeleton para modelos */
.model-skeleton {
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-color: rgba(0, 0, 0, 0.1); }
  50% { background-color: rgba(0, 0, 0, 0.2); }
  100% { background-color: rgba(0, 0, 0, 0.1); }
}
</style>

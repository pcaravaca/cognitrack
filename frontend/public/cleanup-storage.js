/**
 * Script de limpieza para eliminar configuraciones que causan CORS
 * Ejecutar en la consola del navegador: fetch('/cleanup-storage.js').then(r=>r.text()).then(eval)
 */

console.log('🧹 Iniciando limpieza de localStorage...');

// Limpiar todas las configuraciones que pueden contener URLs directas y tokens de auth
const keysToClean = [
  'currentServer',
  'ollamaServers', 
  'detectedHostname',
  'serverConfiguration',
  'ollamaConfig',
  'cognitrack_token',
  'auth_token',
  'access_token',
  'user_data'
];

keysToClean.forEach(key => {
  const value = localStorage.getItem(key);
  if (value) {
    console.log(`❌ Eliminando ${key}: ${value.substring(0, 50)}...`);
    localStorage.removeItem(key);
  } else {
    console.log(`✅ ${key} ya estaba limpio`);
  }
});

// Crear configuración limpia que use solo el proxy
const cleanConfig = {
  id: 'servidor-ia-131',
  name: 'Servidor-IA-131',
  baseUrl: '/api',
  wsUrl: 'ws://cognitrack.local/ws',
  hostname: 'Servidor-IA-131',
  port: 80,
  isLocal: false,
  originalUrl: 'http://10.10.1.131:11434', // Solo para referencia
  createdAt: new Date().toISOString()
};

// Guardar configuración limpia
localStorage.setItem('currentServer', JSON.stringify(cleanConfig));
localStorage.setItem('ollamaServers', JSON.stringify([cleanConfig]));

console.log('✅ Limpieza completada. Configuración del proxy aplicada.');
console.log('🔄 Recarga la página para aplicar los cambios.');

// Mostrar configuración actual
console.log('📋 Configuración actual:', cleanConfig);

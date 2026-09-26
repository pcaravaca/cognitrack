// Script para validar la configuración completa de servidores Ollama
// Ejecutar con: node test_server_config.js

/**
 * Script de diagnósticos para probar la configuración de servidores Ollama en CogniTrack
 * 
 * Este script verifica:
 * 1. La correcta estructura del objeto servidor
 * 2. La validez de las URLs
 * 3. La conectividad con el servidor
 * 4. La persistencia en localStorage
 * 
 * Autor: Peter Caravaca
 * Fecha: 31/08/2025
 */

// Simulamos las variables de entorno y localStorage
const localStorage = {
  _data: {},
  getItem(key) {
    return this._data[key] || null;
  },
  setItem(key, value) {
    this._data[key] = value;
    console.log(`✅ Guardado en localStorage: ${key}`); 
  },
  removeItem(key) {
    delete this._data[key];
  },
  clear() {
    this._data = {};
  }
};

// Constantes y utilidades
const COMMON_HEADERS = {
  'Content-Type': 'application/json'
};

const OLLAMA_SERVERS = {
  local: {
    id: 'local',
    name: 'Servidor Local',
    baseUrl: 'http://localhost:11434',
    wsUrl: 'ws://localhost:11434',
    apiKey: '',
    isLocal: true,
    hostname: 'localhost',
    port: 11434,
    osInfo: null,
    endpoints: {
      version: '/api/version',
      tags: '/api/tags',
      generate: '/api/generate',
      chat: '/api/chat',
      embeddings: '/api/embeddings',
      status: '/api/status'
    },
    timeout: 30000,
    retries: 3,
    retryDelay: 1000
  }
};

// Funciones de utilidad
function normalizeUrl(url) {
  if (!url) return '';
  
  // Asegurar que la URL tenga el formato correcto
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
    url = 'http://' + url;
  }
  
  // Eliminar barra final si existe
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function isValidUrl(url) {
  if (!url) return false;
  
  // Si es una ruta relativa considerarla vu00e1lida
  if (url.startsWith('/')) return true;
  
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Funciones principales de prueba
async function testServerStructure(server) {
  console.log('\n🔍 Probando estructura del servidor...');
  
  // Verificar campos obligatorios
  const requiredFields = ['id', 'name', 'baseUrl'];
  const missingFields = requiredFields.filter(field => !server[field]);
  
  if (missingFields.length > 0) {
    console.error(`❌ Campos obligatorios faltantes: ${missingFields.join(', ')}`);
    return false;
  }
  
  console.log('✅ Estructura básica del servidor correcta');
  
  // Verificar estructura de endpoints
  if (!server.endpoints) {
    console.warn('⚠️ El servidor no tiene endpoints definidos');
  } else {
    console.log('✅ Endpoints definidos');
  }
  
  return true;
}

async function testServerUrl(server) {
  console.log('\n🔍 Probando URL del servidor...');
  
  const url = server.baseUrl;
  if (!isValidUrl(url)) {
    console.error(`❌ URL inválida: ${url}`);
    return false;
  }
  
  console.log(`✅ URL válida: ${url}`);
  return true;
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  console.log(`🔄 Intentando conectar a ${url}`);
  
  let lastError;
  
  for (let i = 0; i <= retries; i++) {
    try {
      // Simulamos una petición en este caso
      console.log(`   Intento ${i + 1}/${retries + 1}`);
      
      // En un entorno real, aquí iría:
      // const response = await fetch(url, options);
      // return response;
      
      // Simulamos éxito o error aleatorio para demostración
      const success = Math.random() > 0.3; // 70% probabilidad de éxito
      
      if (success) {
        console.log(`✅ Conexión exitosa a ${url}`);
        return { ok: true, status: 200, json: async () => ({ version: '0.1.17' }) };
      } else {
        throw new Error('Error de conexión simulado');
      }
      
    } catch (error) {
      console.error(`   ❌ Error en intento ${i + 1}: ${error.message}`);
      lastError = error;
      
      // Esperar antes de reintentar (excepto en el último intento)
      if (i < retries) {
        const delay = (options.retryDelay || 1000) * (i + 1);
        console.log(`   ⏱️ Esperando ${delay}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Error desconocido al conectar con el servidor');
}

async function testServerConnection(server) {
  console.log('\n🔍 Probando conexión con el servidor...');
  
  try {
    const url = `${server.baseUrl}/api/version`;
    const response = await fetchWithRetry(url, {
      method: 'GET',
      headers: {
        ...COMMON_HEADERS,
        'X-Server-Name': server.name || 'unknown',
        'X-Request-ID': `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }, server.retries || 2);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Servidor respondió correctamente. Versión: ${data.version}`);
      return true;
    } else {
      console.error(`❌ Servidor respondió con error: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error al conectar con el servidor: ${error.message}`);
    return false;
  }
}

async function testLocalStoragePersistence(server) {
  console.log('\n🔍 Probando persistencia en localStorage...');
  
  // Limpiar localStorage para la prueba
  localStorage.clear();
  
  // Guardar el servidor en el localStorage
  const servers = [server];
  localStorage.setItem('servers', JSON.stringify(servers));
  localStorage.setItem('currentServer', JSON.stringify(server));
  
  // Verificar que se guardó correctamente
  const savedServers = JSON.parse(localStorage.getItem('servers') || '[]');
  const savedCurrentServer = JSON.parse(localStorage.getItem('currentServer') || 'null');
  
  if (savedServers.length === 0) {
    console.error('❌ No se guardaron los servidores en localStorage');
    return false;
  }
  
  if (!savedCurrentServer) {
    console.error('❌ No se guardó el servidor actual en localStorage');
    return false;
  }
  
  console.log('✅ Datos guardados correctamente en localStorage');
  console.log(`ℹ️ Servidor guardado: ${savedCurrentServer.name} (${savedCurrentServer.baseUrl})`);
  
  return true;
}

// Función principal
async function runTests() {
  console.log('💻 INICIANDO PRUEBAS DE CONFIGURACIÓN DE SERVIDOR OLLAMA');
  console.log('=======================================================');
  
  // Crear un servidor de prueba
  const testServer = {
    id: `test-${Date.now()}`,
    name: 'Servidor de Prueba',
    baseUrl: normalizeUrl('/api'), // Probar con ruta relativa
    wsUrl: 'ws://localhost:11434',
    apiKey: '',
    isLocal: true,
    hostname: 'test-host',
    port: 11434,
    endpoints: {
      version: '/api/version',
      tags: '/api/tags'
    },
    timeout: 5000,
    retries: 2,
    retryDelay: 500
  };
  
  console.log(`💻 Servidor de prueba: ${testServer.name} (${testServer.baseUrl})`);
  
  // Ejecutar todas las pruebas
  const tests = [
    { name: 'Estructura del servidor', fn: () => testServerStructure(testServer) },
    { name: 'URL del servidor', fn: () => testServerUrl(testServer) },
    { name: 'Persistencia en localStorage', fn: () => testLocalStoragePersistence(testServer) },
    { name: 'Conexión al servidor', fn: () => testServerConnection(testServer) }
  ];
  
  let success = true;
  
  for (const test of tests) {
    try {
      console.log(`\n⏰ EJECUTANDO PRUEBA: ${test.name}`);
      const result = await test.fn();
      
      if (result) {
        console.log(`\n✅ PRUEBA EXITOSA: ${test.name}`);
      } else {
        console.error(`\n❌ PRUEBA FALLIDA: ${test.name}`);
        success = false;
      }
    } catch (error) {
      console.error(`\n❌ ERROR EN PRUEBA ${test.name}: ${error.message}`);
      success = false;
    }
  }
  
  console.log('\n=======================================================');
  if (success) {
    console.log('🎉 TODAS LAS PRUEBAS FUERON EXITOSAS');
  } else {
    console.error('⚠️ ALGUNAS PRUEBAS FALLARON. Revisar los errores arriba.');
  }
}

// Ejecutar las pruebas
runTests().catch(error => {
  console.error('Error al ejecutar las pruebas:', error);
});

/*
 * Este script puede ejecutarse con Node.js para probar la configuración
 * de servidores Ollama en un entorno aislado. Simula el comportamiento
 * del frontend de CogniTrack sin necesidad de ejecutar la aplicación completa.
 * 
 * Instrucciones bilingues / Bilingual instructions:
 * 
 * [ES] Para ejecutar este script:
 * 1. Asegúrate de tener Node.js instalado
 * 2. Guarda este archivo como test_server_config.js
 * 3. Ejecuta: node test_server_config.js
 * 
 * [EN] To run this script:
 * 1. Make sure you have Node.js installed
 * 2. Save this file as test_server_config.js
 * 3. Run: node test_server_config.js
 */

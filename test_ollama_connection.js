/**
 * Script para probar la conexión directa a un servidor Ollama
 * Este archivo ayuda a verificar si podemos conectarnos al servidor Ollama en 10.10.1.131:11434
 * 
 * Autor: Peter Caravaca
 * Fecha: 31/08/2025
 */

// Configuración del servidor a probar
const serverConfig = {
  url: 'http://10.10.1.131:11434',
  endpoint: '/api/version'
};

// Función para hacer una solicitud con reintentos
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  console.log(`🔄 Intentando conectar a ${url}`);
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`   Intento ${attempt}/${maxRetries}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        ...options,
        timeout: 5000 // 5 segundos de timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data, status: response.status };
      } else {
        console.error(`   ❌ Error HTTP: ${response.status}`);
        return { success: false, status: response.status };
      }
      
    } catch (error) {
      console.error(`   ❌ Error en intento ${attempt}: ${error.message}`);
      
      if (attempt < maxRetries) {
        const delay = 1000 * attempt; // Incrementar el retraso con cada intento
        console.log(`   ⏱️ Esperando ${delay}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        return { success: false, error: error.message };
      }
    }
  }
}

// Función principal para probar la conexión
async function testConnection() {
  console.log('📡 PRUEBA DE CONEXIÓN A SERVIDOR OLLAMA');
  console.log('============================================');
  console.log(`Servidor: ${serverConfig.url}`);
  console.log(`Endpoint: ${serverConfig.endpoint}`);
  console.log('============================================');
  
  // Construir la URL completa
  const fullUrl = `${serverConfig.url}${serverConfig.endpoint}`;
  console.log(`🔗 URL completa: ${fullUrl}`);
  
  try {
    // Verificar si podemos crear un objeto URL (validar formato)
    try {
      new URL(fullUrl);
      console.log('✅ Formato de URL válido');
    } catch (e) {
      console.error(`❌ Formato de URL inválido: ${e.message}`);
      return;
    }
    
    // Hacer la solicitud al servidor
    console.log('\n🚀 Iniciando solicitud al servidor...');
    const result = await fetchWithRetry(fullUrl);
    
    if (result.success) {
      console.log('\n✅ CONEXIÓN EXITOSA');
      console.log('Respuesta del servidor:');
      console.log(JSON.stringify(result.data, null, 2));
    } else {
      console.error('\n❌ FALLO EN LA CONEXIÓN');
      console.error(`Error: ${result.error || `Código de estado HTTP: ${result.status}`}`);
    }
    
  } catch (error) {
    console.error('\n❌ ERROR INESPERADO');
    console.error(error);
  }
}

// Ejecutar la prueba
testConnection().catch(error => {
  console.error('Error al ejecutar la prueba:', error);
});

/*
 * Instrucciones bilingues / Bilingual instructions:
 * 
 * [ES] Para ejecutar este script:
 * 1. Asegúrate de tener Node.js instalado
 * 2. Ejecuta: node test_ollama_connection.js
 * 
 * [EN] To run this script:
 * 1. Make sure you have Node.js installed
 * 2. Run: node test_ollama_connection.js
 */

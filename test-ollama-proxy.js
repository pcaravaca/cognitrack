// Test de conectividad Ollama a través del proxy Nginx
// Prueba la conectividad desde el frontend hacia los servidores Ollama

async function testOllamaConnectivity() {
    console.log('=== Test de Conectividad Ollama Multi-Servidor ===');
    
    const servers = [
        { name: 'Servidor Principal', url: '/api/ollama/api/tags' },
        { name: 'Servidor 1', url: '/api/server1/api/tags' },
        { name: 'Servidor 2', url: '/api/server2/api/tags' },
        { name: 'Health Check 1', url: '/api/server1/health' },
        { name: 'Health Check 2', url: '/api/server2/health' }
    ];

    const results = [];

    for (const server of servers) {
        console.log(`\n--- Probando ${server.name} ---`);
        console.log(`URL: ${server.url}`);
        
        try {
            const startTime = performance.now();
            
            const response = await fetch(server.url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });
            
            const endTime = performance.now();
            const responseTime = Math.round(endTime - startTime);
            
            let data = null;
            let contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                try {
                    data = await response.json();
                } catch (e) {
                    console.warn('Respuesta no es JSON válido');
                    data = await response.text();
                }
            } else {
                data = await response.text();
            }
            
            const result = {
                server: server.name,
                url: server.url,
                status: response.status,
                statusText: response.statusText,
                success: response.ok,
                responseTime: responseTime,
                contentType: contentType,
                data: data
            };
            
            results.push(result);
            
            if (response.ok) {
                console.log(`✅ ÉXITO - Status: ${response.status} (${responseTime}ms)`);
                if (data && data.models) {
                    console.log(`   Modelos disponibles: ${data.models.length}`);
                    data.models.slice(0, 3).forEach(model => {
                        console.log(`   - ${model.name} (${(model.size / 1024 / 1024 / 1024).toFixed(1)}GB)`);
                    });
                }
            } else {
                console.log(`❌ ERROR - Status: ${response.status} ${response.statusText}`);
                console.log(`   Respuesta: ${JSON.stringify(data).substring(0, 200)}...`);
            }
            
        } catch (error) {
            console.log(`❌ EXCEPCIÓN - ${error.name}: ${error.message}`);
            
            const result = {
                server: server.name,
                url: server.url,
                success: false,
                error: error.message,
                errorType: error.name
            };
            
            results.push(result);
        }
    }

    // Resumen de resultados
    console.log('\n=== RESUMEN DE RESULTADOS ===');
    console.log('┌─────────────────────┬──────────┬─────────────┬──────────────┐');
    console.log('│ Servidor            │ Estado   │ Status Code │ Tiempo (ms)  │');
    console.log('├─────────────────────┼──────────┼─────────────┼──────────────┤');
    
    results.forEach(result => {
        const server = result.server.padEnd(19);
        const status = result.success ? 'OK'.padEnd(8) : 'ERROR'.padEnd(8);
        const code = (result.status || 'N/A').toString().padEnd(11);
        const time = (result.responseTime || 'N/A').toString().padEnd(12);
        
        console.log(`│ ${server} │ ${status} │ ${code} │ ${time} │`);
    });
    
    console.log('└─────────────────────┴──────────┴─────────────┴──────────────┘');

    // Análisis de conectividad
    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    const successRate = (successCount / totalCount * 100).toFixed(1);
    
    console.log(`\n📊 Tasa de éxito: ${successCount}/${totalCount} (${successRate}%)`);
    
    if (successCount === totalCount) {
        console.log('🎉 Todos los servidores están conectados correctamente');
    } else if (successCount > 0) {
        console.log('⚠️ Algunos servidores presentan problemas de conectividad');
    } else {
        console.log('🚨 No se pudo conectar a ningún servidor Ollama');
    }

    // Recomendaciones
    console.log('\n=== RECOMENDACIONES ===');
    const failedServers = results.filter(r => !r.success);
    
    if (failedServers.length > 0) {
        console.log('Para los servidores que fallan:');
        failedServers.forEach(server => {
            console.log(`• ${server.server}:`);
            if (server.error) {
                if (server.error.includes('TypeError')) {
                    console.log('  - Verificar configuración de CORS en Nginx');
                    console.log('  - Comprobar que el servidor Ollama esté ejecutándose');
                } else if (server.error.includes('fetch')) {
                    console.log('  - Verificar conectividad de red');
                    console.log('  - Revisar configuración de proxy en Nginx');
                }
            }
            if (server.status === 502) {
                console.log('  - Bad Gateway: El servidor Ollama no responde');
                console.log('  - Verificar que Ollama esté ejecutándose en la IP/Puerto configurado');
            } else if (server.status === 404) {
                console.log('  - Ruta no encontrada: Revisar configuración de rutas en Nginx');
            }
        });
    }

    console.log('\nPuedes ejecutar este test desde la consola del navegador en la aplicación CogniTrack');
    
    return results;
}

// Auto-ejecutar si se está ejecutando en el navegador
if (typeof window !== 'undefined') {
    console.log('Test de conectividad Ollama disponible. Ejecuta: testOllamaConnectivity()');
}

// Export para Node.js si se necesita
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testOllamaConnectivity };
}

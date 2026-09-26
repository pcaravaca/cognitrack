console.log('🧹 Limpiando localStorage para reiniciar el dashboard...');

// Limpiar todos los datos del store de servidores
localStorage.removeItem('servers');
localStorage.removeItem('cognitrack_servers');

// Limpiar cualquier otro dato de la aplicación
localStorage.removeItem('auth_token');
localStorage.removeItem('user');

console.log('✅ localStorage limpiado. Recarga la página para ver los cambios.');

// Recargar la página
window.location.reload();

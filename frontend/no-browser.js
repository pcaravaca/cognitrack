// Este script inicia Vite sin intentar abrir el navegador
const { spawn } = require('child_process');
const path = require('path');

// Configuración
const vitePath = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
const args = [
  vitePath,
  '--config', 'vite.config.ts',
  '--host', '0.0.0.0',
  '--port', '5173',
  '--strictPort',
  '--force'
];

// Configuración del proceso
const vite = spawn('node', args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    BROWSER: 'none',
    VITE_OPEN_BROWSER: 'false'
  }
});

// Manejar la salida del proceso
vite.on('error', (err) => {
  console.error('Error al iniciar Vite:', err);
  process.exit(1);
});

vite.on('close', (code) => {
  console.log(`Vite se ha cerrado con el código ${code}`);
  process.exit(code);
});

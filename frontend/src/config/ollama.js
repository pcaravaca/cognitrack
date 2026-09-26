export const OLLAMA_SERVERS = {
  local: {
    name: 'Servidor 10.10.1.131',
    url: '/api',  // Usará el proxy configurado en Vite
    apiKey: ''
  },
  development: {
    name: 'Servidor 10.10.1.131',
    url: import.meta.env.VITE_OLLAMA_SERVER_URL || '/api',
    apiKey: ''
  }
}

export const API_ENDPOINTS = {
  MODELS: '/tags',
  PULL_MODEL: '/pull',
  GENERATE: '/generate',
  CHAT: '/chat',
  EMBEDDINGS: '/embeddings',
  SHOW_MODEL: '/show',
  DELETE_MODEL: '/delete',
  VERSION: '/version'
}

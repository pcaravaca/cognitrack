import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ollamaAPI } from '@/services/ollama/api'
import type { OllamaModel, OllamaStatus } from '@/types/ollama'

export const useOllamaStore = defineStore('ollama', () => {
  const models = ref<OllamaModel[]>([])
  const status = ref<OllamaStatus>({ status: 'idle' })
  const error = ref<string | null>(null)
  const isConnected = ref(false)

  // Obtener lista de modelos
  const fetchModels = async () => {
    try {
      status.value = { status: 'loading' }
      models.value = await ollamaAPI.listModels()
      status.value = { status: 'idle' }
      isConnected.value = true
      return models.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al conectar con el servidor Ollama'
      status.value = { status: 'error', message: error.value }
      isConnected.value = false
      throw err
    }
  }

  // Verificar estado del servidor
  const checkHealth = async (): Promise<boolean> => {
    try {
      status.value = { status: 'loading', message: 'Conectando al servidor...' }
      const isHealthy = await ollamaAPI.checkHealth()
      isConnected.value = isHealthy
      status.value = { status: isHealthy ? 'idle' : 'error' }
      return isHealthy
    } catch (err) {
      error.value = 'No se pudo conectar al servidor Ollama'
      status.value = { status: 'error', message: error.value }
      isConnected.value = false
      return false
    }
  }

  // Obtener información detallada de un modelo
  const getModelInfo = async (modelName: string) => {
    try {
      status.value = { status: 'loading' }
      const modelInfo = await ollamaAPI.getModel(modelName)
      status.value = { status: 'idle' }
      return modelInfo
    } catch (err) {
      error.value = 'Error al obtener información del modelo'
      status.value = { status: 'error', message: error.value }
      throw err
    }
  }

  // Generar texto con un modelo
  const generateText = async (model: string, prompt: string): Promise<string> => {
    try {
      status.value = { status: 'loading', message: 'Generando respuesta...' }
      const response = await ollamaAPI.generate(prompt, model)
      status.value = { status: 'idle' }
      return response
    } catch (err) {
      error.value = 'Error al generar texto'
      status.value = { status: 'error', message: error.value }
      throw err
    }
  }

  return {
    models,
    status,
    error,
    isConnected,
    fetchModels,
    checkHealth,
    getModelInfo,
    generateText
  }
})

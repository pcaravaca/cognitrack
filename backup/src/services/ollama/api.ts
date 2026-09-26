import axios, { AxiosInstance } from 'axios'
import type { OllamaModel, OllamaTag, OllamaError, OllamaStatus } from '@/types/ollama'

class OllamaAPI {
  private client: AxiosInstance
  private status: OllamaStatus = { status: 'idle' }

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434/api',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })
  }

  public async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get('/tags')
      return response.data.models || []
    } catch (error) {
      console.error('Error al listar modelos:', error)
      throw error
    }
  }

  public async getModel(name: string): Promise<OllamaModel> {
    try {
      const response = await this.client.post('/show', { name })
      return response.data
    } catch (error) {
      console.error(`Error al obtener modelo ${name}:`, error)
      throw error
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      await this.client.get('/')
      return true
    } catch (error) {
      console.error('Error de conexión con Ollama:', error)
      return false
    }
  }
}

export const ollamaAPI = new OllamaAPI()

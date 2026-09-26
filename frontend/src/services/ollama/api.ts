import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type { OllamaModel, OllamaTag, OllamaError, OllamaStatus } from '@/types/ollama';
import config from '@/config/config';

// Definir tipos para las respuestas de la API
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
}

interface ApiError extends Error {
  response?: {
    status: number;
    statusText: string;
    data: any;
  };
  request?: any;
  config: any;
}

class OllamaAPI {
  private client: AxiosInstance;
  private status: OllamaStatus = { status: 'idle' };
  private baseUrl: string;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      timeout: config.api.timeout,
      withCredentials: true,
    });
    
    // Interceptor para manejar errores globalmente
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response) {
          // El servidor respondió con un estado de error
          console.error('Error en la respuesta de la API:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          });
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          console.error('No se pudo conectar con el servidor:', error.message);
        } else {
          // Error al configurar la petición
          console.error('Error en la configuración de la petición:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  public async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await this.client.get('/tags');
      return response.data?.models || [];
    } catch (error) {
      console.error('Error al listar modelos:', error)
      throw error
    }
  }

  public async getModel(name: string): Promise<OllamaModel> {
    try {
      const response = await this.client.post('/show', { name });
      return response?.data;
    } catch (error) {
      console.error(`Error al obtener modelo ${name}:`, error)
      throw error
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response?.status === 200;
    } catch (error) {
      console.error('Error de conexión con la API:', error);
      return false;
    }
  }
  
  // Método para obtener información del servidor
  public async getServerInfo(): Promise<any> {
    try {
      const response = await this.client.get('/info');
      return response?.data;
    } catch (error) {
      console.error('Error al obtener información del servidor:', error);
      throw error;
    }
  }
  
  // Método para verificar si la API está disponible
  public async isApiAvailable(): Promise<boolean> {
    try {
      await this.client.get('/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const ollamaAPI = new OllamaAPI()

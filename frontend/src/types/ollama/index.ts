export interface OllamaModel {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[] | null
    parameter_size: string
    quantization_level: string
  }
}

export interface OllamaTag {
  name: string
  model: string
  modified_at: string
  size: number
  digest: string
}

export interface OllamaResponse<T> {
  models: T[]
}

export interface OllamaError {
  error: string
}

export interface OllamaStatus {
  status: 'idle' | 'loading' | 'error'
  message?: string
  progress?: number
}

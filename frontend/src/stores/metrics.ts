import { defineStore } from 'pinia'
import { ref } from 'vue'
import { metricsAPI } from '@/services/api'
import type { SystemMetrics, OllamaMetrics } from '@/types/metrics'

export const useMetricsStore = defineStore('metrics', () => {
  const systemMetrics = ref<SystemMetrics | null>(null)
  const ollamaMetrics = ref<OllamaMetrics | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  // Obtener métricas del sistema
  const fetchSystemMetrics = async () => {
    try {
      isLoading.value = true
      error.value = null
      systemMetrics.value = await metricsAPI.getSystemMetrics()
      return systemMetrics.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener métricas del sistema'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Obtener métricas de Ollama
  const fetchOllamaMetrics = async (server?: string) => {
    try {
      isLoading.value = true
      error.value = null
      ollamaMetrics.value = await metricsAPI.getOllamaMetrics(server)
      return ollamaMetrics.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener métricas de Ollama'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Obtener todas las métricas
  const fetchAllMetrics = async (ollamaServer?: string) => {
    try {
      isLoading.value = true
      error.value = null
      await Promise.all([
        fetchSystemMetrics(),
        fetchOllamaMetrics(ollamaServer)
      ])
      return {
        system: systemMetrics.value,
        ollama: ollamaMetrics.value
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener métricas'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    systemMetrics,
    ollamaMetrics,
    error,
    isLoading,
    fetchSystemMetrics,
    fetchOllamaMetrics,
    fetchAllMetrics
  }
})
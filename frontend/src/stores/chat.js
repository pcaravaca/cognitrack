import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useChatStore = defineStore('chat', () => {
  // Estado
  const messages = ref([]);
  const currentModel = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const eventSource = ref(null);
  
  // Getters
  const conversationHistory = computed(() => messages.value);
  const models = ref([]);
  
  // Acciones
  const sendMessage = async (message, model, serverUrl) => {
    if (!message.trim() || !model) return;
    
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    
    messages.value.push(userMessage);
    
    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true
    };
    
    messages.value.push(assistantMessage);
    
    try {
      isLoading.value = true;
      error.value = null;
      
      // Usamos Server-Sent Events para recibir la respuesta en streaming
      if (eventSource.value) {
        eventSource.value.close();
      }
      
      const url = new URL(`${serverUrl}/api/generate`);
      url.searchParams.append('model', model);
      url.searchParams.append('prompt', message);
      url.searchParams.append('stream', 'true');
      
      eventSource.value = new EventSource(url.toString());
      
      eventSource.value.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.response) {
            const lastMessage = messages.value[messages.value.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content += data.response;
              lastMessage.isStreaming = false;
            }
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
        }
      };
      
      eventSource.value.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.value.close();
        isLoading.value = false;
        
        const lastMessage = messages.value[messages.value.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = 'Error al conectar con el servidor. Por favor, inténtalo de nuevo.';
          lastMessage.isStreaming = false;
        }
      };
      
    } catch (err) {
      console.error('Error sending message:', err);
      error.value = 'Error al enviar el mensaje';
      
      const lastMessage = messages.value[messages.value.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = 'Error al procesar tu solicitud.';
        lastMessage.isStreaming = false;
      }
    } finally {
      isLoading.value = false;
    }
  };
  
  const clearConversation = () => {
    messages.value = [];
  };
  
  const setCurrentModel = (model) => {
    currentModel.value = model;
  };
  
  const setModels = (availableModels) => {
    models.value = availableModels;
    if (availableModels.length > 0 && !currentModel.value) {
      currentModel.value = availableModels[0].name;
    }
  };
  
  // Limpiar recursos al destruir
  const cleanup = () => {
    if (eventSource.value) {
      eventSource.value.close();
      eventSource.value = null;
    }
  };
  
  return {
    // Estado
    messages,
    currentModel,
    isLoading,
    error,
    models,
    
    // Getters
    conversationHistory,
    
    // Acciones
    sendMessage,
    clearConversation,
    setCurrentModel,
    setModels,
    cleanup
  };
}, {
  persist: true
});

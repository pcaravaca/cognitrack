<template>
  <v-dialog v-model="dialog" max-width="800" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-chat</v-icon>
        Chat con {{ model?.name || 'Modelo' }}
        <v-spacer />
        <v-chip v-if="model?.inUse" color="warning" size="small" class="mr-2">
          <v-icon start size="small">mdi-account</v-icon>
          En uso por: {{ model?.usedBy || 'Usuario' }}
        </v-chip>
        <v-btn icon="mdi-close" variant="text" @click="dialog = false" />
      </v-card-title>
      
      <v-divider />
      
      <v-card-text class="pa-0" style="height: 400px;">
        <div class="chat-container d-flex flex-column h-100">
          <!-- Mensajes -->
          <div class="messages-container flex-grow-1 pa-4" ref="messagesContainer">
            <div v-for="(message, index) in messages" :key="index" 
                 :class="['message', 'mb-4', message.role === 'user' ? 'user-message' : 'assistant-message']">
              <div class="d-flex align-start">
                <v-avatar :color="message.role === 'user' ? 'primary' : 'secondary'" size="32" class="mr-3">
                  <v-icon size="small">
                    {{ message.role === 'user' ? 'mdi-account' : 'mdi-robot' }}
                  </v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium mb-1">
                    {{ message.role === 'user' ? 'Tú' : model?.name }}
                  </div>
                  <div class="message-content" v-html="formatMessage(message.content)"></div>
                  <div class="text-caption text-disabled mt-1">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Indicador de escritura -->
            <div v-if="isLoading" class="message assistant-message mb-4">
              <div class="d-flex align-start">
                <v-avatar color="secondary" size="32" class="mr-3">
                  <v-icon size="small">mdi-robot</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <div class="font-weight-medium mb-1">{{ model?.name }}</div>
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input -->
          <div class="input-container pa-4 elevation-3">
            <v-textarea
              v-model="userInput"
              :label="$t('chat.typeMessage')"
              :placeholder="$t('chat.placeholder')"
              :disabled="isLoading"
              @keydown.enter.prevent="sendMessage"
              rows="2"
              auto-grow
              variant="outlined"
              hide-details
              class="mb-2"
            />
            <div class="d-flex justify-space-between align-center">
              <v-chip size="small" variant="tonal">
                <v-icon start size="small">mdi-memory</v-icon>
                {{ model?.size || 'N/A' }}
              </v-chip>
              <div>
                <v-btn
                  variant="text"
                  @click="clearChat"
                  :disabled="messages.length === 0 || isLoading"
                >
                  {{ $t('chat.clear') }}
                </v-btn>
                <v-btn
                  color="primary"
                  @click="sendMessage"
                  :loading="isLoading"
                  :disabled="!userInput.trim()"
                  append-icon="mdi-send"
                >
                  {{ $t('chat.send') }}
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { marked } from 'marked'

const props = defineProps({
  modelValue: Boolean,
  model: Object,
  serverId: Number
})

const emit = defineEmits(['update:modelValue'])

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const messages = ref([])
const userInput = ref('')
const isLoading = ref(false)
const messagesContainer = ref(null)

// Función para enviar mensaje
const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return
  
  const prompt = userInput.value.trim()
  userInput.value = ''
  
  // Agregar mensaje del usuario
  messages.value.push({
    role: 'user',
    content: prompt,
    timestamp: new Date()
  })
  
  isLoading.value = true
  await nextTick()
  scrollToBottom()
  
  try {
    // Llamada real a la API de Ollama a través del backend
    const response = await fetch('/api/ollama/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        model: props.model?.name || 'granite3.2-vision:2b',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: false
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    const assistantMessage = {
      role: 'assistant',
      content: data.message?.content || data.response || 'No se recibió respuesta del modelo.',
      timestamp: new Date()
    }
    
    messages.value.push(assistantMessage)
  } catch (error) {
    console.error('Error al enviar mensaje:', error)
    messages.value.push({
      role: 'assistant',
      content: `Error al conectar con el modelo. Por favor verifica que el servidor Ollama esté funcionando y que el modelo ${props.model?.name || 'granite3.2-vision:2b'} esté disponible.`,
      timestamp: new Date(),
      isError: true
    })
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

// Función para limpiar chat
const clearChat = () => {
  messages.value = []
}

// Función para formatear mensaje (Markdown)
const formatMessage = (content) => {
  return marked(content)
}

// Función para formatear tiempo
const formatTime = (timestamp) => {
  return format(timestamp, 'HH:mm', { locale: es })
}

// Función para scroll al final
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Limpiar mensajes cuando se cierra el diálogo
watch(dialog, (newVal) => {
  if (!newVal) {
    setTimeout(() => {
      messages.value = []
      userInput.value = ''
    }, 300)
  }
})
</script>

<style scoped>
.chat-container {
  background-color: rgb(var(--v-theme-surface));
}

.messages-container {
  overflow-y: auto;
  background-color: rgba(var(--v-theme-surface-variant), 0.3);
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.message-content :deep(p) {
  margin-bottom: 0.5em;
}

.message-content :deep(p:last-child) {
  margin-bottom: 0;
}

.message-content :deep(code) {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}

.message-content :deep(pre) {
  background-color: rgba(var(--v-theme-surface-variant), 0.5);
  padding: 12px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.5em 0;
}

.input-container {
  background-color: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Indicador de escritura */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: rgba(var(--v-theme-on-surface), 0.6);
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.6;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}
</style>

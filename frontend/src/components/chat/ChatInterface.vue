<template>
  <v-card class="chat-interface" height="100%" elevation="2">
    <v-card-title class="d-flex align-center pa-4 bg-primary">
      <v-icon start>mdi-robot</v-icon>
      <span class="text-h6">Chat con Ollama</span>
      
      <v-spacer></v-spacer>
      
      <v-select
        v-model="currentModel"
        :items="availableModels"
        item-title="name"
        item-value="name"
        label="Modelo"
        density="compact"
        variant="outlined"
        hide-details
        class="model-select mr-2"
        style="max-width: 250px;"
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-robot</v-icon>
        </template>
      </v-select>
      
      <v-tooltip text="Limpiar conversación" location="bottom">
        <template v-slot:activator="{ props }">
          <v-btn
            v-bind="props"
            icon
            variant="text"
            color="white"
            @click="clearConversation"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-tooltip>
    </v-card-title>
    
    <v-card-text class="chat-messages pa-0" ref="messagesContainer">
      <v-list lines="two" class="pa-0">
        <template v-if="messages.length === 0">
          <v-list-item>
            <v-list-item-title class="text-center text-grey py-8">
              <v-icon size="large" class="mb-2">mdi-message-text-outline</v-icon>
              <div>Envía un mensaje para comenzar</div>
            </v-list-item-title>
          </v-list-item>
        </template>
        
        <template v-else>
          <template v-for="(message, index) in messages" :key="message.id">
            <v-divider v-if="index > 0"></v-divider>
            
            <v-list-item
              :class="{
                'bg-blue-lighten-5': message.role === 'assistant',
                'bg-white': message.role === 'user'
              }"
            >
              <template v-slot:prepend>
                <v-avatar
                  :color="message.role === 'assistant' ? 'primary' : 'secondary'"
                  class="mr-3"
                  size="36"
                >
                  <v-icon v-if="message.role === 'assistant'">mdi-robot</v-icon>
                  <v-icon v-else>mdi-account</v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title>
                <div class="d-flex align-center">
                  <span class="font-weight-medium">
                    {{ message.role === 'assistant' ? 'Asistente' : 'Tú' }}
                  </span>
                  <v-spacer></v-spacer>
                  <small class="text-grey">
                    {{ formatTime(message.timestamp) }}
                  </small>
                </div>
              </v-list-item-title>
              
              <v-list-item-subtitle class="message-content">
                <div class="markdown-content" v-html="formatMessage(message.content)"></div>
                
                <div v-if="message.isStreaming" class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <v-menu>
                  <template v-slot:activator="{ props }">
                    <v-btn
                      v-bind="props"
                      icon
                      variant="text"
                      size="small"
                      class="ml-1"
                    >
                      <v-icon size="small">mdi-dots-vertical</v-icon>
                    </v-btn>
                  </template>
                  
                  <v-list density="compact">
                    <v-list-item @click="copyToClipboard(message.content)">
                      <template v-slot:prepend>
                        <v-icon>mdi-content-copy</v-icon>
                      </template>
                      <v-list-item-title>Copiar</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </template>
            </v-list-item>
          </template>
        </template>
      </v-list>
    </v-card-text>
    
    <v-divider></v-divider>
    
    <v-card-actions class="pa-4">
      <v-text-field
        v-model="newMessage"
        variant="outlined"
        placeholder="Escribe tu mensaje..."
        hide-details
        density="comfortable"
        :loading="isLoading"
        :disabled="!currentModel || isLoading"
        :append-inner-icon="newMessage.trim() ? 'mdi-send' : 'mdi-microphone'"
        @click:append-inner="sendMessage"
        @keydown.enter.exact.prevent="sendMessage"
        autofocus
      >
        <template v-slot:prepend-inner>
          <v-icon>mdi-message-text</v-icon>
        </template>
      </v-text-field>
    </v-card-actions>
    
    <v-snackbar
      v-model="snackbar.show"
      :timeout="3000"
      :color="snackbar.color"
    >
      {{ snackbar.text }}
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useChatStore } from '@/stores/chat';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const props = defineProps({
  models: {
    type: Array,
    required: true
  },
  serverUrl: {
    type: String,
    required: true
  }
});

const chatStore = useChatStore();
const messagesContainer = ref(null);
const newMessage = ref('');
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Inicializar modelos disponibles
chatStore.setModels(props.models);

const messages = computed(() => chatStore.messages);
const isLoading = computed(() => chatStore.isLoading);
const currentModel = computed({
  get: () => chatStore.currentModel,
  set: (value) => chatStore.setCurrentModel(value)
});

const availableModels = computed(() => props.models);

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessage = (content) => {
  if (!content) return '';
  const html = marked.parse(content);
  return DOMPurify.sanitize(html);
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showSnackbar('¡Copiado al portapapeles!', 'success');
  } catch (err) {
    console.error('Error al copiar al portapapeles:', err);
    showSnackbar('Error al copiar al portapapeles', 'error');
  }
};

const showSnackbar = (text, color = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  };
};

const sendMessage = async () => {
  const message = newMessage.value.trim();
  if (!message || !currentModel.value) return;
  
  try {
    await chatStore.sendMessage(message, currentModel.value, props.serverUrl);
    newMessage.value = '';
    scrollToBottom();
  } catch (error) {
    console.error('Error sending message:', error);
    showSnackbar('Error al enviar el mensaje', 'error');
  }
};

const clearConversation = () => {
  chatStore.clearConversation();
};

// Observar cambios en los mensajes para hacer scroll
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

// Limpiar recursos al desmontar el componente
onUnmounted(() => {
  chatStore.cleanup();
});

// Scroll al cargar si hay mensajes
onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background-color: #f5f5f5;
  scroll-behavior: smooth;
}

.message-content {
  white-space: pre-wrap;
  word-break: break-word;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  margin-top: 8px;
  padding-left: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background-color: #9e9e9e;
  border-radius: 50%;
  display: inline-block;
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 40% { 
    transform: scale(1.0);
  }
}

.model-select {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}
</style>

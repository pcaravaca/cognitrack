<template>
  <div>
    <!-- Botón flotante de chat -->
    <v-btn
      :icon="true"
      color="primary"
      size="large"
      elevation="8"
      class="chat-fab"
      @click="openChat"
    >
      <v-icon>mdi-chat</v-icon>
    </v-btn>

    <!-- Dialog de chat -->
    <ModelChatDialog
      v-model="showDialog"
      :model="defaultModel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ModelChatDialog from './ModelChatDialog.vue'

const showDialog = ref(false)
const defaultModel = ref({
  name: 'granite3.2-vision:2b',
  size: '2.0B',
  description: 'Modelo de visión y lenguaje de IBM'
})

const openChat = () => {
  showDialog.value = true
}
</script>

<style scoped>
.chat-fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 999;
}
</style>

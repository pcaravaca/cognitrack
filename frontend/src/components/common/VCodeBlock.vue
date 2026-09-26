<template>
  <div class="code-block">
    <div class="code-header" v-if="language">
      <div class="code-language">{{ language }}</div>
      <v-btn
        v-if="copyable"
        icon="mdi-content-copy"
        size="small"
        variant="text"
        @click="copyCode"
        :color="copied ? 'success' : 'default'"
        class="copy-btn"
      >
        <v-icon>{{ copied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
      </v-btn>
    </div>
    <pre class="code-content"><code :class="codeClass" v-html="highlightedCode"></code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  code: string
  language?: string
  copyable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  language: 'text',
  copyable: true
})

const copied = ref(false)

const codeClass = computed(() => {
  return props.language ? `language-${props.language}` : ''
})

// Función simple de resaltado de sintaxis básico
const highlightedCode = computed(() => {
  let highlighted = props.code

  if (props.language === 'json') {
    // Resaltar JSON
    highlighted = highlighted
      .replace(/(".*?")/g, '<span class="json-string">$1</span>')
      .replace(/(true|false|null)/g, '<span class="json-boolean">$1</span>')
      .replace(/(\d+\.?\d*)/g, '<span class="json-number">$1</span>')
      .replace(/([{}[\],])/g, '<span class="json-punctuation">$1</span>')
  } else if (props.language === 'bash' || props.language === 'shell') {
    // Resaltar comandos bash
    highlighted = highlighted
      .replace(/^(curl|git|npm|yarn|docker)(\s)/gm, '<span class="bash-command">$1</span>$2')
      .replace(/(-\w+|--\w+)/g, '<span class="bash-option">$1</span>')
      .replace(/(http[s]?:\/\/[^\s]+)/g, '<span class="bash-url">$1</span>')
  } else if (props.language === 'javascript' || props.language === 'js') {
    // Resaltar JavaScript básico
    highlighted = highlighted
      .replace(/(function|const|let|var|if|else|return|import|export|from)/g, '<span class="js-keyword">$1</span>')
      .replace(/('.*?'|".*?")/g, '<span class="js-string">$1</span>')
      .replace(/(\/\/.*$)/gm, '<span class="js-comment">$1</span>')
  }

  return highlighted
})

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Error copiando código:', err)
  }
}
</script>

<style scoped>
.code-block {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  overflow: hidden;
  background-color: rgb(var(--v-theme-surface-variant));
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.code-language {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.copy-btn {
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.copy-btn:hover {
  opacity: 1;
}

.code-content {
  margin: 0;
  padding: 16px;
  background-color: rgb(var(--v-theme-surface));
  font-family: 'Courier New', Monaco, 'Lucida Console', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  overflow-x: auto;
  white-space: pre;
}

.code-content code {
  font-family: inherit;
  background: none;
  padding: 0;
}

/* Estilos de resaltado de sintaxis */
:deep(.json-string) {
  color: #22863a;
}

:deep(.json-boolean) {
  color: #005cc5;
}

:deep(.json-number) {
  color: #e36209;
}

:deep(.json-punctuation) {
  color: #586069;
}

:deep(.bash-command) {
  color: #d73a49;
  font-weight: 600;
}

:deep(.bash-option) {
  color: #005cc5;
}

:deep(.bash-url) {
  color: #22863a;
}

:deep(.js-keyword) {
  color: #d73a49;
  font-weight: 600;
}

:deep(.js-string) {
  color: #22863a;
}

:deep(.js-comment) {
  color: #6a737d;
  font-style: italic;
}

/* Tema oscuro */
.v-theme--dark .code-block {
  background-color: rgb(var(--v-theme-surface-bright));
}

.v-theme--dark .code-header {
  background-color: rgba(var(--v-theme-on-surface), 0.1);
}

.v-theme--dark .code-content {
  background-color: rgb(var(--v-theme-surface-variant));
}

.v-theme--dark :deep(.json-string) {
  color: #98d982;
}

.v-theme--dark :deep(.json-boolean) {
  color: #79c0ff;
}

.v-theme--dark :deep(.json-number) {
  color: #ffab70;
}

.v-theme--dark :deep(.json-punctuation) {
  color: #8b949e;
}

.v-theme--dark :deep(.bash-command) {
  color: #ff7b72;
}

.v-theme--dark :deep(.bash-option) {
  color: #79c0ff;
}

.v-theme--dark :deep(.bash-url) {
  color: #98d982;
}

.v-theme--dark :deep(.js-keyword) {
  color: #ff7b72;
}

.v-theme--dark :deep(.js-string) {
  color: #98d982;
}

.v-theme--dark :deep(.js-comment) {
  color: #8b949e;
}
</style>

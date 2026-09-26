/// <reference types="vite/client" />
/// <reference types="vite-plugin-vue-layouts/client" />

// Para archivos .vue
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Para módulos CSS
declare module '*.css' {
  const content: { [className: string]: string }
  export default content
}

// Para módulos SCSS
declare module '*.scss' {
  const content: { [className: string]: string }
  export default content
}

// Para módulos de imágenes
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';

// Variables de entorno
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_NAME: string
  readonly VITE_OLLAMA_API_URL?: string
  readonly VITE_OLLAMA_WS_URL?: string
  // Agrega aquí otras variables de entorno que necesites
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

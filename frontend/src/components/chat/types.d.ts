import { Component } from 'vue';

declare module '*.vue' {
  const component: Component;
  export default component;
}

declare module '@/components/chat/ChatInterface.vue' {
  import { Component } from 'vue';
  
  interface Model {
    name: string;
    model: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
      parent_model: string;
      format: string;
      family: string;
      families: string[] | null;
      parameter_size: string;
      quantization_level: string;
    };
  }
  
  interface ChatInterfaceProps {
    models: Model[];
    serverUrl: string;
  }
  
  const component: Component<ChatInterfaceProps>;
  export default component;
}

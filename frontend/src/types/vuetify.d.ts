// Type definitions for Vuetify 3
import 'vuetify';

declare module 'vuetify' {
  import { DefineComponent } from 'vue';
  
  // Definición del tema
  export interface ThemeDefinition {
    dark: boolean;
    colors: {
      [key: string]: string;
    };
    variables?: {
      [key: string]: string | number;
    };
  }
  
  // Opciones de Vuetify
  export interface VuetifyOptions {
    components?: any;
    directives?: any;
    theme?: {
      defaultTheme?: string;
      themes?: {
        [key: string]: ThemeDefinition;
      };
    };
    icons?: {
      defaultSet?: string;
      aliases?: any;
      sets?: any;
    };
    defaults?: any;
  }

  // Interfaz para el tema actual
  export interface CurrentTheme {
    dark: boolean;
    colors: Record<string, string>;
  }

  // Interfaz para el tema global
  export interface VuetifyThemeGlobal {
    name: string;
    current: {
      value: CurrentTheme;
    };
  }

  // Interfaz principal de Vuetify
  export interface Vuetify {
    theme: {
      global: VuetifyThemeGlobal;
    };
  }

  // Tipos para el tema
  export interface VuetifyThemeItem {
    base?: string;
    lighten5?: string;
    lighten4?: string;
    lighten3?: string;
    lighten2?: string;
    lighten1?: string;
    darken1?: string;
    darken2?: string;
    darken3?: string;
    darken4?: string;
  }
  
  export interface VuetifyThemeVariant {
    primary?: VuetifyThemeItem;
    secondary?: VuetifyThemeItem;
    accent?: VuetifyThemeItem;
    error?: VuetifyThemeItem;
    info?: VuetifyThemeItem;
    success?: VuetifyThemeItem;
    warning?: VuetifyThemeItem;
  }
  
  export interface VuetifyTheme {
    dark: boolean;
    colors: Record<string, string>;
  }
  
  // Función para crear instancia de Vuetify
  export function createVuetify(options?: VuetifyOptions): Vuetify;
  
  // Re-exportar tipos importantes
  export * from 'vuetify';
  export * from 'vuetify/components';
  export * from 'vuetify/directives';
  export * from 'vuetify/composables';
  export * from 'vuetify/locale';
  export * from 'vuetify/services';
  export * from 'vuetify/labs';
  
  const Vuetify: {
    install: (app: any, options?: VuetifyOptions) => void;
  };
  
  export default Vuetify;
}

// Extender las definiciones de tipos de Vuetify
declare module '@vuetify/nightly' {
  export * from 'vuetify';
  export * from 'vuetify/components';
  export * from 'vuetify/directives';
  export * from 'vuetify/composables';
  
  const Vuetify: {
    install: (app: any, options?: any) => void;
  };
  
  export default Vuetify;
}

// Tipos para los temas
declare module 'vuetify/lib' {
  import { VuetifyThemeItem } from 'vuetify/types/services/theme';
  
  export interface VuetifyThemeVariant {
    primary?: VuetifyThemeItem;
    secondary?: VuetifyThemeItem;
    accent?: VuetifyThemeItem;
    error?: VuetifyThemeItem;
    info?: VuetifyThemeItem;
    success?: VuetifyThemeItem;
    warning?: VuetifyThemeItem;
    [key: string]: VuetifyThemeItem | undefined;
  }
  
  export interface VuetifyTheme {
    dark: boolean;
    colors: Record<string, string>;
  }
}

// Extender el módulo de Vuetify para incluir tipos personalizados
declare module 'vuetify' {
  interface ThemeDefinition {
    dark: boolean;
    colors: {
      [key: string]: string;
    };
    variables?: {
      [key: string]: string | number;
    };
  }
  
  interface ThemeOptions {
    defaultTheme?: string;
    themes?: {
      [key: string]: ThemeDefinition;
    };
  }
}

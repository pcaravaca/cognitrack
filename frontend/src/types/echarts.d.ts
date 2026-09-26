import 'echarts';

declare global {
  interface Window {
    echarts: typeof import('echarts');
  }
}

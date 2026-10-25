import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://qspirit.guide',
  integrations: [react()],
  vite: {
    resolve: {
      conditions: ['onnxruntime-web-use-extern-wasm'],
    },
    plugins: [tailwindcss()],
  },
});

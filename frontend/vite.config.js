import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  publicDir: '../informe',
  esbuild: { jsx: 'automatic' },
  server: { strictPort: true },
});

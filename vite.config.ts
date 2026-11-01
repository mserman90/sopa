import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/sopa/', // GitHub Pages repo name
  build: {
    outDir: 'dist',
  },
  test: {
    globals: true,
    environment: 'node',
  }
});

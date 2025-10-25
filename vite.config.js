import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, './components'),
      '@pages': path.resolve(__dirname, './pages'),
      '@entities': path.resolve(__dirname, './entities'),
      '@utils': path.resolve(__dirname, './utils'),
    },
  },
  server: {
    port: 3333,
    open: true,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});

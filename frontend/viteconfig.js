// my-agmarknet-fullstack/frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Ensure this matches the PORT your backend listens on
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Keep this commented out
      },
    },
    port: 3000, // Your frontend dev server port
  },
});

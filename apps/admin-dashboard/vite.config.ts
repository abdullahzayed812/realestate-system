import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth':          { target: 'http://localhost:3001', changeOrigin: true },
      '/api/users':         { target: 'http://localhost:3001', changeOrigin: true },
      '/api/properties':    { target: 'http://localhost:3002', changeOrigin: true },
      '/api/brokers':       { target: 'http://localhost:3002', changeOrigin: true },
      '/api/analytics':     { target: 'http://localhost:3002', changeOrigin: true },
      '/api/bookings':      { target: 'http://localhost:3003', changeOrigin: true },
      '/api/chats':         { target: 'http://localhost:3004', changeOrigin: true },
      '/api/notifications': { target: 'http://localhost:3005', changeOrigin: true },
      '/api/media':         { target: 'http://localhost:3006', changeOrigin: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
});

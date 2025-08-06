import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    },
    // Allow ngrok and other tunneling services
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.app',
      'd919b310d4c6.ngrok-free.app'
    ]
  },
  define: {
    // Add environment variables
    __API_URL__: JSON.stringify(process.env.API_URL || 'http://localhost:8000'),
  },
  // Environment variables prefix
  envPrefix: 'VITE_',
}) 
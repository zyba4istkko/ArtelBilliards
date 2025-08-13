import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isTunnelMode = process.env.VITE_TUNNEL_MODE === 'true'
  
  return {
    plugins: [react()],
    
    // Определяем среду для туннелирования
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    
    server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,
      // Полностью отключаем HMR для туннеля
      hmr: isTunnelMode ? false : {
        port: 5173
      },
      // Отключаем middleware для туннеля
      middlewareMode: false,
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        '.ngrok.io',
        '.ngrok-free.app',
        'd919b310d4c6.ngrok-free.app',
        '.loca.lt',
        'plenty-pants-flash.loca.lt',
        'busy-bottles-sink.loca.lt',
        'dry-elephant-6.loca.lt',
        'tender-husky-55.loca.lt',
        'artel-billiards-dev.loca.lt'
      ]
    },
    
    // Настройки для production-like сборки
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: true
    },
    
    // Базовый путь для правильной работы маршрутизации
    base: '/'
  }
}) 
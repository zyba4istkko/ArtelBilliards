import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

// Плагин для автоматического обновления версии
function versionUpdatePlugin() {
  return {
    name: 'version-update',
    buildStart() {
      try {
        // Читаем package.json
        const packagePath = resolve(__dirname, 'package.json')
        const packageContent = readFileSync(packagePath, 'utf-8')
        const packageData = JSON.parse(packageContent)
        
        // Обновляем buildDate
        packageData.buildDate = new Date().toISOString()
        
        // Записываем обратно
        writeFileSync(packagePath, JSON.stringify(packageData, null, 2))
        
        console.log('✅ Version updated:', packageData.version, 'Build date:', packageData.buildDate)
      } catch (error) {
        console.warn('⚠️ Failed to update version:', error.message)
      }
    }
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    versionUpdatePlugin()
  ],
  define: {
    // Передаем версию и buildDate в env переменные
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(process.env.npm_package_version || '1.0.1'),
    'import.meta.env.VITE_APP_BUILD_DATE': JSON.stringify(new Date().toISOString())
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    watch: {
      usePolling: true
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 
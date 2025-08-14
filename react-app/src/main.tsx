import { createRoot } from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import './index.css'
import App from './App.tsx'

console.log('🚀 Main.tsx загружен!')
console.log('🔍 Root element:', document.getElementById('root'))

try {
  const rootElement = document.getElementById('root')
  if (!rootElement) {
    throw new Error('Root element not found!')
  }
  
  console.log('✅ Создаем React root...')
  const root = createRoot(rootElement)
  
  console.log('✅ Рендерим App...')
  root.render(
    <NextUIProvider>
      <App />
    </NextUIProvider>
  )
  
  console.log('🎉 App успешно отрендерен!')
} catch (error) {
  console.error('❌ Ошибка при рендеринге:', error)
  document.body.innerHTML = `<h1>Ошибка загрузки: ${error.message}</h1>`
}

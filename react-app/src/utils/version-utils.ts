// Утилиты для работы с версией приложения

export interface AppVersion {
  version: string
  buildDate: string
}

export function getAppVersion(): AppVersion {
  try {
    // В development режиме используем значения из Vite env
    if (import.meta.env.DEV) {
      return {
        version: import.meta.env.VITE_APP_VERSION || '1.0.1',
        buildDate: import.meta.env.VITE_APP_BUILD_DATE || new Date().toISOString()
      }
    }
    
    // В production режиме используем значения из сборки
    return {
      version: import.meta.env.VITE_APP_VERSION || '1.0.1',
      buildDate: import.meta.env.VITE_APP_BUILD_DATE || new Date().toISOString()
    }
  } catch (error) {
    console.warn('⚠️ Failed to get app version:', error)
    return {
      version: '1.0.1',
      buildDate: new Date().toISOString()
    }
  }
}

export function isVersionOutdated(buildDate: string, maxAgeHours?: number): boolean {
  try {
    const buildTime = new Date(buildDate).getTime()
    const now = new Date().getTime()
    const maxAge = (maxAgeHours || 24) * 60 * 60 * 1000 // часы в миллисекунды
    
    return (now - buildTime) > maxAge
  } catch {
    return false
  }
}

export function getTimeSinceBuild(buildDate: string): string {
  try {
    const buildTime = new Date(buildDate).getTime()
    const now = new Date().getTime()
    const diffMs = now - buildTime
    
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Только что'
    if (diffMins < 60) return `${diffMins} мин назад`
    if (diffHours < 24) return `${diffHours} ч назад`
    return `${diffDays} дн назад`
  } catch {
    return 'Неизвестно'
  }
}

// Telegram WebApp SDK Types
export interface TelegramWebApp {
  initData: string
  initDataUnsafe: {
    query_id?: string
    user?: TelegramUser
    receiver?: TelegramUser
    chat?: TelegramChat
    chat_type?: string
    chat_instance?: string
    start_param?: string
    can_send_after?: number
    auth_date: number
    hash: string
  }
  version: string
  platform: string
  colorScheme: 'light' | 'dark'
  themeParams: {
    link_color?: string
    button_color?: string
    button_text_color?: string
    secondary_bg_color?: string
    hint_color?: string
    bg_color?: string
    text_color?: string
  }
  isExpanded: boolean
  viewportHeight: number
  viewportStableHeight: number
  headerColor: string
  backgroundColor: string
  isClosingConfirmationEnabled: boolean
  BackButton: {
    isVisible: boolean
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
  }
  MainButton: {
    text: string
    color: string
    textColor: string
    isVisible: boolean
    isActive: boolean
    isProgressVisible: boolean
    setText(text: string): void
    onClick(callback: () => void): void
    offClick(callback: () => void): void
    show(): void
    hide(): void
    enable(): void
    disable(): void
    showProgress(leaveActive?: boolean): void
    hideProgress(): void
    setParams(params: {
      text?: string
      color?: string
      text_color?: string
      is_active?: boolean
      is_visible?: boolean
    }): void
  }
  HapticFeedback: {
    impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void
    notificationOccurred(type: 'error' | 'success' | 'warning'): void
    selectionChanged(): void
  }
  ready(): void
  expand(): void
  close(): void
  sendData(data: string): void
  openLink(url: string, options?: { try_instant_view?: boolean }): void
  openTelegramLink(url: string): void
  openInvoice(url: string, callback?: (status: string) => void): void
  showAlert(message: string, callback?: () => void): void
  showConfirm(message: string, callback?: (confirmed: boolean) => void): void
  showPopup(params: {
    title?: string
    message: string
    buttons?: Array<{
      id?: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text?: string
    }>
  }, callback?: (buttonId: string) => void): void
  showScanQrPopup(params: {
    text?: string
  }, callback?: (text: string) => boolean): void
  closeScanQrPopup(): void
  readTextFromClipboard(callback?: (text: string) => void): void
  requestWriteAccess(callback?: (granted: boolean) => void): void
  requestContact(callback?: (granted: boolean) => void): void
}

export interface TelegramUser {
  id: number
  is_bot?: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
  is_premium?: boolean
  photo_url?: string
}

export interface TelegramChat {
  id: number
  type: 'group' | 'supergroup' | 'channel'
  title: string
  username?: string
  photo_url?: string
}

// Telegram WebApp Helper Class
class TelegramWebAppService {
  private webApp: TelegramWebApp | null = null

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Проверяем, что мы в Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp
      this.webApp.ready()
      this.setupTheme()
    }
  }

  // Проверка, что приложение запущено в Telegram
  public isInTelegram(): boolean {
    return this.webApp !== null
  }

  // Получение данных инициализации для аутентификации
  public getInitData(): string | null {
    return this.webApp?.initData || null
  }

  // Получение стартового параметра
  public getStartParam(): string | null {
    return this.webApp?.initDataUnsafe?.start_param || null
  }

  // Получение данных пользователя
  public getUser(): TelegramUser | null {
    return this.webApp?.initDataUnsafe?.user || null
  }

  // Настройка темы приложения
  private setupTheme() {
    if (!this.webApp) return

    // Применяем цветовую схему Telegram
    const theme = this.webApp.themeParams
    const root = document.documentElement

    if (theme.bg_color) {
      root.style.setProperty('--tg-bg-color', theme.bg_color)
    }
    if (theme.text_color) {
      root.style.setProperty('--tg-text-color', theme.text_color)
    }
    if (theme.button_color) {
      root.style.setProperty('--tg-button-color', theme.button_color)
    }
    if (theme.button_text_color) {
      root.style.setProperty('--tg-button-text-color', theme.button_text_color)
    }

    // Устанавливаем класс для темы
    document.body.classList.add(`tg-theme-${this.webApp.colorScheme}`)
  }

  // Управление главной кнопкой
  public setMainButton(params: {
    text: string
    color?: string
    isVisible?: boolean
    onClick?: () => void
  }) {
    if (!this.webApp) return

    const { text, color, isVisible = true, onClick } = params

    this.webApp.MainButton.setText(text)
    if (color) {
      this.webApp.MainButton.color = color
    }

    if (onClick) {
      this.webApp.MainButton.onClick(onClick)
    }

    if (isVisible) {
      this.webApp.MainButton.show()
    } else {
      this.webApp.MainButton.hide()
    }
  }

  // Управление кнопкой "Назад"
  public setBackButton(params: {
    isVisible?: boolean
    onClick?: () => void
  }) {
    if (!this.webApp) return

    const { isVisible = false, onClick } = params

    if (onClick) {
      this.webApp.BackButton.onClick(onClick)
    }

    if (isVisible) {
      this.webApp.BackButton.show()
    } else {
      this.webApp.BackButton.hide()
    }
  }

  // Haptic feedback
  public hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: string) {
    if (!this.webApp) return

    switch (type) {
      case 'impact':
        this.webApp.HapticFeedback.impactOccurred(style as any || 'medium')
        break
      case 'notification':
        this.webApp.HapticFeedback.notificationOccurred(style as any || 'success')
        break
      case 'selection':
        this.webApp.HapticFeedback.selectionChanged()
        break
    }
  }

  // Показать alert
  public showAlert(message: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showAlert(message, () => resolve())
      } else {
        alert(message)
        resolve()
      }
    })
  }

  // Показать confirm
  public showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, (confirmed) => resolve(confirmed))
      } else {
        resolve(confirm(message))
      }
    })
  }

  // Закрыть приложение
  public close() {
    if (this.webApp) {
      this.webApp.close()
    }
  }

  // Развернуть приложение
  public expand() {
    if (this.webApp) {
      this.webApp.expand()
    }
  }

  // Открыть ссылку
  public openLink(url: string, tryInstantView = false) {
    if (this.webApp) {
      this.webApp.openLink(url, { try_instant_view: tryInstantView })
    } else {
      window.open(url, '_blank')
    }
  }

  // Проверка возможностей
  public getCapabilities() {
    if (!this.webApp) {
      return {
        hasMainButton: false,
        hasBackButton: false,
        hasHapticFeedback: false,
        hasThemeParams: false,
        isExpanded: false,
        version: '0.0'
      }
    }

    return {
      hasMainButton: !!this.webApp.MainButton,
      hasBackButton: !!this.webApp.BackButton,
      hasHapticFeedback: !!this.webApp.HapticFeedback,
      hasThemeParams: !!this.webApp.themeParams,
      isExpanded: this.webApp.isExpanded,
      version: this.webApp.version,
      platform: this.webApp.platform
    }
  }
}

// Добавляем типы для window.Telegram
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp
    }
  }
}

// Создаем единственный экземпляр
export const telegramWebApp = new TelegramWebAppService() 
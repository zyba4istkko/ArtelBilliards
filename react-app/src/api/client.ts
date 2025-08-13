import axios from 'axios'
import { toast } from 'sonner'

// API Base URLs для разных сервисов
const AUTH_SERVICE_URL = 'http://localhost:8001'     // Auth Service
const TEMPLATE_SERVICE_URL = 'http://localhost:8003' // Template Service  
const GAME_SERVICE_URL = 'http://localhost:8002'     // Game Service
const API_GATEWAY_URL = 'http://localhost:8000'      // API Gateway (если будет работать)

class ApiClient {
  private authClient: any
  private templateClient: any
  private gameClient: any
  private refreshingToken: boolean
  private refreshSubscribers: any[]

  constructor() {
    // Создаем отдельные клиенты для каждого сервиса
    this.authClient = axios.create({
      baseURL: AUTH_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.templateClient = axios.create({
      baseURL: TEMPLATE_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.gameClient = axios.create({
      baseURL: GAME_SERVICE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.refreshingToken = false
    this.refreshSubscribers = []
    this.setupInterceptors()
  }

  setupInterceptors() {
    // Настраиваем перехватчики для всех клиентов
    const clients = [this.authClient, this.templateClient, this.gameClient]
    
    clients.forEach(client => {
      // Request interceptor
      client.interceptors.request.use(
        (config: any) => {
          const token = this.getAccessToken()
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
        (error) => Promise.reject(error)
      )

      // Response interceptor
      client.interceptors.response.use(
        (response) => response,
        async (error) => {
          const originalRequest = error.config

          if (error.response?.status === 401 && !originalRequest._retry) {
            if (this.refreshingToken) {
              return new Promise((resolve) => {
                this.refreshSubscribers.push((token) => {
                  originalRequest.headers.Authorization = `Bearer ${token}`
                  resolve(client(originalRequest))
                })
              })
            }

            originalRequest._retry = true
            this.refreshingToken = true

            try {
              const newToken = await this.refreshAccessToken()
              this.onTokenRefreshed(newToken)
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return client(originalRequest)
            } catch (refreshError) {
              this.clearTokens()
              window.location.href = '/login'
              return Promise.reject(refreshError)
            } finally {
              this.refreshingToken = false
              this.refreshSubscribers = []
            }
          }

          this.handleApiError(error)
          return Promise.reject(error)
        }
      )
    })
  }

  onTokenRefreshed(token) {
    this.refreshSubscribers.forEach((callback) => callback(token))
  }

  handleApiError(error) {
    if (error.response?.data) {
      const apiError = error.response.data
      toast.error(apiError.message || apiError.detail || 'Произошла ошибка')
    } else if (error.request) {
      toast.error('Ошибка сети. Проверьте соединение.')
    } else {
      toast.error('Неизвестная ошибка')
    }
  }

  // Token management
  getAccessToken() {
    return localStorage.getItem('access_token')
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  }

  setTokens(tokens) {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    
    const expiresAt = Date.now() + (tokens.expires_in * 1000)
    localStorage.setItem('token_expires_at', expiresAt.toString())
  }

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('token_expires_at')
  }

  async refreshAccessToken() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }

    const response = await this.authClient.post('/auth/refresh', {
      refresh_token: refreshToken
    })

    const tokens = response.data
    this.setTokens(tokens)
    return tokens.access_token
  }

  // Auth methods - используем authClient
  async loginWithTelegram(initData, startParam) {
    try {
      const response = await this.authClient.post('/auth/telegram', {
        init_data: initData,
        start_param: startParam
      })

      const authData = response.data
      this.setTokens(authData)
      toast.success('Добро пожаловать!')
      
      return authData
    } catch (error) {
      console.error('Telegram auth error:', error)
      toast.error('Ошибка авторизации через Telegram')
      throw error
    }
  }

  async loginWithGoogle(idToken) {
    try {
      const response = await this.authClient.post('/auth/google', {
        id_token: idToken
      })

      const authData = response.data
      this.setTokens(authData)
      toast.success('Добро пожаловать!')
      
      return authData
    } catch (error) {
      toast.error('Ошибка авторизации через Google')
      throw error
    }
  }

  async logout(allSessions = false) {
    try {
      await this.authClient.post('/auth/logout', { all_sessions: allSessions })
    } catch (error) {
      console.warn('Error during logout:', error)
    } finally {
      this.clearTokens()
      toast.success('Выход выполнен')
    }
  }

  async getCurrentUser() {
    const response = await this.authClient.get('/auth/me')
    return response.data
  }

  // Utility methods
  isAuthenticated() {
    const token = this.getAccessToken()
    const expiresAt = localStorage.getItem('token_expires_at')
    
    if (!token || !expiresAt) {
      return false
    }

    return Date.now() < parseInt(expiresAt)
  }

  // Generic API methods для Template Service (сохраняем совместимость)
  async get(url) {
    const response = await this.templateClient.get(url)
    return response.data
  }

  async post(url, data) {
    const response = await this.templateClient.post(url, data)
    return response.data
  }

  async put(url, data) {
    const response = await this.templateClient.put(url, data)
    return response.data
  }

  async delete(url) {
    const response = await this.templateClient.delete(url)
    return response.data
  }

  // Геттеры для прямого доступа к клиентам (для сервисов)
  getAuthClient() {
    return this.authClient
  }

  getTemplateClient() {
    return this.templateClient
  }

  getGameClient() {
    return this.gameClient
  }
}

// Создаем единственный экземпляр
export const apiClient = new ApiClient()

console.log('✅ API Client инициализирован:')
console.log('🔐 Auth Service:', AUTH_SERVICE_URL)
console.log('📋 Template Service:', TEMPLATE_SERVICE_URL)
console.log('🎮 Game Service:', GAME_SERVICE_URL) 
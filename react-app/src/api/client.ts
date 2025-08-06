import axios from 'axios'
import { toast } from 'sonner'

// API Base URL
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  private client: any
  private refreshingToken: boolean
  private refreshSubscribers: any[]

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
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
    // Request interceptor
    this.client.interceptors.request.use(
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
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.refreshingToken) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                resolve(this.client(originalRequest))
              })
            })
          }

          originalRequest._retry = true
          this.refreshingToken = true

          try {
            const newToken = await this.refreshAccessToken()
            this.onTokenRefreshed(newToken)
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            return this.client(originalRequest)
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
  }

  onTokenRefreshed(token) {
    this.refreshSubscribers.forEach((callback) => callback(token))
  }

  handleApiError(error) {
    if (error.response?.data) {
      const apiError = error.response.data
      toast.error(apiError.message || 'Произошла ошибка')
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

    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken
    })

    const tokens = response.data.tokens
    this.setTokens(tokens)
    return tokens.access_token
  }

  // Auth methods
  async loginWithTelegram(initData, startParam) {
    try {
      const response = await this.client.post('/auth/telegram', {
        init_data: initData,
        start_param: startParam
      })

      const authData = response.data
      this.setTokens(authData.tokens)
      toast.success('Добро пожаловать!')
      
      return authData
    } catch (error) {
      toast.error('Ошибка авторизации через Telegram')
      throw error
    }
  }

  async loginWithGoogle(idToken) {
    try {
      const response = await this.client.post('/auth/google', {
        id_token: idToken
      })

      const authData = response.data
      this.setTokens(authData.tokens)
      toast.success('Добро пожаловать!')
      
      return authData
    } catch (error) {
      toast.error('Ошибка авторизации через Google')
      throw error
    }
  }

  async logout(allSessions = false) {
    try {
      await this.client.post('/auth/logout', { all_sessions: allSessions })
    } catch (error) {
      console.warn('Error during logout:', error)
    } finally {
      this.clearTokens()
      toast.success('Выход выполнен')
    }
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me')
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

  // Generic API methods
  async get(url) {
    const response = await this.client.get(url)
    return response.data
  }

  async post(url, data) {
    const response = await this.client.post(url, data)
    return response.data
  }

  async put(url, data) {
    const response = await this.client.put(url, data)
    return response.data
  }

  async delete(url) {
    const response = await this.client.delete(url)
    return response.data
  }
}

// Создаем единственный экземпляр
export const apiClient = new ApiClient()

console.log('✅ API Client инициализирован:', API_BASE_URL) 
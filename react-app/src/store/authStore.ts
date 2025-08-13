import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { apiClient } from '../api/client'
import { telegramWebApp } from '../api/telegram'
import type { User, AuthResponse } from '../api/types'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (login: string, password: string) => Promise<void>
  loginWithTelegram: () => Promise<void>
  loginWithGoogle: (idToken: string) => Promise<void>
  logout: (allSessions?: boolean) => Promise<void>
  getCurrentUser: () => Promise<void>
  clearError: () => void
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login with email/username and password
      login: async (login: string, password: string) => {
        try {
          set({ isLoading: true, error: null })

          const response: AuthResponse = await apiClient.login({ login, password })
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Ошибка входа'
          })
          throw error
        }
      },

      // Login with Telegram
      loginWithTelegram: async () => {
        try {
          set({ isLoading: true, error: null })

          const initData = telegramWebApp.getInitData()
          const startParam = telegramWebApp.getStartParam()

          if (!initData) {
            throw new Error('Telegram данные не найдены. Откройте приложение через Telegram.')
          }

          const response: AuthResponse = await apiClient.loginWithTelegram(initData, startParam)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

          // Haptic feedback for success
          telegramWebApp.hapticFeedback('notification', 'success')

        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Ошибка входа через Telegram'
          })

          // Haptic feedback for error
          telegramWebApp.hapticFeedback('notification', 'error')
          throw error
        }
      },

      // Login with Google
      loginWithGoogle: async (idToken: string) => {
        try {
          set({ isLoading: true, error: null })

          const response: AuthResponse = await apiClient.loginWithGoogle(idToken)
          
          set({
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Ошибка входа через Google'
          })
          throw error
        }
      },

      // Logout
      logout: async (allSessions = false) => {
        try {
          set({ isLoading: true, error: null })

          await apiClient.logout(allSessions)
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })

          // Haptic feedback for logout
          telegramWebApp.hapticFeedback('impact', 'light')

        } catch (error: any) {
          // Даже если запрос не удался, очищаем локальное состояние
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      // Get current user
      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null })

          if (!apiClient.isAuthenticated()) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
            return
          }

          const user: User = await apiClient.getCurrentUser()
          
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })

        } catch (error: any) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message || 'Ошибка получения данных пользователя'
          })
        }
      },

      // Clear error
      clearError: () => {
        set({ error: null })
      },

      // Initialize auth state
      initialize: async () => {
        try {
          // Проверяем, есть ли сохраненные токены
          if (apiClient.isAuthenticated()) {
            await get().getCurrentUser()
          } else {
            // Если в Telegram, пытаемся автоматически авторизоваться
            if (telegramWebApp.isInTelegram()) {
              const initData = telegramWebApp.getInitData()
              if (initData) {
                try {
                  await get().loginWithTelegram()
                } catch (error) {
                  // Автоматическая авторизация не удалась, остаемся неавторизованными
                  console.warn('Auto-login with Telegram failed:', error)
                }
              }
            }
          }
        } catch (error) {
          console.error('Auth initialization failed:', error)
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      }
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Сохраняем только пользователя, состояние аутентификации восстанавливается автоматически
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // После восстановления состояния, инициализируем аутентификацию
        if (state) {
          state.initialize()
        }
      },
    }
  )
)

// Селекторы для удобства
export const useUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated)
export const useAuthLoading = () => useAuthStore((state) => state.isLoading)
export const useAuthError = () => useAuthStore((state) => state.error) 
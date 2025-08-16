import { apiClient } from '../client'
import { GameResponse, CreateGameRequest } from '../types'

export const gameService = {
  /**
   * Создание новой игры в сессии
   */
  async createGame(sessionId: string, request: CreateGameRequest): Promise<GameResponse> {
    console.log('🎮 gameService.createGame: Создаем игру для сессии:', sessionId)
    console.log('🎮 gameService.createGame: Request:', request)
    
    const response = await apiClient.getGameClient().post(`/api/v1/sessions/${sessionId}/games`, request)
    
    console.log('🎮 gameService.createGame: Ответ от API:', response.data)
    console.log('🎮 gameService.createGame: Возвращаем:', response.data)
    
    return response.data
  },

  /**
   * Получение списка игр в сессии
   */
  async getSessionGames(sessionId: string, limit: number = 10, offset: number = 0): Promise<GameResponse[]> {
    const response = await apiClient.getGameClient().get(`/api/v1/sessions/${sessionId}/games`, {
      params: { limit, offset }
    })
    // 🔄 ИСПРАВЛЯЕМ: API возвращает {games: [...], total: N}, а не массив напрямую
    return response.data.games || []
  },

  /**
   * Получение детальной информации об игре
   */
  async getGame(gameId: string): Promise<GameResponse> {
    // 🔄 ИСПРАВЛЯЕМ: backend endpoint находится по /api/v1/{game_id}, а не /api/v1/games/{game_id}
    const response = await apiClient.getGameClient().get(`/api/v1/${gameId}`)
    return response.data
  },

  /**
   * Получение активной игры в сессии
   */
  async getActiveGame(sessionId: string): Promise<GameResponse | null> {
    try {
      const response = await apiClient.getGameClient().get(`/api/v1/sessions/${sessionId}/active-game`)
      return response.data
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null // Нет активной игры
      }
      throw error
    }
  },

  /**
   * Завершение игры
   */
  async completeGame(gameId: string): Promise<GameResponse> {
    const response = await apiClient.getGameClient().post(`/api/v1/games/${gameId}/end`)
    return response.data
  },

  /**
   * Добавление игрового события
   */
  async addGameEvent(gameId: string, eventData: any): Promise<any> {
    console.log('🎮 gameService.addGameEvent: Отправляем событие для игры:', gameId)
    console.log('🎮 gameService.addGameEvent: Данные события:', eventData)
    
    // ✅ Правильный URL: /api/v1/games/{gameId}/events
    const response = await apiClient.getGameClient().post(`/api/v1/games/${gameId}/events`, eventData)
    
    console.log('🎮 gameService.addGameEvent: Ответ от API:', response.data)
    return response.data
  },

  /**
   * Получение событий игры
   */
  async getGameEvents(gameId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    const response = await apiClient.getGameClient().get(`/api/v1/games/${gameId}/events`, {
      params: { limit, offset }
    })
    return response.data.events
  },

  /**
   * Получение счетов игры
   */
  async getGameScores(gameId: string): Promise<any> {
    const response = await apiClient.getGameClient().get(`/api/v1/games/${gameId}/scores`)
    return response.data
  },

  /**
   * Удаление события игры (помечаем как удаленное)
   */
  async deleteGameEvent(gameId: string, eventId: string): Promise<any> {
    console.log('🎮 gameService.deleteGameEvent: Удаляем событие:', eventId, 'для игры:', gameId)
    
    const response = await apiClient.getGameClient().delete(`/api/v1/games/${gameId}/events/${eventId}`)
    
    console.log('🎮 gameService.deleteGameEvent: Ответ от API:', response.data)
    return response.data
  }
} 
import { apiClient } from '../client'
import type { 
  GameResponse, 
  GameListResponse,
  GameEventRequest,
  GameEventResponse,
  GameScoresResponse,
  CreateGameRequest
} from '../types'

/**
 * Game Service API - Управление играми в сессиях
 */
export class GameService {
  private static baseUrl = '/api/v1/games'

  /**
   * Создать новую игру в сессии
   */
  static async createGame(sessionId: string, gameData: CreateGameRequest): Promise<GameResponse> {
    const response = await apiClient.post(`${this.baseUrl}/sessions/${sessionId}/games`, gameData)
    return response
  }

  /**
   * Получить список игр в сессии
   */
  static async getSessionGames(sessionId: string, limit: number = 10, offset: number = 0): Promise<GameListResponse> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    
    const response = await apiClient.get(`${this.baseUrl}/sessions/${sessionId}/games?${params.toString()}`)
    return response
  }

  /**
   * Получить детальную информацию об игре
   */
  static async getGame(gameId: string): Promise<GameResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${gameId}`)
    return response
  }

  /**
   * Начать игру
   */
  static async startGame(gameId: string): Promise<GameResponse> {
    const response = await apiClient.post(`${this.baseUrl}/${gameId}/start`, {})
    return response
  }

  /**
   * Завершить игру
   */
  static async endGame(gameId: string): Promise<GameResponse> {
    const response = await apiClient.post(`${this.baseUrl}/${gameId}/end`, {})
    return response
  }

  /**
   * Добавить игровое событие
   */
  static async addGameEvent(gameId: string, eventData: GameEventRequest): Promise<GameEventResponse> {
    const response = await apiClient.post(`${this.baseUrl}/${gameId}/events`, eventData)
    return response
  }

  /**
   * Получить счета игры
   */
  static async getGameScores(gameId: string): Promise<GameScoresResponse> {
    const response = await apiClient.get(`${this.baseUrl}/${gameId}/scores`)
    return response
  }

  /**
   * Получить события игры
   */
  static async getGameEvents(gameId: string, limit: number = 50, offset: number = 0): Promise<GameEventResponse[]> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())
    
    const response = await apiClient.get(`${this.baseUrl}/${gameId}/events?${params.toString()}`)
    return response
  }
} 
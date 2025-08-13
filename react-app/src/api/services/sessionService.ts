import { apiClient } from '../client'
import type { 
  GameSession, 
  SessionPlayer,
  BaseResponse,
  PaginationParams
} from '../types'

/**
 * Session Service API
 */
export class SessionService {
  private static baseUrl = '/api/v1/sessions'

  /**
   * Получить список всех сессий пользователя
   */
  static async getSessions(params: PaginationParams & {
    status?: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled'
    user_id?: string
  } = {}): Promise<{
    sessions: GameSession[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.user_id) queryParams.append('user_id', params.user_id)

    const url = `${this.baseUrl}?${queryParams.toString()}`
    return await apiClient.get(url)
  }

  /**
   * Получить сессию по ID
   */
  static async getSession(id: string): Promise<GameSession> {
    return await apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Создать новую игровую сессию
   */
  static async createSession(sessionData: {
    template_id: string
    name: string
    description?: string
    max_players?: number
  }): Promise<GameSession> {
    return await apiClient.post(this.baseUrl, sessionData)
  }

  /**
   * Обновить сессию
   */
  static async updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    return await apiClient.put(`${this.baseUrl}/${id}`, updates)
  }

  /**
   * Удалить сессию
   */
  static async deleteSession(id: string): Promise<BaseResponse> {
    return await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Присоединиться к сессии
   */
  static async joinSession(id: string): Promise<{ session: GameSession; player: SessionPlayer }> {
    return await apiClient.post(`${this.baseUrl}/${id}/join`)
  }

  /**
   * Покинуть сессию
   */
  static async leaveSession(id: string): Promise<BaseResponse> {
    return await apiClient.post(`${this.baseUrl}/${id}/leave`)
  }

  /**
   * Запустить сессию
   */
  static async startSession(id: string): Promise<GameSession> {
    return await apiClient.post(`${this.baseUrl}/${id}/start`)
  }

  /**
   * Приостановить сессию
   */
  static async pauseSession(id: string): Promise<GameSession> {
    return await apiClient.post(`${this.baseUrl}/${id}/pause`)
  }

  /**
   * Возобновить сессию
   */
  static async resumeSession(id: string): Promise<GameSession> {
    return await apiClient.post(`${this.baseUrl}/${id}/resume`)
  }

  /**
   * Завершить сессию
   */
  static async endSession(id: string): Promise<GameSession> {
    return await apiClient.post(`${this.baseUrl}/${id}/end`)
  }

  /**
   * Получить игроков в сессии
   */
  static async getSessionPlayers(sessionId: string): Promise<SessionPlayer[]> {
    return await apiClient.get(`${this.baseUrl}/${sessionId}/players`)
  }

  /**
   * Добавить игрока в сессию (только для админа)
   */
  static async addPlayerToSession(sessionId: string, userData: {
    username: string
    first_name?: string
    last_name?: string
  }): Promise<SessionPlayer> {
    return await apiClient.post(`${this.baseUrl}/${sessionId}/players`, userData)
  }

  /**
   * Удалить игрока из сессии (только для админа)
   */
  static async removePlayerFromSession(sessionId: string, playerId: string): Promise<BaseResponse> {
    return await apiClient.delete(`${this.baseUrl}/${sessionId}/players/${playerId}`)
  }

  /**
   * Изменить готовность игрока
   */
  static async setPlayerReady(sessionId: string, isReady: boolean = true): Promise<SessionPlayer> {
    return await apiClient.post(`${this.baseUrl}/${sessionId}/ready`, { is_ready: isReady })
  }

  /**
   * Получить активные сессии
   */
  static async getActiveSessions(): Promise<GameSession[]> {
    return await apiClient.get(`${this.baseUrl}/active`)
  }

  /**
   * Получить публичные сессии для присоединения
   */
  static async getPublicSessions(params: PaginationParams = {}): Promise<{
    sessions: GameSession[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())

    const url = `${this.baseUrl}/public?${queryParams.toString()}`
    return await apiClient.get(url)
  }

  /**
   * Получить историю сессий пользователя
   */
  static async getSessionHistory(params: PaginationParams = {}): Promise<{
    sessions: GameSession[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())

    const url = `${this.baseUrl}/history?${queryParams.toString()}`
    return await apiClient.get(url)
  }
} 
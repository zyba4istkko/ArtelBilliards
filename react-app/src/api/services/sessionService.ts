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
    status?: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
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
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(url)
    return response
  }

  /**
   * Получить сессии по фильтрам (использует новый endpoint /filter)
   */
  static async getSessionsByFilter(params: {
    status?: 'waiting' | 'in_progress' | 'completed' | 'cancelled'
    user_id?: string
    limit?: number
    offset?: number
  } = {}): Promise<GameSession[]> {
    const queryParams = new URLSearchParams()
    
    if (params.status) queryParams.append('status', params.status)
    if (params.user_id) queryParams.append('user_id', params.user_id)
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())

    const url = `${this.baseUrl}/filter?${queryParams.toString()}`
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(url)
    return response
  }

  /**
   * Получить сессию по ID
   */
  static async getSession(id: string): Promise<GameSession> {
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(`${this.baseUrl}/${id}`)
    return response
  }

  /**
   * Создать новую игровую сессию
   */
  static async createSession(sessionData: {
    template_id: string
    name: string
    creator_display_name?: string  // Имя создателя сессии
    bot_display_name?: string  // Имя бота
    description?: string
    max_players?: number
  }): Promise<GameSession> {
    // Валидируем UUID формат
    if (!this.isValidUUID(sessionData.template_id)) {
      throw new Error(`Invalid UUID format for template_id: ${sessionData.template_id}`)
    }

    console.log('🔍 SessionService.createSession: Отправляю данные:', sessionData)
    console.log('🔍 SessionService.createSession: URL:', this.baseUrl)

    // apiClient.post уже возвращает response.data, поэтому response это GameSession
    const response = await apiClient.post(this.baseUrl, sessionData)
    
    console.log('🔍 SessionService.createSession: Полученный ответ:', response)
    console.log('🔍 SessionService.createSession: Тип ответа:', typeof response)
    console.log('🔍 SessionService.createSession: response.id:', response?.id)
    
    // Проверяем что получили данные
    if (!response || !response.id) {
      throw new Error(`API returned invalid response: ${JSON.stringify(response)}`)
    }
    
    return response
  }

  /**
   * Обновить сессию
   */
  static async updateSession(id: string, updates: Partial<GameSession>): Promise<GameSession> {
    // apiClient.put уже возвращает response.data
    const response = await apiClient.put(`${this.baseUrl}/${id}`, updates)
    return response
  }

  /**
   * Удалить сессию
   */
  static async deleteSession(id: string): Promise<BaseResponse> {
    // apiClient.delete уже возвращает response.data
    const response = await apiClient.delete(`${this.baseUrl}/${id}`)
    return response
  }

  /**
   * Присоединиться к сессии
   */
  static async joinSession(id: string): Promise<{ session: GameSession; player: SessionPlayer }> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/join`, {})
    return response
  }

  /**
   * Покинуть сессию
   */
  static async leaveSession(id: string): Promise<BaseResponse> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/leave`, {})
    return response
  }

  /**
   * Запустить сессию
   */
  static async startSession(id: string): Promise<GameSession> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/start`, {})
    return response
  }

  /**
   * Приостановить сессию
   */
  static async pauseSession(id: string): Promise<GameSession> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/pause`, {})
    return response
  }

  /**
   * Возобновить сессию
   */
  static async resumeSession(id: string): Promise<GameSession> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/resume`, {})
    return response
  }

  /**
   * Завершить сессию
   */
  static async endSession(id: string): Promise<GameSession> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${id}/end`, {})
    return response
  }

  /**
   * Получить игроков в сессии
   */
  static async getSessionPlayers(sessionId: string): Promise<SessionPlayer[]> {
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(`${this.baseUrl}/${sessionId}/players`)
    return response
  }

  /**
   * Добавить игрока в сессию (только для админа)
   */
  static async addPlayerToSession(sessionId: string, userData: {
    user_id: string
    display_name: string
    session_role?: 'creator' | 'participant'
  }): Promise<BaseResponse> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${sessionId}/players`, userData)
    return response
  }

  /**
   * Удалить игрока из сессии (только для админа)
   */
  static async removePlayerFromSession(sessionId: string, playerId: string): Promise<BaseResponse> {
    // apiClient.delete уже возвращает response.data
    const response = await apiClient.delete(`${this.baseUrl}/${sessionId}/players/${playerId}`)
    return response
  }

  /**
   * Установить готовность игрока
   */
  static async setPlayerReady(sessionId: string, isReady: boolean): Promise<BaseResponse> {
    // apiClient.post уже возвращает response.data
    const response = await apiClient.post(`${this.baseUrl}/${sessionId}/ready`, { is_ready: isReady })
    return response
  }

  /**
   * Получить активные сессии (для администраторов)
   */
  static async getActiveSessions(): Promise<GameSession[]> {
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(`${this.baseUrl}/active`)
    return response
  }

  /**
   * Получить статистику сессий
   */
  static async getSessionStats(params: {
    start_date?: string
    end_date?: string
    game_type?: string
    user_id?: string
  } = {}): Promise<{
    total_sessions: number
    active_sessions: number
    completed_sessions: number
    total_players: number
    average_session_duration: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.start_date) queryParams.append('start_date', params.start_date)
    if (params.end_date) queryParams.append('end_date', params.end_date)
    if (params.game_type) queryParams.append('game_type', params.game_type)
    if (params.user_id) queryParams.append('user_id', params.user_id)

    const url = `${this.baseUrl}/stats?${queryParams.toString()}`
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(url)
    return response
  }

  /**
   * Получить историю сессий пользователя
   */
  static async getUserSessionHistory(userId: string, params: {
    limit?: number
    offset?: number
    status?: string
    game_type?: string
  } = {}): Promise<{
    sessions: GameSession[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.offset) queryParams.append('offset', params.offset.toString())
    if (params.status) queryParams.append('status', params.status)
    if (params.game_type) queryParams.append('game_type', params.game_type)

    const url = `${this.baseUrl}/history/${userId}?${queryParams.toString()}`
    // apiClient.get уже возвращает response.data
    const response = await apiClient.get(url)
    return response
  }

  /**
   * Проверяет является ли строка валидным UUID
   */
  private static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }
} 
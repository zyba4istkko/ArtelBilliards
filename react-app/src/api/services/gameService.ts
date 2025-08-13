import { apiClient } from '../client'
import type { 
  Game, 
  GameEvent,
  BaseResponse,
  PaginationParams
} from '../types'

/**
 * Game Service API
 */
export class GameService {
  private static baseUrl = '/api/v1/games'

  /**
   * Получить список игр по сессии
   */
  static async getGamesBySession(sessionId: string, params: PaginationParams = {}): Promise<{
    games: Game[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())

    const url = `${this.baseUrl}/session/${sessionId}?${queryParams.toString()}`
    return await apiClient.get(url)
  }

  /**
   * Получить игру по ID
   */
  static async getGame(id: string): Promise<Game> {
    return await apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Создать новую игру в сессии
   */
  static async createGame(sessionId: string): Promise<Game> {
    return await apiClient.post(this.baseUrl, { session_id: sessionId })
  }

  /**
   * Запустить игру
   */
  static async startGame(id: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${id}/start`)
  }

  /**
   * Приостановить игру
   */
  static async pauseGame(id: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${id}/pause`)
  }

  /**
   * Возобновить игру
   */
  static async resumeGame(id: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${id}/resume`)
  }

  /**
   * Завершить игру
   */
  static async endGame(id: string, winnerId?: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${id}/end`, { winner_id: winnerId })
  }

  /**
   * Добавить событие в игру
   */
  static async addGameEvent(gameId: string, eventData: {
    player_id: string
    event_type: 'shot' | 'foul' | 'miss' | 'win' | 'timeout'
    description: string
    score_change?: number
    metadata?: Record<string, any>
  }): Promise<GameEvent> {
    return await apiClient.post(`${this.baseUrl}/${gameId}/events`, eventData)
  }

  /**
   * Получить события игры
   */
  static async getGameEvents(gameId: string, params: PaginationParams = {}): Promise<{
    events: GameEvent[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())

    const url = `${this.baseUrl}/${gameId}/events?${queryParams.toString()}`
    return await apiClient.get(url)
  }

  /**
   * Обновить счет игрока
   */
  static async updatePlayerScore(gameId: string, playerId: string, scoreChange: number): Promise<Game> {
    return await apiClient.put(`${this.baseUrl}/${gameId}/score`, {
      player_id: playerId,
      score_change: scoreChange
    })
  }

  /**
   * Сделать ход (комплексное действие)
   */
  static async makeMove(gameId: string, moveData: {
    player_id: string
    action_type: 'shot' | 'foul' | 'miss'
    score_change?: number
    description?: string
    metadata?: Record<string, any>
  }): Promise<{ game: Game; event: GameEvent }> {
    return await apiClient.post(`${this.baseUrl}/${gameId}/move`, moveData)
  }

  /**
   * Передать ход следующему игроку
   */
  static async nextPlayer(gameId: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${gameId}/next-player`)
  }

  /**
   * Отменить последнее действие
   */
  static async undoLastAction(gameId: string): Promise<Game> {
    return await apiClient.post(`${this.baseUrl}/${gameId}/undo`)
  }

  /**
   * Получить статистику игры
   */
  static async getGameStats(gameId: string): Promise<{
    game_id: string
    duration: number
    total_shots: number
    player_stats: Array<{
      player_id: string
      score: number
      shots: number
      fouls: number
      misses: number
      accuracy: number
    }>
  }> {
    return await apiClient.get(`${this.baseUrl}/${gameId}/stats`)
  }

  /**
   * Получить текущее состояние игры
   */
  static async getGameState(gameId: string): Promise<{
    game: Game
    current_player: string | null
    scores: Record<string, number>
    last_events: GameEvent[]
    game_duration: number
  }> {
    return await apiClient.get(`${this.baseUrl}/${gameId}/state`)
  }

  /**
   * Экспортировать игру (для анализа)
   */
  static async exportGame(gameId: string, format: 'json' | 'csv' = 'json'): Promise<any> {
    return await apiClient.get(`${this.baseUrl}/${gameId}/export?format=${format}`)
  }

  /**
   * Получить активные игры пользователя
   */
  static async getActiveGames(): Promise<Game[]> {
    return await apiClient.get(`${this.baseUrl}/active`)
  }

  /**
   * Поиск игр пользователя
   */
  static async searchGames(params: {
    session_id?: string
    status?: 'waiting' | 'active' | 'paused' | 'completed'
    from_date?: string
    to_date?: string
  } & PaginationParams): Promise<{
    games: Game[]
    total: number
    page: number
    page_size: number
  }> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params.session_id) queryParams.append('session_id', params.session_id)
    if (params.status) queryParams.append('status', params.status)
    if (params.from_date) queryParams.append('from_date', params.from_date)
    if (params.to_date) queryParams.append('to_date', params.to_date)

    const url = `${this.baseUrl}/search?${queryParams.toString()}`
    return await apiClient.get(url)
  }
} 
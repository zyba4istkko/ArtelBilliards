import { apiClient } from '../client'
import type { Player } from '../types'

/**
 * Player Service API
 */
export class PlayerService {
  private static baseUrl = '/auth/search-test'

  /**
   * Поиск игроков по username или email
   */
  static async searchPlayers(query: string): Promise<Player[]> {
    try {
      // Используем обычный apiClient через API Gateway
      const response = await apiClient.get(`${this.baseUrl}?q=${encodeURIComponent(query)}`)
      console.log('🔍 PlayerService.searchPlayers response:', response)
      
      // API возвращает массив пользователей напрямую
      const users = Array.isArray(response) ? response : (response.data || [])
      
      // Преобразуем в формат Player
      const players: Player[] = users.map((user: any) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        isBot: false,
        displayName: user.first_name || user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar_url: user.avatar_url,
        is_online: user.is_online,
        last_seen: user.last_seen
      }))
      
      console.log('🔍 PlayerService.searchPlayers players:', players)
      return players
    } catch (error) {
      console.error('PlayerService.searchPlayers error:', error)
      // Возвращаем пустой массив в случае ошибки
      return []
    }
  }

  /**
   * Получить список друзей текущего пользователя
   */
  static async getFriends(): Promise<Player[]> {
    try {
      const response = await apiClient.get(`${this.baseUrl}friends`)
      return response.friends || []
    } catch (error) {
      console.error('PlayerService.getFriends error:', error)
      return []
    }
  }

  /**
   * Добавить игрока в друзья
   */
  static async addFriend(playerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.post(`${this.baseUrl}friends`, { player_id: playerId })
      return { success: true, message: 'Игрок добавлен в друзья' }
    } catch (error) {
      console.error('PlayerService.addFriend error:', error)
      return { success: false, message: 'Ошибка добавления в друзья' }
    }
  }

  /**
   * Удалить игрока из друзей
   */
  static async removeFriend(playerId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`${this.baseUrl}friends/${playerId}`)
      return { success: true, message: 'Игрок удален из друзей' }
    } catch (error) {
      console.error('PlayerService.removeFriend error:', error)
      return { success: false, message: 'Ошибка удаления из друзей' }
    }
  }
}

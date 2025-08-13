import { apiClient } from '../client'
import type { 
  GameTemplate, 
  GameTemplateListResponse, 
  TemplateSearchParams,
  BaseResponse 
} from '../types'

/**
 * Template Service API
 */
export class TemplateService {
  private static baseUrl = '/api/v1/templates'

  /**
   * Получить список всех шаблонов с фильтрацией
   */
  static async getTemplates(params: TemplateSearchParams = {}): Promise<GameTemplateListResponse> {
    const queryParams = new URLSearchParams()
    
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.page_size) queryParams.append('page_size', params.page_size.toString())
    if (params.game_type) queryParams.append('game_type', params.game_type)
    if (params.category_id) queryParams.append('category_id', params.category_id.toString())
    if (params.query) queryParams.append('query', params.query)
    if (params.is_public !== undefined) queryParams.append('is_public', params.is_public.toString())

    const url = `${this.baseUrl}?${queryParams.toString()}`
    return await apiClient.get(url)
  }

  /**
   * Получить шаблон по ID
   */
  static async getTemplate(id: string): Promise<GameTemplate> {
    return await apiClient.get(`${this.baseUrl}/${id}`)
  }

  /**
   * Получить популярные шаблоны
   */
  static async getPopularTemplates(limit: number = 10): Promise<GameTemplateListResponse> {
    return await apiClient.get(`${this.baseUrl}/popular?limit=${limit}`)
  }

  /**
   * Получить рекомендованные шаблоны для пользователя
   */
  static async getRecommendedTemplates(limit: number = 5): Promise<GameTemplateListResponse> {
    return await apiClient.get(`${this.baseUrl}/recommended?limit=${limit}`)
  }

  /**
   * Поиск шаблонов
   */
  static async searchTemplates(query: string, filters?: Partial<TemplateSearchParams>): Promise<GameTemplateListResponse> {
    const params: TemplateSearchParams = {
      query,
      ...filters
    }
    return this.getTemplates(params)
  }

  /**
   * Создать шаблон игры
   */
  static async createTemplate(template: Partial<GameTemplate>): Promise<GameTemplate> {
    return await apiClient.post(this.baseUrl, template)
  }

  /**
   * Обновить шаблон игры
   */
  static async updateTemplate(id: string, updates: Partial<GameTemplate>): Promise<GameTemplate> {
    return await apiClient.put(`${this.baseUrl}/${id}`, updates)
  }

  /**
   * Удалить шаблон игры
   */
  static async deleteTemplate(id: string): Promise<BaseResponse> {
    return await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  /**
   * Клонировать шаблон игры
   */
  static async cloneTemplate(id: string, name?: string): Promise<GameTemplate> {
    return await apiClient.post(`${this.baseUrl}/${id}/clone`, { name })
  }

  /**
   * Оценить шаблон
   */
  static async rateTemplate(id: string, rating: number): Promise<BaseResponse> {
    return await apiClient.post(`${this.baseUrl}/${id}/rate`, { rating })
  }

  /**
   * Добавить/убрать шаблон в избранное
   */
  static async toggleFavorite(id: string): Promise<BaseResponse> {
    return await apiClient.post(`${this.baseUrl}/${id}/favorite`)
  }

  /**
   * Валидировать шаблон игры
   */
  static async validateTemplate(template: Partial<GameTemplate>): Promise<{ valid: boolean; errors: string[] }> {
    return await apiClient.post(`${this.baseUrl}/validate`, template)
  }

  /**
   * Получить статистику использования шаблона
   */
  static async getTemplateStats(id: string): Promise<{
    usage_count: number
    average_rating: number
    ratings_count: number
    recent_usage: Array<{ date: string; count: number }>
  }> {
    return await apiClient.get(`${this.baseUrl}/${id}/stats`)
  }

  /**
   * Получить категории шаблонов
   */
  static async getCategories(): Promise<Array<{
    id: number
    name: string
    description: string
    sort_order: number
    templates_count: number
  }>> {
    return await apiClient.get(`${this.baseUrl}/categories`)
  }
} 
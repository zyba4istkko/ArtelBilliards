import { 
  BALL_COLOR_NAMES, 
  QUEUE_ALGORITHM_NAMES 
} from '../constants/template-constants'
import type { GameTemplate, GameTemplateListResponse } from '../api/types'

// Получение названия шара по цвету
export const getBallDisplayName = (color: string): string => {
  return BALL_COLOR_NAMES[color] || color
}

// Получение отображения очков шара
export const getBallPointsDisplay = (points: number): string => {
  return points === 1 ? '1 очко' : `${points} очка`
}

// Получение названия алгоритма очереди
export const getQueueAlgorithmName = (algorithm: string): string => {
  return QUEUE_ALGORITHM_NAMES[algorithm] || algorithm
}

// Получение деталей шаблона для отображения
export const getTemplateDetails = (template: GameTemplate) => {
  if (!template?.rules) {
    return {
      settings: {},
      balls: [],
      scoring: {}
    }
  }

  const { rules } = template

  // Настройки
  const settings = {
    'Стоимость очка': rules.point_value_rubles ? `${rules.point_value_rubles}₽` : 'Не указано',
    'Игроков': rules.min_players ? `${rules.min_players}-${rules.max_players}` : 'Не указано',
    'Шаров': rules.balls ? rules.balls.length.toString() : 'Не указано',
    'Алгоритм очереди': rules.queue_algorithm ? getQueueAlgorithmName(rules.queue_algorithm) : 'Не указано',
    'Лимит времени': rules.time_limit_minutes ? `${rules.time_limit_minutes} мин` : 'Без лимита',
    'Направление оплаты': rules.payment_direction === 'clockwise' ? 'По часовой' : 'Не указано'
  }

  // Шары
  const balls = rules.balls ? rules.balls.map(ball => ({
    name: getBallDisplayName(ball.color),
    points: getBallPointsDisplay(ball.points),
    color: ball.color
  })) : []

  // Система очков
  const scoring = {
    'Стоимость очка': rules.point_value_rubles ? `${rules.point_value_rubles}₽` : 'Не указано',
    'Штраф за фол': '50₽', // Можно добавить в API
    'Бонус за серию': '20₽ (5+ шаров)', // Можно добавить в API
    'Штраф за промах': '10₽' // Можно добавить в API
  }

  return { settings, balls, scoring }
}

// Нормализация данных шаблона из API
export function normalizeTemplateData(data: any): GameTemplateListResponse {
  return {
    templates: Array.isArray(data) ? data : data?.templates || [],
    total: data?.total || (Array.isArray(data) ? data.length : 0),
    page: data?.page || 1,
    page_size: data?.page_size || 20,
    categories: data?.categories || []
  }
}

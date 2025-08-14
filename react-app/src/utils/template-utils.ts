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
  const gameType = template.game_type

  // Настройки в зависимости от типа игры
  let settings: Record<string, string> = {}
  let scoring: Record<string, string> = {}

  // Общие поля для всех типов
  const playersRange = rules.min_players && rules.max_players 
    ? `${rules.min_players}-${rules.max_players}` 
    : 'Не указано'

  const queueAlgorithm = rules.queue_algorithm 
    ? getQueueAlgorithmName(rules.queue_algorithm) 
    : 'Случайно без повторения'

  if (gameType === 'kolkhoz') {
    // Для Колхоза - убираем лимит времени
    settings = {
      'Игроков': playersRange,
      'Алгоритм очереди': queueAlgorithm,
      'Направление оплаты': rules.payment_direction === 'clockwise' ? 'По часовой стрелке' : 'Не указано'
    }

    scoring = {
      'Стоимость очка': rules.point_value_rubles ? `${rules.point_value_rubles}₽` : '50₽',
      'Штраф за фол': rules.foul_penalty_points ? `${Math.abs(rules.foul_penalty_points)}₽` : '50₽'
    }
  } else if (gameType === 'americana' || gameType === 'moscow_pyramid') {
    // Для Американки и Московской пирамиды
    
    settings = {
      'Игроков': playersRange,
      'Шаров для победы': rules.balls_to_win ? rules.balls_to_win.toString() : '8',
      'Всего шаров': rules.balls_total ? rules.balls_total.toString() : '16',
      'Алгоритм очереди': queueAlgorithm,
      'Направление оплаты': rules.payment_direction === 'clockwise' ? 'По часовой стрелке' : 'Не указано'
    }

    scoring = {
      'Стоимость партии': rules.game_price_rubles ? `${rules.game_price_rubles}₽` : (gameType === 'americana' ? '500₽' : '1000₽')
    }
    
  } else {
    // Fallback для других типов
    settings = {
      'Стоимость очка': rules.point_value_rubles ? `${rules.point_value_rubles}₽` : 'Не указано',
      'Игроков': playersRange,
      'Шаров': rules.balls ? rules.balls.length.toString() : 'Не указано',
      'Алгоритм очереди': queueAlgorithm,
      'Лимит времени': rules.time_limit_minutes ? `${rules.time_limit_minutes} мин` : 'Без лимита',
      'Направление оплаты': rules.payment_direction === 'clockwise' ? 'По часовой стрелке' : 'Не указано'
    }

    scoring = {
      'Стоимость очка': rules.point_value_rubles ? `${rules.point_value_rubles}₽` : 'Не указано',
      'Штраф за фол': '50₽'
    }
  }

  // Шары (только для Колхоза показываем детали шаров)
  const balls = (gameType === 'kolkhoz' && rules.balls) ? rules.balls.map(ball => ({
    name: getBallDisplayName(ball.color),
    points: getBallPointsDisplay(ball.points),
    color: ball.color
  })) : []

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

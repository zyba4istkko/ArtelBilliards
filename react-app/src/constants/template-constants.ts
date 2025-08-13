// Начальные настройки шаров
export const INITIAL_BALLS = [
  { name: 'Белый', color: 'white', points: 'Биток', enabled: true },
  { name: 'Желтый', color: 'yellow', points: 2, enabled: true },
  { name: 'Зеленый', color: 'green', points: 3, enabled: true },
  { name: 'Коричневый', color: 'brown', points: 4, enabled: true },
  { name: 'Синий', color: 'blue', points: 5, enabled: true },
  { name: 'Розовый', color: 'pink', points: 6, enabled: true },
  { name: 'Черный', color: 'black', points: 7, enabled: true },
  { name: 'Красные', color: 'red', points: 1, enabled: false },
]

// Настройки по умолчанию для шаблона
export const DEFAULT_TEMPLATE_SETTINGS = {
  name: '',
  description: '',
  gameType: 'kolkhoz' as const,
  ballCount: '15',
  timeLimit: 'none',
  winCondition: 'last',
  turnOrder: 'sequential',
  pointPrice: '10',
  foulPenalty: '50',
  balls: INITIAL_BALLS,
  // Default game type specific fields
  point_value_rubles: 50,
  foul_penalty_points: 1,
  min_players: 2,
  max_players: 6,
  game_price_rubles: 500,
  balls_to_win: 8
}

// Опции для количества шаров
export const BALL_COUNT_OPTIONS = [
  { label: '15', value: '15' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '21', value: '21' }
]

// Опции для лимита времени
export const TIME_LIMIT_OPTIONS = [
  { label: 'Без лимита', value: 'none' },
  { label: '5 мин', value: '5' },
  { label: '10 мин', value: '10' },
  { label: '15 мин', value: '15' }
]

// Опции для условия победы
export const WIN_CONDITION_OPTIONS = [
  { label: 'До последнего', value: 'last' },
  { label: 'До 50 очков', value: '50' },
  { label: 'До 100 очков', value: '100' },
  { label: 'Другое', value: 'custom' }
]

// Опции для порядка игры
export const TURN_ORDER_OPTIONS = [
  { label: 'По очереди', value: 'sequential' },
  { label: 'Случайный', value: 'random' }
]

// Опции для стоимости очка
export const POINT_PRICE_OPTIONS = [
  { label: '10', value: '10' },
  { label: '25', value: '25' },
  { label: '50', value: '50' },
  { label: '100', value: '100' }
]

// Опции для штрафа за фол
export const FOUL_PENALTY_OPTIONS = [
  { label: '50', value: '50' },
  { label: '100', value: '100' },
  { label: '200', value: '200' }
]

// Маппинг цветов шаров на русские названия
export const BALL_COLOR_NAMES: Record<string, string> = {
  white: 'Белый',
  yellow: 'Желтый',
  green: 'Зеленый',
  brown: 'Коричневый',
  blue: 'Синий',
  pink: 'Розовый',
  black: 'Черный',
  red: 'Красный'
}

// Маппинг типов игр на иконки
export const GAME_TYPE_ICONS: Record<string, string> = {
  kolkhoz: '🎱',
  americana: '🔴',
  moscow_pyramid: '🔺'
}

// Маппинг типов игр на русские названия
export const GAME_TYPE_NAMES: Record<string, string> = {
  kolkhoz: 'Колхоз',
  americana: 'Американка',
  moscow_pyramid: 'Пирамида'
}

// Маппинг алгоритмов очереди на русские названия
export const QUEUE_ALGORITHM_NAMES: Record<string, string> = {
  always_random: 'Всегда случайно',
  random_no_repeat: 'Случайно без повторов',
  manual: 'Вручную'
}

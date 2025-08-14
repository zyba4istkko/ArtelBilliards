// API Response Types
export interface BaseResponse {
  success: boolean
  message: string
}

// Auth Types
export interface User {
  id: string
  telegram_id?: number
  google_id?: string
  username: string
  first_name?: string
  last_name?: string
  email?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}

// Template Types
export type GameType = 'americana' | 'moscow_pyramid' | 'kolkhoz'
export type QueueAlgorithm = 'always_random' | 'random_no_repeat' | 'manual'
export type TemplateVisibility = 'public' | 'private' | 'system'

export interface BallConfig {
  color: string
  points: number
  is_required: boolean
  order_priority: number
}

export interface BaseGameRules {
  game_type: GameType
  max_players: number
  min_players: number
  queue_algorithm: QueueAlgorithm
  balls: BallConfig[]
  point_value_rubles?: number
  payment_direction?: string
  allow_queue_change?: boolean
  calculate_net_result?: boolean
  time_limit_minutes?: number
  foul_penalty_points?: number
  balls_to_win?: number
  balls_total?: number
  game_price_rubles?: number
}

export interface KolkhozRules extends BaseGameRules {
  game_type: 'kolkhoz'
  stake_per_shot?: number
  winner_takes_all?: boolean
  miss_penalty?: number
  foul_penalty?: number
  max_shots_per_turn?: number
}

export interface AmericanaRules extends BaseGameRules {
  game_type: 'americana'
  winning_condition?: string
}

export interface MoscowPyramidRules extends BaseGameRules {
  game_type: 'moscow_pyramid'
  winning_condition?: string
  special_rule?: string
}

export interface GameTemplate {
  id: string
  creator_user_id: string
  name: string
  description: string
  game_type: GameType
  rules: KolkhozRules | AmericanaRules | MoscowPyramidRules
  settings: Record<string, any>
  category_id: number
  category_name: string
  is_public: boolean
  is_system: boolean
  is_favorite: boolean
  tags: string[]
  created_at: string
  updated_at: string
}

export interface GameTemplateCreate {
  name: string
  description: string
  game_type: GameType
  rules: KolkhozRules | AmericanaRules | MoscowPyramidRules
  settings: Record<string, any>
  category_id: number
  is_public: boolean
  tags: string[]
  creator_user_id: string
}

export interface TemplateCategory {
  id: number
  name: string
  description: string
  sort_order: number
  templates_count: number
}

export interface GameTemplateListResponse {
  templates: GameTemplate[]
  total: number
  page: number
  page_size: number
  categories: TemplateCategory[]
}

// Game Session Types
export interface GameSession {
  id: string
  template_id: string
  creator_user_id: string
  name: string
  description?: string
  status: 'waiting' | 'active' | 'paused' | 'completed' | 'cancelled'
  max_players: number
  current_players: number
  created_at: string
  started_at?: string
  finished_at?: string
}

export interface SessionPlayer {
  id: string
  session_id: string
  user_id: string
  username: string
  position: number
  score: number
  is_ready: boolean
  joined_at: string
}

// Game Types
export interface Game {
  id: string
  session_id: string
  game_number: number
  status: 'waiting' | 'active' | 'paused' | 'completed'
  current_player_id?: string
  scores: Record<string, number>
  events: GameEvent[]
  started_at?: string
  finished_at?: string
  winner_id?: string
}

export interface GameEvent {
  id: string
  game_id: string
  player_id: string
  event_type: 'shot' | 'foul' | 'miss' | 'win' | 'timeout'
  description: string
  score_change: number
  timestamp: string
  metadata?: Record<string, any>
}

// API Error Types
export interface ApiError {
  detail: string
  error_code?: string
  timestamp?: string
}

// API Request Types
export interface PaginationParams {
  page?: number
  page_size?: number
}

export interface TemplateSearchParams extends PaginationParams {
  game_type?: GameType
  category_id?: number
  query?: string
  is_public?: boolean
}

// WebSocket Types
export interface WebSocketMessage {
  type: string
  payload: any
  timestamp: string
}

export interface GameUpdateMessage extends WebSocketMessage {
  type: 'game_update'
  payload: {
    game_id: string
    event: GameEvent
    updated_scores: Record<string, number>
  }
}

export interface SessionUpdateMessage extends WebSocketMessage {
  type: 'session_update'
  payload: {
    session_id: string
    players: SessionPlayer[]
    status: string
  }
} 
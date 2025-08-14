"""
Game Service Pydantic Schemas
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field


# Enums
class SessionStatus(str, Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class SessionRole(str, Enum):
    CREATOR = "creator"
    PARTICIPANT = "participant"
    SPECTATOR = "spectator"


class GameStatus(str, Enum):
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class GameEventType(str, Enum):
    SHOT = "shot"
    BALL_POTTED = "ball_potted"
    FOUL = "foul"
    COMBO = "combo"
    BREAK = "break"
    MISS = "miss"
    TURN_END = "turn_end"


# Base Models
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Success"


# Game Type Models
class GameTypeResponse(BaseModel):
    id: int
    name: str
    display_name: str
    description: Optional[str]
    default_rules: Dict[str, Any]
    is_active: bool


# Session Models
class CreateSessionRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    game_type_id: Optional[int] = None  # Опциональный
    template_id: UUID  # Обязательный UUID
    max_players: int = Field(ge=2, le=8)
    description: Optional[str] = Field(max_length=500, default=None)  # Опциональный с дефолтом
    rules: Optional[Dict[str, Any]] = None


class SessionParticipantResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID]
    display_name: str
    session_role: SessionRole
    is_empty_user: bool
    joined_at: datetime
    queue_position: Optional[int]
    current_score: int
    is_active: bool
    can_modify_settings: bool
    can_kick_players: bool
    can_change_rules: bool
    session_balance_rubles: Decimal
    total_games_played: int
    total_balls_potted: int


class SessionResponse(BaseModel):
    id: UUID
    creator_user_id: UUID
    game_type: GameTypeResponse
    template_id: Optional[UUID]
    name: str
    status: SessionStatus
    max_players: int
    current_players_count: int
    rules: Optional[Dict[str, Any]]
    participants: List[SessionParticipantResponse]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    updated_at: datetime


class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int
    page: int
    page_size: int


class JoinSessionRequest(BaseModel):
    display_name: Optional[str] = None
    as_empty_user: bool = False


class InvitePlayerRequest(BaseModel):
    user_id: Optional[UUID] = None
    display_name: str
    as_empty_user: bool = False


# Game Models
class CreateGameRequest(BaseModel):
    queue_algorithm: Optional[str] = "manual"  # "always_random", "random_no_repeat", "manual"
    custom_queue: Optional[List[UUID]] = None


class GameResponse(BaseModel):
    id: UUID
    session_id: UUID
    game_number: int
    status: GameStatus
    winner_participant_id: Optional[UUID]
    started_at: datetime
    completed_at: Optional[datetime]
    duration_seconds: Optional[int]
    game_data: Optional[Dict[str, Any]]


class GameListResponse(BaseModel):
    games: List[GameResponse]
    total: int


# Game Event Models
class GameEventRequest(BaseModel):
    event_type: GameEventType
    participant_id: UUID
    event_data: Dict[str, Any]


class KolkhozBallPottedEvent(BaseModel):
    ball_color: str = Field(pattern="^(white|yellow|red|green|brown|blue|pink|black)$")
    ball_points: int = Field(ge=1, le=10)
    position_x: Optional[float] = Field(ge=0, le=100)  # Для аналитики
    position_y: Optional[float] = Field(ge=0, le=100)


class GameEventResponse(BaseModel):
    id: UUID
    game_id: UUID
    participant_id: UUID
    event_type: GameEventType
    event_data: Dict[str, Any]
    sequence_number: int
    created_at: datetime


class GameEventsResponse(BaseModel):
    events: List[GameEventResponse]
    total: int


# Game Result Models
class GameResultResponse(BaseModel):
    id: UUID
    game_id: UUID
    participant_id: UUID
    queue_position_in_game: int
    balls_potted: int
    points_scored: int
    rubles_earned: Decimal
    rubles_paid: Decimal
    net_result_rubles: Decimal
    point_value_rubles: Decimal
    created_at: datetime


class GameScoresResponse(BaseModel):
    current_scores: List[GameResultResponse]
    game_status: GameStatus
    winner_participant_id: Optional[UUID]


# Queue Management Models
class QueueGenerationRequest(BaseModel):
    algorithm: str = Field(pattern="^(always_random|random_no_repeat|manual)$")
    custom_queue: Optional[List[UUID]] = None


class QueueResponse(BaseModel):
    queue: List[UUID]
    algorithm_used: str
    generation_timestamp: datetime


class QueueAnalyticsResponse(BaseModel):
    total_games: int
    algorithm_distribution: Dict[str, int]
    fairness_score: float  # 0-100, где 100 = идеальная справедливость
    player_statistics: Dict[UUID, Dict[str, Any]]


# Error Models
class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


# Health Check Model
class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "game-service"
    python_version: str = "3.13"
    dependencies: Dict[str, str] = {
        "database": "connected",
        "redis": "connected", 
        "rabbitmq": "connected"
    }
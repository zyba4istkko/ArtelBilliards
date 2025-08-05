"""
Template Service Pydantic Schemas
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any, Literal
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field


# Enums
class GameType(str, Enum):
    AMERICANA = "americana"
    MOSCOW_PYRAMID = "moscow_pyramid"
    KOLKHOZ = "kolkhoz"


class QueueAlgorithm(str, Enum):
    ALWAYS_RANDOM = "always_random"
    RANDOM_NO_REPEAT = "random_no_repeat"
    MANUAL = "manual"


class TemplateVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    SYSTEM = "system"


# Base Models
class BaseResponse(BaseModel):
    success: bool = True
    message: str = "Success"


class BallConfig(BaseModel):
    """Конфигурация шара"""
    color: str = Field(pattern="^(white|yellow|red|green|brown|blue|pink|black)$")
    points: int = Field(ge=1, le=10)
    is_required: bool = True
    order_priority: int = Field(ge=0, le=100)


class BaseGameRules(BaseModel):
    """Базовые правила для всех типов игр"""
    game_type: GameType
    max_players: int = Field(ge=2, le=8)
    min_players: int = Field(ge=2, le=8)
    point_value_rubles: Decimal = Field(ge=0, le=10000)
    time_limit_minutes: Optional[int] = Field(None, ge=5, le=180)


class KolkhozRules(BaseGameRules):
    """Специфические правила для игры Колхоз"""
    game_type: Literal[GameType.KOLKHOZ] = GameType.KOLKHOZ
    balls: List[BallConfig]
    payment_direction: Literal["clockwise", "counter_clockwise"] = "clockwise"
    allow_queue_change: bool = True
    queue_algorithm: QueueAlgorithm = QueueAlgorithm.RANDOM_NO_REPEAT
    calculate_net_result: bool = True
    advanced_settings: Dict[str, Any] = Field(default_factory=dict)


class AmericanaRules(BaseGameRules):
    """Правила для Американки"""
    game_type: Literal[GameType.AMERICANA] = GameType.AMERICANA
    balls_count: int = Field(15, ge=9, le=15)
    break_rules: Dict[str, Any] = Field(default_factory=dict)
    foul_penalties: Dict[str, int] = Field(default_factory=dict)


class MoscowPyramidRules(BaseGameRules):
    """Правила для Московской пирамиды"""
    game_type: Literal[GameType.MOSCOW_PYRAMID] = GameType.MOSCOW_PYRAMID
    pyramid_type: Literal["dynamic", "combined", "free"] = "dynamic"
    balls_count: int = Field(15, ge=15, le=15)
    win_condition: Dict[str, Any] = Field(default_factory=dict)


# Template Category Models
class TemplateCategoryResponse(BaseModel):
    id: int
    name: str
    description: str
    sort_order: int
    templates_count: int


# Template Models
class GameTemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = Field(max_length=500)
    game_type: GameType
    rules: Dict[str, Any]  # Union of KolkhozRules, AmericanaRules, MoscowPyramidRules
    settings: Dict[str, Any] = Field(default_factory=dict)
    category_id: Optional[int] = None
    is_public: bool = False
    tags: List[str] = Field(default_factory=list, max_items=10)


class GameTemplateUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    rules: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    category_id: Optional[int] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = Field(None, max_items=10)


class GameTemplateResponse(BaseModel):
    id: UUID
    creator_user_id: UUID
    name: str
    description: Optional[str]
    game_type: GameType
    rules: Dict[str, Any]
    settings: Dict[str, Any]
    category_id: Optional[int]
    category_name: Optional[str]
    is_public: bool
    is_system: bool
    is_favorite: bool
    tags: List[str]
    usage_count: int
    rating: float
    created_at: datetime
    updated_at: datetime


class GameTemplateListResponse(BaseModel):
    templates: List[GameTemplateResponse]
    total: int
    page: int
    page_size: int
    categories: List[TemplateCategoryResponse]


class GameTemplateSearchRequest(BaseModel):
    query: Optional[str] = None
    game_type: Optional[GameType] = None
    category_id: Optional[int] = None
    is_public: Optional[bool] = True
    creator_user_id: Optional[UUID] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_point_value: Optional[Decimal] = None


# Favorite Models
class TemplateFavoriteRequest(BaseModel):
    template_id: UUID
    is_favorite: bool


class TemplateFavoriteResponse(BaseModel):
    template_id: UUID
    user_id: UUID
    is_favorite: bool
    created_at: datetime


# Template Rating Models
class TemplateRatingRequest(BaseModel):
    template_id: UUID
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=500)


class TemplateRatingResponse(BaseModel):
    id: UUID
    template_id: UUID
    user_id: UUID
    rating: int
    comment: Optional[str]
    created_at: datetime


# Template Statistics Models
class TemplateStatsResponse(BaseModel):
    template_id: UUID
    usage_count: int
    average_rating: float
    ratings_count: int
    favorites_count: int
    last_used: Optional[datetime]
    popular_settings: Dict[str, Any]


# Error Models
class ErrorResponse(BaseModel):
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None


# Health Check Model
class HealthResponse(BaseModel):
    status: str = "healthy"
    service: str = "template-service"
    python_version: str = "3.13"
    dependencies: Dict[str, str] = {
        "database": "connected",
        "redis": "connected",
        "rabbitmq": "connected"
    }


# Template Validation Models
class TemplateValidationRequest(BaseModel):
    game_type: GameType
    rules: Dict[str, Any]


class TemplateValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    normalized_rules: Optional[Dict[str, Any]] = None
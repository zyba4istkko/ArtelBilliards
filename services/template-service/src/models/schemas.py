"""
Template Service Pydantic Schemas
"""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional, Dict, Any, Literal, Union
from uuid import UUID
from enum import Enum

from pydantic import BaseModel, Field, field_validator


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
    color: str = Field(..., description="Цвет шара")
    points: int = Field(..., description="Очки за шар (0 для битка)")
    is_required: bool = Field(True, description="Обязателен ли шар")
    order_priority: int = Field(..., description="Приоритет порядка")

    @field_validator('color')
    @classmethod
    def validate_color(cls, v):
        if v not in ["white", "yellow", "red", "green", "brown", "blue", "pink", "black"]:
            raise ValueError('Invalid color')
        return v

    @field_validator('points')
    @classmethod
    def validate_points(cls, v):
        if v < 0:
            raise ValueError('Points must be non-negative')
        return v

    @field_validator('order_priority')
    @classmethod
    def validate_order_priority(cls, v):
        if v < 0:
            raise ValueError('Order priority must be non-negative')
        return v


class BaseGameRules(BaseModel):
    """Базовые правила игры"""
    game_type: str = Field(..., description="Тип игры")
    max_players: int = Field(..., ge=1, le=10, description="Максимальное количество игроков")
    min_players: int = Field(..., ge=1, le=10, description="Минимальное количество игроков")
    point_value_rubles: Optional[float] = Field(None, ge=0, description="Стоимость очка в рублях")
    payment_direction: Optional[str] = Field(None, description="Направление платежей")
    allow_queue_change: Optional[bool] = Field(None, description="Разрешить изменение очереди")
    calculate_net_result: Optional[bool] = Field(None, description="Рассчитывать чистый результат")
    time_limit_minutes: Optional[int] = Field(None, ge=0, description="Лимит времени в минутах")


class KolkhozRules(BaseGameRules):
    """Правила игры Колхоз"""
    game_type: str = Field("kolkhoz", description="Тип игры")
    balls: List[BallConfig] = Field(..., description="Конфигурация шаров")
    queue_algorithm: str = Field("always_random", description="Алгоритм очереди")
    advanced_settings: Optional[Dict[str, Any]] = Field(None, description="Дополнительные настройки")


class AmericanaRules(BaseGameRules):
    """Правила игры Американа"""
    game_type: str = Field("americana", description="Тип игры")
    balls: List[BallConfig] = Field(..., description="Конфигурация шаров")
    queue_algorithm: str = Field("always_random", description="Алгоритм очереди")
    advanced_settings: Optional[Dict[str, Any]] = Field(None, description="Дополнительные настройки")


class MoscowPyramidRules(BaseGameRules):
    """Правила игры Московская пирамида"""
    game_type: str = Field("moscow_pyramid", description="Тип игры")
    balls: List[BallConfig] = Field(..., description="Конфигурация шаров")
    queue_algorithm: str = Field("always_random", description="Алгоритм очереди")
    advanced_settings: Optional[Dict[str, Any]] = Field(None, description="Дополнительные настройки")


# Template Category Models
class TemplateCategoryBase(BaseModel):
    """Базовая схема категории шаблона"""
    name: str = Field(..., max_length=100, description="Название категории")
    description: Optional[str] = Field(None, description="Описание категории")
    sort_order: int = Field(0, ge=0, description="Порядок сортировки")


class TemplateCategoryCreate(TemplateCategoryBase):
    """Схема для создания категории"""
    pass


class TemplateCategoryUpdate(TemplateCategoryBase):
    """Схема для обновления категории"""
    name: Optional[str] = Field(None, max_length=100)
    sort_order: Optional[int] = Field(None, ge=0)


class TemplateCategoryResponse(TemplateCategoryBase):
    """Схема ответа для категории"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Template Models
class GameTemplateBase(BaseModel):
    """Базовая схема шаблона игры"""
    name: str = Field(..., max_length=200, description="Название шаблона")
    description: Optional[str] = Field(None, description="Описание шаблона")
    game_type: str = Field(..., max_length=50, description="Тип игры")
    rules: Dict[str, Any] = Field(..., description="Правила игры")
    settings: Optional[Dict[str, Any]] = Field(None, description="Настройки UI")
    category_id: int = Field(..., description="ID категории")
    is_public: bool = Field(True, description="Публичный ли шаблон")
    is_system: bool = Field(False, description="Системный ли шаблон")
    tags: List[str] = Field(default_factory=list, description="Теги")


class GameTemplateCreate(GameTemplateBase):
    """Схема для создания шаблона"""
    creator_user_id: UUID = Field(..., description="ID создателя")


class GameTemplateUpdate(BaseModel):
    """Схема для обновления шаблона"""
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    game_type: Optional[str] = Field(None, max_length=50)
    rules: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None
    category_id: Optional[int] = None
    is_public: Optional[bool] = None
    is_system: Optional[bool] = None
    tags: Optional[List[str]] = None


class GameTemplateResponse(GameTemplateBase):
    """Схема ответа для шаблона"""
    id: UUID
    creator_user_id: UUID
    usage_count: int
    rating: float
    created_at: datetime
    updated_at: datetime
    category: TemplateCategoryResponse

    class Config:
        from_attributes = True


class GameTemplateListResponse(BaseModel):
    templates: List[GameTemplateResponse]
    total: int
    page: int
    page_size: int
    categories: List[TemplateCategoryResponse]


class GameTemplateSearchRequest(BaseModel):
    """Схема для поиска шаблонов"""
    game_type: Optional[str] = None
    category_id: Optional[int] = None
    is_public: Optional[bool] = None
    is_system: Optional[bool] = None
    tags: Optional[List[str]] = None
    min_rating: Optional[float] = Field(None, ge=0, le=5)
    max_rating: Optional[float] = Field(None, ge=0, le=5)
    limit: int = Field(50, ge=1, le=100)
    offset: int = Field(0, ge=0)


# Favorite Models
class TemplateFavoriteBase(BaseModel):
    """Базовая схема избранного"""
    template_id: UUID = Field(..., description="ID шаблона")


class TemplateFavoriteCreate(TemplateFavoriteBase):
    """Схема для создания избранного"""
    pass


class TemplateFavoriteResponse(TemplateFavoriteBase):
    """Схема ответа для избранного"""
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Template Rating Models
class TemplateRatingBase(BaseModel):
    """Базовая схема рейтинга"""
    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    comment: Optional[str] = Field(None, description="Комментарий")


class TemplateRatingCreate(TemplateRatingBase):
    """Схема для создания рейтинга"""
    template_id: UUID = Field(..., description="ID шаблона")


class TemplateRatingUpdate(TemplateRatingBase):
    """Схема для обновления рейтинга"""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = None


class TemplateRatingResponse(TemplateRatingBase):
    """Схема ответа для рейтинга"""
    id: UUID
    template_id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TemplateRatingRequest(BaseModel):
    """Схема запроса рейтинга"""
    template_id: UUID = Field(..., description="ID шаблона")
    rating: int = Field(..., ge=1, le=5, description="Оценка от 1 до 5")
    comment: Optional[str] = Field(None, description="Комментарий")


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
    error: str
    details: Optional[Any] = None


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


# Response Models
class SuccessResponse(BaseModel):
    """Схема успешного ответа"""
    success: bool = True
    message: str
    data: Optional[Any] = None


class PaginatedResponse(BaseModel):
    """Схема пагинированного ответа"""
    items: List[Any]
    total: int
    limit: int
    offset: int
    has_more: bool


# Legacy Models for compatibility
class GameTemplateListResponse(BaseModel):
    """Схема списка шаблонов (для обратной совместимости)"""
    templates: List[GameTemplateResponse]
    total: int
    limit: int
    offset: int
    has_more: bool


class BaseResponse(BaseModel):
    """Базовая схема ответа (для обратной совместимости)"""
    success: bool = True
    message: str
    data: Optional[Any] = None
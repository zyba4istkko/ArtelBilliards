"""
Pydantic модели для API Auth Service
"""

from pydantic import BaseModel, EmailStr, validator, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from uuid import UUID
from enum import Enum

from .database import UserRole, AuthProvider, SessionStatus


# ==================== AUTH SCHEMAS ====================

class TelegramAuthRequest(BaseModel):
    """Запрос аутентификации через Telegram"""
    init_data: str = Field(..., description="Данные инициализации от Telegram")
    start_param: Optional[str] = Field(None, description="Стартовый параметр")

class GoogleAuthRequest(BaseModel):
    """Запрос аутентификации через Google"""
    id_token: str = Field(..., description="Google ID Token")

class EmailAuthRequest(BaseModel):
    """Запрос аутентификации через email"""
    email: EmailStr
    password: str = Field(..., min_length=8)

class RegisterRequest(BaseModel):
    """Запрос регистрации пользователя"""
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=8)
    first_name: Optional[str] = Field(None, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    language_code: Optional[str] = Field("ru", max_length=10)
    timezone: Optional[str] = Field("UTC", max_length=50)

    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum() and '_' not in v:
            raise ValueError('Username must contain only letters, numbers and underscores')
        return v.lower()

class AuthResponse(BaseModel):
    """Ответ при успешной аутентификации"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: "UserResponse"

class RefreshTokenRequest(BaseModel):
    """Запрос обновления токена"""
    refresh_token: str

class LogoutRequest(BaseModel):
    """Запрос выхода из системы"""
    session_id: Optional[UUID] = None
    all_sessions: bool = False


# ==================== USER SCHEMAS ====================

class UserBase(BaseModel):
    """Базовая модель пользователя"""
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language_code: str = "ru"
    timezone: str = "UTC"

class UserCreate(UserBase):
    """Модель создания пользователя"""
    password: Optional[str] = None

class UserUpdate(BaseModel):
    """Модель обновления пользователя"""
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language_code: Optional[str] = None
    timezone: Optional[str] = None

class UserResponse(BaseModel):
    """Модель ответа с данными пользователя"""
    id: UUID
    username: str
    email: Optional[str] = None
    phone: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    language_code: str
    timezone: str
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserProfile(UserResponse):
    """Расширенный профиль пользователя"""
    providers: List["AuthProviderResponse"] = []
    active_sessions_count: int = 0


# ==================== SESSION SCHEMAS ====================

class SessionResponse(BaseModel):
    """Информация о сессии"""
    id: UUID
    device_info: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    status: SessionStatus
    expires_at: datetime
    created_at: datetime
    last_activity_at: datetime
    is_current: bool = False

    class Config:
        from_attributes = True


# ==================== AUTH PROVIDER SCHEMAS ====================

class AuthProviderResponse(BaseModel):
    """Информация о провайдере аутентификации"""
    id: UUID
    provider: AuthProvider
    provider_username: Optional[str] = None
    is_primary: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ==================== PERMISSION SCHEMAS ====================

class PermissionResponse(BaseModel):
    """Информация о разрешении"""
    id: UUID
    name: str
    description: Optional[str] = None
    resource: str
    action: str

    class Config:
        from_attributes = True

class UserPermissions(BaseModel):
    """Разрешения пользователя"""
    user_id: UUID
    role: UserRole
    permissions: List[PermissionResponse] = []


# ==================== ERROR SCHEMAS ====================

class ErrorDetail(BaseModel):
    """Детали ошибки"""
    code: str
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseModel):
    """Стандартный ответ с ошибкой"""
    error: str
    details: Optional[List[ErrorDetail]] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# ==================== HEALTH SCHEMAS ====================

class HealthResponse(BaseModel):
    """Ответ проверки здоровья сервиса"""
    status: str = "healthy"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    version: str = "1.0.0"
    dependencies: Dict[str, str] = {}


# ==================== RATE LIMITING SCHEMAS ====================

class RateLimitInfo(BaseModel):
    """Информация о лимитах"""
    limit: int
    remaining: int
    reset_at: datetime


# Обновляем forward references
AuthResponse.model_rebuild()
UserProfile.model_rebuild()
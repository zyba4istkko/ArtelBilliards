"""
Pydantic модели для Auth Service
"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from uuid import UUID
from pydantic import BaseModel
from enum import Enum

from .database import UserRole, AuthProvider, SessionStatus


# ==================== AUTH SCHEMAS ====================

class TelegramAuthRequest(BaseModel):
    """Запрос аутентификации через Telegram"""
    init_data: str
    start_param: Optional[str] = None

class GoogleAuthRequest(BaseModel):
    """Запрос аутентификации через Google"""
    id_token: str

class EmailAuthRequest(BaseModel):
    """Запрос аутентификации через email"""
    email: str
    password: str

class RegisterRequest(BaseModel):
    """Запрос регистрации пользователя"""
    username: str
    email: Optional[str] = None
    password: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language_code: Optional[str] = "ru"
    timezone: Optional[str] = "UTC"

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
    email: Optional[str] = None
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
    email: Optional[str] = None
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

class UserProfile(BaseModel):
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
    timestamp: datetime = datetime.utcnow()


# ==================== HEALTH SCHEMAS ====================

class HealthResponse(BaseModel):
    """Ответ проверки здоровья сервиса"""
    status: str = "healthy"
    timestamp: datetime = datetime.utcnow()
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
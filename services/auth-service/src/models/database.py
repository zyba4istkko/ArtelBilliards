"""
Модели базы данных для Auth Service
"""

import sqlalchemy as sa
from sqlalchemy import Column, String, Integer, DateTime, Boolean, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.sql import func
import uuid
from enum import Enum

# Создаем метаданные
metadata = sa.MetaData()

# Перечисления
class UserRole(str, Enum):
    """Роли пользователей"""
    ADMIN = "admin"
    MODERATOR = "moderator" 
    PREMIUM_USER = "premium_user"
    REGULAR_USER = "regular_user"

class AuthProvider(str, Enum):
    """Провайдеры аутентификации"""
    TELEGRAM = "telegram"
    GOOGLE = "google"
    EMAIL = "email"

class SessionStatus(str, Enum):
    """Статус сессий"""
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

# Таблица пользователей
users_table = sa.Table(
    "users",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("username", String(50), unique=True, nullable=False),
    Column("email", String(255), unique=True, nullable=True),
    Column("phone", String(20), unique=True, nullable=True),
    Column("first_name", String(100), nullable=True),
    Column("last_name", String(100), nullable=True),
    Column("avatar_url", String(500), nullable=True),
    Column("role", String(20), nullable=False, default=UserRole.REGULAR_USER.value),
    Column("is_active", Boolean, default=True),
    Column("is_verified", Boolean, default=False),
    Column("language_code", String(10), default="ru"),
    Column("timezone", String(50), default="UTC"),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
    Column("last_login_at", DateTime(timezone=True), nullable=True),
    Column("metadata", JSONB, nullable=True),  # Дополнительные данные пользователя
    
    # Индексы
    Index("idx_users_username", "username"),
    Index("idx_users_email", "email"),
    Index("idx_users_role", "role"),
    Index("idx_users_created_at", "created_at"),
)

# Таблица провайдеров аутентификации
auth_providers_table = sa.Table(
    "auth_providers",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("provider", String(20), nullable=False),
    Column("provider_user_id", String(255), nullable=False),  # ID пользователя у провайдера
    Column("provider_username", String(255), nullable=True),
    Column("provider_data", JSONB, nullable=True),  # Дополнительные данные от провайдера
    Column("is_primary", Boolean, default=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
    
    # Уникальность по провайдеру и ID
    sa.UniqueConstraint("provider", "provider_user_id", name="uq_provider_user"),
    
    # Индексы
    Index("idx_auth_providers_user_id", "user_id"),
    Index("idx_auth_providers_provider", "provider"),
)

# Таблица сессий пользователей
user_sessions_table = sa.Table(
    "user_sessions",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
    Column("access_token_hash", String(255), nullable=False),
    Column("refresh_token_hash", String(255), nullable=True),
    Column("device_info", JSONB, nullable=True),  # Информация об устройстве
    Column("ip_address", INET, nullable=True),
    Column("user_agent", Text, nullable=True),
    Column("status", String(20), nullable=False, default=SessionStatus.ACTIVE.value),
    Column("expires_at", DateTime(timezone=True), nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("last_activity", DateTime(timezone=True), server_default=func.now()),
    Column("session_token", String(255), unique=True, nullable=True),
    Column("refresh_token", String(255), nullable=True),
    Column("updated_at", DateTime(timezone=True), server_default=func.now()),
    Column("last_activity_at", DateTime(timezone=True), server_default=func.now()),
    
    # Индексы
    Index("idx_user_sessions_user_id", "user_id"),
    Index("idx_user_sessions_token", "session_token"),
    Index("idx_user_sessions_refresh_token", "refresh_token"),
    Index("idx_user_sessions_expires_at", "expires_at"),
    Index("idx_user_sessions_status", "status"),
)

# Таблица логов аутентификации
auth_logs_table = sa.Table(
    "auth_logs",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
    Column("action", String(50), nullable=False),  # login, logout, register, etc.
    Column("provider", String(20), nullable=True),
    Column("ip_address", INET, nullable=True),
    Column("user_agent", Text, nullable=True),
    Column("success", Boolean, nullable=False),
    Column("error_message", Text, nullable=True),
    Column("metadata", JSONB, nullable=True),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    
    # Индексы
    Index("idx_auth_logs_user_id", "user_id"),
    Index("idx_auth_logs_action", "action"),
    Index("idx_auth_logs_created_at", "created_at"),
    Index("idx_auth_logs_success", "success"),
    Index("idx_auth_logs_ip_address", "ip_address"),
)

# Таблица ограничений по IP (rate limiting / blocking)
ip_restrictions_table = sa.Table(
    "ip_restrictions",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("ip_address", INET, nullable=False, unique=True),
    Column("failed_attempts", Integer, default=0),
    Column("blocked_until", DateTime(timezone=True), nullable=True),
    Column("first_attempt_at", DateTime(timezone=True), server_default=func.now()),
    Column("last_attempt_at", DateTime(timezone=True), server_default=func.now()),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    Column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now()),
    
    # Индексы
    Index("idx_ip_restrictions_ip_address", "ip_address"),
    Index("idx_ip_restrictions_blocked_until", "blocked_until"),
)

# Таблица разрешений (для RBAC)
permissions_table = sa.Table(
    "permissions",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("name", String(100), unique=True, nullable=False),
    Column("description", Text, nullable=True),
    Column("resource", String(50), nullable=False),  # games, templates, users, etc.
    Column("action", String(50), nullable=False),    # create, read, update, delete, manage
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    
    # Уникальность по ресурсу и действию
    sa.UniqueConstraint("resource", "action", name="uq_resource_action"),
    
    # Индексы
    Index("idx_permissions_resource", "resource"),
    Index("idx_permissions_action", "action"),
)

# Таблица связи ролей и разрешений
role_permissions_table = sa.Table(
    "role_permissions",
    metadata,
    Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
    Column("role", String(20), nullable=False),
    Column("permission_id", UUID(as_uuid=True), sa.ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False),
    Column("created_at", DateTime(timezone=True), server_default=func.now()),
    
    # Уникальность по роли и разрешению
    sa.UniqueConstraint("role", "permission_id", name="uq_role_permission"),
    
    # Индексы
    Index("idx_role_permissions_role", "role"),
    Index("idx_role_permissions_permission_id", "permission_id"),
)
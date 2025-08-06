"""
Конфигурация Auth Service - упрощенная версия без pydantic_settings
"""

import os
from typing import List, Optional
import secrets


class Settings:
    """Настройки Auth Service"""
    
    # Основные настройки приложения
    SERVICE_NAME: str = "auth-service"
    SERVICE_PORT: int = 8001
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # База данных (используем имя контейнера postgres)
    DATABASE_URL: str = "postgresql://postgres:password@postgres:5432/auth_db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    REDIS_PREFIX: str = "auth:"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://admin:password@localhost:5672"
    
    # JWT настройки
    JWT_SECRET_KEY: str = secrets.token_urlsafe(32)
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # CORS
    ALLOWED_ORIGINS: List[str] = (
        os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:8000,https://telegram.org")
        .split(",")
    )
    
    # Telegram настройки
    TELEGRAM_BOT_TOKEN: Optional[str] = os.getenv("TELEGRAM_BOT_TOKEN")
    TELEGRAM_BOT_USERNAME: Optional[str] = os.getenv("TELEGRAM_BOT_USERNAME")
    TELEGRAM_WEBHOOK_SECRET: Optional[str] = os.getenv("TELEGRAM_WEBHOOK_SECRET")
    
    # Google OAuth настройки
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Безопасность
    PASSWORD_MIN_LENGTH: int = 8
    MAX_LOGIN_ATTEMPTS: int = 5
    LOCKOUT_DURATION_MINUTES: int = 15
    
    # Сессии
    MAX_ACTIVE_SESSIONS: int = 5
    SESSION_CLEANUP_INTERVAL_HOURS: int = 24
    
    # Rate Limiting
    RATE_LIMIT_AUTH_PER_MINUTE: int = 5
    RATE_LIMIT_API_PER_MINUTE: int = 100
    
    # Мониторинг
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9001
    
    # Логирование
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Создаем глобальный экземпляр настроек
settings = Settings()
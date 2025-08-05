"""
Game Service Configuration
"""

import os


class Settings:
    # Service info
    service_name: str = "game-service"
    service_port: int = 8002
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@postgres:5432/game_db")
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379")
    
    # RabbitMQ
    rabbitmq_url: str = os.getenv("RABBITMQ_URL", "amqp://admin:password@rabbitmq:5672")
    
    # JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "game-service-secret-key")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # External Services
    auth_service_url: str = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
    template_service_url: str = os.getenv("TEMPLATE_SERVICE_URL", "http://template-service:8003")
    
    # Game settings
    max_participants_per_session: int = 8
    max_events_per_game: int = 1000
    session_timeout_hours: int = 24


# Global settings instance
settings = Settings()
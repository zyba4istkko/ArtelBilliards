"""
Template Service Configuration
"""

import os


class Settings:
    # Service info
    service_name: str = "template-service"
    service_port: int = 8003
    environment: str = os.getenv("ENVIRONMENT", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Database - PostgreSQL
    DB_HOST: str = os.getenv("DB_HOST", "postgres")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.getenv("DB_NAME", "template_db")
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "password")
    DB_ECHO: bool = os.getenv("DB_ECHO", "false").lower() == "true"
    
    # Legacy database_url for compatibility
    database_url: str = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    
    # Redis
    redis_url: str = os.getenv("REDIS_URL", "redis://redis:6379")
    
    # RabbitMQ
    rabbitmq_url: str = os.getenv("RABBITMQ_URL", "amqp://admin:password@rabbitmq:5672")
    
    # JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "template-service-secret-key")
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30
    
    # External Services
    auth_service_url: str = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")
    game_service_url: str = os.getenv("GAME_SERVICE_URL", "http://game-service:8002")
    
    # Template settings
    max_templates_per_user: int = 50
    max_template_size_bytes: int = 10240  # 10KB
    template_cache_ttl_seconds: int = 3600


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get settings instance"""
    return settings
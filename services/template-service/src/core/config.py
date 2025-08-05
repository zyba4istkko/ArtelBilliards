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
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@postgres:5432/template_db")
    
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
"""
Health Check API Endpoints
"""

from fastapi import APIRouter

from ..models.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    # TODO: Добавить проверки подключений к БД, Redis, RabbitMQ
    return HealthResponse(
        status="healthy",
        service="game-service",
        python_version="3.13",
        dependencies={
            "database": "connected",  # TODO: реальная проверка
            "redis": "connected",
            "rabbitmq": "connected"
        }
    )


@router.get("/health/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {
        "status": "ready",
        "service": "game-service",
        "dependencies": {
            "database": "ready",
            "redis": "ready", 
            "rabbitmq": "ready"
        }
    }


@router.get("/health/live")
async def liveness_check():
    """Liveness check endpoint"""
    return {
        "status": "alive",
        "service": "game-service",
        "timestamp": "2025-08-04T07:50:00Z"
    }
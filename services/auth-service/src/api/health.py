"""
Health check endpoints для Auth Service
"""

from fastapi import APIRouter, status, Depends
from datetime import datetime
import asyncio
import asyncpg
import aioredis
import aio_pika

from ..core.config import settings
from ..models.schemas import HealthResponse

router = APIRouter()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """Базовая проверка здоровья сервиса"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )


@router.get("/ready", response_model=HealthResponse)
async def readiness_check():
    """Проверка готовности сервиса (включая зависимости)"""
    dependencies = {}
    overall_status = "healthy"
    
    # Проверка PostgreSQL
    try:
        conn = await asyncpg.connect(settings.DATABASE_URL)
        await conn.execute("SELECT 1")
        await conn.close()
        dependencies["postgres"] = "healthy"
    except Exception as e:
        dependencies["postgres"] = f"unhealthy: {str(e)}"
        overall_status = "unhealthy"
    
    # Проверка Redis
    try:
        redis = aioredis.from_url(settings.REDIS_URL)
        await redis.ping()
        await redis.close()
        dependencies["redis"] = "healthy"
    except Exception as e:
        dependencies["redis"] = f"unhealthy: {str(e)}"
        overall_status = "unhealthy"
    
    # Проверка RabbitMQ
    try:
        connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        await connection.close()
        dependencies["rabbitmq"] = "healthy"
    except Exception as e:
        dependencies["rabbitmq"] = f"unhealthy: {str(e)}"
        overall_status = "unhealthy"
    
    return HealthResponse(
        status=overall_status,
        timestamp=datetime.utcnow(),
        version="1.0.0",
        dependencies=dependencies
    )


@router.get("/live", response_model=HealthResponse)
async def liveness_check():
    """Проверка живости сервиса (простая проверка)"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.utcnow(),
        version="1.0.0"
    )
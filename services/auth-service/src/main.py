"""
Простая версия Auth Service для тестирования с Python 3.13
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
from contextlib import asynccontextmanager

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    try:
        logger.info("Auth Service starting...")
        
        # Импортируем database функции
        from .core.database import connect_to_db, disconnect_from_db, create_tables
        
        # Подключаемся к базе данных
        await connect_to_db()
        
        # Создаем таблицы (только в development)
        await create_tables()
        
        logger.info("Auth Service startup completed successfully!")
        yield
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        raise
    finally:
        logger.info("Auth Service shutting down...")
        
        # Отключаемся от базы данных
        try:
            from .core.database import disconnect_from_db
            await disconnect_from_db()
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Создание FastAPI приложения
app = FastAPI(
    title="Artel Billiards - Auth Service",
    version="1.0.0",
    description="Микросервис аутентификации для Artel Billiards",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "service": "Artel Billiards Auth Service",
        "version": "1.0.0",
        "status": "running",
        "python_version": "3.13"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "auth-service",
        "python_version": "3.13"
    }

@app.get("/health/ready")
async def readiness_check():
    """Readiness check endpoint"""
    return {
        "status": "ready",
        "service": "auth-service",
        "dependencies": {
            "database": "not_connected",  # Пока что заглушка
            "redis": "not_connected",
            "rabbitmq": "not_connected"
        }
    }

@app.get("/health/live")
async def liveness_check():
    """Liveness check endpoint"""
    return {
        "status": "alive",
        "service": "auth-service"
    }

# Простые auth endpoints для тестирования
@app.post("/auth/telegram")
async def auth_telegram():
    """Заглушка для Telegram аутентификации"""
    return {
        "message": "Telegram auth endpoint",
        "status": "working",
        "note": "This is a test stub"
    }

@app.post("/auth/google")
async def auth_google():
    """Заглушка для Google аутентификации"""
    return {
        "message": "Google auth endpoint", 
        "status": "working",
        "note": "This is a test stub"
    }

@app.get("/auth/me")
async def get_me():
    """Заглушка для получения текущего пользователя"""
    return {
        "message": "Get current user endpoint",
        "status": "working", 
        "note": "This is a test stub"
    }

@app.get("/users/me")
async def get_my_profile():
    """Заглушка для профиля пользователя"""
    return {
        "message": "User profile endpoint",
        "status": "working",
        "note": "This is a test stub"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
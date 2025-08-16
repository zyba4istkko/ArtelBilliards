"""
Game Service Main Application
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from .core.database import connect_to_db, disconnect_from_db, create_tables, init_sqlalchemy
from .core.config import settings
from .api import health, sessions, games

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    try:
        print(f"🎮 Starting Game Service...")
        print(f"📊 Environment: {settings.environment}")
        print(f"🔧 Debug mode: {settings.debug}")
        
        # Подключение к базе данных
        await connect_to_db()
        
        # Создание таблиц (только в development)
        if settings.environment == "development":
            await create_tables()
        
        # Инициализация SQLAlchemy
        await init_sqlalchemy()
        
        # TODO: Подключение к RabbitMQ
        print("🐰 RabbitMQ connection: placeholder")
        
        # TODO: Подключение к Redis
        print("🟥 Redis connection: placeholder")
        
        print("✅ Game Service started successfully!")
        yield
        
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise
    finally:
        print("🛑 Shutting down Game Service...")
        
        # Отключение от базы данных
        await disconnect_from_db()
        
        print("✅ Game Service shut down completed")


# Создание FastAPI приложения
app = FastAPI(
    title="Artel Billiards - Game Service",
    version="1.0.0",
    description="Микросервис управления играми и сессиями",
    lifespan=lifespan
)

# Middleware для логирования запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Логирование всех входящих запросов"""
    logger.info(f"📥 {request.method} {request.url}")
    
    # Логируем тело запроса для POST/PUT
    if request.method in ["POST", "PUT"]:
        try:
            body = await request.body()
            if body:
                logger.info(f"📦 Request body: {body.decode()}")
        except Exception as e:
            logger.warning(f"⚠️ Could not read request body: {e}")
    
    response = await call_next(request)
    
    logger.info(f"📤 {request.method} {request.url} - {response.status_code}")
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Регистрация роутеров
app.include_router(health.router)
app.include_router(sessions.router, prefix="/api/v1")
app.include_router(games.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Artel Billiards Game Service",
        "version": "1.0.0",
        "status": "running",
        "python_version": "3.13",
        "environment": settings.environment,
        "endpoints": {
            "health": "/health",
            "sessions": "/api/v1/sessions",
            "games": "/api/v1/games"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.service_port)
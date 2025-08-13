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
    """Lifecycle management для FastAPI приложения"""
    # Startup
    try:
        print("🚀 Starting Auth Service...")
        from .core.database import connect_database, create_tables
        await connect_database()
        await create_tables()
        print("✅ Auth Service startup completed")
        yield
    except Exception as e:
        print(f"❌ Auth Service startup failed: {e}")
        raise
    finally:
        # Shutdown
        try:
            from .core.database import disconnect_database
            await disconnect_database()
            print("✅ Auth Service shutdown completed")
        except Exception as e:
            print(f"❌ Auth Service shutdown failed: {e}")

# Создание FastAPI приложения
app = FastAPI(
    title="Artel Billiards Auth Service",
    description="Сервис аутентификации для Artel Billiards",
    version="1.0.0",
    lifespan=lifespan
)

# CORS настройка
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:3001", 
        "http://localhost:5173", 
        "http://localhost:8000",
        "https://plenty-pants-flash.loca.lt",
        "https://*.loca.lt"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение роутеров
from .api.auth import router as auth_router
app.include_router(auth_router, prefix="/auth", tags=["auth"])

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
        "database": "connected",
        "dependencies": {
            "postgres": "connected",
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
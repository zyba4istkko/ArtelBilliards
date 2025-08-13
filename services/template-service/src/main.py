"""
Template Service Main Application
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.database import connect_to_db, disconnect_from_db, create_tables
from .core.config import settings
from .api import health, templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    try:
        print(f"🎨 Starting Template Service...")
        print(f"📊 Environment: {settings.environment}")
        print(f"🔧 Debug mode: {settings.debug}")
        
        # Подключение к базе данных
        await connect_to_db()
        
        # Создание таблиц (только в development)
        if settings.environment == "development":
            await create_tables()
        
        # TODO: Подключение к RabbitMQ
        print("🐰 RabbitMQ connection: placeholder")
        
        # TODO: Подключение к Redis
        print("🟥 Redis connection: placeholder")
        
        print("✅ Template Service started successfully!")
        yield
        
    except Exception as e:
        print(f"❌ Error during startup: {e}")
        raise
    finally:
        print("🛑 Shutting down Template Service...")
        
        # Отключение от базы данных
        await disconnect_from_db()
        
        print("✅ Template Service shut down completed")


# Создание FastAPI приложения
app = FastAPI(
    title="Artel Billiards - Template Service",
    version="1.0.0",
    description="Микросервис управления шаблонами игр",
    lifespan=lifespan
)

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
app.include_router(templates.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Artel Billiards Template Service",
        "version": "1.0.0",
        "status": "running",
        "python_version": "3.13",
        "environment": settings.environment,
        "endpoints": {
            "health": "/health",
            "templates": "/api/v1/templates",
            "popular": "/api/v1/templates/popular",
            "my_templates": "/api/v1/templates/my",
            "validation": "/api/v1/templates/validate"
        },
        "features": {
            "game_types": ["kolkhoz", "americana", "moscow_pyramid"],
            "template_categories": ["Колхоз", "Американка", "Московская пирамида", "Турниры", "Обучение", "Пользовательские"],
            "system_templates": 3,
            "validation": True,
            "rating_system": True,
            "favorites": True,
            "cloning": True
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=settings.service_port)
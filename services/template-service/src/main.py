"""
Template Service Main Application
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import templates, health
from .core.database import init_db, close_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Управление жизненным циклом приложения"""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()

app = FastAPI(
    title="Template Service",
    description="Сервис для управления шаблонами игр",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене ограничить конкретными доменами
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роутеры
app.include_router(health.router, tags=["health"])
app.include_router(templates.router, prefix="/api/v1")

@app.get("/")
async def root():
    """Корневой endpoint"""
    return {
        "message": "Template Service API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }
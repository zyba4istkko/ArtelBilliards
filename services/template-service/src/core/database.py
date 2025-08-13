"""
Template Service Database Configuration
"""

import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import NullPool
from .config import settings

# Database URL для SQLAlchemy 2
DATABASE_URL = f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Создаем async engine с SQLAlchemy 2
engine = create_async_engine(
    DATABASE_URL,
    echo=settings.DB_ECHO,
    poolclass=NullPool,
    future=True  # Включаем SQLAlchemy 2 режим
)

# Создаем async session maker
async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

async def get_db_session():
    """Получить сессию базы данных для Dependency Injection"""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()

def get_db_session_context():
    """Получить сессию базы данных как context manager"""
    return async_session()

async def init_db():
    """Инициализация базы данных"""
    # В SQLAlchemy 2 это не нужно, но оставляем для совместимости
    pass

async def close_db():
    """Закрытие соединений с базой данных"""
    await engine.dispose()


# Database health check
async def check_db_health() -> bool:
    """Check if database is accessible"""
    try:
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database health check failed: {e}")
        return False
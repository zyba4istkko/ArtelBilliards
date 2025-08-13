"""
Подключение к базе данных
"""

import asyncpg
import databases
from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from .config import settings

# SQLAlchemy настройка
engine = create_engine(settings.DATABASE_URL, echo=True)
metadata = MetaData()
Base = declarative_base()

# Databases библиотека для async работы
database = databases.Database(settings.DATABASE_URL)

async def connect_database():
    """Подключение к базе данных"""
    try:
        await database.connect()
        print("✅ Auth Service connected to database: auth_db")
        
        # Проверяем версию PostgreSQL
        query = "SELECT version()"
        result = await database.fetch_one(query)
        print(f"📊 PostgreSQL version: {result[0]}")
        
        # Проверяем имя текущей базы данных
        query = "SELECT current_database()"
        result = await database.fetch_one(query)
        print(f"🗄️ Database name: {result[0]}")
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        raise

async def disconnect_database():
    """Отключение от базы данных"""
    await database.disconnect()
    print("🔌 Auth Service disconnected from database")

async def create_tables():
    """Создание таблиц если их нет"""
    from ..models.database import metadata
    
    print("🔧 Creating Auth Service database tables...")
    
    # Используем прямое подключение для создания таблиц
    metadata.create_all(engine)
    
    # Получаем список созданных таблиц
    query = """
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name
    """
    
    result = await database.fetch_all(query)
    table_names = [row[0] for row in result]
    print(f"✅ Auth Service database tables created: {table_names}")
"""
Database connection и setup для Auth Service - простой psycopg3 для Python 3.13
"""

import psycopg
from contextlib import contextmanager

from .config import settings

# Простое подключение без pool пока что
connection = None


async def connect_to_db():
    """Подключение к базе данных при старте приложения"""
    try:
        # Простое подключение для тестирования
        conn = psycopg.connect(settings.DATABASE_URL)
        
        # Проверяем подключение
        with conn.cursor() as cursor:
            cursor.execute("SELECT version(), current_database()")
            version_info = cursor.fetchone()
        
        conn.close()
            
        print(f"✅ Auth Service connected to database: auth_db")
        print(f"📊 PostgreSQL version: {version_info[0]}")
        print(f"🗄️ Database name: {version_info[1]}")
        
        return True
    except Exception as e:
        print(f"❌ Auth Service failed to connect to database: {e}")
        raise


async def disconnect_from_db():
    """Отключение от базы данных при остановке приложения"""
    try:
        print("✅ Auth Service disconnected from database")
    except Exception as e:
        print(f"❌ Auth Service error disconnecting from database: {e}")


async def check_database_connection():
    """Проверка подключения к базе данных"""
    try:
        conn = psycopg.connect(settings.DATABASE_URL)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 as test, current_database() as db_name")
            result = cursor.fetchone()
        conn.close()
        print(f"🔍 Database connection check: test={result[0]}, db_name={result[1]}")
        return True
    except Exception as e:
        print(f"❌ Auth Service database connection check failed: {e}")
        return False


async def create_tables():
    """Создание таблиц в базе данных с простым подключением"""
    try:
        if settings.ENVIRONMENT == "development":
            print("🔧 Creating Auth Service database tables...")
            
            conn = psycopg.connect(settings.DATABASE_URL)
            try:
                with conn.cursor() as cursor:
                    # SQL для создания таблиц пользователей
                    create_users_table = """
                    CREATE TABLE IF NOT EXISTS users (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        username VARCHAR(50) UNIQUE NOT NULL,
                        email VARCHAR(255) UNIQUE,
                        phone VARCHAR(20) UNIQUE,
                        first_name VARCHAR(100),
                        last_name VARCHAR(100),
                        avatar_url VARCHAR(500),
                        role VARCHAR(20) NOT NULL DEFAULT 'regular_user',
                        is_active BOOLEAN DEFAULT TRUE,
                        is_verified BOOLEAN DEFAULT FALSE,
                        language_code VARCHAR(10) DEFAULT 'ru',
                        timezone VARCHAR(50) DEFAULT 'UTC',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        last_login TIMESTAMP WITH TIME ZONE
                    );
                    """
                    
                    # SQL для создания таблиц сессий
                    create_sessions_table = """
                    CREATE TABLE IF NOT EXISTS user_sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                        access_token_hash VARCHAR(255) NOT NULL,
                        refresh_token_hash VARCHAR(255),
                        device_info JSONB,
                        ip_address INET,
                        user_agent TEXT,
                        status VARCHAR(20) DEFAULT 'active',
                        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        last_activity TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                    
                    cursor.execute(create_users_table)
                    cursor.execute(create_sessions_table)
                    conn.commit()
                    
                    # Проверяем созданные таблицы
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """)
                    table_names = [row[0] for row in cursor.fetchall()]
                    
                    print(f"✅ Auth Service database tables created: {table_names}")
            finally:
                conn.close()
            
        else:
            print("⚠️  Production mode: Use Alembic migrations instead of manual table creation")
            
    except Exception as e:
        print(f"❌ Auth Service failed to create tables: {e}")
        raise
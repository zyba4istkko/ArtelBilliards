"""
Game Service Database Connection - Real PostgreSQL connection
"""

import psycopg
from contextlib import contextmanager
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from .config import settings

# SQLAlchemy Base class
class Base(DeclarativeBase):
    pass

# Async engine for SQLAlchemy
engine = None
async_session_maker = None

# Simple connection without pool for now
connection = None


async def connect_to_db():
    """Connect to the database on application startup"""
    try:
        # Simple connection for testing
        conn = psycopg.connect(settings.database_url)
        
        # Test connection
        with conn.cursor() as cursor:
            cursor.execute("SELECT version(), current_database()")
            version_info = cursor.fetchone()
        
        conn.close()
            
        print(f"✅ Game Service connected to database: game_db")
        print(f"📊 PostgreSQL version: {version_info[0]}")
        print(f"🗄️ Database name: {version_info[1]}")
        
        return True
    except Exception as e:
        print(f"❌ Game Service failed to connect to database: {e}")
        raise


async def disconnect_from_db():
    """Disconnect from database on application shutdown"""
    try:
        print("✅ Game Service disconnected from database")
    except Exception as e:
        print(f"❌ Game Service error disconnecting from database: {e}")


async def check_database_connection():
    """Check database connection"""
    try:
        conn = psycopg.connect(settings.database_url)
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 as test, current_database() as db_name")
            result = cursor.fetchone()
        conn.close()
        print(f"🔍 Game Service database connection check: test={result[0]}, db_name={result[1]}")
        return True
    except Exception as e:
        print(f"❌ Game Service database connection check failed: {e}")
        return False


async def create_tables():
    """Create all tables in database with simple connection"""
    try:
        if settings.environment == "development":
            print("🔧 Creating Game Service database tables...")
            
            conn = psycopg.connect(settings.database_url)
            try:
                with conn.cursor() as cursor:
                    # SQL for creating game sessions table
                    create_sessions_table = """
                    CREATE TABLE IF NOT EXISTS game_sessions (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        creator_user_id UUID NOT NULL,
                        game_type JSONB NOT NULL,
                        max_participants INTEGER DEFAULT 8,
                        status VARCHAR(20) DEFAULT 'waiting',
                        settings JSONB DEFAULT '{}',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        started_at TIMESTAMP WITH TIME ZONE,
                        ended_at TIMESTAMP WITH TIME ZONE
                    );
                    """
                    
                    # SQL for creating games table
                    create_games_table = """
                    CREATE TABLE IF NOT EXISTS games (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
                        game_number INTEGER NOT NULL,
                        status VARCHAR(20) DEFAULT 'active',
                        winner_user_id UUID,
                        final_scores JSONB DEFAULT '{}',
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        started_at TIMESTAMP WITH TIME ZONE,
                        ended_at TIMESTAMP WITH TIME ZONE
                    );
                    """
                    
                    # SQL for creating session participants table
                    create_participants_table = """
                    CREATE TABLE IF NOT EXISTS session_participants (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        session_id UUID REFERENCES game_sessions(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL,
                        role VARCHAR(20) DEFAULT 'participant',
                        joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        left_at TIMESTAMP WITH TIME ZONE,
                        total_score INTEGER DEFAULT 0,
                        games_won INTEGER DEFAULT 0,
                        games_played INTEGER DEFAULT 0
                    );
                    """
                    
                    # SQL for creating game events table
                    create_events_table = """
                    CREATE TABLE IF NOT EXISTS game_events (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        game_id UUID REFERENCES games(id) ON DELETE CASCADE,
                        user_id UUID NOT NULL,
                        event_type VARCHAR(50) NOT NULL,
                        event_data JSONB NOT NULL,
                        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        ball_color VARCHAR(20),
                        points INTEGER DEFAULT 0,
                        shot_number INTEGER,
                        game_time_ms INTEGER
                    );
                    """
                    
                    cursor.execute(create_sessions_table)
                    cursor.execute(create_games_table)
                    cursor.execute(create_participants_table)
                    cursor.execute(create_events_table)
                    conn.commit()
                    
                    # Check created tables
                    cursor.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                        ORDER BY table_name
                    """)
                    table_names = [row[0] for row in cursor.fetchall()]
                    
                    print(f"✅ Game Service database tables created: {table_names}")
            finally:
                conn.close()
            
        else:
            print("⚠️  Production mode: Use Alembic migrations instead of manual table creation")
            
    except Exception as e:
        print(f"❌ Game Service failed to create tables: {e}")
        raise


# Database dependency
async def get_database():
    """Get database connection"""
    return None  # For now, we'll use direct connections

# SQLAlchemy database dependency
async def get_db():
    """Get SQLAlchemy database session"""
    if async_session_maker is None:
        raise RuntimeError("Database not initialized")
    
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_sqlalchemy():
    """Initialize SQLAlchemy engine and session maker"""
    global engine, async_session_maker
    
    try:
        # Convert psycopg URL to async SQLAlchemy URL
        # psycopg: postgresql://user:pass@host:port/db
        # async SQLAlchemy: postgresql+psycopg://user:pass@host:port/db
        async_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://")
        
        engine = create_async_engine(
            async_url,
            echo=settings.environment == "development",
            pool_pre_ping=True
        )
        
        async_session_maker = async_sessionmaker(
            engine,
            class_=AsyncSession,
            expire_on_commit=False
        )
        
        # Создаем таблицы из SQLAlchemy моделей
        if settings.environment == "development":
            async with engine.begin() as conn:
                from ..models.database import Base
                # Создаем таблицы только если их нет
                await conn.run_sync(Base.metadata.create_all)
                print("✅ SQLAlchemy tables created")
        
        print("✅ SQLAlchemy engine initialized")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize SQLAlchemy: {e}")
        raise
"""
Migration management for Template Service
Automatically runs migrations on service startup
"""

import asyncio
import os
import subprocess
import sys
from pathlib import Path
from typing import Optional

async def wait_for_database():
    """Wait for database to be ready"""
    import psycopg2
    from psycopg2 import OperationalError
    
    db_config = {
        'host': os.getenv('DB_HOST', 'postgres'),
        'port': os.getenv('DB_PORT', '5432'),
        'database': os.getenv('DB_NAME', 'template_db'),
        'user': os.getenv('DB_USER', 'postgres'),
        'password': os.getenv('DB_PASSWORD', 'password')
    }
    
    max_retries = 30
    retry_delay = 2
    
    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(**db_config)
            conn.close()
            return True
        except OperationalError:
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
            else:
                return False
    
    return False

def run_alembic_command(command: str, cwd: Optional[str] = None) -> bool:
    """Run an alembic command"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        return True
    except subprocess.CalledProcessError:
        return False

async def init_alembic():
    """Initialize Alembic if not already initialized"""
    if not Path("alembic.ini").exists():
        # Initialize alembic
        if not run_alembic_command("alembic init alembic"):
            return False
        
        # Update alembic.ini with correct database URL
        db_url = f"postgresql+psycopg2://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'postgres')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'template_db')}"
        
        # Read and update alembic.ini
        with open("alembic.ini", "r") as f:
            content = f.read()
        
        content = content.replace(
            "sqlalchemy.url = driver://user:pass@localhost/dbname",
            f"sqlalchemy.url = {db_url}"
        )
        
        with open("alembic.ini", "w") as f:
            f.write(content)
        
        # Update env.py to use our models
        env_py_content = '''"""
Alembic environment configuration for Template Service
"""

import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context

# Import your models here
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.models.database import Base
from src.core.config import get_settings

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def get_url():
    """Get database URL from settings"""
    settings = get_settings()
    return f"postgresql+psycopg2://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    """Run migrations with the given connection"""
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations in 'online' mode with async engine"""
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=get_url(),
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
'''
        
        with open("alembic/env.py", "w") as f:
            f.write(env_py_content)
    
    return True

async def create_initial_migration():
    """Create initial migration if it doesn't exist"""
    versions_dir = Path("alembic/versions")
    if not versions_dir.exists():
        versions_dir.mkdir(parents=True)
    
    # Check if we already have migrations
    existing_migrations = list(versions_dir.glob("*.py"))
    if not existing_migrations:
        # Create initial migration
        if not run_alembic_command("alembic revision --autogenerate -m 'Initial tables for Template Service'"):
            return False
    
    return True

async def run_migrations():
    """Main migration function"""
    try:
        # Wait for database
        if not await wait_for_database():
            raise Exception("Database not available")
        
        # Initialize alembic
        if not await init_alembic():
            raise Exception("Failed to initialize Alembic")
        
        # Create initial migration if needed
        if not await create_initial_migration():
            raise Exception("Failed to create initial migration")
        
        # Apply migrations
        if not run_alembic_command("alembic upgrade head"):
            raise Exception("Failed to apply migrations")
        
        return True
        
    except Exception as e:
        raise Exception(f"Migration failed: {str(e)}")

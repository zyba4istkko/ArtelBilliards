#!/usr/bin/env python3
"""
Migration initialization script for Template Service
This script can be run manually or automatically to set up and apply migrations
"""

import asyncio
import os
import sys
import subprocess
from pathlib import Path

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
            print("✅ Database connection successful!")
            return True
        except OperationalError as e:
            print(f"⏳ Database not ready (attempt {attempt + 1}/{max_retries}): {e}")
            if attempt < max_retries - 1:
                await asyncio.sleep(retry_delay)
            else:
                print("❌ Failed to connect to database after maximum retries")
                return False
    
    return False

def run_command(command, cwd=None):
    """Run a shell command and return the result"""
    try:
        result = subprocess.run(
            command,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
            check=True
        )
        print(f"✅ Command successful: {command}")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {command}")
        print(f"Error: {e}")
        if e.stderr:
            print(f"Stderr: {e.stderr}")
        return False

def init_alembic():
    """Initialize Alembic if not already initialized"""
    if not Path("alembic.ini").exists():
        print("📋 Initializing Alembic...")
        if not run_command("alembic init alembic"):
            return False
        
        # Update alembic.ini with correct database URL
        db_url = f"postgresql+asyncpg://{os.getenv('DB_USER', 'postgres')}:{os.getenv('DB_PASSWORD', 'password')}@{os.getenv('DB_HOST', 'postgres')}:{os.getenv('DB_PORT', '5432')}/{os.getenv('DB_NAME', 'template_db')}"
        
        # Read and update alembic.ini
        with open("alembic.ini", "r") as f:
            content = f.read()
        
        content = content.replace(
            "sqlalchemy.url = driver://user:pass@localhost/dbname",
            f"sqlalchemy.url = {db_url}"
        )
        
        with open("alembic.ini", "w") as f:
            f.write(content)
        
        print("✅ Alembic initialized and configured")
    else:
        print("✅ Alembic already initialized")
    
    return True

def update_env_py():
    """Update env.py to use our models"""
    env_py_path = Path("alembic/env.py")
    if env_py_path.exists():
        # Backup original
        env_py_path.rename("alembic/env.py.backup")
    
    # Create new env.py
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
    return f"postgresql+asyncpg://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"


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
    
    with open(env_py_path, "w") as f:
        f.write(env_py_content)
    
    print("✅ env.py updated with our models")

def create_initial_migration():
    """Create initial migration if it doesn't exist"""
    versions_dir = Path("alembic/versions")
    if not versions_dir.exists():
        versions_dir.mkdir(parents=True)
    
    # Check if we already have migrations
    existing_migrations = list(versions_dir.glob("*.py"))
    if not existing_migrations:
        print("📝 Creating initial migration...")
        if not run_command("alembic revision --autogenerate -m 'Initial tables for Template Service'"):
            print("⚠️ Failed to create initial migration, but continuing...")
    else:
        print(f"✅ Found {len(existing_migrations)} existing migration(s)")

def apply_migrations():
    """Apply all pending migrations"""
    print("🔄 Applying database migrations...")
    if not run_command("alembic upgrade head"):
        print("❌ Failed to apply migrations")
        return False
    
    print("✅ Migrations applied successfully!")
    return True

async def main():
    """Main migration process"""
    print("🚀 Starting Template Service migration process...")
    
    # Wait for database
    if not await wait_for_database():
        sys.exit(1)
    
    # Initialize Alembic
    if not init_alembic():
        sys.exit(1)
    
    # Update env.py
    update_env_py()
    
    # Create initial migration
    create_initial_migration()
    
    # Apply migrations
    if not apply_migrations():
        sys.exit(1)
    
    print("🎉 Migration process completed successfully!")

if __name__ == "__main__":
    asyncio.run(main())

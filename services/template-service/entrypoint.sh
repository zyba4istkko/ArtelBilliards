#!/bin/bash
set -e

echo "🚀 Starting Template Service..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME; do
    echo "Database is not ready yet. Waiting..."
    sleep 2
done
echo "✅ Database is ready!"

# Initialize database tables using Python script
echo "📊 Initializing database tables..."
cd /app
python -c "
import asyncio
import sys
sys.path.append('/app')
from src.core.database import engine
from src.models.database import Base

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Database tables created successfully!')

asyncio.run(init_db())
"

# Start the application
echo "🎯 Starting Template Service application..."
exec uvicorn src.main:app --host 0.0.0.0 --port 8003 --reload

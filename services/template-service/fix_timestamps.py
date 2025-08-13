#!/usr/bin/env python3
"""
Исправление временных меток в существующих записях
"""

import asyncio
import asyncpg
import os
from datetime import datetime

# Конфигурация БД
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'template_db')
}

async def fix_timestamps():
    """Исправление временных меток"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Исправляем поля created_at и updated_at
        print("\n🔧 Исправление временных меток...")
        
        # Обновляем записи где created_at или updated_at NULL
        result = await conn.execute("""
            UPDATE game_templates 
            SET 
                created_at = COALESCE(created_at, CURRENT_TIMESTAMP),
                updated_at = COALESCE(updated_at, CURRENT_TIMESTAMP)
            WHERE created_at IS NULL OR updated_at IS NULL
        """)
        
        print(f"   ✅ Обновлено записей: {result.split()[-1]}")
        
        # Проверяем результат
        templates = await conn.fetch("""
            SELECT id, name, created_at, updated_at
            FROM game_templates 
            ORDER BY created_at DESC
            LIMIT 5
        """)
        
        print(f"\n📊 Проверка временных меток:")
        for template in templates:
            print(f"   • {template['name']}: created={template['created_at']}, updated={template['updated_at']}")
        
        print("\n🎉 Временные метки исправлены!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(fix_timestamps())

#!/usr/bin/env python3
"""
Проверка категорий в базе данных
"""

import asyncio
import asyncpg
import os

# Конфигурация БД
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'template_db')
}

async def check_categories():
    """Проверка категорий"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем категории
        categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        
        print(f"\n📊 Найдено {len(categories)} категорий:")
        for cat in categories:
            print(f"   • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        # Проверяем шаблоны
        templates = await conn.fetch("SELECT id, name, game_type, category_id, is_system FROM game_templates ORDER BY category_id, name")
        
        print(f"\n📋 Найдено {len(templates)} шаблонов:")
        for tpl in templates:
            print(f"   • {tpl['name']} ({tpl['game_type']}) - Категория {tpl['category_id']} - Системный: {tpl['is_system']}")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(check_categories())

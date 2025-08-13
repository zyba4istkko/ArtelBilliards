#!/usr/bin/env python3
"""
Исправление названий категорий в базе данных
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

async def fix_category_names():
    """Исправление названий категорий"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем текущие категории
        print("\n📊 Текущие категории:")
        categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        for cat in categories:
            print(f"   • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        # Исправляем названия категорий
        print("\n🔧 Исправление названий категорий...")
        
        # Категория 1: Системные
        await conn.execute("""
            UPDATE template_categories 
            SET name = 'Системные', description = 'Стандартные шаблоны'
            WHERE id = 1
        """)
        print("   ✅ Категория 1: 'Системные'")
        
        # Категория 2: Американка
        await conn.execute("""
            UPDATE template_categories 
            SET name = 'Американка', description = 'Шаблоны для Американки'
            WHERE id = 2
        """)
        print("   ✅ Категория 2: 'Американка'")
        
        # Проверяем результат
        print("\n📊 Обновленные категории:")
        categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        for cat in categories:
            print(f"   • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        print("\n🎉 Названия категорий исправлены!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(fix_category_names())

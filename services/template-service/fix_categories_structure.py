#!/usr/bin/env python3
"""
Исправление структуры категорий: создание 3 отдельных категорий
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

async def fix_categories():
    """Исправление структуры категорий"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем текущие категории
        print("\n📊 Текущие категории:")
        categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        for cat in categories:
            print(f"   • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        # Удаляем старые категории
        print("\n🗑️ Удаление старых категорий...")
        await conn.execute("DELETE FROM template_categories")
        
        # Создаем 3 новые категории
        print("\n🆕 Создание новых категорий...")
        
        # 1. Колхоз
        await conn.execute("""
            INSERT INTO template_categories (id, name, description, sort_order, created_at, updated_at)
            VALUES (1, 'Колхоз', 'Шаблоны для игры Колхоз', 1, NOW(), NOW())
        """)
        print("   ✅ Категория 'Колхоз' создана (ID: 1)")
        
        # 2. Американка
        await conn.execute("""
            INSERT INTO template_categories (id, name, description, sort_order, created_at, updated_at)
            VALUES (2, 'Американка', 'Шаблоны для игры Американка', 2, NOW(), NOW())
        """)
        print("   ✅ Категория 'Американка' создана (ID: 2)")
        
        # 3. Московская пирамида
        await conn.execute("""
            INSERT INTO template_categories (id, name, description, sort_order, created_at, updated_at)
            VALUES (3, 'Московская пирамида', 'Шаблоны для Московской пирамиды', 3, NOW(), NOW())
        """)
        print("   ✅ Категория 'Московская пирамида' создана (ID: 3)")
        
        # Обновляем шаблоны с правильными категориями
        print("\n🔄 Обновление категорий шаблонов...")
        
        # Колхоз -> категория 1
        kolkhoz_count = await conn.execute("""
            UPDATE game_templates 
            SET category_id = 1 
            WHERE game_type = 'kolkhoz'
        """)
        print(f"   ✅ Обновлено шаблонов Колхоза: {kolkhoz_count}")
        
        # Американка -> категория 2
        americana_count = await conn.execute("""
            UPDATE game_templates 
            SET category_id = 2 
            WHERE game_type = 'americana'
        """)
        print(f"   ✅ Обновлено шаблонов Американки: {americana_count}")
        
        # Московская пирамида -> категория 3
        moscow_count = await conn.execute("""
            UPDATE game_templates 
            SET category_id = 3 
            WHERE game_type = 'moscow_pyramid'
        """)
        print(f"   ✅ Обновлено шаблонов Московской пирамиды: {moscow_count}")
        
        # Проверяем результат
        print("\n🔍 Проверка результата...")
        
        new_categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        print("   📊 Новые категории:")
        for cat in new_categories:
            print(f"      • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        templates = await conn.fetch("""
            SELECT name, game_type, category_id 
            FROM game_templates 
            ORDER BY category_id, name
        """)
        print("   📋 Шаблоны по категориям:")
        for template in templates:
            print(f"      • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        print("\n🎉 Структура категорий исправлена успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(fix_categories())

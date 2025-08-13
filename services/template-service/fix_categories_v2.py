#!/usr/bin/env python3
"""
Исправление структуры категорий: создание 3 отдельных категорий (v2)
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
        
        # Создаем третью категорию, если её нет
        print("\n🆕 Создание категории 'Московская пирамида'...")
        await conn.execute("""
            INSERT INTO template_categories (id, name, description, sort_order, created_at, updated_at)
            VALUES (3, 'Московская пирамида', 'Шаблоны для Московской пирамиды', 3, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                sort_order = EXCLUDED.sort_order,
                updated_at = EXCLUDED.updated_at
        """)
        print("   ✅ Категория 'Московская пирамида' создана/обновлена (ID: 3)")
        
        # Обновляем названия существующих категорий
        print("\n🔄 Обновление названий категорий...")
        
        # Категория 1 -> Колхоз
        await conn.execute("""
            UPDATE template_categories 
            SET name = 'Колхоз', description = 'Шаблоны для игры Колхоз', updated_at = NOW()
            WHERE id = 1
        """)
        print("   ✅ Категория 1 переименована в 'Колхоз'")
        
        # Категория 2 остается Американка
        await conn.execute("""
            UPDATE template_categories 
            SET name = 'Американка', description = 'Шаблоны для игры Американка', updated_at = NOW()
            WHERE id = 2
        """)
        print("   ✅ Категория 2 остается 'Американка'")
        
        # Обновляем шаблоны с правильными категориями
        print("\n🔄 Обновление категорий шаблонов...")
        
        # Московская пирамида -> категория 3
        moscow_count = await conn.fetchval("""
            UPDATE game_templates 
            SET category_id = 3, updated_at = NOW()
            WHERE game_type = 'moscow_pyramid'
            RETURNING (SELECT COUNT(*) FROM game_templates WHERE game_type = 'moscow_pyramid')
        """)
        print(f"   ✅ Обновлено шаблонов Московской пирамиды: {moscow_count or 0}")
        
        # Проверяем результат
        print("\n🔍 Проверка результата...")
        
        new_categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        print("   📊 Итоговые категории:")
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

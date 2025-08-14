#!/usr/bin/env python3
"""
Очистка базы данных от старых шаблонов
Оставляем только три новых базовых системных шаблона
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

async def cleanup_templates():
    """Очистка старых шаблонов"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем текущие шаблоны
        print("\n📊 Текущие шаблоны:")
        templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY category_id, name
        """)
        
        for template in templates:
            print(f"   • {template['name']} ({template['game_type']}) - Категория {template['category_id']} - Системный: {template['is_system']}")
        
        # Определяем шаблоны для удаления (старые)
        print("\n🗑️ Определяем шаблоны для удаления...")
        
        # Получаем ID старых шаблонов (не те, что мы создали)
        old_templates = await conn.fetch("""
            SELECT id, name 
            FROM game_templates 
            WHERE name NOT IN (
                'Колхоз стандартный (50₽ за очко)',
                'Колхоз бюджетный (25₽ за очко)', 
                'Колхоз премиум (200₽ за очко)',
                'Американка (500₽ за партию)',
                'Московская пирамида (1000₽ за партию)'
            )
        """)
        
        print(f"   📋 Найдено {len(old_templates)} старых шаблонов для удаления:")
        for template in old_templates:
            print(f"      • {template['name']} (ID: {template['id']})")
        
        if not old_templates:
            print("   ✅ Нет старых шаблонов для удаления")
            return
        
        # Удаляем старые шаблоны
        print("\n🗑️ Удаление старых шаблонов...")
        
        for template in old_templates:
            await conn.execute("DELETE FROM game_templates WHERE id = $1", template['id'])
            print(f"   ✅ Удален: {template['name']}")
        
        # Проверяем результат
        print("\n🔍 Проверка результата...")
        
        remaining_templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY category_id, name
        """)
        
        print(f"   📊 Осталось {len(remaining_templates)} шаблонов:")
        for template in remaining_templates:
            print(f"      • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        # Проверяем категории
        print("\n📂 Проверка категорий:")
        categories = await conn.fetch("SELECT id, name, description FROM template_categories ORDER BY id")
        for cat in categories:
            print(f"   • ID {cat['id']}: {cat['name']} - {cat['description']}")
        
        print("\n🎉 Очистка завершена успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(cleanup_templates())

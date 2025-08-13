#!/usr/bin/env python3
"""
Удаление дубликатов шаблонов
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

async def remove_duplicates():
    """Удаление дубликатов"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем текущие шаблоны
        print("\n📊 Текущие шаблоны:")
        templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY name, created_at
        """)
        
        for template in templates:
            print(f"   • {template['name']} (ID: {template['id']}) - {template['game_type']} - Категория {template['category_id']}")
        
        # Находим дубликаты
        print("\n🔍 Поиск дубликатов...")
        
        duplicates = await conn.fetch("""
            SELECT name, COUNT(*) as count, 
                   array_agg(id ORDER BY created_at) as ids,
                   array_agg(created_at ORDER BY created_at) as dates
            FROM game_templates 
            GROUP BY name 
            HAVING COUNT(*) > 1
        """)
        
        if not duplicates:
            print("   ✅ Дубликатов не найдено")
            return
        
        print(f"   📋 Найдено {len(duplicates)} шаблонов с дубликатами:")
        for dup in duplicates:
            print(f"      • {dup['name']}: {dup['count']} копий")
            for i, (id_val, date) in enumerate(zip(dup['ids'], dup['dates'])):
                print(f"        {i+1}. ID: {id_val}, создан: {date}")
        
        # Удаляем дубликаты, оставляя самый старый
        print("\n🗑️ Удаление дубликатов...")
        
        for dup in duplicates:
            # Оставляем первый (самый старый), удаляем остальные
            ids_to_remove = dup['ids'][1:]  # Все кроме первого
            
            for id_to_remove in ids_to_remove:
                await conn.execute("DELETE FROM game_templates WHERE id = $1", id_to_remove)
                print(f"   ✅ Удален дубликат: {dup['name']} (ID: {id_to_remove})")
        
        # Проверяем результат
        print("\n🔍 Проверка результата...")
        
        remaining_templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY name
        """)
        
        print(f"   📊 Осталось {len(remaining_templates)} уникальных шаблонов:")
        for template in remaining_templates:
            print(f"      • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        print("\n🎉 Удаление дубликатов завершено!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(remove_duplicates())

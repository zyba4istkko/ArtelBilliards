#!/usr/bin/env python3
"""
Добавление шаблона Колхоза
"""

import asyncio
import asyncpg
import json
import os
import uuid

# Конфигурация БД
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'template_db')
}

async def add_kolkhoz_template():
    """Добавление шаблона Колхоза"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # Проверяем текущие шаблоны
        print("\n📊 Текущие шаблоны:")
        templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY name
        """)
        
        for template in templates:
            print(f"   • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        # Создаем шаблон Колхоза
        print("\n🆕 Создание шаблона Колхоза...")
        
        kolkhoz_rules = {
            "game_type": "kolkhoz",
            "max_players": 6,
            "min_players": 2,
            "balls_total": 15,
            "point_value_rubles": 50,
            "queue_algorithm": "random_no_repeat",
            "winning_condition": "last_ball_remaining",
            "game_rules": {
                "description": "Классическая русская игра Колхоз. Игра до последнего шара",
                "ball_counting": "point_based",
                "foul_penalty_points": -1,
                "foul_penalty_description": "Штраф за фол: -1 очко (50₽ при стоимости очка 50₽)",
                "payment_direction": "clockwise",
                "calculate_net_result": True
            }
        }
        
        kolkhoz_settings = {
            "ui_theme": "classic",
            "show_points_counter": True,
            "show_running_total": True,
            "enable_point_calculation": True,
            "show_foul_warnings": True,
            "show_payment_direction": True
        }
        
        await conn.execute("""
            INSERT INTO game_templates (id, creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        """, 
        str(uuid.uuid4()),
        '00000000-0000-0000-0000-000000000000',
        'Колхоз стандартный (50₽ за очко)',
        'Классическая русская игра Колхоз. Игра до последнего шара. 50₽ за очко',
        'kolkhoz',
        json.dumps(kolkhoz_rules),
        json.dumps(kolkhoz_settings),
        1, True, True, json.dumps(["колхоз", "русский бильярд", "классика"]))
        
        print("   ✅ Колхоз стандартный создан")
        
        # Проверяем результат
        print("\n🔍 Проверка результата...")
        
        remaining_templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            ORDER BY name
        """)
        
        print(f"   📊 Теперь у нас {len(remaining_templates)} шаблонов:")
        for template in remaining_templates:
            print(f"      • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        print("\n🎉 Шаблон Колхоза добавлен успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(add_kolkhoz_template())

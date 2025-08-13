#!/usr/bin/env python3
"""
Template Service: Обновление системных шаблонов
Удаление рейтинговой системы и создание новых базовых шаблонов
"""

import asyncio
import asyncpg
import json
import os
import uuid
from datetime import datetime

# Конфигурация БД
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'postgres'),
    'port': int(os.getenv('DB_PORT', 5432)),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'password'),
    'database': os.getenv('DB_NAME', 'template_db')
}

async def update_system_templates():
    """Обновление системных шаблонов"""
    
    print("🔄 Подключение к базе данных...")
    conn = await asyncpg.connect(**DB_CONFIG)
    
    try:
        print("✅ Подключение установлено")
        
        # 1. УДАЛЕНИЕ РЕЙТИНГОВОЙ СИСТЕМЫ
        print("\n🗑️ Удаление рейтинговой системы...")
        
        # Удаляем поле rating из game_templates
        await conn.execute("ALTER TABLE game_templates DROP COLUMN IF EXISTS rating")
        print("   ✅ Поле 'rating' удалено")
        
        # Удаляем поле usage_count из game_templates  
        await conn.execute("ALTER TABLE game_templates DROP COLUMN IF EXISTS usage_count")
        print("   ✅ Поле 'usage_count' удалено")
        
        # Удаляем таблицу template_ratings полностью
        await conn.execute("DROP TABLE IF EXISTS template_ratings CASCADE")
        print("   ✅ Таблица 'template_ratings' удалена")
        
        # Удаляем индексы связанные с рейтингами
        await conn.execute("DROP INDEX IF EXISTS idx_game_templates_rating_usage")
        await conn.execute("DROP INDEX IF EXISTS idx_game_templates_rating")
        print("   ✅ Индексы рейтингов удалены")
        
        # 2. ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ШАБЛОНОВ КОЛХОЗА
        print("\n🔄 Обновление существующих шаблонов Колхоза...")
        
        # Обновляем существующий шаблон "Колхоз стандартный"
        kolkhoz_standard_rules = {
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
        
        kolkhoz_standard_settings = {
            "ui_theme": "classic",
            "show_points_counter": True,
            "show_running_total": True,
            "enable_point_calculation": True,
            "show_foul_warnings": True,
            "show_payment_direction": True
        }
        
        await conn.execute("""
            UPDATE game_templates 
            SET rules = $1, settings = $2, description = $3
            WHERE name = $4
        """, json.dumps(kolkhoz_standard_rules), json.dumps(kolkhoz_standard_settings), 
        'Классическая русская игра Колхоз. Игра до последнего шара. 50₽ за очко',
        'Колхоз стандартный (50₽ за очко)')
        print("   ✅ Колхоз стандартный обновлен")
        
        # Обновляем существующий шаблон "Колхоз бюджетный"
        kolkhoz_budget_rules = {
            "game_type": "kolkhoz",
            "max_players": 4,
            "min_players": 2,
            "balls_total": 15,
            "point_value_rubles": 25,
            "queue_algorithm": "random_no_repeat",
            "winning_condition": "last_ball_remaining",
            "game_rules": {
                "description": "Бюджетная версия игры Колхоз для начинающих",
                "ball_counting": "point_based",
                "foul_penalty_points": -1,
                "foul_penalty_description": "Штраф за фол: -1 очко (25₽ при стоимости очка 25₽)",
                "payment_direction": "clockwise",
                "calculate_net_result": True
            }
        }
        
        kolkhoz_budget_settings = {
            "ui_theme": "modern",
            "show_points_counter": True,
            "show_running_total": True,
            "enable_point_calculation": True,
            "show_foul_warnings": True,
            "show_payment_direction": True
        }
        
        await conn.execute("""
            UPDATE game_templates 
            SET rules = $1, settings = $2, description = $3
            WHERE name = $4
        """, json.dumps(kolkhoz_budget_rules), json.dumps(kolkhoz_budget_settings),
        'Бюджетная версия игры Колхоз для начинающих. 25₽ за очко',
        'Колхоз бюджетный (25₽ за очко)')
        print("   ✅ Колхоз бюджетный обновлен")
        
        # Обновляем существующий шаблон "Колхоз премиум"
        kolkhoz_premium_rules = {
            "game_type": "kolkhoz",
            "max_players": 6,
            "min_players": 2,
            "balls_total": 15,
            "point_value_rubles": 200,
            "time_limit_minutes": 30,
            "queue_algorithm": "random_no_repeat",
            "winning_condition": "last_ball_remaining",
            "game_rules": {
                "description": "Премиум версия игры Колхоз с высокими ставками",
                "ball_counting": "point_based",
                "foul_penalty_points": -1,
                "foul_penalty_description": "Штраф за фол: -1 очко (200₽ при стоимости очка 200₽)",
                "payment_direction": "clockwise",
                "calculate_net_result": True
            }
        }
        
        kolkhoz_premium_settings = {
            "ui_theme": "premium",
            "show_points_counter": True,
            "show_running_total": True,
            "enable_point_calculation": True,
            "show_foul_warnings": True,
            "show_payment_direction": True,
            "require_confirmation": True,
            "show_money_warnings": True,
            "enable_advanced_stats": True
        }
        
        await conn.execute("""
            UPDATE game_templates 
            SET rules = $1, settings = $2, description = $3
            WHERE name = $4
        """, json.dumps(kolkhoz_premium_rules), json.dumps(kolkhoz_premium_settings),
        'Премиум версия игры Колхоз с высокими ставками. 200₽ за очко',
        'Колхоз премиум (200₽ за очко)')
        print("   ✅ Колхоз премиум обновлен")
        
        # 3. СОЗДАНИЕ НОВЫХ СИСТЕМНЫХ ШАБЛОНОВ
        print("\n🆕 Создание новых системных шаблонов...")
        
        # Шаблон: Американка
        americana_rules = {
            "game_type": "americana",
            "max_players": 2,
            "min_players": 2,
            "balls_total": 16,
            "balls_to_win": 8,
            "game_price_rubles": 500,
            "queue_algorithm": "random_no_repeat",
            "winning_condition": "first_to_8_balls",
            "game_rules": {
                "description": "Игра до 8 шаров. Выигрывает тот, кто первым забьет 8 шаров",
                "ball_counting": "simple_count",
                "no_color_values": True
            }
        }
        
        americana_settings = {
            "ui_theme": "classic",
            "show_ball_counter": True,
            "show_game_progress": True,
            "enable_simple_scoring": True,
            "show_winning_condition": True
        }
        
        await conn.execute("""
            INSERT INTO game_templates (id, creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        """, 
        str(uuid.uuid4()),
        '00000000-0000-0000-0000-000000000000',
        'Американка (500₽ за партию)',
        'Русский бильярд. Игра до 8 шаров. Выигрывает тот, кто первым забьет 8 шаров',
        'americana',
        json.dumps(americana_rules),
        json.dumps(americana_settings),
        2, True, True, json.dumps(["американка", "русский бильярд", "до 8 шаров"]))
        print("   ✅ Американка создана")
        
        # Шаблон: Московская пирамида
        moscow_pyramid_rules = {
            "game_type": "moscow_pyramid",
            "max_players": 2,
            "min_players": 2,
            "balls_total": 16,
            "balls_to_win": 8,
            "game_price_rubles": 1000,
            "queue_algorithm": "random_no_repeat",
            "winning_condition": "first_to_8_balls",
            "game_rules": {
                "description": "Московская пирамида. Игра одним желтым шаром до 8. Всего 16 шаров",
                "ball_counting": "simple_count",
                "no_color_values": True,
                "special_rule": "yellow_ball_only",
                "yellow_ball_description": "Игра ведется одним желтым шаром"
            }
        }
        
        moscow_pyramid_settings = {
            "ui_theme": "classic",
            "show_ball_counter": True,
            "show_game_progress": True,
            "enable_simple_scoring": True,
            "show_winning_condition": True,
            "highlight_yellow_ball": True,
            "show_yellow_ball_rule": True
        }
        
        await conn.execute("""
            INSERT INTO game_templates (id, creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        """,
        str(uuid.uuid4()),
        '00000000-0000-0000-0000-000000000000',
        'Московская пирамида (1000₽ за партию)',
        'Московская пирамида. Игра одним желтым шаром до 8. Всего 16 шаров',
        'moscow_pyramid',
        json.dumps(moscow_pyramid_rules),
        json.dumps(moscow_pyramid_settings),
        2, True, True, json.dumps(["московская пирамида", "желтый шар", "до 8 шаров"]))
        print("   ✅ Московская пирамида создана")
        
        # 4. ПРОВЕРКА РЕЗУЛЬТАТА
        print("\n🔍 Проверка результата...")
        
        # Показываем все системные шаблоны
        templates = await conn.fetch("""
            SELECT id, name, game_type, category_id, is_system, created_at
            FROM game_templates 
            WHERE is_system = true 
            ORDER BY category_id, name
        """)
        
        print(f"   📊 Найдено {len(templates)} системных шаблонов:")
        for template in templates:
            print(f"      • {template['name']} ({template['game_type']}) - Категория {template['category_id']}")
        
        print("\n🎉 Обновление системных шаблонов завершено успешно!")
        
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        raise
    finally:
        await conn.close()
        print("🔌 Соединение с БД закрыто")

if __name__ == "__main__":
    asyncio.run(update_system_templates())

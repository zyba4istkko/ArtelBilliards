-- Template Service: Обновление системных шаблонов
-- Удаление рейтинговой системы и создание новых базовых шаблонов

-- 1. УДАЛЕНИЕ РЕЙТИНГОВОЙ СИСТЕМЫ

-- Удаляем поле rating из game_templates
ALTER TABLE game_templates DROP COLUMN IF EXISTS rating;

-- Удаляем поле usage_count из game_templates  
ALTER TABLE game_templates DROP COLUMN IF EXISTS usage_count;

-- Удаляем таблицу template_ratings полностью
DROP TABLE IF EXISTS template_ratings CASCADE;

-- Удаляем индексы связанные с рейтингами
DROP INDEX IF EXISTS idx_game_templates_rating_usage;
DROP INDEX IF EXISTS idx_game_templates_rating;

-- 2. ОБНОВЛЕНИЕ СУЩЕСТВУЮЩИХ ШАБЛОНОВ КОЛХОЗА

-- Обновляем существующий шаблон "Колхоз стандартный"
UPDATE game_templates 
SET 
    rules = '{"game_type": "kolkhoz", "max_players": 6, "min_players": 2, "balls_total": 15, "point_value_rubles": 50, "queue_algorithm": "random_no_repeat", "winning_condition": "last_ball_remaining", "game_rules": {"description": "Классическая русская игра Колхоз. Игра до последнего шара", "ball_counting": "point_based", "foul_penalty_points": -1, "foul_penalty_description": "Штраф за фол: -1 очко (50₽ при стоимости очка 50₽)", "payment_direction": "clockwise", "calculate_net_result": true}}'::jsonb,
    settings = '{"ui_theme": "classic", "show_points_counter": true, "show_running_total": true, "enable_point_calculation": true, "show_foul_warnings": true, "show_payment_direction": true}'::jsonb,
    description = 'Классическая русская игра Колхоз. Игра до последнего шара. 50₽ за очко'
WHERE name = 'Колхоз стандартный (50₽ за очко)';

-- Обновляем существующий шаблон "Колхоз бюджетный"  
UPDATE game_templates 
SET 
    rules = '{"game_type": "kolkhoz", "max_players": 4, "min_players": 2, "balls_total": 15, "point_value_rubles": 25, "queue_algorithm": "random_no_repeat", "winning_condition": "last_ball_remaining", "game_rules": {"description": "Бюджетная версия игры Колхоз для начинающих", "ball_counting": "point_based", "foul_penalty_points": -1, "foul_penalty_description": "Штраф за фол: -1 очко (25₽ при стоимости очка 25₽)", "payment_direction": "clockwise", "calculate_net_result": true}}'::jsonb,
    settings = '{"ui_theme": "modern", "show_points_counter": true, "show_running_total": true, "enable_point_calculation": true, "show_foul_warnings": true, "show_payment_direction": true}'::jsonb,
    description = 'Бюджетная версия игры Колхоз для начинающих. 25₽ за очко'
WHERE name = 'Колхоз бюджетный (25₽ за очко)';

-- Обновляем существующий шаблон "Колхоз премиум"
UPDATE game_templates 
SET 
    rules = '{"game_type": "kolkhoz", "max_players": 6, "min_players": 2, "balls_total": 15, "point_value_rubles": 200, "time_limit_minutes": 30, "queue_algorithm": "random_no_repeat", "winning_condition": "last_ball_remaining", "game_rules": {"description": "Премиум версия игры Колхоз с высокими ставками", "ball_counting": "point_based", "foul_penalty_points": -1, "foul_penalty_description": "Штраф за фол: -1 очко (200₽ при стоимости очка 200₽)", "payment_direction": "clockwise", "calculate_net_result": true}}'::jsonb,
    settings = '{"ui_theme": "premium", "show_points_counter": true, "show_running_total": true, "enable_point_calculation": true, "show_foul_warnings": true, "show_payment_direction": true, "require_confirmation": true, "show_money_warnings": true, "enable_advanced_stats": true}'::jsonb,
    description = 'Премиум версия игры Колхоз с высокими ставками. 200₽ за очко'
WHERE name = 'Колхоз премиум (200₽ за очко)';

-- 3. СОЗДАНИЕ НОВЫХ СИСТЕМНЫХ ШАБЛОНОВ

-- Шаблон: Американка
INSERT INTO game_templates (creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags) VALUES
(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Американка (500₽ за партию)',
    'Русский бильярд. Игра до 8 шаров. Выигрывает тот, кто первым забьет 8 шаров',
    'americana',
    '{"game_type": "americana", "max_players": 2, "min_players": 2, "balls_total": 16, "balls_to_win": 8, "game_price_rubles": 500, "queue_algorithm": "random_no_repeat", "winning_condition": "first_to_8_balls", "game_rules": {"description": "Игра до 8 шаров. Выигрывает тот, кто первым забьет 8 шаров", "ball_counting": "simple_count", "no_color_values": true}}'::jsonb,
    '{"ui_theme": "classic", "show_ball_counter": true, "show_game_progress": true, "enable_simple_scoring": true, "show_winning_condition": true}'::jsonb,
    2,
    true,
    true,
    '["американка", "русский бильярд", "до 8 шаров"]'::jsonb
);

-- Шаблон: Московская пирамида
INSERT INTO game_templates (creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags) VALUES
(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Московская пирамида (1000₽ за партию)',
    'Московская пирамида. Игра одним желтым шаром до 8. Всего 16 шаров',
    'moscow_pyramid',
    '{"game_type": "moscow_pyramid", "max_players": 2, "min_players": 2, "balls_total": 16, "balls_to_win": 8, "game_price_rubles": 1000, "queue_algorithm": "random_no_repeat", "winning_condition": "first_to_8_balls", "game_rules": {"description": "Московская пирамида. Игра одним желтым шаром до 8. Всего 16 шаров", "ball_counting": "simple_count", "no_color_values": true, "special_rule": "yellow_ball_only", "yellow_ball_description": "Игра ведется одним желтым шаром"}}'::jsonb,
    '{"ui_theme": "classic", "show_ball_counter": true, "show_game_progress": true, "enable_simple_scoring": true, "show_winning_condition": true, "highlight_yellow_ball": true, "show_yellow_ball_rule": true}'::jsonb,
    3,
    true,
    true,
    '["московская пирамида", "желтый шар", "до 8 шаров"]'::jsonb
);

-- 4. ПРОВЕРКА РЕЗУЛЬТАТА

-- Показываем все системные шаблоны
SELECT 
    id,
    name,
    game_type,
    category_id,
    is_system,
    created_at
FROM game_templates 
WHERE is_system = true 
ORDER BY category_id, name;

-- Показываем структуру таблицы (без рейтингов)
\d game_templates;

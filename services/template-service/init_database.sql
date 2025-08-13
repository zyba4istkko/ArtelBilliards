-- Template Service Database Initialization Script
-- This script creates all necessary tables and initial data

-- Create template_categories table
CREATE TABLE IF NOT EXISTS template_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create game_templates table
CREATE TABLE IF NOT EXISTS game_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_user_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    game_type VARCHAR(50) NOT NULL,
    rules JSONB NOT NULL,
    settings JSONB,
    category_id INTEGER NOT NULL REFERENCES template_categories(id),
    is_public BOOLEAN DEFAULT TRUE,
    is_system BOOLEAN DEFAULT FALSE,
    tags JSONB DEFAULT '[]',
    usage_count INTEGER DEFAULT 0,
    rating FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create template_ratings table
CREATE TABLE IF NOT EXISTS template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES game_templates(id),
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, user_id)
);

-- Create template_favorites table
CREATE TABLE IF NOT EXISTS template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES game_templates(id),
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_game_templates_game_type_public ON game_templates(game_type, is_public);
CREATE INDEX IF NOT EXISTS idx_game_templates_creator_public ON game_templates(creator_user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_game_templates_rating_usage ON game_templates(rating, usage_count);
CREATE INDEX IF NOT EXISTS idx_game_templates_creator_user_id ON game_templates(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_game_templates_game_type ON game_templates(game_type);
CREATE INDEX IF NOT EXISTS idx_game_templates_is_public ON game_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_game_templates_is_system ON game_templates(is_system);
CREATE INDEX IF NOT EXISTS idx_game_templates_usage_count ON game_templates(usage_count);
CREATE INDEX IF NOT EXISTS idx_game_templates_rating ON game_templates(rating);
CREATE INDEX IF NOT EXISTS idx_template_ratings_user_id ON template_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_template_favorites_user_id ON template_favorites(user_id);

-- Insert initial categories
INSERT INTO template_categories (id, name, description, sort_order) VALUES
(1, 'Колхоз', 'Шаблоны для игры Колхоз', 1),
(2, 'Американка', 'Шаблоны для Американки', 2),
(3, 'Московская пирамида', 'Шаблоны для Московской пирамиды', 3),
(4, 'Турниры', 'Шаблоны для турнирных игр', 4),
(5, 'Обучение', 'Упрощенные шаблоны для новичков', 5),
(6, 'Пользовательские', 'Созданные пользователями', 6)
ON CONFLICT (id) DO NOTHING;

-- Insert initial system templates
INSERT INTO game_templates (creator_user_id, name, description, game_type, rules, settings, category_id, is_public, is_system, tags, usage_count, rating) VALUES
(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Колхоз стандартный (50₽ за очко)',
    'Стандартные правила игры Колхоз с оплатой 50 рублей за очко',
    'kolkhoz',
    '{"game_type": "kolkhoz", "max_players": 6, "min_players": 2, "point_value_rubles": 50.00, "balls": [{"color": "white", "points": 1, "order_priority": 1, "is_required": true}, {"color": "yellow", "points": 2, "order_priority": 2, "is_required": true}, {"color": "green", "points": 3, "order_priority": 3, "is_required": true}, {"color": "brown", "points": 4, "order_priority": 4, "is_required": true}, {"color": "blue", "points": 5, "order_priority": 5, "is_required": true}, {"color": "pink", "points": 6, "order_priority": 6, "is_required": true}, {"color": "black", "points": 7, "order_priority": 7, "is_required": true}], "payment_direction": "clockwise", "allow_queue_change": true, "queue_algorithm": "random_no_repeat", "calculate_net_result": true}'::jsonb,
    '{"ui_theme": "classic", "show_running_total": true, "enable_sound_effects": true, "auto_calculate_results": true}'::jsonb,
    1,
    true,
    true,
    '["стандарт", "колхоз", "средний"]'::jsonb,
    1250,
    4.8
),
(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Колхоз бюджетный (25₽ за очко)',
    'Бюджетный вариант игры Колхоз для начинающих',
    'kolkhoz',
    '{"game_type": "kolkhoz", "max_players": 4, "min_players": 2, "point_value_rubles": 25.00, "balls": [{"color": "white", "points": 1, "order_priority": 1, "is_required": true}, {"color": "yellow", "points": 2, "order_priority": 2, "is_required": true}, {"color": "green", "points": 3, "order_priority": 3, "is_required": true}, {"color": "pink", "points": 4, "order_priority": 4, "is_required": true}], "payment_direction": "clockwise", "allow_queue_change": true, "queue_algorithm": "always_random", "calculate_net_result": true}'::jsonb,
    '{"ui_theme": "modern", "show_running_total": true, "enable_tutorials": true}'::jsonb,
    1,
    true,
    true,
    '["бюджет", "колхоз", "новички"]'::jsonb,
    890,
    4.5
),
(
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Колхоз премиум (200₽ за очко)',
    'Премиум версия игры Колхоз с высокими ставками',
    'kolkhoz',
    '{"game_type": "kolkhoz", "max_players": 6, "min_players": 2, "point_value_rubles": 200.00, "time_limit_minutes": 30, "balls": [{"color": "white", "points": 1, "order_priority": 1, "is_required": true}, {"color": "yellow", "points": 2, "order_priority": 2, "is_required": true}, {"color": "green", "points": 3, "order_priority": 3, "is_required": true}, {"color": "brown", "points": 4, "order_priority": 4, "is_required": true}, {"color": "blue", "points": 5, "order_priority": 5, "is_required": true}, {"color": "pink", "points": 6, "order_priority": 6, "is_required": true}, {"color": "black", "points": 7, "order_priority": 7, "is_required": true}], "payment_direction": "clockwise", "allow_queue_change": true, "queue_algorithm": "random_no_repeat", "calculate_net_result": true}'::jsonb,
    '{"ui_theme": "premium", "show_running_total": true, "require_confirmation": true, "show_money_warnings": true, "enable_advanced_stats": true}'::jsonb,
    1,
    true,
    true,
    '["премиум", "колхоз", "высокие ставки"]'::jsonb,
    450,
    4.9
)
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_template_categories_updated_at BEFORE UPDATE ON template_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_templates_updated_at BEFORE UPDATE ON game_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_template_ratings_updated_at BEFORE UPDATE ON template_ratings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Template Service Database Initialization
-- This script creates the necessary tables and initial data

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
    template_id UUID NOT NULL REFERENCES game_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create template_favorites table
CREATE TABLE IF NOT EXISTS template_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES game_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_templates_game_type_public ON game_templates(game_type, is_public);
CREATE INDEX IF NOT EXISTS idx_game_templates_creator_public ON game_templates(creator_user_id, is_public);
CREATE INDEX IF NOT EXISTS idx_game_templates_rating_usage ON game_templates(rating, usage_count);
CREATE INDEX IF NOT EXISTS idx_template_ratings_template_user ON template_ratings(template_id, user_id);
CREATE INDEX IF NOT EXISTS idx_template_ratings_user ON template_ratings(user_id);

-- Insert initial category
INSERT INTO template_categories (id, name, description, sort_order) 
VALUES (1, 'Колхоз', 'Шаблоны для игры Колхоз', 1)
ON CONFLICT (id) DO NOTHING;

-- Insert initial template for Kolhoz
INSERT INTO game_templates (
    id, 
    creator_user_id, 
    name, 
    description, 
    game_type, 
    rules, 
    settings, 
    category_id, 
    is_public, 
    is_system, 
    tags, 
    usage_count, 
    rating
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::UUID,
    'Колхоз стандартный (50₽ за очко)',
    'Стандартные правила игры Колхоз с оплатой 50 рублей за очко',
    'kolkhoz',
    '{
        "game_type": "kolkhoz",
        "max_players": 4,
        "min_players": 2,
        "point_value_rubles": 50,
        "time_limit_minutes": 60,
        "balls": [
            {"color": "white", "points": 0, "is_required": true, "order_priority": 0},
            {"color": "yellow", "points": 2, "is_required": true, "order_priority": 1},
            {"color": "red", "points": 3, "is_required": true, "order_priority": 2},
            {"color": "green", "points": 4, "is_required": true, "order_priority": 3},
            {"color": "brown", "points": 5, "is_required": true, "order_priority": 4},
            {"color": "blue", "points": 6, "is_required": true, "order_priority": 5},
            {"color": "pink", "points": 7, "is_required": true, "order_priority": 6},
            {"color": "black", "points": 8, "is_required": true, "order_priority": 7}
        ],
        "queue_algorithm": "always_random",
        "advanced_settings": {
            "allow_queue_change": true,
            "calculate_net_result": true,
            "payment_direction": "loser_pays_winner"
        }
    }'::JSONB,
    '{
        "ui_theme": "default",
        "show_timer": true,
        "show_points": true,
        "show_ball_order": true
    }'::JSONB,
    1,
    TRUE,
    TRUE,
    '["стандарт", "колхоз", "средний"]'::JSONB,
    1250,
    4.8
) ON CONFLICT DO NOTHING;

-- Create function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_template_categories_updated_at 
    BEFORE UPDATE ON template_categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_templates_updated_at 
    BEFORE UPDATE ON game_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_ratings_updated_at 
    BEFORE UPDATE ON template_ratings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

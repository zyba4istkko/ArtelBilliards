-- Создание тестовой сессии
INSERT INTO game_sessions (
    id, 
    creator_user_id, 
    game_type_id, 
    template_id, 
    name, 
    status, 
    max_players, 
    current_players_count, 
    rules, 
    created_at, 
    updated_at
) VALUES (
    gen_random_uuid(), 
    '908042b2-db74-4241-bf29-2c55e8e0235f', 
    1, 
    '944ac875-b53c-44ae-84ff-0eb71a63625c', 
    'Тестовая сессия', 
    'waiting', 
    8, 
    1, 
    '{"point_value_rubles": 50.0}', 
    NOW(), 
    NOW()
) RETURNING id;

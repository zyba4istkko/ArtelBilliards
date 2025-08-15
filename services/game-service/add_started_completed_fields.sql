-- Добавление полей started_at и completed_at в таблицу game_sessions
-- Выполняется вручную для обновления существующей схемы

-- Добавляем поле started_at (когда сессия началась - первая игра)
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Добавляем поле completed_at (когда сессия завершилась)
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;

-- Обновляем существующие записи: устанавливаем started_at = created_at для сессий со статусом 'in_progress'
UPDATE game_sessions 
SET started_at = created_at 
WHERE status = 'in_progress' AND started_at IS NULL;

-- Обновляем существующие записи: устанавливаем completed_at = updated_at для сессий со статусом 'completed'
UPDATE game_sessions 
SET completed_at = updated_at 
WHERE status = 'completed' AND completed_at IS NULL;

-- Проверяем результат
SELECT 
    id, 
    name, 
    status, 
    created_at, 
    started_at, 
    completed_at, 
    updated_at
FROM game_sessions 
ORDER BY created_at DESC 
LIMIT 5;

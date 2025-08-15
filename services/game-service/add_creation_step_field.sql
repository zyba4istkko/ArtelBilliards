-- Добавление поля creation_step в таблицу game_sessions
-- Выполняется вручную для обновления существующей схемы

-- Добавляем поле creation_step (шаг создания сессии 1-3)
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS creation_step INTEGER DEFAULT 1;

-- Обновляем существующие записи: устанавливаем creation_step = 1 для всех сессий
UPDATE game_sessions 
SET creation_step = 1 
WHERE creation_step IS NULL;

-- Проверяем результат
SELECT 
    id, 
    name, 
    status, 
    creation_step,
    created_at, 
    started_at, 
    completed_at, 
    updated_at
FROM game_sessions 
ORDER BY created_at DESC 
LIMIT 5;

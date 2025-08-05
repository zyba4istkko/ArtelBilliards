-- Инициализация баз данных для микросервисной архитектуры Artel Billiards
-- Этот скрипт создает отдельные базы данных для каждого микросервиса

-- Создание баз данных
CREATE DATABASE auth_db;
CREATE DATABASE game_db; 
CREATE DATABASE template_db;
CREATE DATABASE stats_db;
CREATE DATABASE friends_db;
CREATE DATABASE notification_db;

-- Создание пользователей для каждого сервиса (опционально для продакшена)
-- В development режиме используем общего пользователя postgres

-- Выдача прав доступа
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE game_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE template_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE stats_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE friends_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE notification_db TO postgres;

-- Подключение к каждой базе и создание расширений
\c auth_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c game_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c template_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c stats_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c friends_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Для поиска пользователей

\c notification_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Возвращаемся к основной базе
\c artel_billiards;

-- Сообщение об успешной инициализации
SELECT 'Microservices databases initialized successfully!' as status;
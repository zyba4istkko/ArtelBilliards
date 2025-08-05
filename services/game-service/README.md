# Game Service

Микросервис управления играми и игровыми сессиями для Artel Billiards.

## Функциональность

### 🎮 Основные возможности
- **Управление сессиями**: Создание, присоединение, настройка игровых сессий
- **Игровая логика**: Создание игр, обработка событий, подсчет очков
- **Система очередей**: Алгоритмы генерации справедливых очередей игроков
- **"Колхоз" логика**: Специальная логика подсчета результатов для игры "Колхоз"
- **Реал-тайм события**: Обработка игровых событий в реальном времени

### 🎯 Типы игр
- **Americana**: Классическая американская пирамида
- **Moscow Pyramid**: Московская пирамида
- **Kolkhoz**: Игра с уникальной системой расчетов

### 🔄 Алгоритмы очередей
- **Always Random**: Всегда случайная очередь
- **Random No Repeat**: Случайная без повторения последних комбинаций
- **Manual**: Ручная настройка очереди

## API Endpoints

### Sessions API (`/api/v1/sessions`)
```
POST   /sessions                    # Создание сессии
GET    /sessions                    # Список сессий пользователя
GET    /sessions/{id}               # Детали сессии
POST   /sessions/{id}/join          # Присоединение к сессии
POST   /sessions/{id}/leave         # Покидание сессии
POST   /sessions/{id}/invite        # Приглашение игрока
```

### Games API (`/api/v1/games`)
```
POST   /sessions/{id}/games         # Создание игры
GET    /sessions/{id}/games         # Список игр сессии
GET    /games/{id}                  # Детали игры
POST   /games/{id}/events           # Добавление события
GET    /games/{id}/events           # История событий
GET    /games/{id}/scores           # Текущие счета
POST   /games/{id}/end              # Завершение игры
```

### Health API
```
GET    /health                      # Health check
GET    /health/ready               # Readiness check
GET    /health/live                # Liveness check
```

## Схема базы данных

### Основные таблицы
- `game_types` - Типы игр (справочник)
- `game_sessions` - Игровые сессии
- `session_participants` - Участники сессий
- `games` - Отдельные игры в сессии
- `game_events` - События в играх
- `game_results` - Результаты игроков (для "Колхоз")

### Особенности схемы
- **UUID** для всех primary keys
- **JSONB** для гибкого хранения правил и данных
- **Индексы** для оптимизации производительности
- **Cascading deletes** для автоматической очистки

## Технологии

- **Python 3.13** - Язык программирования
- **FastAPI** - Web framework
- **PostgreSQL** - База данных
- **SQLAlchemy** - ORM
- **Alembic** - Миграции БД
- **Pydantic** - Валидация данных
- **Redis** - Кеширование (планируется)
- **RabbitMQ** - Асинхронные задачи (планируется)

## Развертывание

### Docker
```bash
# Сборка
docker build -t game-service .

# Запуск
docker run -p 8002:8002 game-service
```

### Development
```bash
# Установка зависимостей
pip install -r requirements.txt

# Запуск
uvicorn src.main:app --reload --port 8002
```

## Конфигурация

### Переменные окружения
```env
DATABASE_URL=postgresql://user:pass@host:5432/game_db
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672
JWT_SECRET_KEY=your-secret-key
SERVICE_PORT=8002
ENVIRONMENT=development
DEBUG=true
```

## Интеграция

### С другими сервисами
- **Auth Service**: Проверка JWT токенов, получение информации о пользователях
- **Template Service**: Получение шаблонов игр и правил
- **API Gateway**: Проксирование запросов и маршрутизация

### События RabbitMQ
- `game.session.created` - Сессия создана
- `game.session.joined` - Игрок присоединился
- `game.game.started` - Игра начата
- `game.event.occurred` - Игровое событие
- `game.game.ended` - Игра завершена

## Статус разработки

✅ **Завершено**:
- Базовая архитектура и структура
- Модели базы данных
- API endpoints для сессий и игр
- Логика игры "Колхоз"
- Алгоритмы генерации очередей
- Health checks

🚧 **В разработке**:
- Интеграция с Auth Service
- RabbitMQ события
- Redis кеширование
- Расширенная валидация
- Unit тесты

📋 **Планируется**:
- WebSocket для реал-тайм обновлений
- Аналитика и статистика
- Система рейтингов
- Расширенные игровые режимы
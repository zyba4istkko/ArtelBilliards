# 🎮 API Integration - Game Service

## 📋 Обзор

Реализована интеграция с backend API для создания игр и управления очередностью игроков согласно алгоритмам:
- **Always Random** - случайная очередь для каждой игры
- **Random No Repeat** - случайная без повторения последних комбинаций (РЕКОМЕНДУЕМЫЙ)
- **Manual** - ручная настройка очереди

## 🏗️ Архитектура

### Backend (Game Service)

#### 1. Алгоритмы очередности (`queue_algorithms.py`)
- `generate_always_random_queue()` - простая случайность
- `generate_random_no_repeat_queue()` - без повторений с историей
- `generate_manual_queue()` - пользовательский порядок

#### 2. Модели БД
- `Game` - отдельные игры в сессии
- `GameQueue` - история очередностей (только для random_no_repeat)
- Обновленная `GameSession` с полем `current_game_id`

#### 3. API Endpoints
```
POST /api/v1/sessions/{session_id}/games - Создать игру
GET /api/v1/sessions/{session_id}/active-game - Получить активную игру
POST /api/v1/games/{game_id}/end - Завершить игру
```

### Frontend (React App)

#### 1. API Services
- `gameService.createGame()` - создание игры
- `gameService.getActiveGame()` - получение активной игры
- `gameService.completeGame()` - завершение игры

#### 2. ActiveGamePage Integration
- Автоматическое создание игры при загрузке страницы
- Отображение алгоритма очередности в заголовке
- Интеграция с API для завершения игры

## 🚀 Запуск и тестирование

### 1. Запуск Backend

```bash
cd services/game-service

# Установка зависимостей
pip install -r requirements.txt

# Применение миграций
alembic upgrade head

# Запуск сервиса
uvicorn src.main:app --reload --port 8002
```

### 2. Запуск Frontend

```bash
cd react-app

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev
```

### 3. Тестирование API

#### Создание сессии
```bash
curl -X POST "http://localhost:8002/api/v1/sessions/" \
  -H "Content-Type: application/json" \
  -d '{
    "game_type_id": 1,
    "name": "Test Session",
    "max_players": 4,
    "rules": {
      "point_value_rubles": 100,
      "queue_algorithm": "random_no_repeat"
    }
  }'
```

#### Создание игры
```bash
curl -X POST "http://localhost:8002/api/v1/sessions/{session_id}/games" \
  -H "Content-Type: application/json" \
  -d '{
    "queue_algorithm": "random_no_repeat"
  }'
```

#### Получение активной игры
```bash
curl "http://localhost:8002/api/v1/sessions/{session_id}/active-game"
```

### 4. Тестирование алгоритмов

```bash
cd services/game-service
python -m pytest tests/test_queue_algorithms.py -v
```

## 🔧 Конфигурация

### Переменные окружения
```env
DATABASE_URL=postgresql://user:pass@host:5432/game_db
JWT_SECRET_KEY=your-secret-key
SERVICE_PORT=8002
ENVIRONMENT=development
DEBUG=true
```

### Настройки БД
- PostgreSQL 13+
- UUID для primary keys
- JSONB для гибких данных
- Индексы для оптимизации

## 📊 Логика алгоритмов

### Always Random
- Каждая игра = случайный порядок
- Может повторяться
- Простая реализация

### Random No Repeat (РЕКОМЕНДУЕМЫЙ)
- Циклическая смена без повторений
- Автоматический сброс истории при полном цикле
- Математика: N! перестановок для N игроков

**Пример для 3 игроков:**
- Игра 1: А→Б→В
- Игра 2: В→А→Б (не повторяет Игру 1)
- Игра 3: Б→В→А (не повторяет Игры 1-2)
- Игра 4: А→В→Б (не повторяет Игры 1-3)
- Игра 5: Б→А→В (не повторяет Игры 1-4)
- Игра 6: В→Б→А (не повторяет Игры 1-5)
- Игра 7: А→Б→В (сброс истории - повторение после 6 игр)

### Manual
- Пользовательский порядок
- Fallback к исходному порядку
- Поддержка частичного порядка

## 🎯 Следующие шаги

### 1. Реализация событий игры
- Создание таблицы `game_events`
- API для добавления событий (шары, штрафы)
- Загрузка существующих событий при инициализации

### 2. WebSocket интеграция
- Real-time обновления между игроками
- Синхронизация состояния игры
- Уведомления о событиях

### 3. Подсчет очков
- Реализация логики подсчета из событий
- Обновление API `/games/{id}/scores`
- Интеграция с frontend

### 4. Тестирование
- E2E тесты для полного flow
- Тесты производительности
- Тесты конкурентности

## 🐛 Известные проблемы

1. **Linter ошибки** в frontend - связаны с типами NextUI
2. **Stub реализации** для событий игры - требуют доработки
3. **Аутентификация** - заглушка, требует интеграции с Auth Service

## 📝 Логи

### Backend
```bash
# Создание игры
🎮 Session {session_id}: Создаем новую игру...

# Завершение цикла random_no_repeat
🔄 Session {session_id}: Завершен полный цикл из {N} игр. Начинаем новый цикл.
```

### Frontend
```bash
# Инициализация игры
🎮 Создаем новую игру в сессии...
✅ Игра создана: {game_data}
```

## 🤝 Интеграция с другими сервисами

- **Auth Service** - JWT токены, пользователи
- **Session Service** - управление сессиями
- **Template Service** - правила и настройки игр
- **Notification Service** - уведомления (планируется)

---

**Статус:** ✅ Основная интеграция завершена  
**Версия:** 1.0.0  
**Дата:** 2024-08-15

# 🔧 ТЕХНИЧЕСКИЙ КОНТЕКСТ - Artel Billiards

**Дата создания:** 15.08.2025  
**Версия:** 1.0  

---

## 🏗️ АРХИТЕКТУРА СИСТЕМЫ

### Общая схема
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway   │    │   Game Service  │
│   (Frontend)    │◄──►│   (Nginx)       │◄──►│   (FastAPI)     │
│   Port: 5173    │    │   Port: 8000    │    │   Port: 8002    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │  Auth Service   │    │   PostgreSQL    │
                       │   (FastAPI)     │    │   (Database)    │
                       │   Port: 8001    │    │   Port: 5432    │
                       └─────────────────┘    └─────────────────┘
```

### Компоненты
1. **Frontend (React App)**
   - React 18+ с TypeScript
   - Material-UI для компонентов
   - Tailwind CSS для стилизации
   - React Router для навигации

2. **API Gateway (Nginx)**
   - Проксирование запросов
   - Балансировка нагрузки
   - SSL termination (в продакшене)

3. **Game Service (FastAPI)**
   - Управление игровыми сессиями
   - Логика игры и правил
   - Интеграция с базой данных

4. **Auth Service (FastAPI)**
   - Аутентификация пользователей
   - Управление сессиями
   - JWT токены

5. **Database (PostgreSQL)**
   - Основные данные приложения
   - Пользователи, сессии, игроки

---

## 🗄️ СТРУКТУРА БАЗЫ ДАННЫХ

### Основные таблицы

#### `users` (auth_db)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `game_sessions` (game_db)
```sql
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY,
    creator_user_id UUID NOT NULL,
    game_type_id INTEGER NOT NULL,
    template_id UUID,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting',
    max_players INTEGER DEFAULT 8,
    current_players_count INTEGER DEFAULT 1,
    rules JSONB,
    creation_step INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `session_participants` (game_db)
```sql
CREATE TABLE session_participants (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID,
    display_name VARCHAR(100) NOT NULL,
    session_role VARCHAR(20) DEFAULT 'participant',
    is_empty_user BOOLEAN DEFAULT FALSE,
    queue_position INTEGER NOT NULL,
    current_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    can_modify_settings BOOLEAN DEFAULT FALSE,
    can_kick_players BOOLEAN DEFAULT FALSE,
    can_change_rules BOOLEAN DEFAULT FALSE,
    session_balance_rubles DECIMAL(10,2) DEFAULT 0.0,
    total_games_played INTEGER DEFAULT 0,
    total_balls_potted INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT NOW(),
    left_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API ENDPOINTS

### Game Service (Port: 8002)

#### Сессии
- `POST /api/v1/sessions` - Создание сессии
- `GET /api/v1/sessions/{session_id}` - Получение сессии
- `PUT /api/v1/sessions/{session_id}` - Обновление сессии
- `DELETE /api/v1/sessions/{session_id}` - Удаление сессии

#### Участники
- `GET /api/v1/sessions/{session_id}/players` - Получение участников
- `POST /api/v1/sessions/{session_id}/players` - Добавление игрока
- `DELETE /api/v1/sessions/{session_id}/participants/{participant_id}` - Удаление участника

#### Боты
- `POST /api/v1/sessions/{session_id}/bots` - Добавление бота

#### Шаблоны
- `GET /api/v1/templates` - Получение шаблонов игр

### Auth Service (Port: 8001)

#### Аутентификация
- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход в систему
- `GET /auth/me` - Информация о текущем пользователе

---

## 🐳 DOCKER КОНФИГУРАЦИЯ

### Основной compose файл
```yaml
# docker-compose.base.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: game_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  game-service:
    build: ./services/game-service
    ports:
      - "8002:8002"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/game_db

  auth-service:
    build: ./services/auth-service
    ports:
      - "8001:8001"
    depends_on:
      - postgres
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/auth_db

  api-gateway:
    image: nginx:alpine
    ports:
      - "8000:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - game-service
      - auth-service
```

### Файл разработки
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build: ./react-app
    ports:
      - "5173:5173"
    volumes:
      - ./react-app:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:8000

  postgres:
    environment:
      POSTGRES_DB: game_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

---

## 🔐 АУТЕНТИФИКАЦИЯ

### JWT токены
- **Алгоритм:** HS256
- **Время жизни:** 24 часа
- **Refresh токены:** Планируется

### Пароли
- **Хеширование:** bcrypt
- **Соль:** Автоматическая
- **Раунды:** 12

### Права доступа
- **Создатель сессии:** Полные права
- **Участник:** Ограниченные права
- **Гость:** Только просмотр

---

## 🎨 FRONTEND АРХИТЕКТУРА

### Основные технологии
- **React 18+** - основная библиотека для UI
- **TypeScript** - типизированный JavaScript
- **Vite** - сборщик и dev server
- **Tailwind CSS** - utility-first CSS фреймворк

### UI библиотеки компонентов
- **NextUI** - основная библиотека компонентов ✅
  - Современный дизайн и анимации
  - Полная поддержка TypeScript
  - Встроенная темная/светлая тема
  - Компоненты: Button, Card, Input, Select, Modal, Table, Pagination, Tabs, Accordion
  - Специальные компоненты: Autocomplete, DatePicker, TimeInput, Slider, Switch, Checkbox, Radio
  - Progress, Spinner, Skeleton для состояний загрузки

- **Material-UI (MUI)** - устаревшая библиотека (в процессе миграции)
  - Используется только в существующих компонентах
  - Планируется полное удаление после миграции на NextUI

### Стилизация
- **Design Tokens** - централизованная система CSS переменных
  - Цвета: primary (#41B3A3), secondary (#E27D60), accent (#E8A87C)
  - Типографика: Inter font family, размеры xs-4xl
  - Spacing: единая система отступов
- **CSS Variables** - кастомные CSS свойства для темизации
- **Responsive Design** - мобильная адаптация через Tailwind CSS

### State Management
- **React Hooks** - useState, useEffect, useContext
- **Zustand** - легковесное управление состоянием
- **React Query** - управление серверным состоянием и кэшированием

### Routing
- **React Router DOM** - навигация между страницами
- **Protected Routes** - защищенные маршруты для авторизованных пользователей

### Архитектурные решения
- **Компонентный подход** - функциональные компоненты с TypeScript
- **Разделение ответственности** - UI компоненты, страницы, сервисы
- **Lazy Loading** - динамическая загрузка компонентов
- **Error Boundaries** - обработка ошибок на уровне компонентов

### Планы развития
- **Полный переход на NextUI** - единая библиотека компонентов
- **Стандартизация дизайн-системы** - консистентный UI/UX
- **Оптимизация bundle size** - удаление дублирующих зависимостей
- **Улучшение производительности** - оптимизация рендеринга

---

## 🚀 ПРОИЗВОДИТЕЛЬНОСТЬ

### Оптимизации
1. **Frontend:**
   - Lazy loading компонентов
   - Memoization с React.memo
   - Оптимизация re-renders

2. **Backend:**
   - Асинхронные операции
   - Connection pooling
   - Кэширование запросов

3. **База данных:**
   - Индексы на ключевых полях
   - Оптимизация запросов
   - Партиционирование (планируется)

### Мониторинг
- **Метрики:** Время отклика, пропускная способность
- **Логи:** Структурированное логирование
- **Трейсинг:** Отслеживание запросов

---

## 🔧 ИНСТРУМЕНТЫ РАЗРАБОТКИ

### Frontend
- **Сборщик:** Vite
- **Линтер:** ESLint + Prettier
- **Тестирование:** Jest + React Testing Library (планируется)

### Backend
- **Линтер:** Black + isort
- **Тестирование:** pytest (планируется)
- **Документация:** FastAPI auto-docs

### DevOps
- **Контейнеризация:** Docker
- **Оркестрация:** Docker Compose
- **CI/CD:** GitHub Actions (планируется)

---

## 📊 МЕТРИКИ И МОНИТОРИНГ

### Ключевые показатели
- **Время отклика API:** < 100ms
- **Время загрузки страниц:** < 2s
- **Доступность:** 99.9%
- **Покрытие тестами:** Планируется

### Логирование
- **Уровни:** DEBUG, INFO, WARNING, ERROR
- **Формат:** Структурированный JSON
- **Хранение:** Docker logs + файлы

---

**Последнее обновление:** 15.08.2025  
**Версия:** 1.0  
**Статус:** Активный

### Ключевые компоненты
- **SessionCreationPage:** Создание и настройка сессий
- **PlayerManagement:** Управление игроками в сессии
- **SessionService:** Backend логика сессий
- **AuthService:** Управление пользователями
- **DashboardPage:** Главная страница с обзором активных сессий
- **ActiveGamesSection:** Компонент отображения активных игровых сессий

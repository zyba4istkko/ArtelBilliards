# 🔐 Auth Service

Микросервис аутентификации и авторизации для Artel Billiards.

## 🚀 Функциональность

### ✅ Реализовано:
- 🔑 **JWT аутентификация** с access/refresh токенами
- 📱 **Telegram Mini App** аутентификация  
- 🌐 **Google OAuth** аутентификация
- 👥 **Управление пользователями** и профилями
- 🛡️ **RBAC** (Role-Based Access Control)
- 📊 **Управление сессиями** (до 5 активных)
- 🔒 **Безопасность**: rate limiting, IP blocking
- 📝 **Логирование** всех событий аутентификации
- 🐰 **RabbitMQ** интеграция для событий
- 🏥 **Health checks** и мониторинг

## 🛠️ Технологический стек

- **Python**: 3.13
- **Framework**: FastAPI
- **Database**: PostgreSQL 17
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Auth**: JWT, OAuth 2.0
- **ORM**: SQLAlchemy 2.0 + Alembic
- **Testing**: pytest + asyncio
- **Containerization**: Docker

## 📁 Структура проекта

```
auth-service/
├── src/
│   ├── api/           # API endpoints
│   │   ├── auth.py    # Authentication endpoints
│   │   ├── users.py   # User management endpoints  
│   │   └── health.py  # Health check endpoints
│   ├── core/          # Core components
│   │   ├── config.py  # Configuration settings
│   │   ├── database.py # Database connection
│   │   └── security.py # JWT & security utils
│   ├── models/        # Data models
│   │   ├── database.py # SQLAlchemy models
│   │   └── schemas.py  # Pydantic schemas
│   ├── services/      # Business logic
│   │   ├── auth.py     # Auth service logic
│   │   ├── telegram.py # Telegram auth
│   │   ├── google.py   # Google OAuth
│   │   └── rabbitmq.py # Message queue
│   └── main.py        # FastAPI application
├── tests/             # Test files
├── alembic/           # Database migrations
├── Dockerfile         # Docker container
├── requirements.txt   # Python dependencies
├── alembic.ini       # Alembic configuration
└── pytest.ini       # Test configuration
```

## 🚀 Быстрый запуск

### 1. **Через Docker Compose (рекомендуется)**

```bash
# Запуск только Auth Service
docker-compose -f ../../docker-compose.base.yml -f ../../docker-compose.dev.yml up auth-service

# Проверка здоровья
curl http://localhost:8001/health
```

### 2. **Локальная разработка**

```bash
# Установка зависимостей
pip install -r requirements.txt

# Переменные окружения
export DATABASE_URL="postgresql://postgres:password@localhost:5432/auth_db"
export REDIS_URL="redis://localhost:6379"
export RABBITMQ_URL="amqp://admin:password@localhost:5672"
export JWT_SECRET_KEY="your-secret-key"

# Запуск сервиса
uvicorn src.main:app --host 0.0.0.0 --port 8001 --reload
```

## 📡 API Endpoints

### 🏥 Health Check
- `GET /health` - Базовая проверка
- `GET /health/ready` - Проверка зависимостей
- `GET /health/live` - Проверка живости

### 🔐 Authentication
- `POST /auth/telegram` - Telegram Mini App auth
- `POST /auth/google` - Google OAuth auth  
- `POST /auth/refresh` - Обновление токенов
- `POST /auth/logout` - Выход из системы
- `GET /auth/me` - Текущий пользователь

### 👥 User Management
- `GET /users/me` - Мой профиль
- `PUT /users/me` - Обновление профиля
- `GET /users/me/full` - Расширенный профиль
- `GET /users/me/sessions` - Мои сессии
- `DELETE /users/me/sessions/{id}` - Отзыв сессии
- `GET /users/` - Список пользователей (admin)
- `GET /users/{id}` - Пользователь по ID (admin)
- `PUT /users/{id}` - Обновление пользователя (admin)
- `DELETE /users/{id}` - Деактивация пользователя (admin)

## 🔧 Конфигурация

### Переменные окружения:

```bash
# Database
DATABASE_URL=postgresql://postgres:password@postgres:5432/auth_db

# Cache  
REDIS_URL=redis://redis:6379

# Message Queue
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672

# JWT Settings
JWT_SECRET_KEY=your-super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# OAuth Providers
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
MAX_ACTIVE_SESSIONS=5

# Environment
ENVIRONMENT=development
DEBUG=true
```

## 🧪 Тестирование

```bash
# Запуск всех тестов
pytest

# Тесты с покрытием
pytest --cov=src --cov-report=html

# Только unit тесты
pytest -m unit

# Только auth тесты  
pytest -m auth

# Быстрые тесты (исключить slow)
pytest -m "not slow"
```

## 📊 Мониторинг

### Prometheus метрики:
- Количество активных пользователей
- Частота аутентификации по провайдерам
- Ошибки аутентификации
- Время ответа API

### Health checks:
- Database connectivity
- Redis connectivity  
- RabbitMQ connectivity
- Service availability

## 🔒 Безопасность

### Реализованные меры:
- ✅ JWT токены с expiration
- ✅ Rate limiting по IP
- ✅ Автоблокировка после 5 неудачных попыток
- ✅ Валидация Telegram данных
- ✅ Безопасные HTTP заголовки
- ✅ Хеширование паролей (bcrypt)
- ✅ Session management с лимитами
- ✅ Логирование всех событий безопасности

### Рекомендации для продакшн:
- 🔐 Используйте сложные JWT секреты
- 🌐 Настройте HTTPS
- 🛡️ Настройте WAF
- 📊 Мониторинг подозрительной активности
- 🔄 Регулярное обновление зависимостей

## 🐰 RabbitMQ Events

### Публикуемые события:
- `user.registered` - Регистрация пользователя
- `auth.login_success` - Успешный вход
- `auth.login_failed` - Неудачная попытка входа
- `auth.logout` - Выход пользователя
- `auth.session_created` - Создание сессии
- `auth.session_revoked` - Отзыв сессии

## 🚨 Troubleshooting

### Типичные проблемы:

**1. Database connection failed**
```bash
# Проверьте что PostgreSQL запущен
docker exec artel_postgres pg_isready

# Проверьте DATABASE_URL
echo $DATABASE_URL
```

**2. JWT token invalid**
```bash
# Проверьте JWT_SECRET_KEY
# Убедитесь что время системы синхронизировано
```

**3. Telegram validation failed**
```bash
# Проверьте TELEGRAM_BOT_TOKEN
# Убедитесь что init_data не старше 1 часа
```

**4. RabbitMQ connection failed**
```bash
# Проверьте что RabbitMQ запущен  
curl http://localhost:15672
```

## 📚 Документация API

После запуска сервиса документация доступна по адресам:
- **Swagger UI**: http://localhost:8001/docs
- **ReDoc**: http://localhost:8001/redoc

## 🔄 Миграции базы данных

```bash
# Создание миграции
alembic revision --autogenerate -m "Description"

# Применение миграций
alembic upgrade head

# Откат миграции
alembic downgrade -1
```

## 🤝 Разработка

### Добавление новых провайдеров:
1. Создайте класс в `src/services/`
2. Добавьте endpoint в `src/api/auth.py`  
3. Обновите схемы в `src/models/schemas.py`
4. Добавьте тесты

### Code style:
- Используйте `black` для форматирования
- Следуйте `flake8` линтингу
- Добавляйте type hints
- Пишите docstrings для публичных методов
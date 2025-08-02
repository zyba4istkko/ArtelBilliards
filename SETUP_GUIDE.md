# 🎯 Руководство по настройке Artel Billiards

## 📋 Обзор новых технологий

Проект Artel Billiards теперь включает следующие технологии:

- **🐰 RabbitMQ** - брокер сообщений для асинхронных задач
- **⚡ fastStream** - Python фреймворк для работы с RabbitMQ
- **🧪 pytest** - система тестирования
- **🔄 Alembic** - система миграций БД
- **🔐 JWT tokens** - аутентификация и авторизация
- **📊 Логирование (Loguru)** - структурированное логирование
- **📈 Prometheus** - мониторинг и сбор метрик
- **🐳 Docker** - контейнеризация приложения

## 🚀 Быстрый старт

### 1. Предварительные требования

- Docker & Docker Compose
- Python 3.8+ (для локальной разработки)
- Node.js 18+ (для фронтенда)

### 2. Настройка переменных окружения

Скопируйте файл с примером переменных окружения:
```bash
cp environment.example .env
```

Отредактируйте `.env` файл под ваши нужды.

### 3. Запуск всех сервисов

```bash
# Запуск всех сервисов в фоновом режиме
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка всех сервисов
docker-compose down
```

### 4. Проверка работоспособности

После запуска проверьте доступность сервисов:

- **Backend API**: http://localhost:8000
- **Frontend**: http://localhost:3000
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)

## 🏗️ Архитектура системы

```
┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  FastAPI Core   │
│   (Frontend)    │◄──►│   (Backend)     │
│   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Port: 5432    │
                       └─────────────────┘
                              │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Worker Service  │◄──►│    RabbitMQ     │◄──►│   Redis Cache   │
│  (fastStream)   │    │   Port: 5672    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                                             │
        ▼                                             ▼
┌─────────────────┐                          ┌─────────────────┐
│   Prometheus    │                          │   Grafana       │
│   Port: 9090    │                          │   Port: 3001    │
└─────────────────┘                          └─────────────────┘
```

## 🔧 Разработка

### Настройка Backend

1. **Создание виртуального окружения:**
```bash
cd fast-api-app
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. **Установка зависимостей:**
```bash
pip install -r requirements.txt
```

3. **Настройка Alembic:**
```bash
# Инициализация (уже сделано)
alembic init alembic

# Создание миграции
alembic revision --autogenerate -m "Initial migration"

# Применение миграций
alembic upgrade head
```

4. **Запуск тестов:**
```bash
# Все тесты
pytest

# Тесты с покрытием
pytest --cov=app --cov-report=html

# Только unit тесты
pytest -m unit

# Только integration тесты
pytest -m integration
```

### Настройка Frontend

1. **Установка зависимостей:**
```bash
cd react-app
npm install
```

2. **Запуск в режиме разработки:**
```bash
npm run dev
```

## 🧪 Тестирование

### Структура тестов

```
fast-api-app/tests/
├── unit/                 # Unit тесты
│   ├── test_auth.py
│   ├── test_models.py
│   └── test_services.py
├── integration/          # Integration тесты
│   ├── test_api.py
│   ├── test_database.py
│   └── test_rabbitmq.py
├── e2e/                  # End-to-end тесты
│   └── test_workflows.py
└── conftest.py           # Pytest конфигурация и fixtures
```

### Запуск конкретных категорий тестов

```bash
# Unit тесты
pytest tests/unit -v

# Integration тесты
pytest tests/integration -v

# E2E тесты
pytest tests/e2e -v

# Тесты с маркерами
pytest -m "auth and not slow" -v
```

## 📊 Мониторинг и логирование

### Логирование

Логи настроены с помощью Loguru и сохраняются в:
- **Консоль**: структурированный вывод
- **Файл**: `logs/app.log`
- **Elasticsearch** (опционально): для централизованного логирования

### Метрики Prometheus

Автоматически собираются метрики:
- HTTP requests (duration, count, status codes)
- Database connections и queries
- RabbitMQ queue sizes и processing times
- Custom business metrics (активные игры, пользователи)

### Алерты

Настройте алерты в Prometheus для:
- Высокая задержка API (>500ms)
- Ошибки 5xx >5%
- Недоступность сервисов
- Переполнение очередей RabbitMQ

## 🔐 Безопасность

### JWT Токены

- **Access Token**: 30 минут
- **Refresh Token**: 7 дней
- **Blacklist**: Redis для отозванных токенов

### Конфигурация CORS

Разрешенные origins настроены в переменных окружения.

### Хеширование паролей

Используется bcrypt с 12 rounds.

## 🚀 Деплой

### Продакшн конфигурация

1. **Настройте переменные окружения:**
```bash
ENVIRONMENT=production
DEBUG=false
JWT_SECRET_KEY=<secure-random-key>
DATABASE_URL=<production-database-url>
```

2. **Соберите production образы:**
```bash
docker-compose -f docker-compose.prod.yml build
```

3. **Запустите с production конфигурацией:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Health Checks

Все сервисы настроены с health checks:
- PostgreSQL: `pg_isready`
- Redis: `redis-cli ping`
- RabbitMQ: `rabbitmq-diagnostics check_port_connectivity`
- Backend: `/health` endpoint

## 🤝 Вклад в проект

### Стандарты кода

- **Python**: Black для форматирования, flake8 для линтинга
- **JavaScript/React**: ESLint + Prettier
- **Коммиты**: Conventional Commits

### Workflow

1. Создайте feature branch
2. Напишите тесты для нового функционала
3. Реализуйте функционал
4. Убедитесь что все тесты проходят
5. Создайте Pull Request

## 📚 Дополнительные ресурсы

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [RabbitMQ Tutorials](https://www.rabbitmq.com/getstarted.html)
- [Prometheus Best Practices](https://prometheus.io/docs/practices/)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🆘 Troubleshooting

### Общие проблемы

1. **Порты заняты:**
```bash
# Найти процесс использующий порт
lsof -i :8000
# Остановить процесс
kill -9 <PID>
```

2. **Проблемы с Docker volumes:**
```bash
# Очистить все volumes
docker-compose down -v
docker system prune -a
```

3. **База данных не запускается:**
```bash
# Проверить логи PostgreSQL
docker-compose logs postgres
```

4. **RabbitMQ недоступен:**
```bash
# Перезапустить RabbitMQ
docker-compose restart rabbitmq
```

### Полезные команды

```bash
# Мониторинг ресурсов
docker-compose top

# Выполнение команд в контейнере
docker-compose exec backend bash
docker-compose exec postgres psql -U postgres -d artel_billiards

# Просмотр активных соединений
docker-compose exec redis redis-cli monitor
```
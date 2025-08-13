# Автоматические миграции для Template Service

## Обзор

Template Service теперь автоматически управляет миграциями базы данных при запуске. Это означает, что вам не нужно вручную запускать команды `alembic` - все происходит автоматически.

## Как это работает

### 1. Автоматический запуск при старте сервиса

При запуске Template Service происходит следующее:

1. **Ожидание готовности базы данных** - сервис ждет, пока PostgreSQL станет доступен
2. **Инициализация Alembic** - если Alembic не инициализирован, он создается автоматически
3. **Создание миграций** - если миграций нет, создается первая миграция на основе моделей
4. **Применение миграций** - все pending миграции применяются автоматически
5. **Запуск сервиса** - после успешных миграций запускается FastAPI приложение

### 2. Файлы миграций

- **`src/core/migrations.py`** - основной модуль управления миграциями
- **`entrypoint.sh`** - bash скрипт для Docker (альтернативный подход)
- **`init_migrations.py`** - Python скрипт для ручного запуска

### 3. Конфигурация

Переменные окружения для миграций:

```bash
DB_HOST=postgres          # Хост базы данных
DB_PORT=5432             # Порт базы данных
DB_NAME=template_db      # Имя базы данных
DB_USER=postgres         # Пользователь базы данных
DB_PASSWORD=password     # Пароль базы данных
DB_ECHO=false            # Логирование SQL запросов
```

## Использование

### Автоматический режим (рекомендуется)

Просто запустите сервис - миграции применятся автоматически:

```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up template-service
```

### Ручной режим

Если нужно запустить миграции вручную:

```bash
# Внутри контейнера
docker exec -it artel_template_service_dev python init_migrations.py

# Или через entrypoint
docker exec -it artel_template_service_dev /app/entrypoint.sh
```

## Структура миграций

После автоматической инициализации создается структура:

```
alembic/
├── alembic.ini          # Конфигурация Alembic
├── env.py               # Настройки окружения
└── versions/            # Файлы миграций
    └── 001_initial_tables.py  # Первая миграция
```

## Логирование

Все операции с миграциями логируются в консоль:

```
🚀 Starting Template Service...
📊 Initializing database...
✅ Database initialized successfully
✅ Database connection healthy
🔄 Running database migrations...
📋 Initializing Alembic...
✅ Alembic initialized and configured
📝 Creating initial migration...
✅ Found 1 existing migration(s)
🔄 Applying database migrations...
✅ Migrations completed successfully
🎯 Template Service started successfully!
```

## Обработка ошибок

- Если миграции не могут быть применены, сервис продолжит работу
- Все ошибки миграций логируются с предупреждением
- Сервис не падает при проблемах с миграциями

## Добавление новых миграций

Для добавления новых миграций:

1. Обновите модели в `src/models/database.py`
2. Перезапустите сервис - новая миграция создастся автоматически
3. Или создайте вручную: `alembic revision --autogenerate -m "Description"`

## Troubleshooting

### Проблема: "Database not available"
- Проверьте, что PostgreSQL запущен и доступен
- Проверьте переменные окружения DB_*

### Проблема: "Failed to initialize Alembic"
- Проверьте права доступа к файловой системе
- Убедитесь, что alembic установлен в requirements.txt

### Проблема: "Failed to apply migrations"
- Проверьте логи PostgreSQL на ошибки
- Убедитесь, что пользователь имеет права на создание таблиц

## Безопасность

- Миграции выполняются от имени пользователя приложения
- Все SQL операции логируются
- Обработка ошибок предотвращает падение сервиса
- Поддержка rollback через `alembic downgrade`

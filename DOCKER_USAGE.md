# 🐳 Docker Compose Usage Guide

Руководство по использованию Docker конфигураций для проекта Artel Billiards.

## 🔧 Tech Stack Versions
- **Python**: 3.13 (latest)
- **PostgreSQL**: 17 (latest) 
- **FastAPI**: 0.104.1
- **Redis**: 7-alpine
- **RabbitMQ**: 3-management

## 📁 Структура файлов

```
├── docker-compose.base.yml    # Базовая инфраструктура (PostgreSQL, Redis, RabbitMQ)
├── docker-compose.dev.yml     # Разработка (Auth + API Gateway + Frontend)
└── docker-compose.prod.yml    # Продакшн (все микросервисы + мониторинг)
```

## 🚀 Сценарии использования

### 1. 🔧 **Только инфраструктура**
Запуск только базовых сервисов (PostgreSQL, Redis, RabbitMQ):
```bash
docker-compose -f docker-compose.base.yml up
```

### 2. 🧪 **Разработка (MVP)**
Быстрый запуск для разработки:
```bash
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up
```

**Что включено:**
- ✅ PostgreSQL + микросервисные БД
- ✅ Redis для кеширования  
- ✅ RabbitMQ для сообщений
- ✅ Auth Service (8001)
- ✅ API Gateway (8000)
- ✅ React Frontend (3000)
- ✅ Prometheus (9090)
- ✅ Grafana (3001)

### 3. 🌐 **Полная продакшн система**
Все микросервисы с полным мониторингом:
```bash
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up
```

**Что включено:**
- ✅ Вся инфраструктура из base
- ✅ Все 6 микросервисов (Auth, Game, Template, Stats, Friends, Notification)
- ✅ API Gateway (8000)
- ✅ Elasticsearch (9200) для поиска
- ✅ React Frontend (3000)
- ✅ Prometheus (9090) + Grafana (3001)
- ✅ Loki (3100) для логов
- ✅ Jaeger (16686) для трейсинга

## 🎯 Конкретные примеры

### Разработка Auth Service
```bash
# Запуск только инфраструктуры + Auth Service
docker-compose -f docker-compose.base.yml up postgres redis rabbitmq
docker-compose -f docker-compose.dev.yml up auth-service

# Проверка работы
curl http://localhost:8001/health
```

### Тестирование API Gateway
```bash
# Запуск API Gateway + зависимости
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up auth-service api-gateway

# Проверка маршрутизации
curl http://localhost:8000/auth/health
```

### Полное локальное окружение
```bash
# Все сервисы для полного тестирования
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up

# Фоновый запуск
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d
```

## 🔍 Мониторинг и отладка

### Порты сервисов
| Сервис | Порт | URL |
|--------|------|-----|
| API Gateway | 8000 | http://localhost:8000 |
| Auth Service | 8001 | http://localhost:8001 |
| Game Service | 8002 | http://localhost:8002 |
| Template Service | 8003 | http://localhost:8003 |
| Stats Service | 8004 | http://localhost:8004 |
| Friends Service | 8005 | http://localhost:8005 |
| Notification Service | 8006 | http://localhost:8006 |
| Frontend | 3000 | http://localhost:3000 |
| Grafana | 3001 | http://localhost:3001 |
| Prometheus | 9090 | http://localhost:9090 |
| Loki | 3100 | http://localhost:3100 |
| Elasticsearch | 9200 | http://localhost:9200 |
| RabbitMQ Management | 15672 | http://localhost:15672 |
| Jaeger UI | 16686 | http://localhost:16686 |

### Health Check
```bash
# Проверка всех сервисов
curl http://localhost:8001/health  # Auth
curl http://localhost:8002/health  # Game  
curl http://localhost:8003/health  # Template
curl http://localhost:8004/health  # Stats
curl http://localhost:8005/health  # Friends
curl http://localhost:8006/health  # Notification
```

### Логи
```bash
# Логи конкретного сервиса
docker-compose logs auth-service

# Логи в реальном времени
docker-compose logs -f auth-service

# Логи всех сервисов
docker-compose logs
```

## 🛠️ Переменные окружения

Создайте файл `.env` для настройки:
```bash
# JWT секреты
JWT_SECRET_KEY=your-super-secret-jwt-key

# Grafana пароль
GRAFANA_PASSWORD=admin

# PostgreSQL
POSTGRES_PASSWORD=your-secure-password

# RabbitMQ
RABBITMQ_DEFAULT_PASS=your-rabbitmq-password
```

## 🧹 Очистка

### Остановка сервисов
```bash
# Остановка dev окружения
docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml down

# Остановка prod окружения  
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down
```

### Полная очистка (включая данные)
```bash
# ВНИМАНИЕ: Удаляет все данные!
docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml down -v
docker system prune -a
```

## 🚨 Troubleshooting

### Конфликт портов
```bash
# Проверка занятых портов
netstat -tulpn | grep :8000

# Остановка conflicting сервисов
docker stop $(docker ps -q)
```

### Пересборка образов
```bash
# Пересборка конкретного сервиса
docker-compose -f docker-compose.dev.yml build auth-service

# Пересборка всех сервисов
docker-compose -f docker-compose.prod.yml build --no-cache
```

### Проблемы с сетью
```bash
# Пересоздание сети
docker network rm artel_network
docker-compose -f docker-compose.base.yml up
```

## 📋 Чек-лист для разработчиков

### Перед началом работы:
- [ ] Клонирован репозиторий
- [ ] Установлен Docker и Docker Compose
- [ ] Создан файл `.env` с секретами
- [ ] Запущена инфраструктура: `docker-compose -f docker-compose.base.yml up`

### Для разработки Auth Service:
- [ ] Запущен dev stack: `docker-compose -f docker-compose.base.yml -f docker-compose.dev.yml up auth-service`
- [ ] Проверен health: `curl http://localhost:8001/health`
- [ ] Открыт Swagger: http://localhost:8001/docs

### Для полного тестирования:
- [ ] Запущен prod stack: `docker-compose -f docker-compose.base.yml -f docker-compose.prod.yml up`
- [ ] Проверены все health endpoints
- [ ] Открыт Grafana: http://localhost:3001 (admin/admin)
- [ ] Проверен RabbitMQ: http://localhost:15672 (admin/password)
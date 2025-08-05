# Multi-stage Dockerfile для Auth Service
FROM python:3.13-slim as builder

# Устанавливаем зависимости для сборки
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Обновляем pip
RUN pip install --no-cache-dir --upgrade pip

# Копируем requirements
COPY requirements.txt /tmp/service-requirements.txt

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r /tmp/service-requirements.txt

# ==================== PRODUCTION STAGE ====================
FROM python:3.13-slim

# Устанавливаем runtime зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Копируем виртуальное окружение
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Создаем пользователя
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

# Рабочая директория
WORKDIR /app

# Создаем директории
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

# Копируем код приложения
COPY src/ /app/src/

# Устанавливаем владельца
RUN chown -R appuser:appuser /app

# Переключаемся на пользователя
USER appuser

# Экспозим порт Auth Service
EXPOSE 8001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8001/health || exit 1

# Запускаем приложение
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "1"]
# Template Service Dockerfile
FROM python:3.11-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем requirements.txt
COPY requirements.txt .

# Устанавливаем Python зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем код приложения
COPY src/ ./src/

# Копируем entrypoint скрипт
COPY entrypoint.sh .

# Делаем entrypoint исполняемым
RUN chmod +x entrypoint.sh

# Открываем порт
EXPOSE 8000

# Используем entrypoint скрипт
ENTRYPOINT ["./entrypoint.sh"]

# Команда по умолчанию
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
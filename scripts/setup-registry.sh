#!/bin/bash

# Скрипт для настройки локального Docker registry
# Запускать на control plane (10.10.100.131)

echo "🚀 Настройка локального Docker registry..."

# Проверяем, запущен ли уже registry
if docker ps | grep -q "registry:2"; then
    echo "✅ Registry уже запущен"
else
    echo "📦 Запускаем Docker registry..."
    docker run -d \
        --name registry \
        --restart=always \
        -p 5000:5000 \
        -v registry-data:/var/lib/registry \
        registry:2
    
    echo "✅ Registry запущен на порту 5000"
fi

# Проверяем статус
echo "📊 Статус registry:"
docker ps | grep registry

# Показываем IP адрес
HOST_IP=$(hostname -I | awk '{print $1}')
echo "🌐 Registry доступен по адресу: $HOST_IP:5000"

# Тестируем registry
echo "🧪 Тестируем registry..."
curl -f http://localhost:5000/v2/_catalog || echo "❌ Registry недоступен"

echo "✅ Настройка registry завершена!"

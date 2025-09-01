# Многоэтапная сборка для оптимизации размера образа
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production && npm cache clean --force

# Копирование исходного кода
COPY src/ ./src/

# Сборка приложения (если нужно)
RUN npm run build || echo "No build script found"

# Финальный образ
FROM node:18-alpine AS production

# Создание пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Установка рабочей директории
WORKDIR /app

# Копирование зависимостей из builder этапа
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Копирование исходного кода
COPY --from=builder --chown=nodejs:nodejs /app/src ./src

# Копирование package.json
COPY --chown=nodejs:nodejs package*.json ./

# Переключение на пользователя nodejs
USER nodejs

# Открытие порта
EXPOSE 8080

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Запуск приложения
CMD ["node", "src/app.js"]

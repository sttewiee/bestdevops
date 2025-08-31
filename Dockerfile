# Многоэтапная сборка для оптимизации размера образа
FROM node:18-alpine AS builder

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY package*.json ./

# Установка зависимостей
RUN npm install --omit=dev && npm cache clean --force

# Копирование исходного кода
COPY src/ ./src/

# Финальный образ
FROM node:18-alpine AS production

# Установка wget для healthcheck
RUN apk add --no-cache wget

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
COPY --from=builder --chown=nodejs:nodejs package*.json ./

# Переключение на пользователя nodejs
USER nodejs

# Открытие порта
EXPOSE 3000

# Проверка здоровья
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Запуск приложения
CMD ["node", "src/app.js"]

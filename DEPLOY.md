# 🚀 Деплой на Vercel — Пошаговая Инструкция

## 1. Подготовка

Убедитесь, что у вас есть:
- Аккаунт на [vercel.com](https://vercel.com)
- Git-репозиторий (GitHub, GitLab или Bitbucket)

## 2. Загрузка кода в Git

```bash
cd test_j
git init
git add .
git commit -m "Next.js migration"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## 3. Создание проекта на Vercel

1. Зайдите на [vercel.com/new](https://vercel.com/new)
2. Нажмите **"Import Git Repository"**
3. Выберите ваш репозиторий
4. Vercel автоматически определит Next.js — нажмите **"Deploy"**

## 4. Подключение Vercel Postgres

1. Откройте ваш проект в [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейдите в **Storage** → **Create Database** → **Postgres**
3. Выберите регион (рекомендуется `fra1` — Франкфурт)
4. Нажмите **Create**
5. Vercel автоматически добавит переменную `POSTGRES_URL` в ваш проект

## 5. Инициализация базы данных

После подключения Postgres нужно создать таблицы. Есть два варианта:

### Вариант А: Через Vercel Dashboard
1. Откройте **Storage** → вашу Postgres БД → **Query**
2. Скопируйте и выполните SQL:

```sql
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  user_name VARCHAR(255),
  current_q INTEGER DEFAULT 0,
  answers JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'active',
  result_type INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(id),
  result_type INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS clicks (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES sessions(id),
  link_type VARCHAR(20) DEFAULT 'telegram',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_results_session ON results(session_id);
CREATE INDEX IF NOT EXISTS idx_clicks_session ON clicks(session_id);
```

### Вариант Б: Автоматически при первом запуске
Добавьте вызов `initializeDatabase()` из `src/lib/db.ts` в один из API route при первом запросе.

## 6. Локальная разработка с Vercel Postgres

Для локального тестирования:

```bash
# Установите Vercel CLI
npm i -g vercel

# Привяжите проект
vercel link

# Получите переменные окружения
vercel env pull .env.local

# Запустите dev-сервер
npm run dev
```

## 7. Передеплой

После каждого `git push` Vercel автоматически делает новый деплой.

Для ручного деплоя:
```bash
vercel --prod
```

## ⚠️ Важные замечания

- **Старый Express сервер** (`server.js`, `database.js`) больше не нужен для Vercel
- **SQLite данные** (`test_data.db`) — если нужно перенести данные, сделайте экспорт через CSV и импорт в Postgres
- **Порт 3000** — Next.js dev-сервер использует порт 3000 по умолчанию, поэтому остановите старый Express сервер перед запуском `npm run dev`

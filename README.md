# SubTrack

Минималистичный трекер подписок: фиксируйте регулярные платежи, держите бюджет под контролем.

## Стек

- React 19 + TypeScript + Vite
- TailwindCSS + shadcn/ui + Radix UI
- Supabase (PostgreSQL, Auth, RLS, Storage)
- AuthKit WorkOS (SSO) + Supabase Auth
- React Router v6
- react-hook-form + zod
- date-fns

## Требования

- Node.js ≥ 20
- pnpm ≥ 8
- Supabase CLI ≥ 1.176.7 (для локальной БД)

## Быстрый старт

```bash
git clone https://github.com/<you>/subtrack.git
cd subtrack

# установка зависимостей
pnpm install

# запуск Supabase (PostgreSQL + API + Studio)
supabase start

# скопируйте пример env и заполните
cp .env.example .env.local

# запуск фронтенда
pnpm dev      # http://localhost:5173
```

### Переменные окружения

```env
# Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<public-anon-key>

# WorkOS
VITE_WORKOS_CLIENT_ID=client_XXXXXXXXXXXXXXXXXXXX
# необязательно
VITE_WORKOS_API_HOSTNAME=auth.my-company.com

# Stripe (для биллинга)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX

# Sentry (для мониторинга ошибок)
VITE_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXX@XXXXXXXXXX.ingest.sentry.io/XXXXXXXXXX

# PostHog (для аналитики)
VITE_POSTHOG_KEY=phc_XXXXXXXXXXXXXXXXXXXX
VITE_POSTHOG_HOST=https://app.posthog.com
```

## Features

- 🖥️ Дашборд с карточками подписок, календарём платежей и виджетами затрат
- ➕ CRUD-операции подписок (Supabase RLS)
- 🔔 Edge-функция напоминаний за 3 дня до списания
- 📤 Экспорт / 📥 импорт CSV
- 🌗 Light/Dark тема
- 🪄 SSO через WorkOS (AuthKit) + Supabase Auth
- 💳 Stripe интеграция для биллинга
- 🎯 Onboarding процесс
- 💱 Мультивалютность
- 📊 KPI метрики

## Testing

- **Vitest** для unit/logic (команда `pnpm test`)
- **Playwright** smoke: Landing → Title, далее планируем end-to-end CRUD
- **Husky** pre-commit: `lint` + `test`
- **CI GitHub Actions**: lint → vitest → build

## Deploy Guide

1. Создайте проект на [Supabase](https://supabase.com) и выкатите миграции:
   ```bash
   supabase link --project-ref your-ref
   supabase db push
   supabase functions deploy reminder --no-verify-jwt
   ```
2. В настройках **Auth → Settings** укажите `SITE_URL` и разрешённые редиректы.
3. Настройте переменные среды на хостинге (Vercel/Netlify):
   ```env
   VITE_SUPABASE_URL=https://<ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<public-anon-key>
   VITE_WORKOS_CLIENT_ID=client_XXXXXXXXXXXX
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_XXXXXXXXXXXX
   VITE_SENTRY_DSN=https://XXXXXXXXXXXX@XXXXXXXXXX.ingest.sentry.io/XXXXXXXXXX
   VITE_POSTHOG_KEY=phc_XXXXXXXXXXXX
   VITE_POSTHOG_HOST=https://app.posthog.com
   ```
4. Соберите и задеплойте фронт:
   ```bash
   pnpm build
   # vercel deploy или netlify deploy
   ```

## Roadmap

- [ ] Toast-уведомления (shadcn `useToast`)
- [ ] Storybook для UI компонентов
- [ ] Импорт из банковской выписки (CSV/Email)
- [ ] Категорийная аналитика + графики
- [ ] PWA + offline-cache

## Скрипты (обновлено)

| Скрипт               | Описание                                   |
|----------------------|--------------------------------------------|
| `pnpm dev`           | Запуск фронтенда (Vite)                    |
| `pnpm build`         | Сборка production                          |
| `pnpm preview`       | Локальный preview                          |
| `pnpm lint`          | ESLint (warnings=error)                    |
| `pnpm test`          | Unit-тесты Vitest                          |
| `pnpm test:watch`    | Vitest watch-mode                          |
| `pnpm e2e`           | Playwright e2e tests                       |
| `pnpm seed`          | Создание демо пользователя и данных       |
| `supabase db reset`  | Откат и повторный прогон миграций/сидов    |

## Структура каталогов

```
src/
├── app/                    # Основное приложение
├── components/             # UI компоненты
│   ├── ui/                # shadcn/ui компоненты
│   └── ...                # Кастомные компоненты
├── features/              # Функциональные модули
│   ├── subscriptions/     # Управление подписками
│   ├── teams/            # Команды и роли
│   ├── billing/          # Платежи
│   ├── onboarding/       # Onboarding
│   └── currency/         # Валюты
├── hooks/                # React hooks
├── lib/                  # Утилиты и конфигурация
├── pages/                # Страницы приложения
└── types/                # TypeScript типы
```

## Демо данные

Для быстрого старта используйте демо пользователя:

```bash
# Создание демо данных
pnpm seed

# Логин
Email: demo@subtrack.dev
Password: demo123
```

## Мониторинг

- **Sentry**: отслеживание ошибок и производительности
- **PostHog**: аналитика пользователей и событий
- **Vercel Analytics**: метрики производительности

## Безопасность

- Row Level Security (RLS) в Supabase
- Валидация всех входных данных
- Безопасная аутентификация через WorkOS
- Защита от CSRF и XSS атак

## Accessibility & UX

- Skip link (`Tab` → Skip to content)
- Landmark roles (`banner`, `main`), descriptive `aria-label`s
- Focus-visible ring on interactive elements
- Toast notifications announced via `aria-live` region
- Keyboard shortcut `⌘/Ctrl + K` toggles light/dark theme
- Mobile‐first: на экранах < 768 px список подписок отображается карточками вместо таблицы (гориз. скролл устранён)
- Lazy-loading иконок, правильные `alt`-тексты

## Overview

SubTrack — это минималистичный менеджер подписок. Помогает:

1. Вести учёт всех сервисов и регулярных платежей.
2. Получать e-mail-напоминания перед списанием средств.
3. Видеть агрегированную статистику по расходам.
4. Экспортировать/импортировать данные (CSV) и иметь кросс-платформенный доступ (PWA).

Фронтенд полностью статичен (SPA), развёртывается на Vercel/Netlify. Бэкенд — Supabase (PostgreSQL + Edge Functions + RLS + Storage).

## Architecture

```mermaid
flowchart TD
  subgraph Frontend (Vite + React)
    A[React SPA]
    A -->|fetch| B[(Supabase REST)]
    A -->|SSO| C[WorkOS AuthKit]
    A -->|Realtime| D[(Supabase Realtime)]
  end
  subgraph Supabase
    B --> DB[(PostgreSQL)]
    E[Edge Function: reminder] --> DB
    E --> M[Auth Admin]--> Email
    Storage[(Bucket: icons)]
  end
```

1. Пользователь авторизуется через WorkOS (SSO) или Supabase Email/Password.
2. Все CRUD операции выполняются напрямую из SPA через `@supabase/supabase-js`, защищены RLS.
3. Edge-функция `reminder` раз в день отправляет email о платежах, которые наступят через 3 дня.
4. Иконки сервисов хранятся в public-bucket `icons` и отдаются через CDN.

### Каталоги

```
apps/              # (зарезервировано под микрофронты)
public/            # статика + manifest + PWA icons
supabase/          # RLS-политики, миграции, функции
src/
  app/             # Router + глобальные провайдеры
  assets/          # SVG, логотипы
  components/
    ui/            # атомарные компоненты (shadcn)
    marketing/     # лендинг/B2B блоки
```

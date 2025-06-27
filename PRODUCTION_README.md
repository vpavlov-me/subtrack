# SubTrack - Production Deployment Guide

## 🚀 Production-Ready MVP

SubTrack - это минималистичный трекер подписок с полным набором функций для команд и предприятий.

### ✨ Основные возможности

- 🔐 **Teams & Roles** - управление командой и ролями
- 💳 **Billing с Stripe** - интеграция платежей
- 🎯 **Guided Onboarding** - пошаговая настройка
- 🔔 **Flexible Reminders** - гибкие напоминания
- 💱 **Multi-currency** - поддержка множественных валют
- 📊 **Light Analytics** - базовые KPI и метрики
- 🌍 **Timezone-safe** - безопасная работа с часовыми поясами
- 📱 **PWA Support** - прогрессивное веб-приложение

## 🛠 Технический стек

### Frontend

- **React 19** + TypeScript
- **Vite** - быстрая сборка
- **TailwindCSS** + shadcn/ui - современный UI
- **React Router v6** - навигация
- **React Hook Form** + Zod - формы и валидация
- **date-fns** - работа с датами

### Backend

- **Supabase** - PostgreSQL + Auth + RLS
- **Edge Functions** - серверная логика
- **Row Level Security** - безопасность данных
- **Real-time subscriptions** - обновления в реальном времени

### DevOps

- **Vercel** - хостинг и деплой
- **GitHub Actions** - CI/CD
- **Playwright** - E2E тестирование
- **Vitest** - unit тестирование

### Monitoring

- **Sentry** - error tracking
- **PostHog** - analytics
- **Vercel Analytics** - performance monitoring

## 📋 Чек-лист для продакшена

### 1. Supabase Setup ✅

- [ ] Создан проект на Supabase
- [ ] Применены миграции
- [ ] Настроены RLS политики
- [ ] Развернуты Edge Functions
- [ ] Настроены Cron Jobs
- [ ] Настроен Storage

### 2. Stripe Setup ✅

- [ ] Создан аккаунт Stripe
- [ ] Настроены продукты и цены
- [ ] Настроены Webhooks
- [ ] Настроен Customer Portal
- [ ] Протестированы платежи

### 3. Vercel Setup ✅

- [ ] Подключен GitHub репозиторий
- [ ] Настроены переменные окружения
- [ ] Настроен домен
- [ ] Включены Analytics
- [ ] Настроены Preview Deployments

### 4. Authentication ✅

- [ ] Настроен Supabase Auth
- [ ] Настроен WorkOS SSO
- [ ] Настроены Email Templates
- [ ] Протестированы методы входа

### 5. Monitoring ✅

- [ ] Настроен Sentry
- [ ] Настроен PostHog
- [ ] Настроены Alerts
- [ ] Протестированы дашборды

### 6. Testing ✅

- [ ] Unit тесты проходят
- [ ] E2E тесты проходят
- [ ] CI/CD pipeline работает
- [ ] Протестированы основные сценарии

## 🔧 Быстрый старт

### 1. Клонирование и установка

```bash
git clone https://github.com/vpavlov-me/subtrack.git
cd subtrack
pnpm install
```

### 2. Настройка переменных окружения

Создайте `.env.local`:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# WorkOS AuthKit
VITE_WORKOS_CLIENT_ID=your-workos-client-id

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key

# Monitoring (optional)
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### 3. Запуск разработки

```bash
# Локальный Supabase
supabase start

# Фронтенд
pnpm dev
```

### 4. Тестирование

```bash
# Unit тесты
pnpm test

# E2E тесты
pnpm e2e

# Линтинг
pnpm lint
```

## 📚 Документация

- [Development Guide](./DEVELOPMENT.md) - руководство разработчика
- [Supabase Setup](./SUPABASE_SETUP.md) - настройка Supabase
- [Stripe Setup](./STRIPE_SETUP.md) - настройка Stripe
- [Vercel Setup](./VERCEL_SETUP.md) - настройка Vercel
- [Observability Setup](./OBSERVABILITY_SETUP.md) - настройка мониторинга

## 🏗 Архитектура

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

## 🔒 Безопасность

- **Row Level Security** - изоляция данных на уровне строк
- **Authentication** - безопасная аутентификация
- **Environment Variables** - защита секретов
- **CORS** - настройка cross-origin запросов
- **Input Validation** - валидация всех входных данных

## 📊 Мониторинг и аналитика

### Error Tracking

- Sentry для отслеживания ошибок
- Source maps для детальной отладки
- Performance monitoring

### User Analytics

- PostHog для аналитики пользователей
- Event tracking для ключевых действий
- Funnel analysis для конверсии

### Performance

- Vercel Analytics для метрик производительности
- Core Web Vitals monitoring
- Speed insights

## 🚀 Деплой

### Автоматический деплой

- Push в `main` → автоматический деплой на Vercel
- Pull Request → preview deployment
- GitHub Actions → CI/CD pipeline

### Ручной деплой

```bash
# Установка Vercel CLI
npm i -g vercel

# Логин и деплой
vercel login
vercel --prod
```

## 🧪 Тестирование

### Unit Tests

- Vitest + jsdom
- Покрытие основных функций
- Автоматический запуск в CI

### E2E Tests

- Playwright
- Критические пользовательские сценарии
- Автоматический запуск в CI

### Manual Testing

- [ ] Регистрация и вход
- [ ] Создание команды
- [ ] Добавление подписок
- [ ] Настройка напоминаний
- [ ] Управление биллингом
- [ ] Onboarding процесс

## 📈 Метрики и KPI

### Бизнес метрики

- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (CLV)
- Churn Rate

### Технические метрики

- Page Load Time
- API Response Time
- Error Rate
- Uptime
- Core Web Vitals

## 🔄 Обновления и поддержка

### Регулярные обновления

- Security patches
- Dependency updates
- Feature improvements
- Bug fixes

### Поддержка

- GitHub Issues для багов
- GitHub Discussions для вопросов
- Email поддержка для enterprise клиентов

## 📄 Лицензия

MIT License - см. [LICENSE](LICENSE) файл.

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch
3. Внесите изменения
4. Добавьте тесты
5. Создайте Pull Request

## 📞 Контакты

- **GitHub**: [vpavlov-me/subtrack](https://github.com/vpavlov-me/subtrack)
- **Email**: support@subtrack.com
- **Documentation**: [docs.subtrack.com](https://docs.subtrack.com)

---

**SubTrack** - Минималистичный трекер подписок для команд и предприятий 🚀

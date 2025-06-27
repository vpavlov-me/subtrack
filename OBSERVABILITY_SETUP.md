# Observability Setup Guide

## 1. Sentry Setup

### Создание проекта

1. Перейдите на [sentry.io](https://sentry.io)
2. Создайте новый проект
3. Выберите **React** framework
4. Выберите **Vite** build tool

### Настройка SDK

```bash
# Установка Sentry SDK
pnpm add @sentry/react @sentry/tracing
```

### Конфигурация

Создайте файл `src/lib/sentry.ts`:

```typescript
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [new BrowserTracing()],
      tracesSampleRate: 1.0,
      environment: import.meta.env.MODE,
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
    });
  }
}
```

### Интеграция в приложение

В `src/main.tsx`:

```typescript
import { initSentry } from '@/lib/sentry'

// Инициализация Sentry
initSentry()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <Providers>
        <App />
      </Providers>
    </Sentry.ErrorBoundary>
  </StrictMode>
)
```

### Error Boundary Component

```typescript
function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}
```

### Source Maps Upload

В Vercel Dashboard > Settings > Environment Variables:

```env
SENTRY_AUTH_TOKEN=your-sentry-auth-token
SENTRY_ORG=your-org-slug
SENTRY_PROJECT=your-project-slug
```

## 2. PostHog Setup

### Создание проекта

1. Перейдите на [posthog.com](https://posthog.com)
2. Создайте новый проект
3. Выберите **React** framework

### Настройка SDK

```bash
# Установка PostHog SDK
pnpm add posthog-js
```

### Конфигурация

Создайте файл `src/lib/posthog.ts`:

```typescript
import posthog from 'posthog-js';

export function initPostHog() {
  if (import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://app.posthog.com',
      loaded: posthog => {
        if (import.meta.env.DEV) posthog.debug();
      },
      capture_pageview: false,
      capture_pageleave: true,
    });
  }
}

export { posthog };
```

### Интеграция в приложение

В `src/main.tsx`:

```typescript
import { initPostHog } from '@/lib/posthog';

// Инициализация PostHog
initPostHog();
```

### Event Tracking

```typescript
import { posthog } from '@/lib/posthog';

// Track user actions
export function trackSubscriptionCreated(subscription: Subscription) {
  posthog.capture('subscription_created', {
    name: subscription.name,
    price: subscription.price,
    currency: subscription.currency,
    billing_cycle: subscription.billingCycle,
    category: subscription.category,
  });
}

export function trackTeamInviteSent(email: string) {
  posthog.capture('team_invite_sent', {
    email: email,
  });
}

export function trackOnboardingCompleted(step: number) {
  posthog.capture('onboarding_completed', {
    step: step,
  });
}
```

### User Identification

```typescript
import { posthog } from '@/lib/posthog';

// Identify user after login
export function identifyUser(user: User) {
  posthog.identify(user.id, {
    email: user.email,
    name: user.user_metadata?.full_name,
  });
}

// Reset on logout
export function resetUser() {
  posthog.reset();
}
```

## 3. Vercel Analytics

### Настройка

В Vercel Dashboard > Analytics:

1. **Web Analytics**: Enable
2. **Speed Insights**: Enable
3. **Core Web Vitals**: Enable

### Интеграция

```bash
# Установка Vercel Analytics
pnpm add @vercel/analytics
```

В `src/main.tsx`:

```typescript
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <App />
      <Analytics />
    </Providers>
  </StrictMode>
)
```

## 4. Performance Monitoring

### Web Vitals

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to PostHog
  posthog.capture('web_vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
  });

  // Send to Sentry
  Sentry.metrics.increment('web_vital', {
    tags: { name: metric.name },
    value: metric.value,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### Custom Metrics

```typescript
// Track page load time
export function trackPageLoad(page: string) {
  const loadTime = performance.now();

  posthog.capture('page_load', {
    page: page,
    load_time: loadTime,
  });

  Sentry.metrics.timing('page_load', loadTime, {
    tags: { page: page },
  });
}

// Track API response time
export function trackApiCall(endpoint: string, duration: number) {
  posthog.capture('api_call', {
    endpoint: endpoint,
    duration: duration,
  });

  Sentry.metrics.timing('api_call', duration, {
    tags: { endpoint: endpoint },
  });
}
```

## 5. Error Tracking

### Global Error Handler

```typescript
import { posthog } from '@/lib/posthog';

window.addEventListener('error', event => {
  posthog.capture('javascript_error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', event => {
  posthog.capture('unhandled_promise_rejection', {
    reason: event.reason,
  });
});
```

### API Error Tracking

```typescript
import { posthog } from '@/lib/posthog';

export function trackApiError(endpoint: string, error: any) {
  posthog.capture('api_error', {
    endpoint: endpoint,
    error: error.message,
    status: error.status,
  });

  Sentry.captureException(error, {
    tags: { endpoint: endpoint },
    extra: { status: error.status },
  });
}
```

## 6. Dashboard Setup

### Sentry Dashboard

1. **Issues**: мониторинг ошибок
2. **Performance**: метрики производительности
3. **Releases**: отслеживание релизов
4. **Users**: мониторинг пользователей

### PostHog Dashboard

1. **Events**: все события
2. **Insights**: аналитика
3. **Funnels**: воронки конверсии
4. **Cohorts**: когортный анализ
5. **Feature Flags**: feature flags

### Vercel Analytics

1. **Web Analytics**: трафик и метрики
2. **Speed Insights**: производительность
3. **Core Web Vitals**: веб-метрики

## 7. Alerts Setup

### Sentry Alerts

1. **Error Rate**: > 5% ошибок
2. **Performance**: медленные запросы
3. **Release Health**: проблемы с релизами

### PostHog Alerts

1. **Conversion Drop**: падение конверсии
2. **Feature Usage**: использование фич
3. **User Engagement**: вовлеченность

## 8. Best Practices

### Error Tracking

- Не логируйте чувствительные данные
- Группируйте похожие ошибки
- Настройте правильные уровни логирования

### Performance Monitoring

- Отслеживайте ключевые метрики
- Настройте базовые линии
- Мониторьте тренды

### User Analytics

- Уважайте приватность пользователей
- Соблюдайте GDPR/CCPA
- Настройте opt-out механизмы

# Vercel Setup Guide

## 1. Создание проекта

1. Перейдите на [vercel.com](https://vercel.com)
2. Подключите GitHub репозиторий
3. Выберите репозиторий `subtrack`

## 2. Настройка Build Settings

В Vercel Dashboard > Settings > General:

### Build & Development Settings:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`
- **Node.js Version**: 20.x

### Root Directory:
- Оставьте пустым (корень проекта)

## 3. Настройка переменных окружения

В Vercel Dashboard > Settings > Environment Variables:

### Production:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your-stripe-key
VITE_SENTRY_DSN=your-sentry-dsn
VITE_POSTHOG_KEY=your-posthog-key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### Preview (для PR):
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_WORKOS_CLIENT_ID=your-workos-client-id
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

## 4. Настройка домена

В Vercel Dashboard > Settings > Domains:

1. **Custom Domain**: `subtrack.yourdomain.com`
2. **Configure DNS**:
   - Type: CNAME
   - Name: subtrack
   - Value: cname.vercel-dns.com

## 5. Настройка Preview Deployments

В Vercel Dashboard > Settings > Git:

1. **Preview Deployment**: Enabled
2. **Branch**: `main`
3. **Production Branch**: `main`

## 6. Настройка Analytics

В Vercel Dashboard > Analytics:

1. **Web Analytics**: Enable
2. **Speed Insights**: Enable
3. **Core Web Vitals**: Enable

## 7. Настройка Functions

В Vercel Dashboard > Functions:

1. **Serverless Functions**: Disabled (используем Supabase Edge Functions)
2. **Edge Functions**: Disabled

## 8. Настройка Edge Config

В Vercel Dashboard > Storage > Edge Config:

Создайте конфигурацию для feature flags:

```json
{
  "features": {
    "teams": true,
    "billing": true,
    "onboarding": true,
    "analytics": true
  }
}
```

## 9. Настройка Monitoring

### Sentry Integration:
1. В Sentry создайте проект
2. Добавьте DSN в переменные окружения
3. Настройте source maps upload

### PostHog Integration:
1. В PostHog создайте проект
2. Добавьте ключи в переменные окружения
3. Настройте event tracking

## 10. Настройка Security

В Vercel Dashboard > Settings > Security:

1. **Password Protection**: Disabled (для production)
2. **Security Headers**: Default
3. **CORS**: Configure if needed

## 11. Настройка Performance

### Image Optimization:
- Vercel автоматически оптимизирует изображения
- Используйте `next/image` или `vercel/image`

### Caching:
- Static assets: автоматически кешируются
- API routes: настройте кеширование в коде

## 12. Мониторинг деплоев

В Vercel Dashboard > Deployments:

- **Build Logs**: проверяйте логи сборки
- **Function Logs**: логи edge functions
- **Performance**: метрики производительности

## 13. Настройка Notifications

В Vercel Dashboard > Settings > Notifications:

1. **Slack**: подключите для уведомлений о деплоях
2. **Email**: настройте email уведомления
3. **Discord**: подключите Discord webhook

## 14. Тестирование

### Локальное тестирование:
```bash
# Установка Vercel CLI
npm i -g vercel

# Логин
vercel login

# Локальный деплой
vercel dev
```

### Production тестирование:
1. Создайте PR
2. Проверьте preview deployment
3. Протестируйте функциональность
4. Merge в main

## 15. Troubleshooting

### Common Issues:

**Build fails**:
- Проверьте логи сборки
- Убедитесь, что все зависимости установлены
- Проверьте TypeScript ошибки

**Environment variables not working**:
- Убедитесь, что переменные добавлены в правильную среду
- Проверьте синтаксис
- Перезапустите деплой

**Domain not working**:
- Проверьте DNS настройки
- Убедитесь, что домен добавлен в Vercel
- Проверьте SSL сертификат 
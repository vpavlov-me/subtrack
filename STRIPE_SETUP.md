# Stripe Setup Guide

## 1. Создание Stripe аккаунта

1. Перейдите на [stripe.com](https://stripe.com)
2. Создайте аккаунт
3. Переключитесь в **Test mode** для разработки

## 2. Настройка продуктов и цен

В Stripe Dashboard > Products:

### Создайте планы подписки:

1. **Starter Plan**
   - Name: "Starter"
   - Price: $9/month
   - Billing: Recurring
   - Interval: Monthly

2. **Pro Plan**
   - Name: "Pro"
   - Price: $29/month
   - Billing: Recurring
   - Interval: Monthly

3. **Enterprise Plan**
   - Name: "Enterprise"
   - Price: $99/month
   - Billing: Recurring
   - Interval: Monthly

### Годовые планы (опционально):

- Создайте те же планы с годовым биллингом
- Примените скидку (например, 20%)

## 3. Настройка переменных окружения

```env
# Frontend
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Backend (Supabase Edge Functions)
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## 4. Настройка Webhooks

В Stripe Dashboard > Developers > Webhooks:

1. **Endpoint URL**: `https://your-project.supabase.co/functions/v1/stripe-webhook`
2. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.created`
   - `customer.updated`

3. Скопируйте **Webhook signing secret** в переменные окружения

## 5. Настройка Customer Portal

В Stripe Dashboard > Settings > Billing > Customer Portal:

1. **Configuration**:
   - Enable customer portal
   - Allow customers to update payment methods
   - Allow customers to cancel subscriptions
   - Allow customers to update billing information

2. **Branding**:
   - Upload logo
   - Set brand colors
   - Customize messaging

## 6. Настройка Checkout

В Stripe Dashboard > Settings > Checkout:

1. **Configuration**:
   - Enable automatic tax calculation
   - Set default currency
   - Configure success/cancel URLs

2. **Branding**:
   - Upload logo
   - Set brand colors
   - Customize messaging

## 7. Тестирование

### Тестовые карты:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Тестовые данные:

- Expiry: любая будущая дата
- CVC: любые 3 цифры
- ZIP: любые 5 цифр

## 8. Интеграция с Supabase

### Edge Function настройка:

1. Убедитесь, что edge function `stripe-webhook` развернута
2. Проверьте логи в Supabase Dashboard > Edge Functions

### База данных:

1. Таблица `billing_subscriptions` создается автоматически
2. Таблица `profiles` обновляется с billing данными

## 9. Мониторинг

В Stripe Dashboard:

- **Payments**: мониторинг платежей
- **Subscriptions**: управление подписками
- **Customers**: управление клиентами
- **Logs**: детальные логи API

## 10. Переход в Production

1. Переключитесь в **Live mode**
2. Обновите переменные окружения на production ключи
3. Настройте production webhook endpoint
4. Протестируйте с реальными картами

## 11. Безопасность

- Никогда не коммитьте секретные ключи в код
- Используйте environment variables
- Включите webhook signature verification
- Настройте IP whitelist для webhooks

## 12. Аналитика

В Stripe Dashboard > Analytics:

- Revenue metrics
- Subscription metrics
- Customer metrics
- Churn analysis

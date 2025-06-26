# Supabase Setup Guide

## 1. Создание проекта

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Выберите регион (рекомендуется ближайший к пользователям)
4. Дождитесь завершения инициализации

## 2. Настройка переменных окружения

Скопируйте URL и anon key из Settings > API:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Применение миграций

```bash
# Линкуем проект
supabase link --project-ref your-project-ref

# Применяем миграции
supabase db push

# Генерируем типы
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

## 4. Настройка RLS (Row Level Security)

Все таблицы уже имеют RLS политики в миграциях:

- `profiles` - пользователи видят только свой профиль
- `teams` - пользователи видят команды, где они участники
- `team_members` - пользователи видят участников своих команд
- `subscriptions` - пользователи видят подписки своей команды
- `reminder_preferences` - пользователи видят свои настройки
- `currency_rates` - публичная таблица

## 5. Настройка Edge Functions

```bash
# Деплой edge functions
supabase functions deploy

# Проверка статуса
supabase functions list
```

## 6. Настройка Cron Jobs

В Supabase Dashboard > Database > Cron:

1. **reminder** - ежедневно в 9:00 UTC
   ```sql
   0 9 * * * select reminder()
   ```

2. **currency_rates_refresh** - каждые 6 часов
   ```sql
   0 */6 * * * select currency_rates_refresh()
   ```

## 7. Настройка Storage

В Supabase Dashboard > Storage:

1. Создайте bucket `avatars` для аватаров пользователей
2. Настройте RLS политики:
   ```sql
   -- Пользователи могут загружать свои аватары
   CREATE POLICY "Users can upload own avatar" ON storage.objects
   FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
   
   -- Пользователи могут просматривать аватары
   CREATE POLICY "Users can view avatars" ON storage.objects
   FOR SELECT USING (true);
   ```

## 8. Настройка Auth

В Supabase Dashboard > Authentication > Settings:

1. **Site URL**: `https://your-domain.vercel.app`
2. **Redirect URLs**: 
   - `https://your-domain.vercel.app/auth/callback`
   - `http://localhost:5173/auth/callback` (для разработки)

## 9. Настройка Email Templates

В Supabase Dashboard > Authentication > Email Templates:

1. **Confirm signup** - настройте шаблон подтверждения
2. **Reset password** - настройте шаблон сброса пароля
3. **Magic link** - настройте шаблон magic link

## 10. Настройка WorkOS SSO

1. Создайте проект в [WorkOS Dashboard](https://dashboard.workos.com)
2. Настройте SSO провайдеры (Google, GitHub, etc.)
3. Добавьте переменную:
   ```env
   VITE_WORKOS_CLIENT_ID=your-workos-client-id
   ```

## 11. Тестирование

```bash
# Запуск локального Supabase
supabase start

# Тестирование edge functions
supabase functions serve

# Проверка миграций
supabase db reset
```

## 12. Мониторинг

В Supabase Dashboard > Logs:
- Database logs
- Auth logs  
- Edge function logs
- API logs 
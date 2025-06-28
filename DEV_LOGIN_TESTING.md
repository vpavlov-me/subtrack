# 🚀 Dev Login Testing Guide

## ✅ Что исправлено

1. **Умная система переключения** - теперь dev login автоматически использует локальную базу данных
2. **Специальная обработка dev учетных данных** - `dev@subtrack.dev` / `dev123` всегда используют локальное хранение
3. **Подробное логирование** - все операции записываются в консоль браузера
4. **Автоматическое переключение** - при ошибках Supabase система переключается на локальное хранение

## 🧪 Как протестировать

### Шаг 1: Откройте приложение
```
http://localhost:5177
```

### Шаг 2: Найдите кнопку Dev Login
- На странице входа должна быть кнопка: **"🚀 Dev Login (dev@subtrack.dev)"**
- Кнопка видна только в режиме разработки (`import.meta.env.DEV === true`)

### Шаг 3: Откройте консоль браузера
- **Chrome/Edge**: F12 → Console
- **Firefox**: F12 → Console
- **Safari**: Develop → Show Web Inspector → Console

### Шаг 4: Нажмите кнопку Dev Login
- Кликните на кнопку "🚀 Dev Login (dev@subtrack.dev)"
- Следите за логами в консоли

## 📊 Ожидаемые логи в консоли

### При загрузке страницы:
```
🔧 Supabase Config: { hasUrl: true, hasKey: true, url: "https://aewznkhihjgkiggqszbj.s...", key: "eyJhbGciOiJIUzI1NiIs..." }
✅ Using real Supabase client
🔧 LocalSupabaseClient initialized
📊 Loaded from localStorage: { users: 0, profiles: 0, subscriptions: 0, currentUser: false }
```

### При нажатии Dev Login:
```
🔧 signInWithPassword called with: dev@subtrack.dev
🚀 Dev login detected, using local storage
🔧 Local signInWithPassword called with: { email: "dev@subtrack.dev", password: "dev123" }
✅ Local signIn successful for: dev@subtrack.dev
💾 Saved to localStorage
```

### При успешном входе:
```
🔧 Local onAuthStateChange called
🔧 Local getUser called, current user: dev@subtrack.dev
```

## 🔧 Если dev login не работает

### Проблема 1: Кнопка не видна
**Решение:**
- Убедитесь, что `import.meta.env.DEV === true`
- Проверьте, что вы на странице `/login`
- Обновите страницу (Ctrl+F5)

### Проблема 2: Кнопка есть, но не работает
**Решение:**
- Откройте консоль браузера
- Нажмите кнопку и посмотрите на ошибки
- Проверьте, что нет JavaScript ошибок

### Проблема 3: Нет редиректа на dashboard
**Решение:**
- Проверьте, что AuthProvider правильно обрабатывает состояние
- Убедитесь, что нет ошибок в консоли
- Проверьте, что ProtectedRoute работает

### Проблема 4: Ошибки в консоли
**Возможные ошибки:**
- `Cannot read property 'auth' of undefined` - проблема с инициализацией Supabase
- `TypeError: ...` - проблема с типами TypeScript
- `Network Error` - проблема с подключением

## 🎯 Альтернативные способы тестирования

### Способ 1: Принудительное использование локальной БД
1. Временно удалите переменные окружения из `.env.local`:
   ```bash
   # Закомментируйте эти строки
   # VITE_SUPABASE_URL=...
   # VITE_SUPABASE_ANON_KEY=...
   ```
2. Перезапустите dev сервер: `npm run dev`
3. Теперь будет использоваться только mock клиент

### Способ 2: Ручная регистрация
1. На странице регистрации введите:
   - Email: `dev@subtrack.dev`
   - Password: `dev123`
2. Нажмите "Зарегистрироваться"
3. Должен произойти автоматический вход

### Способ 3: Прямое тестирование через консоль
1. Откройте консоль браузера
2. Выполните:
   ```javascript
   // Получить доступ к Supabase клиенту
   const supabase = window.supabase || window.__SUPABASE__;
   
   // Попробовать войти
   supabase.auth.signInWithPassword({
     email: 'dev@subtrack.dev',
     password: 'dev123'
   }).then(result => {
     console.log('Login result:', result);
   });
   ```

## 📁 Файлы для проверки

### Основные файлы:
- `src/lib/supabase.ts` - умный Supabase клиент
- `src/lib/local-db.ts` - локальная база данных
- `src/pages/Login.tsx` - страница входа с dev кнопкой
- `src/app/AuthProvider.tsx` - контекст авторизации

### Тестовые файлы:
- `scripts/test-dev-login.js` - тест dev login
- `test-dev-login.html` - HTML страница для тестирования
- `scripts/simple-test.js` - комплексный тест

## 🎉 Ожидаемый результат

После успешного dev login:
- ✅ Пользователь должен быть перенаправлен на `/dashboard`
- ✅ В консоли должны быть логи успешного входа
- ✅ В localStorage должны сохраниться данные пользователя
- ✅ Все защищенные маршруты должны быть доступны
- ✅ Профиль пользователя должен быть создан автоматически

## 📞 Поддержка

Если dev login все еще не работает:
1. Проверьте все логи в консоли браузера
2. Убедитесь, что dev сервер запущен на правильном порту
3. Проверьте, что нет конфликтов с другими процессами
4. Попробуйте очистить localStorage и перезагрузить страницу

---

**Готово к тестированию! Откройте http://localhost:5177 и попробуйте dev login.** 🚀 
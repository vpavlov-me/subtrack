# SubTrack - Менеджер подписок для малого бизнеса

SubTrack - это веб-приложение для отслеживания подписок на сервисы и инструменты, используемые в малом бизнесе.

## Технологии

- Frontend: React + Vite + TypeScript + TailwindCSS
- Backend: Supabase (Auth, Database)
- State Management: Zustand
- Routing: React Router

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/subtrack.git
cd subtrack
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл `.env` в корневой директории проекта и добавьте следующие переменные:
```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

4. Запустите приложение в режиме разработки:
```bash
npm run dev
```

## Функциональность

- 🔐 Аутентификация пользователей
- 📦 Управление подписками (добавление, редактирование, удаление)
- 📊 Дашборд с общей статистикой
- 🔔 Напоминания о предстоящих платежах

## Структура проекта

```
src/
  ├── components/     # React компоненты
  ├── pages/         # Страницы приложения
  ├── store/         # Zustand хранилища
  ├── lib/           # Утилиты и конфигурация
  └── types/         # TypeScript типы
```

## Лицензия

MIT

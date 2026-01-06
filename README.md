# Fortune Wheel for Teams

Простой сервис на Next.js + Supabase для выбора ведущего в командах.

## Запуск локально
1. Установите зависимости: `npm install`
2. Создайте файл `.env.local` с ключами Supabase:
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```
3. Старт dev-сервера: `npm run dev`

## Тесты
- Юнит: `npm test`
- E2E (нужен запущенный dev сервер на 3000): `npm run e2e`

## Деплой на Vercel
- Добавьте переменные окружения `SUPABASE_URL`, `SUPABASE_ANON_KEY`.
- Подключите репозиторий и деплойте как Next.js App Router проект.


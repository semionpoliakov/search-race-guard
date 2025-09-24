# Search

Демонстрационное приложение на Next.js (App Router) и React 19: поисковое поле с дебаунсом, синхронизацией URL и защитой от гонок запросов.

## Стек

- Next.js 15 (App Router)
- React 19 (клиентские компоненты поверх SSR)
- TypeScript
- CSS Modules

## Запуск

```bash
pnpm install
pnpm dev

pnpm build
pnpm start
```

Альтернативы: `npm` или `yarn` c теми же скриптами.

## Мок-API `GET /api/search`

- Параметры: `q` (строка).

## TODO

- Eslint
- Prettier
- Tests

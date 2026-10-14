# Electronic Library API

Серверное приложение для системы «Электронная библиотека и каталог книг»
(дисциплина «Разработка серверных приложений»).

- `ARCHITECTURE.md` — предметная область, архитектура, модель данных (ЛР1), REST API (ЛР2), структура кода (ЛР3)
- `openapi.yaml` — спецификация REST API (OpenAPI 3.0)

## Требования

- Node.js 18.18 или новее (`node -v`)
- Внешние npm-пакеты не нужны

## Запуск

```bash
cp .env.example .env     # создать локальный файл настроек
npm start                # запуск сервера
# или: npm run dev       # запуск с автоперезапуском при изменении файлов
```

Проверка:

```bash
curl -i http://localhost:8080/api/v1/health
```

Ожидаемый ответ — `200 OK`:

```json
{
  "status": "pass",
  "app_name": "Electronic Library API",
  "version": "1.0.0",
  "environment": "development",
  "uptime_seconds": 12,
  "timestamp": "2026-10-14T11:07:51.703Z",
  "checks": { "storage": "pass" }
}
```

## Тесты

```bash
npm test
```

## Структура проекта

```
.
├── cmd/app/main.js                 # точка входа
├── internal/
│   ├── app.js                      # сборка слоев (внедрение зависимостей)
│   ├── config/config.js            # загрузка конфигурации из .env
│   ├── controller/                 # API / Transport Layer (HTTP)
│   ├── service/                    # Service / Domain Layer (бизнес-логика)
│   └── repository/                 # Repository / Data Access Layer
├── tests/                          # автотесты
├── .env.example                    # шаблон переменных окружения
├── .gitignore
├── openapi.yaml
├── ARCHITECTURE.md
├── package.json
└── README.md
```

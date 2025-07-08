# back-quests

Backend для pixel-art квест-игры на React.

## Запуск

1. Установите зависимости:

```
npm install
```

2. Создайте файл `.env` в папке `back-quests`:

```
MONGO_URI=mongodb://localhost:27017/quests
JWT_SECRET=supersecretkey
CLIENT_ORIGIN=http://localhost:5173
PORT=3001
```

3. Запустите сервер:

```
npm start
```

## Эндпоинты

- `POST   /api/register` — регистрация (name, email, password)
- `POST   /api/login` — логин (email, password)
- `GET    /api/profile` — получить профиль и прогресс (требует авторизации)
- `POST   /api/progress` — сохранить прогресс (scene, stats; только для сцен 1 и 2)
- `POST   /api/logout` — выйти

JWT хранится в httpOnly cookie.

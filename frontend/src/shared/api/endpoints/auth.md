### Регистрация пользователя
* **URL:** `/api/users/register/`
* **Метод:** `POST`
* **Доступ:** Любой (`AllowAny`)
* **Вход (JSON Body):**
```json
{
  "username": "string",
  "email": "string",
  "password": "string (min_length: 6)"
}
```
* **Ответ при успехе (201 Created):**
```json
{
  "message": "Регистрация прошла успешно!",
  "user": {
    "id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "profile": {
      "id": 0,
      "language": "string",
      "theme": "string"
    }
  },
  "tokens": {
    "refresh": "string",
    "access": "string"
  }
}
```
* **Ответ при ошибке валидации (400 Bad Request):**
```json
{
  "username": [
    "Пользователь с таким именем уже существует."
  ],
  "password": [
    "Убедитесь, что это поле содержит не менее 6 символов."
  ]
}
```

---

### Авторизация (Вход)
* **URL:** `/api/users/login/`
* **Метод:** `POST`
* **Доступ:** Любой (`AllowAny`)
* **Вход (JSON Body):**
```json
{
  "username": "string",
  "password": "string"
}
```
* **Ответ при успехе (200 OK):**
```json
{
  "message": "Успешный вход",
  "user": {
    "id": 0,
    "username": "string",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "profile": {
      "id": 0,
      "language": "string",
      "theme": "string"
    }
  },
  "tokens": {
    "refresh": "string",
    "access": "string"
  }
}
```
* **Ответ при неверных данных (401 Unauthorized):**
```json
{
  "error": "Неверный логин или пароль"
}
```

---

### Выход из аккаунта
* **URL:** `/api/users/logout/`
* **Метод:** `POST`
* **Доступ:** Только авторизованные (`IsAuthenticated`)
* **Заголовки:** `Authorization: Bearer <access_token>`
* **Вход (JSON Body):**
```json
{
  "refresh": "string"
}
```
* **Ответ при успехе (205 Reset Content):**
```json
{
  "message": "Вы успешно вышли из аккаунта"
}
```
* **Ответ при отсутствии токена (400 Bad Request):**
```json
{
  "error": "Refresh токен не передан"
}
```
* **Ответ при невалидном/истекшем токене (400 Bad Request):**
```json
{
  "error": "Неверный или истёкший refresh токен"
}
```

---

### Обновление токена доступа
* **URL:** `/api/users/refresh/`
* **Метод:** `POST`
* **Доступ:** Любой (`AllowAny`)
* **Вход (JSON Body):**
```json
{
  "refresh": "string"
}
```
* **Ответ при успехе (200 OK):**
```json
{
  "access": "string"
}
```
* **Ответ при невалидном/истекшем рефреше (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

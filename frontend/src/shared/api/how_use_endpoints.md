# Руководство по работе с API эндпоинтами

В нашем проекте используется строго типизированная архитектура эндпоинтов на основе. Это гарантирует 100% безопасность типов в IDE без использования сторонних библиотек валидации (вроде Zod).


# Использование эндпоинтов в Сторах / Компонентах

Эндпоинты возвращают объект, содержащий HTTP-статус (`status`) и тело ответа (`data`). Чтобы получить автодополнение полей, всегда используйте конструкцию `switch (result.status)` или блоки `if`.

## пример

```typescript
import { loginUser } from '@/shared/api/endpoints/login';

// Внутри экшена Zustand:
login: async (username, password) => {
  set({ isLoading: true });

  // 1. Вызываем функцию эндпоинта
  const result = await loginUser({ username, password });

  // В этой точке result.data еще не типизирован, так как статус неизвестен!
  set({ isLoading: false });

  // 2. Сужаем тип через switch-case
  switch (result.status) {
    case 200:
      // IDE знает, что здесь доступны: result.data.tokens и result.data.user
      localStorage.setItem('rt', result.data.tokens.refresh);
      set({ _accessToken: result.data.tokens.access, isAuth: true });
      return "successful";

    case 401:
      // IDE знает, что здесь доступно только поле result.data.error
      console.log(result.data.error); // "Неверный логин или пароль"
      return "incorrect login or password";

    case 500:
      // Срабатывает при системных сбоях (сеть, упал сервер)
      return "server error";
  }
}
```

# Создание нового

При создании нового файла в папке `endpoints/` придерживайтесь монолитной структуры из шаблона. Цель сделать использование эндпоинта удобным. 

Так-же, при создании эндпоинта строго придерживаетесь openapi. Если нужного вам эндпоинта в openapi нет вы имеете полное право обидиться на бекендера. Но на всякий случай можете попробовать скинуть код бекенда нейросети что-бы она расписала для вас эндпоинты.

## Критически важное правило: Выбор клиента (`client` vs `authClient`)

В нашей архитектуре есть два Axios-клиента. Ошибка в их выборе может привести к **зацикливанию приложения (Circular Dependency)** или утечке токенов.

1. **`client` (Базовый)** 
   * **Где использовать:** Только для публичных эндпоинтов, где **НЕ** нужен заголовок `Authorization: Bearer` (`login`, `registration`, `refresh`).
   * **Почему:** Он полностью независим. Наш интерцептор авторизации использует эндпоинт `refresh` (работающий на базовом `client`), чтобы обновить токен. Если бы `refresh` работал на `authClient`, приложение ушло бы в бесконечный цикл бесконечных попыток обновиться.

2. **`authClient` (Авторизованный)**
   * **Где использовать:** Для **ВСЕХ** остальных эндпоинтов приложения, которые **требуют авторизации** (получение профиля, создание записей, а также `logout`).
   * **Почему:** Он автоматически подставляет текущий `_accessToken` из Zustand в заголовки. Если сервер вернет `401 Unauthorized`, `authClient` сам заморозит запрос, тихо обновит токен через `_refreshToken()` и повторит ваш запрос заново. Юзер ничего не заметит. И вам не нужно думать над авторизацией 

## Шаблон для создания нового эндпоинта (Пример: Получение профиля)

Создаем файл `src/shared/api/endpoints/getProfile.ts`:

```typescript
// 1. ВАЖНО: Выбираем правильный клиент! Профиль требует авторизации -> authClient
import { authClient } from '../authClient'; 

// 2. Описываем входные данные (если параметров нет, интерфейс можно пропустить)
export interface ProfileRequest {
  userId: number;
}

// 3. Описываем итоговый тип ответа (Discriminated Union)
export type ProfileResponse =

  | {
      status: 200;
      data: {
        id: number;
        bio: string;
        avatar_url: string;
      };
    }
  | {
      status: 404;
      data: {
        detail: string; // "Пользователь не найден"
      };
    }

  | {
      status: 500;
      data: {
        message: string; // Заглушка для ошибок сети
      };
    };

// 4. Функция эндпоинта
export async function getProfile(params: ProfileRequest): Promise<ProfileResponse> {
  try {
    const response = await authClient.get<any>(`users/profile/${params.userId}/`, {
      // Явно перечисляем статусы, которые мы обрабатываем в блоке try БЕЗ вызова throw
      validateStatus: (status) => status === 200 || status === 404,
    });

    // Принудительно приводим к нашему типу. TS проверит совпадение пар status + data
    return {
      status: response.status,
      data: response.data,
    } as ProfileResponse;

  } catch (error) {
    // Сюда падают только инфраструктурные аварии (нет сети, упал прокси-сервер 502, 403 Forbidden)
    console.error(`Критическая ошибка при получении профиля ${params.userId}:`, error);

    // Гарантируем, что фронтенд получит предсказуемый объект, который не уронит UI
    return {
      status: 500,
      data: { message: 'Произошла непредвиденная ошибка сети или инфраструктуры' },
    };
  }
}
```

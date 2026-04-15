Для развертывания:
1) Создайте в данном репозиторий venv файл
2) Подключите его 'venv\Scripts\activate'
3) Скачайте пакеты из файла requirements.txt 'pip install -r requirements.txt'


## Структура Django проекта
```
fitness_tracker/
├── manage.py
├── config/                 # 🟦 Core: настройки, urls, wsgi/asgi, общие утилиты
├── apps/
│   ├── users/              # 👤 Аутентификация, профили, настройки
│   ├── exercises/          # 🏋️ Каталог упражнений и группы мышц
│   ├── programs/           # 📅 Готовые программы тренировок
│   ├── workouts/           # 🔥 Дневник тренировок, сеты, календарь, недавние
│   ├── measurements/       # ⚖️ Замеры веса и история
│   └── notes/              # 📝 Блокнот
├── requirements.txt
├── docker-compose.yml (опционально)
└── README.md
```

---
### 🧩 Детализация приложений

#### 1. `config` (Core)
*Назначение:* Базовая конфигурация проекта, маршрутизация, общие миксины, пагинация, кастомные исключения, настройки DRF, JWT, CORS.
*Что внутри:*
- `settings.py`: разделение на `base`, `dev`, `prod`.
- `urls.py`: корневой роутер (`/api/v1/`, `/admin/`, `schema/` для Swagger).
- `utils/`: хелперы для дат, валидаторы, кастомные permissions.
- `pagination.py`: стандартная пагинация для списков (10/20/50 items).

#### 2. `users`
*Назначение:* Управление пользователями, аутентификация, сохранение настроек.
*Модели:*
- `User` (наследует `AbstractUser`): `id`, `username`, `email`, `password`, `is_admin` (или используйте встроенные `is_staff`/`is_superuser`), `created_at`.
- `UserProfile` (OneToOne): `theme` (light/dark), `language` (ru/en). *Примечание: тему и язык лучше хранить на фронтенде в `localStorage`, но бэкенд может синхронизировать их для кросс-девайсного опыта.*
*API эндпоинты:*
- `POST /api/v1/auth/register/`
- `POST /api/v1/auth/login/` (выдача JWT)
- `GET/PATCH /api/v1/users/profile/`
- `PATCH /api/v1/users/settings/` (сохранение темы/языка)

#### 3. `exercises`
*Назначение:* Справочник упражнений и групп мышц. Независимое приложение.
*Модели:*
- `MuscleGroup`: `id`, `name` (Грудь, Спина, Ноги и т.д.)
- `Exercise`: `id`, `muscle_group_id` (FK), `name`, `description`, `image_url`
*Функционал по ТЗ:* Заполнение каталога через админку. Frontend запрашивает список по группам мышц для страницы «Упражнения».
*API эндпоинты:*
- `GET /api/v1/exercises/muscle-groups/`
- `GET /api/v1/exercises/?group_id=...&search=...`

#### 4. `programs`
*Назначение:* Готовые тренировочные программы с днями и упражнениями.
*Модели:*
- `Program`: `id`, `name`, `description`, `difficulty` (choices: BEGINNER, INTERMEDIATE, ADVANCED)
- `ProgramDay`: `id`, `program_id` (FK), `name` (День 1 — Сила верха), `day_number`
- `ProgramDayExercise`: `id`, `program_day_id` (FK), `exercise_id` (FK), `exercise_order`
*Функционал по ТЗ:* Карточки программ → страница программы → список дней → кнопка «Добавить все в сегодняшнюю тренировку».
*API эндпоинты:*
- `GET /api/v1/programs/`
- `GET /api/v1/programs/{id}/days/`
- `GET /api/v1/programs/{id}/days/{day_id}/exercises/`
- `POST /api/v1/programs/{id}/days/{day_id}/import-to-today/` (копирует упражнения в `workouts`)

#### 5. `workouts`
*Назначение:* Ядро дневника тренировок. Логика текущей тренировки, сетов, календаря и недавних упражнений.
*Модели:*
- `Workout`: `id`, `user_id` (FK), `date` (unique together с user_id)
- `WorkoutExercise`: `id`, `workout_id` (FK), `exercise_id` (FK), `exercise_order`
- `Set`: `id`, `workout_exercise_id` (FK), `weight`, `reps`, `set_number`
- `RecentExercise`: `id`, `user_id` (FK), `exercise_id` (FK), `last_used`, `use_count`
*Функционал по ТЗ:* 
- Создание тренировки на дату
- Добавление/удаление упражнений (`+` / 🗑)
- Логирование подходов (вес, повторения)
- Автоматическое обновление `RecentExercise` при добавлении подхода
- Отдача дат тренировок для календаря на фронтенде
*API эндпоинты:*
- `GET /api/v1/workouts/today/`
- `GET /api/v1/workouts/?date=YYYY-MM-DD`
- `POST /api/v1/workouts/{id}/exercises/`
- `DELETE /api/v1/workouts/{id}/exercises/{ex_id}/`
- `POST /api/v1/workouts/{id}/exercises/{ex_id}/sets/`
- `GET /api/v1/workouts/calendar-dates/` (возвращает массив дат с тренировками)
- `GET /api/v1/exercises/recent/`

#### 6. `measurements`
*Назначение:* Трекинг веса и построение графика.
*Модели:*
- `WeightRecord`: `id`, `user_id` (FK), `date`, `weight`, `comment`, `created_at`
*Функционал по ТЗ:* Форма добавления, лента истории с редактированием/удалением, данные для линейного графика.
*API эндпоинты:*
- `GET /api/v1/measurements/weight/` (с пагинацией и фильтрацией по датам)
- `POST /api/v1/measurements/weight/`
- `PUT/DELETE /api/v1/measurements/weight/{id}/`
- `GET /api/v1/measurements/weight/chart-data/` (агрегация: `SELECT date, weight ORDER BY date`)

#### 7. `notes`
*Назначение:* Простой текстовый редактор.
*Модели:*
- `Note`: `id`, `user_id` (FK, Unique), `content` (TEXT), `updated_at`
*Функционал по ТЗ:* Один блокнот на пользователя. Автосохранение или кнопка "Сохранить".
*API эндпоинты:*
- `GET/PUT /api/v1/notes/` (так как заметка одна на пользователя, используем `PUT` для обновления)





### 📂 1. Приложение `users`
**Назначение:** Аутентификация и базовые данные о юзере.
*В этом приложении живет кастомная модель пользователя.*

*   **`User`** (Custom User Model)
    *   `id` (PK)
    *   `username` (TEXT/CharField) — *уникальное имя*
    *   `email` (TEXT/EmailField) — *для логина*
    *   `password_hash` (TEXT/PasswordField) — *безопасное хранение пароля*
    *   `is_admin` (BOOLEAN/BooleanField) — *флаг администратора (из схемы)*
    *   `created_at` (TIMESTAMP/DateTimeField) — *дата регистрации*
    *   *Наследует `AbstractUser` для интеграции с Django Auth.*

---

### 📂 2. Приложение `exercises`
**Назначение:** Справочник (каталог) упражнений. Данные общие для всех, редактируются через админку.

*   **`MuscleGroup`**
    *   `id` (PK)
    *   `name` (TEXT/CharField) — *Грудь, Спина, Ноги и т.д.*

*   **`Exercise`**
    *   `id` (PK)
    *   `muscle_group` (FK → MuscleGroup) — *связь с группой мышц*
    *   `name` (TEXT/CharField) — *Название упражнения (из ТЗ 3.2)*
    *   `description` (TEXT/TextField) — *описание техники*
    *   `image_url` (TEXT/URLField или ImageField) — *ссылка на фото*

---

### 📂 3. Приложение `workouts`
**Назначение:** Дневник тренировок пользователя. Самая сложная часть логики.
*Сюда же относим `RecentExercise`, так как это история использования упражнений в тренировках.*

*   **`Workout`**
    *   `id` (PK)
    *   `user` (FK → User) — *кому принадлежит тренировка*
    *   `date` (DATE/DateField) — *дата тренировки (уникальна для юзера)*

*   **`WorkoutExercise`**
    *   `id` (PK)
    *   `workout` (FK → Workout)
    *   `exercise` (FK → Exercise)
    *   `exercise_order` (INTEGER) — *порядок отображения в списке*

*   **`Set`**
    *   `id` (PK)
    *   `workout_exercise` (FK → WorkoutExercise)
    *   `weight` (REAL/FloatField) — *вес в кг*
    *   `reps` (INTEGER) — *количество повторений*
    *   `set_number` (INTEGER) — *номер подхода (1, 2, 3...)*

*   **`RecentExercise`** *(Задача Разработчика 8)*
    *   `id` (PK)
    *   `user` (FK → User)
    *   `exercise` (FK → Exercise)
    *   `last_used` (TIMESTAMP) — *когда последний раз делали*
    *   `use_count` (INTEGER) — *сколько раз добавляли (для сортировки)*

---

### 📂 4. Приложение `programs`
**Назначение:** Готовые шаблоны программ тренировок (контент от админа).

*   **`Program`**
    *   `id` (PK)
    *   `name` (TEXT/CharField) — *Название программы*
    *   `difficulty` (TEXT/CharField) — *Уровень: НАЧАЛЬНЫЙ, СРЕДНИЙ, ПРОДВИНУТЫЙ (choices)*
    *   `description` (TEXT/TextField) — *Описание программы*

*   **`ProgramDay`**
    *   `id` (PK)
    *   `program` (FK → Program)
    *   `name` (TEXT/CharField) — *Название дня (напр. "День 1 — Сила верха")*
    *   `day_number` (INTEGER) — *порядковый номер дня*

*   **`ProgramDayExercise`**
    *   `id` (PK)
    *   `program_day` (FK → ProgramDay)
    *   `exercise` (FK → Exercise)
    *   `exercise_order` (INTEGER) — *порядок упражнений в дне*

---

### 📂 5. Приложение `measurements`
**Назначение:** Трекинг веса и замеров тела.

*   **`WeightRecord`**
    *   `id` (PK)
    *   `user` (FK → User)
    *   `date` (DATE/DateField) — *дата замера*
    *   `weight` (REAL/FloatField) — *вес в кг*
    *   `comment` (TEXT/TextField) — *комментарий (из ТЗ 3.6)*
    *   `created_at` (TIMESTAMP) — *когда создана запись*

---

### 📂 6. Приложение `notes`
**Назначение:** Личный блокнот пользователя.
*(Полностью в зоне ответственности Разработчика 8)*

*   **`Note`**
    *   `id` (PK)
    *   `user` (FK → User, Unique=True) — *одна заметка на одного юзера*
    *   `content` (TEXT/TextField) — *текст заметки*
    *   `updated_at` (TIMESTAMP) — *дата последнего изменения*

---

### 📂 7. Приложение `site_config` (или `common`)
**Назначение:** Глобальные настройки сайта, не привязанные к конкретному юзеру.
*(Полностью в зоне ответственности Разработчика 8 — соцсети в шапке)*

*   **`SocialLink`**
    *   `id` (PK)
    *   `platform` (TEXT/CharField) — *Telegram, Instagram, VK и т.д.*
    *   `url` (URLField) — *ссылка*
    *   `icon` (ImageField) — *иконка соцсети*
    *   `order` (INTEGER) — *порядок отображения в шапке*
    *   `is_active` (BOOLEAN) — *показывать ли ссылку*

---
## 👨‍ **РАЗРАБОТЧИК 1:
### Реализовать Модели:
- Кастомная модель User (расширение AbstractUser)

### API Endpoints:
- `/api/auth/register/` - регистрация
- `/api/auth/login/` - логин
- `/api/auth/refresh/` - обновление токена
- `/api/auth/logout/` - логаут

## 👨‍💻 **РАЗРАБОТЧИК 2: Exercises & Muscle Groups**
### Основные задачи:
- [ ] Создание приложения `exercises`
- [ ] Реализация CRUD для групп мышц
- [ ] Реализация CRUD для упражнений
- [ ] Загрузка и обработка изображений упражнений
- [ ] Поиск и фильтрация упражнений
- [ ] Категоризация по группам мышц
- [ ] Валидация данных

### Модели:
- `MuscleGroup` (id, name)
- `Exercise` (id, muscle_group_id FK, name, description, image_url)

### API Endpoints:
- `GET /api/exercises/muscle-groups/` - список групп мышц
- `GET /api/exercises/` - список всех упражнений (с фильтрацией по группе)
- `GET /api/exercises/{id}/` - детали упражнения
- `POST /api/exercises/` - создание (admin only)
- `PUT/DELETE /api/exercises/{id}/` - редактирование/удаление (admin only)
- 
## 👨‍💻 **РАЗРАБОТЧИК 3: Workouts & Sets (Ядро системы)**

### Основные задачи:
- [ ] Создание приложения `workouts`
- [ ] Логика создания тренировки на дату
- [ ] Добавление/удаление упражнений из тренировки
- [ ] Управление подходами (sets)
- [ ] Валидация уникальности тренировки на дату
- [ ] Подсчет статистики (упражнения, подходы, общий вес)
- [ ] Оптимизация запросов (select_related, prefetch_related)

### Модели:
- `Workout` (id, user_id FK, date)
- `WorkoutExercise` (id, workout_id FK, exercise_id FK, exercise_order)
- `Set` (id, workout_exercise_id FK, weight, reps, set_number)

### API Endpoints:
- `GET /api/workouts/today/` - сегодняшняя тренировка
- `GET /api/workouts/{date}/` - тренировка за дату
- `POST /api/workouts/{id}/exercises/` - добавить упражнение
- `DELETE /api/workouts/{id}/exercises/{exercise_id}/` - удалить упражнение
- `POST /api/workouts/{id}/exercises/{exercise_id}/sets/` - добавить подход
- `PUT/DELETE /api/sets/{id}/` - редактирование/удаление подхода
- `GET /api/workouts/{id}/stats/` - статистика тренировки
## 👨‍💻 **РАЗРАБОТЧИК 4: Training Programs**

### Основные задачи:
- [ ] Создание приложения `programs`
- [ ] CRUD для программ тренировок
- [ ] Управление днями программы
- [ ] Привязка упражнений к дням
- [ ] Функция импорта программы в текущую тренировку
- [ ] Уровни сложности (choices)
- [ ] Вложенные сериализаторы для программ

### Модели:
- `Program` (id, name, difficulty, description)
- `ProgramDay` (id, program_id FK, name, day_number)
- `ProgramDayExercise` (id, program_days_id FK, exercise_id FK, exercise_order)

### API Endpoints:
- `GET /api/programs/` - список программ
- `GET /api/programs/{id}/` - детали программы с днями
- `GET /api/programs/{id}/days/{day_id}/` - упражнения конкретного дня
- `POST /api/programs/{id}/days/{day_id}/import/` - импортировать в сегодняшнюю тренировку
- `POST/PUT/DELETE /api/programs/` - управление программами (admin)

---

## 👨‍💻 **РАЗРАБОТЧИК 5: Weight Tracking & Measurements**

### Основные задачи:
- [ ] Создание приложения `measurements`
- [ ] CRUD для записей веса
- [ ] Автоматическая установка даты
- [ ] Валидация числовых значений
- [ ] Агрегация данных для графика
- [ ] Сортировка по дате
- [ ] Фильтрация по периоду

### Модели:
- `WeightRecord` (id, user_id FK, date, weight, comment, created_at)

### API Endpoints:
- `GET /api/measurements/weight/` - список записей (с пагинацией)
- `GET /api/measurements/weight/chart-data/` - данные для графика (date, weight)
- `POST /api/measurements/weight/` - добавить запись
- `PUT /api/measurements/weight/{id}/` - редактировать
- `DELETE /api/measurements/weight/{id}/` - удалить
- `GET /api/measurements/weight/stats/` - статистика (мин, макс, средний, текущий)

---

## 👨‍💻 **РАЗРАБОТЧИК 6: Notes & User Settings**

### Основные задачи:
- [ ] Создание приложения `notes`
- [ ] CRUD для заметок (одна заметка на пользователя)
- [ ] Автосохранение или ручное сохранение
- [ ] Создание приложения `users` (профиль, настройки)
- [ ] Управление языком и темой
- [ ] Валидация уникальности заметки

### Модели:
- `Note` (id, user_id FK UNIQUE, content, updated_at)
- `UserProfile` (user_id FK UNIQUE, language, theme)

### API Endpoints:
**Notes:**
- `GET /api/notes/` - получить заметку
- `PUT /api/notes/` - обновить заметку

**Settings:**
- `GET /api/users/profile/` - профиль пользователя
- `PATCH /api/users/profile/` - обновление профиля
- `GET /api/users/settings/` - настройки
- `PATCH /api/users/settings/` - обновление настроек (язык, тема)

---

## 👨‍ **РАЗРАБОТЧИК 7: Calendar, Statistics & Recent Exercises**

### Основные задачи:
- [ ] Создание приложения `calendar` (или интеграция в workouts)
- [ ] Получение дат с тренировками для календаря
- [ ] Агрегация статистики (неделя, месяц, год)
- [ ] Система recent exercises (часто используемые)
- [ ] Оптимизация агрегационных запросов
- [ ] Кэширование статистики (Redis)

### Модели:
- `RecentExercise` (id, user_id FK, exercise_id FK, last_used, use_count)

### API Endpoints:
- `GET /api/calendar/month/{year}/{month}/` - даты тренировок за месяц
- `GET /api/statistics/summary/` - общая статистика пользователя
- `GET /api/statistics/period/` - статистика за период
- `GET /api/exercises/recent/` - недавние упражнения
- `POST /api/exercises/recent/update/` - обновление счетчика (автоматически при добавлении подхода)


## 👨‍💻 **РАЗРАБОТЧИК 8: Admin Panel, Documentation & Testing**

### Основные задачи:
- [ ] Кастомизация Django Admin
- [ ] Inline редактирование для Program → Days → Exercises
- [ ] Inline редактирование для Exercise → Muscle Groups
- [ ] Настройка прав доступа (permissions)
- [ ] Интеграция drf-spectacular/drf-yasg (Swagger/OpenAPI)
- [ ] Написание unit-тестов (pytest)
- [ ] Интеграционное тестирование API
- [ ] API документация для frontend команды
- [ ] Настройка логирования
- [ ] Performance optimization (индексы БД, оптимизация запросов)

### Admin Features:
- [ ] Массовое добавление упражнений
- [ ] Импорт/экспорт данных
- [ ] Drag-and-drop сортировка упражнений в программе
- [ ] Визуализация связей между моделями

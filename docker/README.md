Запуск:
`cd docker`
`docker-compose up --build`

Доступ: `http://localhost:3000/login`

Данные для входа:
Логин: `admin`
Пароль: `admin`

Файлы:
`Dockerfile.backend` - сборка бэкенда (Django + Python 3.12)
`Dockerfile.frontend` - сборка фронтенда (React + Node.js 20)
`docker-compose.yml` - оркестрация двух сервисов
`entrypoint.sh` - запускает миграции, создаёт admin/admin и стартует бэкенд.
`.env` - переменные окружения (адрес бэкенда)
`.dockerignore` - исключает лишние файлы из сборки

Команды
`docker-compose up --build`   # собрать и запустить
`docker-compose down`         # остановить
`docker-compose logs -f`      # логи

После запуска открой `http://localhost:3000/login` и введи `admin/admin`
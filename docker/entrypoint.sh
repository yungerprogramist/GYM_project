#!/bin/sh
python AndryxaGym_backend/manage.py migrate
python AndryxaGym_backend/manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@admin.com', 'admin') if not User.objects.filter(username='admin').exists() else None"
python AndryxaGym_backend/manage.py runserver 0.0.0.0:8000
#!/bin/sh
python AndryxaGym_backend/manage.py migrate
python AndryxaGym_backend/manage.py createsuperuser --noinput --username admin --password admin --email admin@admin.com || true
python AndryxaGym_backend/manage.py runserver 0.0.0.0:8000
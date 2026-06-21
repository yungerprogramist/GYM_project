from .settings import *

ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'corsheaders',
] + INSTALLED_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
] + MIDDLEWARE

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
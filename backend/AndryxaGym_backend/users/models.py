from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class UserProfile(models.Model):
    LANGUAGE_CHOICES = [('en', 'English'), ('ru', 'Russian')]
    THEME_CHOICES = [('light', 'Light'), ('dark', 'Dark')]

    language = models.CharField(max_length=10, default='en', choices=LANGUAGE_CHOICES)
    theme = models.CharField(max_length=20, default='light', choices=THEME_CHOICES)

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username
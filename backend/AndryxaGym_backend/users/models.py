from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    language = models.CharField(max_length=10, default="en")
    theme = models.CharField(max_length=20, default="light")

    def __str__(self):
        return self.user.username
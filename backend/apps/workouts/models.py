from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.exercises.models import Exercise

User = get_user_model()

class RecentExercise(models.Model):
    """Модель для отслеживания часто используемых упражнений"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='recent_usage')
    last_used = models.DateTimeField(default=timezone.now)
    use_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ['user', 'exercise']  # Один пользователь - одно упражнение
        ordering = ['-last_used']
        indexes = [
            models.Index(fields=['user', '-last_used']),
            models.Index(fields=['user', '-use_count']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.exercise.name} ({self.use_count})"
    
    def increment_usage(self):
        """Увеличить счетчик использования"""
        self.use_count += 1
        self.last_used = timezone.now()
        self.save()

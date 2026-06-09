from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

# class Workout1(models.Model):
#     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')
#     date = models.DateTimeField(auto_now_add=True)
#     notes = models.TextField(blank=True, null=True)

#     class Meta:
#         ordering = ['-date']

class RecentExercise(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='recent_exercises')
    exercise = models.ForeignKey('exercises.Exercise', on_delete=models.CASCADE)
    last_used = models.DateTimeField(auto_now=True)
    use_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('user', 'exercise')
        ordering = ['-use_count', '-last_used']
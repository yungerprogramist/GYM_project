from django.db import models
from django.conf import settings
from exercises.models import Exercise


class Workout(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='workouts'
    )
    date = models.DateField()

    class Meta:
        unique_together = ['user', 'date']
        ordering = ['-date']
        verbose_name = 'Тренировка'
        verbose_name_plural = 'Тренировки'

    def __str__(self):
        return f"{self.user.username} - {self.date}"


class WorkoutExercise(models.Model):
    workout = models.ForeignKey(
        Workout,
        on_delete=models.CASCADE,
        related_name='exercises'
    )
    exercise = models.ForeignKey(
        Exercise,
        on_delete=models.CASCADE,
        related_name='workout_entries'
    )
    exercise_order = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ['workout', 'exercise']
        ordering = ['exercise_order']
        verbose_name = 'Упражнение в тренировке'
        verbose_name_plural = 'Упражнения в тренировке'

    def __str__(self):
        return f"{self.exercise.name} (порядок: {self.exercise_order})"


class Set(models.Model):
    workout_exercise = models.ForeignKey(
        WorkoutExercise,
        on_delete=models.CASCADE,
        related_name='sets'
    )
    weight = models.FloatField()
    reps = models.PositiveIntegerField()
    set_number = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['set_number']
        verbose_name = 'Подход'
        verbose_name_plural = 'Подходы'

    def __str__(self):
        return f"Подход {self.set_number}: {self.weight} кг × {self.reps} повт."

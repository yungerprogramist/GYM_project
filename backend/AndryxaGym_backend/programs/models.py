from django.db import models
from exercises.models import Exercise


class Program(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    name = models.CharField(max_length=255)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProgramDay(models.Model):
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='days')
    name = models.CharField(max_length=255)
    day_number = models.PositiveIntegerField()

    class Meta:
        ordering = ['day_number']
        unique_together = ['program', 'day_number']

    def __str__(self):
        return f"{self.program.name} - Day {self.day_number}: {self.name}"


class ProgramDayExercise(models.Model):
    program_day = models.ForeignKey(ProgramDay, on_delete=models.CASCADE, related_name='exercises')
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    exercise_order = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['exercise_order']
        unique_together = ['program_day', 'exercise']

    def __str__(self):
        return f"{self.program_day} - {self.exercise.name}"

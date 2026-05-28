from django.db import models


class MuscleGroup(models.Model):
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Muscle Group"
        verbose_name_plural = "Muscle Groups"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
        ]

    def __str__(self):
        return self.name


class Exercise(models.Model):
    muscle_group = models.ForeignKey(
        MuscleGroup,
        on_delete=models.CASCADE,
        related_name="exercises",
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    image = models.ImageField(
        upload_to="exercises/images/",
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "Exercise"
        verbose_name_plural = "Exercises"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["muscle_group"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.muscle_group})"
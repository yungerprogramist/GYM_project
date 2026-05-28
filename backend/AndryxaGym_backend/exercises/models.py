from django.db import models


class MuscleGroup(models.Model):
<<<<<<< HEAD
    name = models.CharField(max_length=100, unique=True)

    class Meta:
        verbose_name = "Muscle Group"
        verbose_name_plural = "Muscle Groups"
        ordering = ["name"]
        indexes = [
            models.Index(fields=["name"]),
        ]
=======
    """Группа мышц (Грудь, Спина, Ноги и т.д.)"""
    name = models.CharField(max_length=100, unique=True, verbose_name="Название")

    class Meta:
        verbose_name = "Группа мышц"
        verbose_name_plural = "Группы мышц"
        ordering = ["name"]
>>>>>>> origin/main

    def __str__(self):
        return self.name


class Exercise(models.Model):
<<<<<<< HEAD
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
=======
    """Упражнение из каталога"""
    muscle_group = models.ForeignKey(
        MuscleGroup,
        on_delete=models.CASCADE,        # если удалить группу — удалятся все её упражнения
        related_name="exercises",        # MuscleGroup.exercises.all() — удобный обратный доступ
        verbose_name="Группа мышц",
    )
    name = models.CharField(max_length=200, verbose_name="Название")
    description = models.TextField(blank=True, default="", verbose_name="Описание")
    image = models.ImageField(
        upload_to="exercises/images/",   # файлы сохраняются в media/exercises/images/
        blank=True,
        null=True,
        verbose_name="Изображение",
    )

    class Meta:
        verbose_name = "Упражнение"
        verbose_name_plural = "Упражнения"
        ordering = ["name"]
>>>>>>> origin/main

    def __str__(self):
        return f"{self.name} ({self.muscle_group})"
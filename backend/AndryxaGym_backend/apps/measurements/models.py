from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

User = get_user_model()


class WeightRecord(models.Model):
    user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,
    related_name='weight_records',
    verbose_name='User',
    null=True,
    blank=True
    )
    date = models.DateField(
        default=timezone.now,
        verbose_name='Date'
    )
    weight = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        validators=[
            MinValueValidator(20.0),
            MaxValueValidator(500.0)
        ],
        verbose_name='Weight'
    )
    comment = models.TextField(
        blank=True,
        null=True,
        verbose_name='Comment'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Created at'
    )

    class Meta:
        verbose_name = 'Weight record'
        verbose_name_plural = 'Weight records'
        ordering = ['-date', '-created_at']
        unique_together = ['user', 'date']

    def __str__(self):
        return f"{self.user.username} - {self.weight} kg ({self.date})"
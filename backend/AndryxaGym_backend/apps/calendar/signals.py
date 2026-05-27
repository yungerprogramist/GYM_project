from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.cache import cache
from .models import RecentExercise
# from exercises.models import ExerciseSet

@receiver(post_save)  # Добавь sender=ExerciseSet когда создашь модель
def update_recent_exercise(sender, instance, created, **kwargs):
    """
    Автоматически обновляет счетчик при добавлении подхода
    """
    if hasattr(instance, 'exercise') and hasattr(instance, 'user'):
        user = instance.user
        exercise = instance.exercise
        
        recent_ex, _ = RecentExercise.objects.get_or_create(
            user=user,
            exercise=exercise
        )
        recent_ex.increment_use()
        
        # Очищаем кэш
        cache.delete(f"stats_summary_{user.id}")
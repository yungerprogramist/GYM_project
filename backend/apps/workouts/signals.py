from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.exercises.models import Set
from .services import RecentExerciseService

@receiver(post_save, sender=Set)
def update_recent_exercise_on_set_created(sender, instance, created, **kwargs):
    """Автоматически обновляем счетчик при создании нового подхода"""
    if created:
        workout_exercise = instance.workout_exercise
        RecentExerciseService.update_recent_exercise(
            user_id=workout_exercise.workout.user_id,
            exercise_id=workout_exercise.exercise_id,
            workout_id=workout_exercise.workout_id
        )

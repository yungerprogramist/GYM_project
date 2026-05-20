from rest_framework import permissions


class IsWorkoutOwner(permissions.BasePermission):
    """Проверка, что пользователь — владелец тренировки"""

    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'workout_exercise'):
            return obj.workout_exercise.workout.user == request.user
        if hasattr(obj, 'workout'):
            return obj.workout.user == request.user
        return False
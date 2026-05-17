from rest_framework import serializers
from django.utils import timezone
from datetime import datetime
from .models import RecentExercise
from apps.exercises.models import Exercise, Workout, WorkoutExercise, Set

class CalendarMonthSerializer(serializers.Serializer):
    """Сериализатор для дат тренировок за месяц"""
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    workout_dates = serializers.ListField(child=serializers.DateField())

class StatisticsSummarySerializer(serializers.Serializer):
    """Общая статистика пользователя"""
    total_workouts = serializers.IntegerField()
    total_exercises = serializers.IntegerField()
    total_sets = serializers.IntegerField()
    total_volume = serializers.FloatField()  # Общий тоннаж (вес * повторения)
    avg_workouts_per_week = serializers.FloatField()
    longest_streak = serializers.IntegerField()  # Самая длинная серия тренировок
    current_streak = serializers.IntegerField()  # Текущая серия

class PeriodStatisticsSerializer(serializers.Serializer):
    """Статистика за период"""
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_workouts = serializers.IntegerField()
    total_sets = serializers.IntegerField()
    total_volume = serializers.FloatField()
    workouts_by_day = serializers.DictField()  # {'2024-01-01': 1, ...}
    top_exercises = serializers.ListField()  # Топ упражнений за период

class RecentExerciseSerializer(serializers.ModelSerializer):
    """Сериализатор для недавних упражнений"""
    exercise_id = serializers.IntegerField(source='exercise.id')
    exercise_name = serializers.CharField(source='exercise.name')
    muscle_group = serializers.CharField(source='exercise.muscle_group.name')
    
    class Meta:
        model = RecentExercise
        fields = ['exercise_id', 'exercise_name', 'muscle_group', 'use_count', 'last_used']

class RecentExerciseUpdateSerializer(serializers.Serializer):
    """Сериализатор для обновления счетчика"""
    exercise_id = serializers.IntegerField()
    workout_id = serializers.IntegerField(required=False)

from django.db import models
from django.db.models import Sum, Count, F, Q
from django.utils import timezone
from datetime import timedelta, datetime
from collections import defaultdict
from typing import Dict, List, Tuple
import json
from django.core.cache import cache
from apps.exercises.models import Workout, WorkoutExercise, Set
from .models import RecentExercise

class StatisticsService:
    """Сервис для агрегации статистики с кэшированием"""
    
    CACHE_TTL = 3600  # 1 час для статистики
    
    @staticmethod
    def get_user_stats_summary(user_id: int) -> dict:
        """Получение общей статистики пользователя с кэшированием"""
        cache_key = f"user_stats_summary_{user_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Агрегационные запросы
        workouts = Workout.objects.filter(user_id=user_id)
        workout_exercises = WorkoutExercise.objects.filter(
            workout__user_id=user_id
        )
        sets = Set.objects.filter(
            workout_exercise__workout__user_id=user_id
        )
        
        # Общая статистика
        total_workouts = workouts.count()
        total_exercises = workout_exercises.values('exercise').distinct().count()
        total_sets = sets.count()
        
        # Общий объем (вес * повторения)
        total_volume = sets.aggregate(
            total=Sum(F('weight') * F('reps'))
        )['total'] or 0.0
        
        # Среднее количество тренировок в неделю
        if total_workouts > 0:
            first_workout = workouts.earliest('date').date
            last_workout = workouts.latest('date').date
            days_span = (last_workout - first_workout).days or 1
            weeks_span = days_span / 7
            avg_workouts_per_week = total_workouts / weeks_span if weeks_span > 0 else 0
        else:
            avg_workouts_per_week = 0
        
        # Серии тренировок
        workout_dates = list(workouts.values_list('date', flat=True).order_by('date'))
        longest_streak, current_streak = StatisticsService._calculate_streaks(workout_dates)
        
        result = {
            'total_workouts': total_workouts,
            'total_exercises': total_exercises,
            'total_sets': total_sets,
            'total_volume': round(total_volume, 2),
            'avg_workouts_per_week': round(avg_workouts_per_week, 1),
            'longest_streak': longest_streak,
            'current_streak': current_streak
        }
        
        # Кэшируем результат
        cache.set(cache_key, result, StatisticsService.CACHE_TTL)
        
        return result
    
    @staticmethod
    def get_period_statistics(user_id: int, start_date: str, end_date: str) -> dict:
        """Статистика за определенный период"""
        cache_key = f"user_stats_period_{user_id}_{start_date}_{end_date}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        # Фильтруем по периоду
        workouts = Workout.objects.filter(
            user_id=user_id,
            date__gte=start_date,
            date__lte=end_date
        )
        
        workout_ids = workouts.values_list('id', flat=True)
        workout_exercises = WorkoutExercise.objects.filter(workout_id__in=workout_ids)
        sets = Set.objects.filter(workout_exercise_id__in=workout_exercises.values('id'))
        
        # Базовая статистика
        total_workouts = workouts.count()
        total_sets = sets.count()
        total_volume = sets.aggregate(
            total=Sum(F('weight') * F('reps'))
        )['total'] or 0.0
        
        # Тренировки по дням
        workouts_by_day = {}
        for workout in workouts:
            date_str = workout.date.strftime('%Y-%m-%d')
            workouts_by_day[date_str] = workouts_by_day.get(date_str, 0) + 1
        
        # Топ упражнений за период
        top_exercises = list(
            workout_exercises.values('exercise__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        result = {
            'start_date': start_date,
            'end_date': end_date,
            'total_workouts': total_workouts,
            'total_sets': total_sets,
            'total_volume': round(total_volume, 2),
            'workouts_by_day': workouts_by_day,
            'top_exercises': top_exercises
        }
        
        cache.set(cache_key, result, StatisticsService.CACHE_TTL)
        return result
    
    @staticmethod
    def get_workout_dates_for_month(user_id: int, year: int, month: int) -> List[str]:
        """Получение дат тренировок за месяц"""
        cache_key = f"workout_dates_{user_id}_{year}_{month}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        start_date = datetime(year, month, 1).date()
        if month == 12:
            end_date = datetime(year + 1, 1, 1).date()
        else:
            end_date = datetime(year, month + 1, 1).date()
        
        workout_dates = Workout.objects.filter(
            user_id=user_id,
            date__gte=start_date,
            date__lt=end_date
        ).values_list('date', flat=True).distinct()
        
        result = [date.strftime('%Y-%m-%d') for date in workout_dates]
        cache.set(cache_key, result, StatisticsService.CACHE_TTL)
        
        return result
    
    @staticmethod
    def _calculate_streaks(dates: List) -> Tuple[int, int]:
        """Расчет серий тренировок"""
        if not dates:
            return 0, 0
        
        longest_streak = 1
        current_streak = 0
        temp_streak = 1
        
        for i in range(1, len(dates)):
            diff = (dates[i] - dates[i-1]).days
            if diff == 1:
                temp_streak += 1
            else:
                longest_streak = max(longest_streak, temp_streak)
                temp_streak = 1
        
        longest_streak = max(longest_streak, temp_streak)
        
        # Текущая серия
        today = timezone.now().date()
        for date in reversed(dates):
            diff = (today - date).days
            if diff == current_streak:
                current_streak += 1
            else:
                break
        
        return longest_streak, current_streak

class RecentExerciseService:
    """Сервис для работы с часто используемыми упражнениями"""
    
    @staticmethod
    def update_recent_exercise(user_id: int, exercise_id: int, workout_id: int = None):
        """Обновление счетчика использования упражнения"""
        recent, created = RecentExercise.objects.get_or_create(
            user_id=user_id,
            exercise_id=exercise_id
        )
        recent.increment_usage()
        
        # Инвалидируем кэш
        cache_key = f"recent_exercises_{user_id}"
        cache.delete(cache_key)
        
        return recent
    
    @staticmethod
    def get_recent_exercises(user_id: int, limit: int = 20):
        """Получение недавних упражнений с кэшированием"""
        cache_key = f"recent_exercises_{user_id}"
        cached_data = cache.get(cache_key)
        
        if cached_data:
            return cached_data
        
        recent_exercises = RecentExercise.objects.filter(
            user_id=user_id
        ).select_related('exercise', 'exercise__muscle_group').order_by('-use_count', '-last_used')[:limit]
        
        result = list(recent_exercises)
        cache.set(cache_key, result, 1800)  # 30 минут
        
        return result

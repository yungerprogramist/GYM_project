from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.db.models import Count, Sum, Avg
from django.core.cache import cache
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Workout, RecentExercise
from .serializers import WorkoutSerializer, RecentExerciseSerializer
from exercises.models import Exercise  # Импортируй свою модель Exercise


class CalendarView(APIView):
    """
    GET /api/calendar/month/{year}/{month}/
    Возвращает даты тренировок за месяц
    """
    def get(self, request, year, month):
        user = request.user
        
        # Получаем уникальные даты тренировок за месяц
        workouts = Workout.objects.filter(
            user=user,
            date__year=year,
            date__month=month
        ).dates('date', 'day')
        
        # Преобразуем в список
        dates = [date.isoformat() for date in workouts]
        
        return Response({
            'year': year,
            'month': month,
            'dates': dates,
            'count': len(dates)
        })


class StatisticsView(APIView):
    """
    GET /api/statistics/summary/ - общая статистика
    """
    def get(self, request):
        user = request.user
        cache_key = f"stats_summary_{user.id}"
        
        # Пробуем получить из кэша
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        # Считаем статистику
        total_workouts = Workout.objects.filter(user=user).count()
        
        # Статистика за неделю
        week_ago = timezone.now() - timedelta(days=7)
        week_workouts = Workout.objects.filter(
            user=user, 
            date__gte=week_ago
        ).count()
        
        # Статистика за месяц
        month_ago = timezone.now() - timedelta(days=30)
        month_workouts = Workout.objects.filter(
            user=user,
            date__gte=month_ago
        ).count()
        
        data = {
            'total_workouts': total_workouts,
            'week_workouts': week_workouts,
            'month_workouts': month_workouts,
            'recent_exercises_count': RecentExercise.objects.filter(user=user).count()
        }
        
        # Кэшируем на 10 минут
        cache.set(cache_key, data, timeout=600)
        
        return Response(data)


class StatisticsPeriodView(APIView):
    """
    GET /api/statistics/period/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    def get(self, request):
        user = request.user
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'start_date and end_date are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        workouts = Workout.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        )
        
        stats = {
            'total_workouts': workouts.count(),
            'start_date': start_date,
            'end_date': end_date
        }
        
        return Response(stats)


class RecentExerciseView(APIView):
    """
    GET /api/exercises/recent/ - список недавних упражнений
    """
    def get(self, request):
        user = request.user
        recent = RecentExercise.objects.filter(user=user)[:10]
        serializer = RecentExerciseSerializer(recent, many=True)
        return Response(serializer.data)


class RecentExerciseUpdateView(APIView):
    """
    POST /api/exercises/recent/update/
    Body: {"exercise_id": 123}
    """
    def post(self, request):
        user = request.user
        exercise_id = request.data.get('exercise_id')
        
        if not exercise_id:
            return Response(
                {'error': 'exercise_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Получаем или создаем запись
        recent_ex, created = RecentExercise.objects.get_or_create(
            user=user,
            exercise_id=exercise_id
        )
        
        # Увеличиваем счетчик
        recent_ex.increment_use()
        
        # Очищаем кэш статистики
        cache.delete(f"stats_summary_{user.id}")
        
        serializer = RecentExerciseSerializer(recent_ex)
        return Response(serializer.data)
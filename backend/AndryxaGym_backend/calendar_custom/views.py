from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Sum, F
from django.db.models.functions import TruncDay, TruncMonth
from django.core.cache import cache
from django.utils import timezone
from datetime import timedelta
from workouts.models import Set 
from .models import RecentExercise
from workouts.models import Workout, WorkoutExercise
from exercises.models import Exercise
from .serializers import RecentExerciseSerializer


class CalendarView(APIView):
    def get(self, request, year, month):
        user = request.user
        
        workouts = Workout.objects.filter(
            user=user,
            date__year=year,
            date__month=month
        ).prefetch_related('exercises__sets')
        
        result = {}
        
        for workout in workouts:
            date_key = workout.date.isoformat()
            
            exercises_qs = workout.exercises.all()
            
            # Считаем через связанные Set
            total_weight = exercises_qs.aggregate(
                total=Sum(F('sets__weight') * F('sets__reps'))
            )['total'] or 0
            
            item = {
                'id': workout.id,
                'date': date_key,
                'exercise_count': exercises_qs.count(),
                'total_weight': total_weight
            }
            
            if date_key not in result:
                result[date_key] = []
            
            result[date_key].append(item)
            
        return Response(result)


class StatisticsView(APIView):
    """
    GET /api/v1/statistics/summary/
    """
    def get(self, request):
        user = request.user
        cache_key = f"stats_summary_{user.id}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)
        
        workouts_qs = Workout.objects.filter(user=user)
        
        stats = workouts_qs.aggregate(
            total_exercises=Count('exercises', distinct=True),
            total_sets=Count('exercises__sets', distinct=True),
        )
        
        # Считаем тоннаж через Set напрямую
        total_weight = Set.objects.filter(
            workout_exercise__workout__user=user
        ).aggregate(
            total=Sum(F('weight') * F('reps'))
        )['total'] or 0
        
        current_streak = 0
        dates = workouts_qs.values_list('date', flat=True).distinct().order_by('-date')
        
        if dates:
            today = timezone.now().date()
            last_date = dates[0]
            
            if (today - last_date).days <= 1:
                current_streak = 1
                for i in range(1, len(dates)):
                    diff = (dates[i-1] - dates[i]).days
                    if diff == 1:
                        current_streak += 1
                    else:
                        break
        
        most_active = workouts_qs.annotate(
            month=TruncMonth('date')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        most_active_month = most_active['month'].strftime('%Y-%m') if most_active else None
        
        most_common = WorkoutExercise.objects.filter(
            workout__user=user
        ).values('exercise__name').annotate(
            count=Count('id')
        ).order_by('-count').first()
        
        most_common_exercise = most_common['exercise__name'] if most_common else None
        
        data = {
            'total_exercises': stats['total_exercises'] or 0,
            'total_sets': stats['total_sets'] or 0,
            'total_weight': float(total_weight),
            'streaks': current_streak,
            'most_active_month': most_active_month,
            'most_common_exercise': most_common_exercise,
            'total_workouts': workouts_qs.count(),
            'week_workouts': workouts_qs.filter(date__gte=timezone.now() - timedelta(days=7)).count(),
            'month_workouts': workouts_qs.filter(date__gte=timezone.now() - timedelta(days=30)).count(),
        }
        
        cache.set(cache_key, data, timeout=600)
        
        return Response(data)

class StatisticsPeriodView(APIView):
    """
    GET /api/v1/statistics/period/?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    def get(self, request):
        user = request.user
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')
        
        if not start_date_str or not end_date_str:
            return Response(
                {'error': 'start_date and end_date are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            start_dt = timezone.datetime.strptime(start_date_str, '%Y-%m-%d').date()
            end_dt = timezone.datetime.strptime(end_date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {'error': 'Invalid date format. Use YYYY-MM-DD'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        qs = Workout.objects.filter(user=user, date__range=[start_dt, end_dt])

        period_data = {
            'start_date': start_date_str,
            'end_date': end_date_str,
            'days_count': (end_dt - start_dt).days + 1
        }

        # Считаем тоннаж через Set напрямую (weight * reps)
        total_weight = Set.objects.filter(
            workout_exercise__workout__user=user,
            workout_exercise__workout__date__range=[start_dt, end_dt]
        ).aggregate(
            total=Sum(F('weight') * F('reps'))
        )['total'] or 0

        totals = qs.aggregate(
            total_workouts=Count('id', distinct=True),
            total_exercises=Count('exercises', distinct=True),
            total_sets=Count('exercises__sets', distinct=True),
        )
        totals['total_weight'] = float(total_weight)
        totals = {k: (v if v is not None else 0) for k, v in totals.items()}

        # Группировка по дням
        daily_stats = qs.annotate(
            day=TruncDay('date')
        ).values('day').annotate(
            count=Count('id', distinct=True),
            exercises=Count('exercises', distinct=True),
        ).order_by('day')

        # Считаем вес для каждого дня отдельно
        workouts_per_day = {}
        for item in daily_stats:
            day = item['day']
            day_weight = Set.objects.filter(
                workout_exercise__workout__user=user,
                workout_exercise__workout__date=day
            ).aggregate(
                total=Sum(F('weight') * F('reps'))
            )['total'] or 0
            
            key = day.strftime('%Y-%m-%d')
            workouts_per_day[key] = {
                'workouts': item['count'],
                'exercises': item['exercises'],
                'weight': float(day_weight)
            }

        # Тренд
        period_length = (end_dt - start_dt).days + 1
        prev_start = start_dt - timedelta(days=period_length)
        prev_end = start_dt - timedelta(days=1)
        
        prev_weight = Set.objects.filter(
            workout_exercise__workout__user=user,
            workout_exercise__workout__date__range=[prev_start, prev_end]
        ).aggregate(
            total=Sum(F('weight') * F('reps'))
        )['total'] or 0
        
        current_weight = totals['total_weight']
        
        if prev_weight > 0:
            trend_percent = round(((current_weight - prev_weight) / prev_weight) * 100, 2)
        elif current_weight > 0:
            trend_percent = 100.0
        else:
            trend_percent = 0.0
            
        trend = {
            'previous_period_weight': float(prev_weight),
            'current_period_weight': current_weight,
            'change_percent': trend_percent,
            'direction': 'up' if trend_percent > 0 else ('down' if trend_percent < 0 else 'stable')
        }

        return Response({
            'period': period_data,
            'totals': totals,
            'workouts_per_day': workouts_per_day,
            'trend': trend
        })


class RecentExerciseView(APIView):
    """
    GET /api/exercises/recent/
    """
    def get(self, request):
        user = request.user
        recent = RecentExercise.objects.filter(
            user=user
        ).order_by('-last_used')[:10]
        
        serializer = RecentExerciseSerializer(recent, many=True)
        return Response(serializer.data)


class RecentExerciseUpdateView(APIView):
    """
    POST /api/v1/exercises/recent/update/
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

        try:
            exercise_id = int(exercise_id)
        except (ValueError, TypeError):
            return Response(
                {'error': 'exercise_id must be an integer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            exercise = Exercise.objects.get(id=exercise_id)
        except Exercise.DoesNotExist:
            return Response(
                {'error': f'Exercise with id {exercise_id} not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        recent_ex, created = RecentExercise.objects.get_or_create(
            user=user,
            exercise=exercise
        )
        
        RecentExercise.objects.filter(id=recent_ex.id).update(
            use_count=F('use_count') + 1,
            last_used=timezone.now()
        )
        
        recent_ex.refresh_from_db()
        
        cache.delete(f"stats_summary_{user.id}")
        
        serializer = RecentExerciseSerializer(recent_ex)
        return Response(serializer.data, status=status.HTTP_200_OK)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers
from datetime import datetime
from .serializers import (
    CalendarMonthSerializer,
    PeriodStatisticsSerializer,
    RecentExerciseSerializer,
    RecentExerciseUpdateSerializer
)
from .services import StatisticsService, RecentExerciseService

class CalendarMonthView(APIView):
    """Получение дат с тренировками за месяц"""
    permission_classes = [IsAuthenticated]
    
    @method_decorator(cache_page(3600))  # Кэшируем на 1 час
    @method_decorator(vary_on_headers('Authorization'))
    def get(self, request, year, month):
        try:
            # Валидация года и месяца
            year = int(year)
            month = int(month)
            if not (1 <= month <= 12):
                return Response(
                    {'error': 'Месяц должен быть от 1 до 12'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            workout_dates = StatisticsService.get_workout_dates_for_month(
                request.user.id, year, month
            )
            
            serializer = CalendarMonthSerializer({
                'year': year,
                'month': month,
                'workout_dates': workout_dates
            })
            
            return Response(serializer.data)
            
        except ValueError:
            return Response(
                {'error': 'Неверный формат года или месяца'},
                status=status.HTTP_400_BAD_REQUEST
            )

class StatisticsSummaryView(APIView):
    """Общая статистика пользователя"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        stats = StatisticsService.get_user_stats_summary(request.user.id)
        return Response(stats)

class PeriodStatisticsView(APIView):
    """Статистика за период"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Получаем параметры периода
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            return Response(
                {'error': 'Параметры start_date и end_date обязательны'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Валидация дат
        try:
            datetime.strptime(start_date, '%Y-%m-%d')
            datetime.strptime(end_date, '%Y-%m-%d')
        except ValueError:
            return Response(
                {'error': 'Даты должны быть в формате YYYY-MM-DD'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        stats = StatisticsService.get_period_statistics(
            request.user.id, start_date, end_date
        )
        
        serializer = PeriodStatisticsSerializer(stats)
        return Response(serializer.data)

class RecentExercisesView(APIView):
    """Получение недавних упражнений"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        limit = request.query_params.get('limit', 20)
        try:
            limit = int(limit)
        except ValueError:
            limit = 20
        
        recent_exercises = RecentExerciseService.get_recent_exercises(
            request.user.id, limit
        )
        
        serializer = RecentExerciseSerializer(recent_exercises, many=True)
        return Response(serializer.data)

class RecentExerciseUpdateView(APIView):
    """Обновление счетчика использования упражнения"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RecentExerciseUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        
        data = serializer.validated_data
        
        try:
            recent = RecentExerciseService.update_recent_exercise(
                user_id=request.user.id,
                exercise_id=data['exercise_id'],
                workout_id=data.get('workout_id')
            )
            
            return Response({
                'message': 'Счетчик обновлен',
                'use_count': recent.use_count,
                'last_used': recent.last_used
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

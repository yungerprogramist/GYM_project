from datetime import date, datetime

from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import status, viewsets, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Workout, WorkoutExercise, Set
from .serializers import (
    WorkoutSerializer,
    WorkoutListSerializer,
    WorkoutExerciseSerializer,
    SetSerializer,
    AddExerciseSerializer,
    CreateSetSerializer,
    WorkoutStatsSerializer,
)
from .permissions import IsWorkoutOwner
from apps.exercises.Models import Exercise


class WorkoutViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = WorkoutSerializer
    permission_classes = [IsAuthenticated, IsWorkoutOwner]

    def get_queryset(self):
        return Workout.objects.filter(
            user=self.request.user
        ).prefetch_related(
            'exercises__sets',
            'exercises__exercise__muscle_group'
        ).select_related('user')

    def get_serializer_class(self):
        if self.action == 'list':
            return WorkoutListSerializer
        if self.action == 'stats':
            return WorkoutStatsSerializer
        return WorkoutSerializer

    def get_workout(self, workout_id):
        """Получить тренировку с проверкой прав"""
        workout = get_object_or_404(Workout, id=workout_id)
        self.check_object_permissions(self.request, workout)
        return workout

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        """GET /api/workouts/today/"""
        today = timezone.localdate()
        workout, created = Workout.objects.get_or_create(
            user=request.user,
            date=today
        )
        serializer = WorkoutSerializer(workout)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='date/(?P<date_str>[0-9]{4}-[0-9]{2}-[0-9]{2})')
    def by_date(self, request, date_str=None):
        """GET /api/workouts/date/YYYY-MM-DD/"""
        try:
            target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response(
                {"error": "Неверный формат даты. Используйте YYYY-MM-DD"},
                status=status.HTTP_400_BAD_REQUEST
            )

        workout = get_object_or_404(
            Workout.objects.filter(user=request.user, date=target_date)
        )
        serializer = WorkoutSerializer(workout)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='exercises')
    def add_exercise(self, request, pk=None):
        """POST /api/workouts/{id}/exercises/"""
        workout = self.get_workout(pk)

        serializer = AddExerciseSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        exercise_id = serializer.validated_data['exercise_id']
        exercise_order = serializer.validated_data.get('exercise_order', 0)

        # Проверка существования упражнения
        exercise = get_object_or_404(Exercise, id=exercise_id)

        # Проверка на дубликат
        if WorkoutExercise.objects.filter(workout=workout, exercise=exercise).exists():
            return Response(
                {"error": "Это упражнение уже добавлено в тренировку"},
                status=status.HTTP_409_CONFLICT
            )

        # Автоматический порядок, если не указан
        if not exercise_order:
            last_order = WorkoutExercise.objects.filter(
                workout=workout
            ).aggregate(max_order=models.Max('exercise_order'))['max_order'] or 0
            exercise_order = last_order + 1

        workout_exercise = WorkoutExercise.objects.create(
            workout=workout,
            exercise=exercise,
            exercise_order=exercise_order
        )

        response_serializer = WorkoutExerciseSerializer(workout_exercise)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'], url_path='exercises/(?P<exercise_id>[0-9]+)')
    def remove_exercise(self, request, pk=None, exercise_id=None):
        """DELETE /api/workouts/{id}/exercises/{exercise_id}/"""
        workout = self.get_workout(pk)
        workout_exercise = get_object_or_404(
            WorkoutExercise,
            workout=workout,
            exercise_id=exercise_id
        )
        workout_exercise.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], url_path='exercises/(?P<exercise_id>[0-9]+)/sets')
    def add_set(self, request, pk=None, exercise_id=None):
        """POST /api/workouts/{id}/exercises/{exercise_id}/sets/"""
        workout = self.get_workout(pk)
        workout_exercise = get_object_or_404(
            WorkoutExercise.objects.select_related('workout'),
            workout=workout,
            exercise_id=exercise_id
        )

        serializer = CreateSetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Автоматический номер подхода
        set_number = serializer.validated_data.get('set_number', 0)
        if not set_number:
            last_number = Set.objects.filter(
                workout_exercise=workout_exercise
            ).aggregate(max_num=models.Max('set_number'))['max_num'] or 0
            set_number = last_number + 1

        workout_set = Set.objects.create(
            workout_exercise=workout_exercise,
            weight=serializer.validated_data['weight'],
            reps=serializer.validated_data['reps'],
            set_number=set_number
        )

        response_serializer = SetSerializer(workout_set)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='stats')
    def stats(self, request, pk=None):
        """GET /api/workouts/{id}/stats/"""
        workout = self.get_workout(pk)

        sets_queryset = Set.objects.filter(
            workout_exercise__workout=workout
        ).select_related('workout_exercise__exercise')

        stats = {
            'date': workout.date,
            'exercise_count': workout.exercises.count(),
            'set_count': sets_queryset.count(),
            'total_weight': sets_queryset.aggregate(
                total=models.Sum('weight')
            )['total'] or 0,
        }

        return Response(stats)


class SetViewSet(
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet
):
    serializer_class = SetSerializer
    permission_classes = [IsAuthenticated, IsWorkoutOwner]
    queryset = Set.objects.all()
    http_method_names = ['put', 'patch', 'delete', 'head', 'options']
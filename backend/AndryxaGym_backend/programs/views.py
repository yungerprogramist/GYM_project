from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Program, ProgramDay
from .serializers import ProgramListSerializer, ProgramDetailSerializer, ProgramDaySerializer
from workouts.models import Workout, WorkoutExercise


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return ProgramListSerializer
        return ProgramDetailSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]

    @action(detail=True, methods=['get'], url_path='days/(?P<day_id>\\d+)')
    def day_exercises(self, request, pk=None, day_id=None):
        program = self.get_object()
        day = get_object_or_404(ProgramDay, id=day_id, program=program)
        serializer = ProgramDaySerializer(day)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='days/(?P<day_id>\\d+)/import')
    def import_to_training(self, request, pk=None, day_id=None):
        program = self.get_object()
        day = get_object_or_404(ProgramDay, id=day_id, program=program)

        today = timezone.localdate()
        workout, created = Workout.objects.get_or_create(
            user=request.user,
            date=today
        )

        imported_count = 0
        for program_exercise in day.exercises.all():
            workout_exercise, ex_created = WorkoutExercise.objects.get_or_create(
                workout=workout,
                exercise=program_exercise.exercise,
                defaults={'exercise_order': program_exercise.exercise_order}
            )
            if ex_created:
                imported_count += 1

        return Response({
            'status': 'success',
            'message': f'День "{day.name}" импортирован в тренировку за {today}',
            'workout_id': workout.id,
            'imported_exercises': imported_count,
            'total_exercises': day.exercises.count(),
        })
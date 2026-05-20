from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Program, ProgramDay
from .serializers import ProgramListSerializer, ProgramDetailSerializer, ProgramDaySerializer


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
        # TODO: добавить логику импорта, когда появится модель Training/Workout
        return Response({
            'status': 'success',
            'message': f'Day "{day.name}" imported to today\'s training'
        })

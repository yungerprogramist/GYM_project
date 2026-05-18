from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import MuscleGroup, Exercise
from .serializers import MuscleGroupSerializer, ExerciseSerializer


class MuscleGroupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    GET /api/v1/exercises/muscle-groups/      — список всех групп мышц
    GET /api/v1/exercises/muscle-groups/{id}/ — детали одной группы

    ReadOnly — редактировать группы можно только через Django Admin.
    """
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer
    permission_classes = [AllowAny]  # список мышц доступен без авторизации


class ExerciseViewSet(viewsets.ModelViewSet):
    """
    GET    /api/v1/exercises/         — список упражнений (с фильтрацией и поиском)
    GET    /api/v1/exercises/{id}/    — детали упражнения
    POST   /api/v1/exercises/         — создать упражнение (только admin)
    PUT    /api/v1/exercises/{id}/    — обновить упражнение (только admin)
    PATCH  /api/v1/exercises/{id}/    — частично обновить (только admin)
    DELETE /api/v1/exercises/{id}/    — удалить упражнение (только admin)

    Фильтрация:  ?muscle_group=1
    Поиск:       ?search=жим
    Сортировка:  ?ordering=name
    """
    queryset = Exercise.objects.select_related("muscle_group").all()
    serializer_class = ExerciseSerializer

    # Бэкенды для фильтрации, поиска и сортировки
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["muscle_group"]   # ?muscle_group=<id>
    search_fields = ["name", "description"]  # ?search=<текст>
    ordering_fields = ["name", "id"]

    def get_permissions(self):
        """
        Читать упражнения может любой авторизованный пользователь.
        Создавать / редактировать / удалять — только admin.
        """
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdminUser()]
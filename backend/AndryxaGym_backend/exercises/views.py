from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiTypes, inline_serializer
from rest_framework import serializers as drf_serializers

from .models import MuscleGroup, Exercise
from .serializers import MuscleGroupSerializer, ExerciseSerializer


@extend_schema_view(
    list=extend_schema(tags=['MuscleGroups']),
    retrieve=extend_schema(tags=['MuscleGroups']),
)
class MuscleGroupViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = MuscleGroup.objects.all()
    serializer_class = MuscleGroupSerializer
    permission_classes = [AllowAny]


exercise_write_schema = inline_serializer(
    name='ExerciseWrite',
    fields={
        'muscle_group': drf_serializers.IntegerField(),
        'name': drf_serializers.CharField(max_length=200),
        'description': drf_serializers.CharField(required=False, default=""),
        'image': drf_serializers.FileField(required=False, allow_null=True),
    }
)


@extend_schema_view(
    list=extend_schema(tags=['Exercises']),
    retrieve=extend_schema(tags=['Exercises']),
    create=extend_schema(
        tags=['Exercises'],
        request={'multipart/form-data': exercise_write_schema},
    ),
    update=extend_schema(
        tags=['Exercises'],
        request={'multipart/form-data': exercise_write_schema},
    ),
    partial_update=extend_schema(
        tags=['Exercises'],
        request={'multipart/form-data': exercise_write_schema},
    ),
    destroy=extend_schema(tags=['Exercises']),
)
class ExerciseViewSet(viewsets.ModelViewSet):
    queryset = Exercise.objects.select_related("muscle_group").all()
    serializer_class = ExerciseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["muscle_group"]
    search_fields = ["name", "description"]
    ordering_fields = ["name", "id"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [IsAuthenticated()]
        return [IsAdminUser()]
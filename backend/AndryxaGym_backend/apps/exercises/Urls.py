from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .Views import MuscleGroupViewSet, ExerciseViewSet

# DefaultRouter автоматически создаёт все нужные URL-маршруты для ViewSet
router = DefaultRouter()
router.register(r"muscle-groups", MuscleGroupViewSet, basename="musclegroup")
router.register(r"", ExerciseViewSet, basename="exercise")

urlpatterns = [
    path("", include(router.urls)),
]

# Итоговые маршруты:
# GET  /api/v1/exercises/                   → список упражнений
# POST /api/v1/exercises/                   → создать (admin)
# GET  /api/v1/exercises/{id}/              → детали
# PUT  /api/v1/exercises/{id}/              → обновить (admin)
# DEL  /api/v1/exercises/{id}/              → удалить (admin)
# GET  /api/v1/exercises/muscle-groups/     → список групп мышц
# GET  /api/v1/exercises/muscle-groups/{id}/→ детали группы
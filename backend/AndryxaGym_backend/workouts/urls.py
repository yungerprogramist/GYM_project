from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkoutViewSet, SetViewSet

router = DefaultRouter()
router.register(r'sets', SetViewSet, basename='set')
router.register(r'', WorkoutViewSet, basename='workout')

urlpatterns = [
    path('', include(router.urls)),
]
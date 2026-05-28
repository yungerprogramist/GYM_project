from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeightRecordViewSet

router = DefaultRouter()
router.register(r'weight', WeightRecordViewSet, basename='weight')

urlpatterns = [
    path('weight/chart-data/', WeightRecordViewSet.as_view({'get': 'chart_data'}), name='weight-chart-data'),
    path('weight/stats/', WeightRecordViewSet.as_view({'get': 'stats'}), name='weight-stats'),
    path('', include(router.urls)),
]
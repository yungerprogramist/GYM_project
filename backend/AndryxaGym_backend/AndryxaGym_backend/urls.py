"""
URL configuration for AndryxaGym_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from .admin_views import model_diagram
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from calendar_custom.views import (
    CalendarView,
    StatisticsView,
    StatisticsPeriodView,
    RecentExerciseView,
    RecentExerciseUpdateView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin/model-diagram/', model_diagram, name='model-diagram'),
    
    path('api/v1/notes/', include('notes.urls')),
    path('api/v1/measurements/', include('measurements.urls')),
    path('api/v1/programs/', include('programs.urls')),  
    path('api/v1/workouts/', include('workouts.urls')),
    path('api/v1/users/', include('users.urls')),     
    path('api/v1/users/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/exercises/', include('exercises.urls')),
    path('api/v1/calendar/month/<int:year>/<int:month>/', CalendarView.as_view()),
    path('api/v1/statistics/summary/', StatisticsView.as_view()),
    path('api/v1/statistics/period/', StatisticsPeriodView.as_view()),
    path('api/v1/exercises/recent/', RecentExerciseView.as_view()),
    path('api/v1/exercises/recent/update/', RecentExerciseUpdateView.as_view()),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
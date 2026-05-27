"""
URL configuration for AndryxaGym_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings
from apps.calendar.views import (
    CalendarView,
    StatisticsView,
    StatisticsPeriodView,
    RecentExerciseView,
    RecentExerciseUpdateView
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
    path('api/measurements/', include('apps.measurements.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/exercises/', include('exercises.urls')),
    path('api/calendar/month/<int:year>/<int:month>/', CalendarView.as_view()),
    path('api/statistics/summary/', StatisticsView.as_view()),
    path('api/statistics/period/', StatisticsPeriodView.as_view()),
    path('api/exercises/recent/', RecentExerciseView.as_view()),
    path('api/exercises/recent/update/', RecentExerciseUpdateView.as_view()),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


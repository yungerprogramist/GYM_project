"""
URL configuration for AndryxaGym_backend project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from django.conf import settings

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
    path('api/measurements/', include('apps.measurements.urls')),
    path('api/workouts/', include('workouts.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/exercises/', include('exercises.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


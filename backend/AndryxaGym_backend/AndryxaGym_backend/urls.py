"""
URL configuration for AndryxaGym_backend project.
"""

from django.contrib import admin
from django.urls import path, include
<<<<<<< HEAD
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('notes.urls')),
    path('api/users/', include('users.urls')),
    path('api/users/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
=======
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/exercises/', include('apps.exercises.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
>>>>>>> feature/exercises

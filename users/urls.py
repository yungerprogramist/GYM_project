from django.urls import path
from .views import UserProfileView, UserSettingsView

urlpatterns = [
    path("profile/", UserProfileView.as_view()),
    path("settings/", UserSettingsView.as_view()),
]
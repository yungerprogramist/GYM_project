from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    LogoutView,
    UserProfileView, 
    UserSettingsView
)

urlpatterns = [
    # auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('settings/', UserSettingsView.as_view(), name='settings'),
]
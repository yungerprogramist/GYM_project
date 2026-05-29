from django.contrib import admin
<<<<<<< HEAD
from django.contrib.auth.admin import UserAdmin
from .models import User, UserProfile


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name = 'Профиль'


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = [UserProfileInline]
    list_display = ['username', 'email', 'is_staff', 'is_active']
    list_filter = ['is_staff', 'is_active']
    search_fields = ['username', 'email']

    def get_readonly_fields(self, request, obj=None):
        # Обычный staff не может менять права доступа
        if not request.user.is_superuser:
            return ['is_superuser', 'user_permissions', 'groups']
        return []
=======

# Register your models here.
>>>>>>> origin/main

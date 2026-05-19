from django.contrib import admin
from .models import WeightRecord


@admin.register(WeightRecord)
class WeightRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'weight', 'date', 'created_at']
    list_filter = ['user', 'date']
    search_fields = ['user__username', 'comment']
    readonly_fields = ['created_at']
    ordering = ['-date']
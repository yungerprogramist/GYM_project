from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from .models import MuscleGroup, Exercise


class ExerciseResource(resources.ModelResource):
    class Meta:
        model = Exercise
        fields = ['id', 'name', 'description', 'muscle_group']


class ExerciseInline(admin.TabularInline):
    model = Exercise
    extra = 3
    fields = ['name', 'description', 'image']


def duplicate_exercises(modeladmin, request, queryset):
    for exercise in queryset:
        exercise.pk = None
        exercise.name = f"{exercise.name} (copy)"
        exercise.save()
duplicate_exercises.short_description = "Duplicate selected exercises"


@admin.register(MuscleGroup)
class MuscleGroupAdmin(admin.ModelAdmin):
    inlines = [ExerciseInline]
    list_display = ['id', 'name', 'exercise_count']
    search_fields = ['name']

    def exercise_count(self, obj):
        return obj.exercises.count()
    exercise_count.short_description = 'Exercises'


@admin.register(Exercise)
class ExerciseAdmin(ImportExportModelAdmin):
    resource_class = ExerciseResource
    list_display = ['id', 'name', 'muscle_group']
    list_filter = ['muscle_group']
    search_fields = ['name', 'description']
    list_select_related = ['muscle_group']
    actions = [duplicate_exercises]

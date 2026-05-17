from django.contrib import admin
from .models import Workout, WorkoutExercise, Set


class SetInline(admin.TabularInline):
    model = Set
    extra = 0


class WorkoutExerciseInline(admin.TabularInline):
    model = WorkoutExercise
    extra = 0
    show_change_link = True


@admin.register(Workout)
class WorkoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'exercise_count']
    list_filter = ['date', 'user']
    search_fields = ['user__username']
    inlines = [WorkoutExerciseInline]

    def exercise_count(self, obj):
        return obj.exercises.count()
    exercise_count.short_description = 'Упражнений'


@admin.register(WorkoutExercise)
class WorkoutExerciseAdmin(admin.ModelAdmin):
    list_display = ['workout', 'exercise', 'exercise_order']
    inlines = [SetInline]


@admin.register(Set)
class SetAdmin(admin.ModelAdmin):
    list_display = ['workout_exercise', 'set_number', 'weight', 'reps']
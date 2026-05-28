from django.contrib import admin
from .models import Program, ProgramDay, ProgramDayExercise


class ProgramDayExerciseInline(admin.TabularInline):
    model = ProgramDayExercise
    extra = 1
    fields = ['exercise', 'exercise_order']
    ordering = ['exercise_order']


class ProgramDayInline(admin.TabularInline):
    model = ProgramDay
    extra = 1
    show_change_link = True
    ordering = ['day_number']


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    inlines = [ProgramDayInline]
    list_display = ['name', 'difficulty']
    search_fields = ['name']
    list_filter = ['difficulty']


@admin.register(ProgramDay)
class ProgramDayAdmin(admin.ModelAdmin):
    inlines = [ProgramDayExerciseInline]
    list_display = ['name', 'program', 'day_number']
    ordering = ['program', 'day_number']


@admin.register(ProgramDayExercise)
class ProgramDayExerciseAdmin(admin.ModelAdmin):
    list_display = ['exercise', 'program_day', 'exercise_order']
    ordering = ['program_day', 'exercise_order']
    list_editable = ['exercise_order']
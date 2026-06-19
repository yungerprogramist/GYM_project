from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render


@staff_member_required
def model_diagram(request):
    models_data = {
        'User': {
            'color': '#4A90D9',
            'fields': ['id', 'username', 'email', 'password'],
            'relations': ['UserProfile']
        },
        'UserProfile': {
            'color': '#7B68EE',
            'fields': ['id', 'user', 'language', 'theme'],
            'relations': []
        },
        'Note': {
            'color': '#9B59B6',
            'fields': ['id', 'user', 'content', 'updated_at'],
            'relations': []
        },
        'MuscleGroup': {
            'color': '#E8A838',
            'fields': ['id', 'name'],
            'relations': ['Exercise']
        },
        'Exercise': {
            'color': '#E86B38',
            'fields': ['id', 'name', 'description', 'image', 'muscle_group'],
            'relations': []
        },
        'RecentExercise': {
            'color': '#D35400',
            'fields': ['id', 'user', 'exercise', 'last_used'],
            'relations': []
        },
        'Program': {
            'color': '#50C878',
            'fields': ['id', 'name', 'difficulty', 'description'],
            'relations': ['ProgramDay']
        },
        'ProgramDay': {
            'color': '#3CB371',
            'fields': ['id', 'program', 'name', 'day_number'],
            'relations': ['ProgramDayExercise']
        },
        'ProgramDayExercise': {
            'color': '#2E8B57',
            'fields': ['id', 'program_day', 'exercise', 'exercise_order'],
            'relations': []
        },
        'WeightRecord': {
            'color': '#5DADE2',
            'fields': ['id', 'user', 'date', 'weight', 'comment', 'created_at'],
            'relations': []
        },
        'Workout': {
            'color': '#E84040',
            'fields': ['id', 'user', 'date'],
            'relations': ['WorkoutExercise']
        },
        'WorkoutExercise': {
            'color': '#C0392B',
            'fields': ['id', 'workout', 'exercise', 'exercise_order'],
            'relations': ['Set']
        },
        'Set': {
            'color': '#A93226',
            'fields': ['id', 'workout_exercise', 'weight', 'reps', 'set_number'],
            'relations': []
        },
    }
    return render(request, 'admin/model_diagram.html', {'models_data': models_data})

from rest_framework import serializers
from .models import Workout, RecentExercise


class WorkoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workout
        fields = ['id', 'user', 'date', 'notes']


class RecentExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_id = serializers.IntegerField(source='exercise.id', read_only=True)
    
    class Meta:
        model = RecentExercise
        fields = ['id', 'exercise_id', 'exercise_name', 'last_used', 'use_count']
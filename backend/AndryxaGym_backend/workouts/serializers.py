from rest_framework import serializers
from .models import Workout, WorkoutExercise, Set
from exercises.models import Exercise
from django.db import models

class SetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['id', 'weight', 'reps', 'set_number']
        read_only_fields = ['id']

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("Вес должен быть больше нуля")
        return value

    def validate_reps(self, value):
        if value <= 0:
            raise serializers.ValidationError("Количество повторений должно быть больше нуля")
        return value


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    sets = SetSerializer(many=True, read_only=True)
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)
    exercise_id = serializers.IntegerField(write_only=True)
    muscle_group = serializers.CharField(source='exercise.muscle_group.name', read_only=True)

    class Meta:
        model = WorkoutExercise
        fields = [
            'id', 'exercise_id', 'exercise_name', 'muscle_group',
            'exercise_order', 'sets'
        ]
        read_only_fields = ['id']


class WorkoutSerializer(serializers.ModelSerializer):
    exercises = WorkoutExerciseSerializer(many=True, read_only=True)
    exercise_count = serializers.SerializerMethodField()
    set_count = serializers.SerializerMethodField()
    total_weight = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = [
            'id', 'date', 'exercises',
            'exercise_count', 'set_count', 'total_weight'
        ]
        read_only_fields = ['id', 'user']

    def get_exercise_count(self, obj):
        return obj.exercises.count()

    def get_set_count(self, obj):
        return Set.objects.filter(workout_exercise__workout=obj).count()

    def get_total_weight(self, obj):
        return Set.objects.filter(
            workout_exercise__workout=obj
        ).aggregate(total=models.Sum('weight'))['total'] or 0


class WorkoutListSerializer(serializers.ModelSerializer):
    """Облегчённый сериализатор для списка тренировок"""
    exercise_count = serializers.SerializerMethodField()

    class Meta:
        model = Workout
        fields = ['id', 'date', 'exercise_count']

    def get_exercise_count(self, obj):
        return obj.exercises.count()


class AddExerciseSerializer(serializers.Serializer):
    exercise_id = serializers.IntegerField()
    exercise_order = serializers.IntegerField(required=False, default=0)

    def validate_exercise_id(self, value):
        if not Exercise.objects.filter(id=value).exists():
            raise serializers.ValidationError("Упражнение не найдено")
        return value


class CreateSetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Set
        fields = ['weight', 'reps', 'set_number']

    def validate(self, data):
        if data['weight'] <= 0:
            raise serializers.ValidationError({"weight": "Вес должен быть больше нуля"})
        if data['reps'] <= 0:
            raise serializers.ValidationError({"reps": "Количество повторений должно быть больше нуля"})
        return data


class WorkoutStatsSerializer(serializers.Serializer):
    date = serializers.DateField()
    exercise_count = serializers.IntegerField()
    set_count = serializers.IntegerField()
    total_weight = serializers.FloatField()
    exercises = WorkoutExerciseSerializer(many=True)
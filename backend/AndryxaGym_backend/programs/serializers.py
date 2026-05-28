from rest_framework import serializers
from .models import Program, ProgramDay, ProgramDayExercise


class ProgramDayExerciseSerializer(serializers.ModelSerializer):
    exercise_name = serializers.ReadOnlyField(source='exercise.name')

    class Meta:
        model = ProgramDayExercise
        fields = ['id', 'exercise', 'exercise_name', 'exercise_order']


class ProgramDaySerializer(serializers.ModelSerializer):
    exercises = ProgramDayExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = ProgramDay
        fields = ['id', 'name', 'day_number', 'exercises']


class ProgramListSerializer(serializers.ModelSerializer):
    days_count = serializers.SerializerMethodField()

    class Meta:
        model = Program
        fields = ['id', 'name', 'difficulty', 'description', 'days_count']

    def get_days_count(self, obj):
        return obj.days.count()


class ProgramDetailSerializer(serializers.ModelSerializer):
    days = ProgramDaySerializer(many=True, read_only=True)

    class Meta:
        model = Program
        fields = ['id', 'name', 'difficulty', 'description', 'days']

from rest_framework import serializers
from .models import MuscleGroup, Exercise


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ["id", "name"]


class ExerciseSerializer(serializers.ModelSerializer):
    # Показываем название группы мышц (read-only) вместо просто ID
    muscle_group_name = serializers.CharField(source="muscle_group.name", read_only=True)

    class Meta:
        model = Exercise
        fields = [
            "id",
            "muscle_group",       # ID группы (для записи)
            "muscle_group_name",  # Название группы (для чтения)
            "name",
            "description",
            "image",
        ]

    def validate_name(self, value):
        """Название не должно быть пустым или состоять только из пробелов"""
        if not value.strip():
            raise serializers.ValidationError("Название упражнения не может быть пустым.")
        return value.strip()
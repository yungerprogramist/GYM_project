from rest_framework import serializers
from .models import MuscleGroup, Exercise


class MuscleGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuscleGroup
        fields = ["id", "name"]


class ExerciseSerializer(serializers.ModelSerializer):
    muscle_group_name = serializers.CharField(source="muscle_group.name", read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)  # добавь эту строку

    class Meta:
        model = Exercise
        fields = [
            "id",
            "muscle_group",
            "muscle_group_name",
            "name",
            "description",
            "image",
        ]

    def validate_name(self, value):
        if not value.strip():
            raise serializers.ValidationError("Название упражнения не может быть пустым.")
        return value.strip()
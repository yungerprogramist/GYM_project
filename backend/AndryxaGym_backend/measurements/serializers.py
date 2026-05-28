from rest_framework import serializers
from django.utils import timezone
from .models import WeightRecord


class WeightRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightRecord
        fields = ['id', 'user', 'date', 'weight', 'comment', 'created_at']
        read_only_fields = ['user', 'created_at']

    def validate_date(self, value):
        if value > timezone.now().date():
            raise serializers.ValidationError('Date cannot be in the future')
        return value

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError('Weight must be positive')
        return value


class WeightStatsSerializer(serializers.Serializer):
    current_weight = serializers.FloatField()
    min_weight = serializers.FloatField()
    max_weight = serializers.FloatField()
    avg_weight = serializers.FloatField()
    total_records = serializers.IntegerField()
    weight_change = serializers.FloatField()


class ChartDataSerializer(serializers.Serializer):
    date = serializers.DateField()
    weight = serializers.FloatField()

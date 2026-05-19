from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg, Max, Min, Count
from django.utils import timezone
from datetime import timedelta
from .models import WeightRecord
from .serializers import (
    WeightRecordSerializer,
    WeightStatsSerializer,
    ChartDataSerializer
)


class WeightRecordViewSet(viewsets.ModelViewSet):
    serializer_class = WeightRecordSerializer
    permission_classes = []
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['date', 'weight', 'created_at']
    ordering = ['-date']

    def get_queryset(self):
        queryset = WeightRecord.objects.all()

        period = self.request.query_params.get('period', None)
        if period:
            today = timezone.now().date()
            if period == 'week':
                start_date = today - timedelta(days=7)
                queryset = queryset.filter(date__gte=start_date)
            elif period == 'month':
                start_date = today - timedelta(days=30)
                queryset = queryset.filter(date__gte=start_date)
            elif period == 'quarter':
                start_date = today - timedelta(days=90)
                queryset = queryset.filter(date__gte=start_date)
            elif period == 'year':
                start_date = today - timedelta(days=365)
                queryset = queryset.filter(date__gte=start_date)
            elif period == 'custom':
                date_from = self.request.query_params.get('date_from')
                date_to = self.request.query_params.get('date_to')
                if date_from:
                    queryset = queryset.filter(date__gte=date_from)
                if date_to:
                    queryset = queryset.filter(date__lte=date_to)

        return queryset

    @action(detail=False, methods=['get'])
    def stats(self, request):
        queryset = self.get_queryset()

        if not queryset.exists():
            return Response(
                {'error': 'No data for statistics'},
                status=status.HTTP_404_NOT_FOUND
            )

        stats = queryset.aggregate(
            min_weight=Min('weight'),
            max_weight=Max('weight'),
            avg_weight=Avg('weight'),
            total_records=Count('id')
        )

        current_record = queryset.first()
        stats['current_weight'] = current_record.weight

        if queryset.count() >= 2:
            first_record = queryset.last()
            stats['weight_change'] = current_record.weight - first_record.weight
        else:
            stats['weight_change'] = 0

        serializer = WeightStatsSerializer(stats)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def chart_data(self, request):
        queryset = self.get_queryset()
        chart_data = queryset.order_by('date').values('date', 'weight')
        serializer = ChartDataSerializer(chart_data, many=True)
        return Response(serializer.data)
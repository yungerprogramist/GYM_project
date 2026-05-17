from django.urls import path
from .views import (
    CalendarMonthView,
    StatisticsSummaryView,
    PeriodStatisticsView,
    RecentExercisesView,
    RecentExerciseUpdateView
)

urlpatterns = [
    # Календарь
    path('api/calendar/month/<int:year>/<int:month>/', 
         CalendarMonthView.as_view(), 
         name='calendar-month'),
    
    # Статистика
    path('api/statistics/summary/', 
         StatisticsSummaryView.as_view(), 
         name='statistics-summary'),
    
    path('api/statistics/period/', 
         PeriodStatisticsView.as_view(), 
         name='statistics-period'),
    
    # Недавние упражнения
    path('api/exercises/recent/', 
         RecentExercisesView.as_view(), 
         name='recent-exercises'),
    
    path('api/exercises/recent/update/', 
         RecentExerciseUpdateView.as_view(), 
         name='recent-exercise-update'),
]

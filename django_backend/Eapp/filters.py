import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    created_at = django_filters.DateFromToRangeFilter()

    class Meta:
        model = Task
        fields = {
            'status': ['exact', 'in'],
            'assigned_to': ['exact'],
            'customer': ['exact'],
            'created_by': ['exact'],
            'is_debt': ['exact'],
        }

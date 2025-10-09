import django_filters
from .models import Task

class TaskFilter(django_filters.FilterSet):
    created_at = django_filters.DateFromToRangeFilter()
    updated_at = django_filters.DateFromToRangeFilter()
    status = django_filters.CharFilter(method='filter_status')

    class Meta:
        model = Task
        fields = {
            'assigned_to': ['exact'],
            'customer': ['exact'],
            'created_by': ['exact'],
            'is_debt': ['exact'],
        }

    def filter_status(self, queryset, name, value):
        statuses = value.split(',')
        return queryset.filter(status__in=statuses)

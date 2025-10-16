# Eapp/reports/services.py
from django.db.models import Q, Count, Sum, Avg, F, ExpressionWrapper, fields
from django.db.models.functions import TruncDate, ExtractWeek, ExtractMonth
from datetime import datetime, timedelta
from django.utils import timezone
from decimal import Decimal
from ..models import Task, Payment, Customer, User, CostBreakdown

class ReportGenerator:
    def __init__(self, report_config):
        self.config = report_config
        self.date_filters = self._build_date_filters()
        
    def _build_date_filters(self):
        date_range = self.config.get('dateRange')
        today = timezone.now().date()
        
        if date_range == 'last_7_days':
            start_date = today - timedelta(days=7)
            return Q(created_at__date__gte=start_date)
        elif date_range == 'last_30_days':
            start_date = today - timedelta(days=30)
            return Q(created_at__date__gte=start_date)
        elif date_range == 'last_3_months':
            start_date = today - timedelta(days=90)
            return Q(created_at__date__gte=start_date)
        elif date_range == 'last_6_months':
            start_date = today - timedelta(days=180)
            return Q(created_at__date__gte=start_date)
        elif date_range == 'last_year':
            start_date = today - timedelta(days=365)
            return Q(created_at__date__gte=start_date)
        elif date_range == 'custom':
            start_date = self.config.get('customStartDate')
            end_date = self.config.get('customEndDate')
            if start_date and end_date:
                return Q(created_at__date__range=[start_date, end_date])
        
        return Q()
    
    def _get_field_mapping(self):
        return {
            # Basic fields
            'task_id': 'id',
            'customer_name': 'customer__name',
            'laptop_model': 'laptop_model',
            'technician': 'assigned_to__get_full_name',
            'status': 'status',
            'urgency': 'urgency',
            'location': 'current_location',
            
            # Date fields
            'date_in': 'date_in',
            'date_completed': 'date_out',
            
            # Performance fields
            'turnaround_time': self._calculate_turnaround_time,
            
            # Financial fields
            'total_cost': self._calculate_total_cost,
            'parts_cost': self._calculate_parts_cost,
            'labor_cost': self._calculate_labor_cost,
            'payment_status': 'payment_status',
        }
    
    def _calculate_turnaround_time(self, task):
        if task.date_in and task.date_out:
            return (task.date_out.date() - task.date_in).days
        return None
    
    def _calculate_total_cost(self, task):
        estimated_cost = task.estimated_cost or Decimal('0.00')
        additive_costs = task.cost_breakdowns.filter(cost_type='Additive').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        subtractive_costs = task.cost_breakdowns.filter(cost_type='Subtractive').aggregate(
            total=Sum('amount')
        )['total'] or Decimal('0.00')
        return float(estimated_cost + additive_costs - subtractive_costs)
    
    def _calculate_parts_cost(self, task):
        parts_cost = task.cost_breakdowns.filter(
            cost_type='Additive', 
            category__icontains='part'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return float(parts_cost)
    
    def _calculate_labor_cost(self, task):
        labor_cost = task.cost_breakdowns.filter(
            cost_type='Additive', 
            category__icontains='labor'
        ).aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
        return float(labor_cost)
    
    def generate_report(self):
        base_queryset = Task.objects.filter(self.date_filters)
        field_mapping = self._get_field_mapping()
        selected_fields = self.config.get('selectedFields', [])
        
        # Apply report type specific filters
        base_queryset = self._apply_report_type_filters(base_queryset)
        
        # Prefetch related data for performance
        base_queryset = base_queryset.select_related(
            'customer', 'assigned_to', 'brand'
        ).prefetch_related('cost_breakdowns', 'payments')
        
        # Convert to report data
        report_data = []
        for task in base_queryset:
            row = {}
            for field in selected_fields:
                if field in field_mapping:
                    mapping = field_mapping[field]
                    if callable(mapping):
                        row[field] = mapping(task)
                    else:
                        # Handle related fields
                        if '__' in mapping:
                            obj = task
                            for part in mapping.split('__'):
                                obj = getattr(obj, part, None)
                                if obj is None:
                                    break
                            row[field] = obj
                        else:
                            row[field] = getattr(task, mapping, None)
            report_data.append(row)
        
        return {
            'metadata': self._generate_metadata(base_queryset),
            'data': report_data,
            'summary': self._generate_summary(base_queryset, selected_fields)
        }
    
    def _apply_report_type_filters(self, queryset):
        report_type = self.config.get('selectedType')
        
        if report_type == 'financial':
            return queryset.exclude(estimated_cost__isnull=True)
        elif report_type == 'operational':
            return queryset.filter(status__in=['Completed', 'In Progress', 'Pending'])
        elif report_type == 'performance':
            return queryset.filter(assigned_to__isnull=False)
        elif report_type == 'customer':
            return queryset.select_related('customer')
        
        return queryset
    
    def _generate_metadata(self, queryset):
        return {
            'total_records': queryset.count(),
            'generated_at': timezone.now().isoformat(),
            'report_name': self.config.get('reportName'),
            'date_range': self.config.get('dateRange'),
            'report_type': self.config.get('selectedType')
        }
    
    def _generate_summary(self, queryset, selected_fields):
        summary = {}
        
        if 'status' in selected_fields:
            status_counts = queryset.values('status').annotate(count=Count('status'))
            summary['status_distribution'] = {item['status']: item['count'] for item in status_counts}
        
        if any(field in selected_fields for field in ['total_cost', 'payment_status']):
            financial_summary = queryset.aggregate(
                total_revenue=Sum('estimated_cost'),
                avg_cost=Avg('estimated_cost'),
                total_tasks=Count('id')
            )
            summary.update(financial_summary)
        
        if 'turnaround_time' in selected_fields:
            completed_tasks = queryset.filter(status='Completed', date_in__isnull=False, date_out__isnull=False)
            if completed_tasks.exists():
                turnaround_data = []
                for task in completed_tasks:
                    if task.date_in and task.date_out:
                        turnaround_data.append((task.date_out.date() - task.date_in).days)
                
                if turnaround_data:
                    summary['avg_turnaround_days'] = sum(turnaround_data) / len(turnaround_data)
                    summary['min_turnaround_days'] = min(turnaround_data)
                    summary['max_turnaround_days'] = max(turnaround_data)
        
        return summary
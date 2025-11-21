# reports/services.py
from django.db.models import Q, Sum, Count, Avg
from Eapp.models import Task, User
from financials.models import  Payment
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone


class ReportGenerator:
    def __init__(self, config):
        self.config = config
        self.queryset = Task.objects.all()
        
    def generate_report(self):
        try:
            # Apply date filters
            self._apply_date_filters()
            
            # Apply field selections and build annotations
            fields = self.config.get('selectedFields', [])
            report_type = self.config.get('selectedType', 'operational')
            
            # Build the queryset data
            data = self._build_queryset_data(fields)
            
            return {
                'success': True,
                'data': data,
                'metadata': {
                    'total_records': len(data),
                    'generated_at': timezone.now().isoformat(),
                    'report_type': report_type
                }
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'data': []
            }
    
    def _apply_date_filters(self):
        date_range = self.config.get('dateRange', 'last_30_days')
        custom_start = self.config.get('customStartDate')
        custom_end = self.config.get('customEndDate')
        
        now = timezone.now()
        
        if date_range == 'custom' and custom_start and custom_end:
            start_date = custom_start
            end_date = custom_end
        else:
            if date_range == 'last_7_days':
                start_date = now - timedelta(days=7)
            elif date_range == 'last_30_days':
                start_date = now - timedelta(days=30)
            elif date_range == 'last_3_months':
                start_date = now - timedelta(days=90)
            elif date_range == 'last_6_months':
                start_date = now - timedelta(days=180)
            elif date_range == 'last_year':
                start_date = now - timedelta(days=365)
            else:
                start_date = now - timedelta(days=30)  # default
            
            end_date = now
        
        # Apply date filter based on report type
        report_type = self.config.get('selectedType', 'operational')
        
        if report_type in ['financial', 'revenue']:
            # For financial reports, filter by payment date or task creation date
            self.queryset = self.queryset.filter(
                Q(created_at__date__range=(start_date, end_date)) |
                Q(payments__date__range=(start_date, end_date))
            ).distinct()
        else:
            # For operational reports, filter by task creation date
            self.queryset = self.queryset.filter(created_at__date__range=(start_date, end_date))
    
    def _build_queryset_data(self, fields):
        """Build report data based on selected fields"""
        data = []
        
        # Select related to optimize queries
        self.queryset = self.queryset.select_related(
            'assigned_to', 'customer', 'brand', 'workshop_location'
        ).prefetch_related('payments', 'cost_breakdowns')
        
        for task in self.queryset:
            row = {}
            
            for field in fields:
                try:
                    if field == 'task_id':
                        row['task_id'] = task.title
                    
                    elif field == 'customer_name':
                        row['customer_name'] = task.customer.name if task.customer else 'N/A'
                    
                    elif field == 'laptop_model':
                        row['laptop_model'] = task.laptop_model
                    
                    elif field == 'technician':
                        # FIX: Handle technician field properly
                        if task.assigned_to:
                            row['technician'] = task.assigned_to.get_full_name()
                        else:
                            row['technician'] = 'Unassigned'
                    
                    elif field == 'status':
                        row['status'] = task.get_status_display()
                    
                    elif field == 'date_in':
                        row['date_in'] = task.date_in.isoformat() if task.date_in else 'N/A'
                    
                    elif field == 'date_completed':
                        if task.status == 'Completed' and task.date_out:
                            row['date_completed'] = task.date_out.date().isoformat()
                        else:
                            row['date_completed'] = 'N/A'
                    
                    elif field == 'turnaround_time':
                        turnaround = self._calculate_turnaround_time(task)
                        row['turnaround_time'] = turnaround
                    
                    elif field == 'total_cost':
                        row['total_cost'] = str(task.calculate_total_cost())
                    
                    elif field == 'parts_cost':
                        parts_cost = sum(
                            item.amount for item in task.cost_breakdowns.filter(
                                Q(category__icontains='part') | Q(description__icontains='part')
                            )
                        )
                        row['parts_cost'] = str(parts_cost)
                    
                    elif field == 'labor_cost':
                        labor_cost = sum(
                            item.amount for item in task.cost_breakdowns.filter(
                                Q(category__icontains='labor') | Q(description__icontains='labor')
                            )
                        )
                        row['labor_cost'] = str(labor_cost)
                    
                    elif field == 'payment_status':
                        row['payment_status'] = task.get_payment_status_display()
                    
                    elif field == 'urgency':
                        row['urgency'] = task.get_urgency_display()
                    
                    elif field == 'location':
                        row['location'] = task.current_location
                    
                    elif field == 'brand':
                        row['brand'] = task.brand.name if task.brand else 'N/A'
                    
                    elif field == 'device_type':
                        row['device_type'] = task.get_device_type_display()
                    
                    elif field == 'serial_number':
                        row['serial_number'] = task.serial_number
                    
                    elif field == 'estimated_cost':
                        row['estimated_cost'] = str(task.estimated_cost) if task.estimated_cost else '0.00'
                    
                    elif field == 'outstanding_balance':
                        row['outstanding_balance'] = str(task.outstanding_balance)
                    
                    elif field == 'paid_amount':
                        paid_amount = sum(p.amount for p in task.payments.all()) or Decimal('0.00')
                        row['paid_amount'] = str(paid_amount)
                    
                    elif field == 'workshop_status':
                        row['workshop_status'] = task.get_workshop_status_display() if task.workshop_status else 'N/A'
                    
                    elif field == 'created_by':
                        row['created_by'] = task.created_by.get_full_name() if task.created_by else 'N/A'
                    
                    elif field == 'days_in_system':
                        days_in_system = (timezone.now().date() - task.date_in).days
                        row['days_in_system'] = str(days_in_system)
                    
                    else:
                        # Try to get attribute directly
                        if hasattr(task, field):
                            value = getattr(task, field)
                            if callable(value):
                                value = value()
                            row[field] = str(value) if value is not None else 'N/A'
                        else:
                            row[field] = 'N/A'
                
                except Exception as e:
                    # Log the error but continue with other fields
                    print(f"Error processing field {field} for task {task.title}: {str(e)}")
                    row[field] = 'Error'
            
            data.append(row)
        
        return data
    
    def _calculate_turnaround_time(self, task):
        """Calculate turnaround time in days, excluding workshop time."""
        if not task.date_in:
            return "N/A"

        end_date = task.date_out.date() if task.date_out else timezone.now().date()
        total_duration = end_date - task.date_in

        workshop_duration = timedelta(days=0)
        if task.workshop_sent_at:
            workshop_end = task.workshop_returned_at.date() if task.workshop_returned_at else timezone.now().date()
            workshop_duration = workshop_end - task.workshop_sent_at.date()

        turnaround_duration = total_duration - workshop_duration
        days = turnaround_duration.days

        if task.status in ['Completed', 'Picked Up']:
            return f"{days} days"
        else:
            return f"{days} days (ongoing)"
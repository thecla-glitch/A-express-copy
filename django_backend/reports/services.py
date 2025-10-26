# reports/services.py
from django.db.models import Q, Sum, Count, Avg
from Eapp.models import Task, User, Payment, Customer, Brand, Location, CostBreakdown
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal


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
        """Calculate turnaround time in days"""
        if task.status in ['Completed', 'Picked Up'] and task.date_out and task.date_in:
            delta = task.date_out.date() - task.date_in
            return f"{delta.days} days"
        elif task.date_in:
            delta = timezone.now().date() - task.date_in
            return f"{delta.days} days (ongoing)"
        return "N/A"


class PredefinedReportGenerator:
    
    @staticmethod
    def generate_revenue_summary_report(date_range='last_30_days'):
        """Generate revenue summary report"""
        try:
            # Calculate date range
            end_date = timezone.now().date()
            if date_range == 'last_7_days':
                start_date = end_date - timedelta(days=7)
            elif date_range == 'last_30_days':
                start_date = end_date - timedelta(days=30)
            elif date_range == 'last_3_months':
                start_date = end_date - timedelta(days=90)
            elif date_range == 'last_6_months':
                start_date = end_date - timedelta(days=180)
            elif date_range == 'last_year':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            # Get payments by date
            payments_by_date = Payment.objects.filter(
                date__range=[start_date, end_date]
            ).values('date').annotate(
                daily_revenue=Sum('amount')
            ).order_by('date')
            
            # Calculate totals
            total_revenue = sum(item['daily_revenue'] for item in payments_by_date)
            average_daily_revenue = total_revenue / len(payments_by_date) if payments_by_date else 0
            
            return {
                'payments_by_date': list(payments_by_date),
                'total_revenue': float(total_revenue),
                'average_daily_revenue': float(average_daily_revenue),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        except Exception as e:
            raise Exception(f"Error generating revenue summary: {str(e)}")
    
    @staticmethod
    def generate_outstanding_payments_report():
        """Generate outstanding payments report"""
        try:
            outstanding_tasks = []
            
            tasks = Task.objects.filter(
                Q(payment_status='Unpaid') | Q(payment_status='Partially Paid')
            ).select_related('customer').prefetch_related('payments')
            
            for task in tasks:
                total_cost = task.calculate_total_cost()
                paid_amount = sum(p.amount for p in task.payments.all()) or Decimal('0.00')
                outstanding_balance = total_cost - paid_amount
                
                # Calculate days overdue (simplified)
                days_overdue = 0
                if task.due_date and task.due_date < timezone.now().date():
                    days_overdue = (timezone.now().date() - task.due_date).days
                
                outstanding_tasks.append({
                    'task_id': task.title,
                    'customer_name': task.customer.name if task.customer else 'N/A',
                    'total_cost': float(total_cost),
                    'paid_amount': float(paid_amount),
                    'outstanding_balance': float(outstanding_balance),
                    'days_overdue': days_overdue,
                    'payment_status': task.get_payment_status_display()
                })
            
            total_outstanding = sum(item['outstanding_balance'] for item in outstanding_tasks)
            
            return {
                'outstanding_tasks': outstanding_tasks,
                'total_outstanding_amount': float(total_outstanding),
                'total_outstanding_tasks': len(outstanding_tasks)
            }
        except Exception as e:
            raise Exception(f"Error generating outstanding payments report: {str(e)}")
    
    @staticmethod
    def generate_task_status_report():
        """Generate task status distribution report"""
        try:
            status_counts = Task.objects.values('status').annotate(
                count=Count('id')
            ).order_by('status')
            
            total_tasks = sum(item['count'] for item in status_counts)
            
            status_distribution = []
            for item in status_counts:
                percentage = (item['count'] / total_tasks * 100) if total_tasks > 0 else 0
                status_distribution.append({
                    'status': item['status'],
                    'count': item['count'],
                    'percentage': round(percentage, 2)
                })
            
            return {
                'status_distribution': status_distribution,
                'total_tasks': total_tasks
            }
        except Exception as e:
            raise Exception(f"Error generating task status report: {str(e)}")
    
    @staticmethod
    def generate_technician_performance_report(date_range='last_30_days'):
        """Generate technician performance report"""
        try:
            # Calculate date range
            end_date = timezone.now().date()
            if date_range == 'last_7_days':
                start_date = end_date - timedelta(days=7)
            elif date_range == 'last_30_days':
                start_date = end_date - timedelta(days=30)
            elif date_range == 'last_3_months':
                start_date = end_date - timedelta(days=90)
            elif date_range == 'last_6_months':
                start_date = end_date - timedelta(days=180)
            elif date_range == 'last_year':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            technicians = User.objects.filter(role='Technician', is_active=True)
            technician_performance = []
            
            for tech in technicians:
                # Get tasks assigned to this technician within date range
                tech_tasks = Task.objects.filter(
                    assigned_to=tech,
                    created_at__date__range=[start_date, end_date]
                )
                
                completed_tasks = tech_tasks.filter(status='Completed')
                total_tasks = tech_tasks.count()
                
                # Calculate efficiency (completed vs total assigned)
                efficiency = (completed_tasks.count() / total_tasks * 100) if total_tasks > 0 else 0
                
                # Calculate total revenue from completed tasks
                total_revenue = sum(
                    task.calculate_total_cost() for task in completed_tasks
                )
                
                # Calculate average completion time (simplified)
                avg_completion_hours = 0
                if completed_tasks.exists():
                    completion_times = []
                    for task in completed_tasks:
                        if task.date_in and task.date_out:
                            completion_time = (task.date_out - task.created_at).total_seconds() / 3600
                            completion_times.append(completion_time)
                    
                    if completion_times:
                        avg_completion_hours = sum(completion_times) / len(completion_times)
                
                technician_performance.append({
                    'technician_name': tech.get_full_name(),
                    'completed_tasks': completed_tasks.count(),
                    'total_tasks': total_tasks,
                    'efficiency': round(efficiency, 2),
                    'total_revenue': float(total_revenue),
                    'avg_completion_hours': round(avg_completion_hours, 2)
                })
            
            return {
                'technician_performance': technician_performance,
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        except Exception as e:
            raise Exception(f"Error generating technician performance report: {str(e)}")
    
    @staticmethod
    def generate_turnaround_time_report():
        """Generate turnaround time analysis report"""
        try:
            completed_tasks = Task.objects.filter(
                status='Completed',
                date_in__isnull=False,
                date_out__isnull=False
            )
            
            turnaround_times = []
            for task in completed_tasks:
                turnaround_days = (task.date_out.date() - task.date_in).days
                turnaround_times.append({
                    'task_id': task.title,
                    'customer_name': task.customer.name if task.customer else 'N/A',
                    'date_in': task.date_in.isoformat(),
                    'date_out': task.date_out.date().isoformat(),
                    'turnaround_days': turnaround_days,
                    'technician': task.assigned_to.get_full_name() if task.assigned_to else 'N/A'
                })
            
            # Calculate statistics
            if turnaround_times:
                avg_turnaround = sum(item['turnaround_days'] for item in turnaround_times) / len(turnaround_times)
                min_turnaround = min(item['turnaround_days'] for item in turnaround_times)
                max_turnaround = max(item['turnaround_days'] for item in turnaround_times)
            else:
                avg_turnaround = min_turnaround = max_turnaround = 0
            
            return {
                'turnaround_times': turnaround_times,
                'statistics': {
                    'average_turnaround_days': round(avg_turnaround, 2),
                    'min_turnaround_days': min_turnaround,
                    'max_turnaround_days': max_turnaround,
                    'total_completed_tasks': len(turnaround_times)
                }
            }
        except Exception as e:
            raise Exception(f"Error generating turnaround time report: {str(e)}")
    
    @staticmethod
    def generate_technician_workload_report():
        """Generate current technician workload report"""
        try:
            technicians = User.objects.filter(role='Technician', is_active=True)
            workload_data = []
            
            for tech in technicians:
                current_tasks = Task.objects.filter(
                    assigned_to=tech
                ).exclude(
                    status__in=['Completed', 'Picked Up', 'Terminated']
                )
                
                tasks_by_status = current_tasks.values('status').annotate(
                    count=Count('id')
                )
                
                status_breakdown = {item['status']: item['count'] for item in tasks_by_status}
                
                workload_data.append({
                    'technician_name': tech.get_full_name(),
                    'total_current_tasks': current_tasks.count(),
                    'status_breakdown': status_breakdown
                })
            
            return {
                'workload_data': workload_data,
                'total_active_tasks': sum(item['total_current_tasks'] for item in workload_data)
            }
        except Exception as e:
            raise Exception(f"Error generating technician workload report: {str(e)}")
    
    @staticmethod
    def generate_payment_methods_report(date_range='last_30_days'):
        """Generate payment methods analysis report"""
        try:
            # Calculate date range
            end_date = timezone.now().date()
            if date_range == 'last_7_days':
                start_date = end_date - timedelta(days=7)
            elif date_range == 'last_30_days':
                start_date = end_date - timedelta(days=30)
            elif date_range == 'last_3_months':
                start_date = end_date - timedelta(days=90)
            elif date_range == 'last_6_months':
                start_date = end_date - timedelta(days=180)
            elif date_range == 'last_year':
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
            
            payment_methods_data = Payment.objects.filter(
                date__range=[start_date, end_date]
            ).values('method__name').annotate(
                total_amount=Sum('amount'),
                payment_count=Count('id')
            ).order_by('-total_amount')
            
            total_payments = sum(item['total_amount'] for item in payment_methods_data)
            
            payment_methods = []
            for item in payment_methods_data:
                percentage = (item['total_amount'] / total_payments * 100) if total_payments > 0 else 0
                payment_methods.append({
                    'method_name': item['method__name'],
                    'total_amount': float(item['total_amount']),
                    'payment_count': item['payment_count'],
                    'percentage': round(percentage, 2)
                })
            
            return {
                'payment_methods': payment_methods,
                'total_amount': float(total_payments),
                'date_range': {
                    'start_date': start_date.isoformat(),
                    'end_date': end_date.isoformat()
                }
            }
        except Exception as e:
            raise Exception(f"Error generating payment methods report: {str(e)}")
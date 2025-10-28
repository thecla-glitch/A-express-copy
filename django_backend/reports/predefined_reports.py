# Eapp/reports/predefined_reports.py
from itertools import zip_longest
from django.db.models import Count, Sum, Avg, Q, F
from django.utils import timezone
from datetime import timedelta, datetime
from decimal import Decimal
from Eapp.models import Task, User, TaskActivity
from financials.models import Payment, CostBreakdown

class PredefinedReportGenerator:
    
    @staticmethod
    def generate_revenue_summary_report(date_range='last_30_days'):
        """Generate revenue summary report"""
        date_filter = PredefinedReportGenerator._get_date_filter(date_range)
        
        # Revenue data by period
        payments = Payment.objects.filter(date_filter).values('date').annotate(
            daily_revenue=Sum('amount')
        ).order_by('date')
        
        # Monthly totals
        monthly_revenue = Payment.objects.filter(date_filter).aggregate(
            total_revenue=Sum('amount'),
            average_payment=Avg('amount'),
            payment_count=Count('id')
        )
        
        # Payment methods breakdown
        payment_methods = Payment.objects.filter(date_filter).values(
            'method__name'
        ).annotate(
            total=Sum('amount'),
            count=Count('id')
        )
        
        return {
            'payments_by_date': list(payments),
            'monthly_totals': monthly_revenue,
            'payment_methods': list(payment_methods),
            'date_range': date_range
        }
    
    @staticmethod
    @staticmethod
    def generate_outstanding_payments_report():
        """Generate outstanding payments report"""
        # Get tasks with unpaid or partially paid status
        outstanding_tasks = Task.objects.filter(
            Q(payment_status='Unpaid') | Q(payment_status='Partially Paid')
        ).select_related('customer').prefetch_related('payments', 'customer__phone_numbers')
        
        tasks_data = []
        for task in outstanding_tasks:
            # Calculate paid amount from related payments
            paid_amount = task.payments.aggregate(total=Sum('amount'))['total'] or Decimal('0.00')
            
            # Calculate total cost (estimated_cost + additive costs - subtractive costs)
            estimated_cost = task.estimated_cost or Decimal('0.00')
            additive_costs = task.cost_breakdowns.filter(cost_type='Additive').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            subtractive_costs = task.cost_breakdowns.filter(cost_type='Subtractive').aggregate(
                total=Sum('amount')
            )['total'] or Decimal('0.00')
            
            total_cost = estimated_cost + additive_costs - subtractive_costs
            outstanding_balance = total_cost - paid_amount
            
            # Only include tasks with positive outstanding balance
            if outstanding_balance > 0:
                days_overdue = (timezone.now().date() - task.date_in).days if task.date_in else 0
                
                # Get the first phone number or use 'Not provided'
                customer_phone = 'Not provided'
                if hasattr(task.customer, 'phone_numbers') and task.customer.phone_numbers.exists():
                    customer_phone = task.customer.phone_numbers.first().phone_number
                
                tasks_data.append({
                    'task_id': task.title,
                    'customer_name': task.customer.name,
                    'customer_phone': customer_phone,
                    'total_cost': float(total_cost),
                    'paid_amount': float(paid_amount),
                    'outstanding_balance': float(outstanding_balance),
                    'days_overdue': days_overdue,
                    'status': task.status,
                    'date_in': task.date_in.isoformat() if task.date_in else None
                })
        
        # Sort by outstanding balance (highest first)
        tasks_data.sort(key=lambda x: x['outstanding_balance'], reverse=True)
        
        total_outstanding = sum(task['outstanding_balance'] for task in tasks_data)
        
        return {
            'outstanding_tasks': tasks_data,
            'summary': {
                'total_outstanding': total_outstanding,
                'task_count': len(tasks_data),
                'average_balance': total_outstanding / len(tasks_data) if tasks_data else 0
            }
        }
    @staticmethod
    def generate_task_status_report():
        """Generate task status overview report"""
        status_counts = Task.objects.values('status').annotate(
            count=Count('id')
        ).order_by('-count')
        
        total_tasks = Task.objects.count()
        
        # Calculate percentages
        status_data = []
        for item in status_counts:
            percentage = (item['count'] / total_tasks * 100) if total_tasks > 0 else 0
            status_data.append({
                'status': item['status'],
                'count': item['count'],
                'percentage': round(percentage, 1)
            })
        
        # Urgency distribution
        urgency_counts = Task.objects.values('urgency').annotate(
            count=Count('id')
        )
        
        return {
            'status_distribution': status_data,
            'urgency_distribution': list(urgency_counts),
            'total_tasks': total_tasks,
            'generated_at': timezone.now()
        }
    
    @staticmethod
    def generate_technician_performance_report(date_range='last_30_days'):
        """Generate technician performance report"""
        date_filter = PredefinedReportGenerator._get_date_filter(date_range, field='created_at')
        
        technician_performance = User.objects.filter(
            role='Technician',
            is_active=True
        ).annotate(
            completed_tasks=Count('tasks', filter=Q(tasks__status='Completed') & date_filter),
            in_progress_tasks=Count('tasks', filter=Q(tasks__status='In Progress') & date_filter),
            total_tasks=Count('tasks', filter=date_filter),
            total_revenue=Sum('tasks__estimated_cost', filter=Q(tasks__status='Completed') & date_filter),
            avg_completion_time=Avg(
                F('tasks__date_out') - F('tasks__date_in'),
                filter=Q(tasks__status='Completed') & date_filter
            )
        ).exclude(completed_tasks=0)
        
        performance_data = []
        for tech in technician_performance:
            efficiency = (tech.completed_tasks / tech.total_tasks * 100) if tech.total_tasks > 0 else 0
            avg_hours = tech.avg_completion_time.total_seconds() / 3600 if tech.avg_completion_time else 0
            
            performance_data.append({
                'technician_name': tech.get_full_name(),
                'completed_tasks': tech.completed_tasks,
                'in_progress_tasks': tech.in_progress_tasks,
                'total_tasks': tech.total_tasks,
                'efficiency': round(efficiency, 1),
                'total_revenue': float(tech.total_revenue or 0),
                'avg_completion_hours': round(avg_hours, 1),
                'rating': min(5.0, 3.0 + (efficiency / 25))  # Simulated rating based on efficiency
            })
        
        return {
            'technician_performance': performance_data,
            'date_range': date_range,
            'total_technicians': len(performance_data)
        }
    
    @staticmethod
    def generate_turnaround_time_report(period_type='weekly'):
        """Generate average turnaround time report using TaskActivity logs for higher accuracy."""
        tasks = Task.objects.filter(
            status__in=['Completed', 'Picked Up']
        ).filter(
            activities__type='intake'
        ).filter(
            activities__type='picked_up'
        ).distinct()

        if not tasks.exists():
            return {'periods': [], 'summary': {'overall_average': 0, 'best_period': 'N/A', 'improvement': 0}}

        grouped_tasks = {}
        for task in tasks:
            try:
                intake_activity = task.activities.filter(type='intake').latest('timestamp')
                picked_up_activity = task.activities.filter(type='picked_up').latest('timestamp')
            except TaskActivity.DoesNotExist:
                continue

            start_time = intake_activity.timestamp
            end_time = picked_up_activity.timestamp
            total_duration = end_time - start_time

            # Calculate workshop duration
            workshop_duration = timedelta(0)
            workshop_sent_activities = task.activities.filter(type='workshop', message__icontains='sent').order_by('timestamp')
            workshop_returned_activities = task.activities.filter(type='workshop', message__icontains='returned').order_by('timestamp')

            for sent, returned in zip_longest(workshop_sent_activities, workshop_returned_activities):
                if sent and returned:
                    workshop_duration += returned.timestamp - sent.timestamp

            # Calculate returned duration
            returned_duration = timedelta(0)
            returned_activities = task.activities.filter(type='returned').order_by('timestamp')
            for returned_activity in returned_activities:
                # Find the next 'In Progress' status update
                next_in_progress_activity = task.activities.filter(
                    type='status_update',
                    message__icontains='In Progress',
                    timestamp__gt=returned_activity.timestamp
                ).order_by('timestamp').first()

                if next_in_progress_activity:
                    returned_duration += next_in_progress_activity.timestamp - returned_activity.timestamp

            turnaround_duration = total_duration - workshop_duration - returned_duration
            turnaround_days = turnaround_duration.days

            if period_type == 'weekly':
                period_key = end_time.strftime('%Y-W%U')
            elif period_type == 'monthly':
                period_key = end_time.strftime('%Y-%m')
            else:
                period_key = 'overall'

            if period_key not in grouped_tasks:
                grouped_tasks[period_key] = []
            grouped_tasks[period_key].append(turnaround_days)

        # ... (rest of the calculation logic remains the same) ...
        periods_data = []
        all_turnaround_days = []
        for period, days_list in grouped_tasks.items():
            avg_turnaround = sum(days_list) / len(days_list) if days_list else 0
            periods_data.append({
                'period': period,
                'average_turnaround': round(avg_turnaround, 1),
                'tasks_completed': len(days_list),
                'efficiency': 100  # Placeholder
            })
            all_turnaround_days.extend(days_list)

        periods_data.sort(key=lambda x: x['period'])

        overall_average = sum(all_turnaround_days) / len(all_turnaround_days) if all_turnaround_days else 0
        best_period_data = min(periods_data, key=lambda x: x['average_turnaround']) if periods_data else None
        best_period = best_period_data['period'] if best_period_data else 'N/A'

        improvement = 0
        if len(periods_data) > 1:
            improvement = ((periods_data[-2]['average_turnaround'] - periods_data[-1]['average_turnaround']) 
                           / periods_data[-2]['average_turnaround'] * 100) if periods_data[-2]['average_turnaround'] > 0 else 0

        return {
            'periods': periods_data,
            'summary': {
                'overall_average': round(overall_average, 1),
                'best_period': best_period,
                'improvement': round(improvement, 1)
            }
        }    
    @staticmethod
    def generate_technician_workload_report():
        """Generate technician workload report"""
        workload_data = User.objects.filter(
            role='Technician',
            is_active=True
        ).annotate(
            total_tasks=Count('tasks', filter=~Q(tasks__status__in=['Completed', 'Picked Up'])),
            in_progress_tasks=Count('tasks', filter=Q(tasks__status='In Progress')),
            awaiting_parts_tasks=Count('tasks', filter=Q(tasks__status='Awaiting Parts')),
            pending_tasks=Count('tasks', filter=Q(tasks__status='Pending'))
        ).values(
            'id', 'first_name', 'last_name', 'total_tasks', 'in_progress_tasks',
            'awaiting_parts_tasks', 'pending_tasks'
        ).order_by('-total_tasks')
        
        workload_list = []
        for tech in workload_data:
            workload_list.append({
                'name': f"{tech['first_name']} {tech['last_name']}",
                'tasks': tech['total_tasks'],
                'in_progress': tech['in_progress_tasks'],
                'awaiting_parts': tech['awaiting_parts_tasks'],
                'pending': tech['pending_tasks']
            })
        
        return {
            'workload_data': workload_list,
            'total_active_technicians': len(workload_list),
            'total_assigned_tasks': sum(tech['tasks'] for tech in workload_list)
        }
    
    @staticmethod
    def generate_payment_methods_report(date_range='last_30_days'):
        """Generate payment methods breakdown report"""
        date_filter = PredefinedReportGenerator._get_date_filter(date_range)
        
        payment_methods = Payment.objects.filter(date_filter).values(
            'method__name'
        ).annotate(
            total_amount=Sum('amount'),
            payment_count=Count('id'),
            average_payment=Avg('amount')
        ).order_by('-total_amount')
        
        total_revenue = Payment.objects.filter(date_filter).aggregate(
            total=Sum('amount')
        )['total'] or 0
        
        # Calculate percentages
        methods_data = []
        for method in payment_methods:
            percentage = (method['total_amount'] / total_revenue * 100) if total_revenue > 0 else 0
            methods_data.append({
                'method_name': method['method__name'],
                'total_amount': float(method['total_amount']),
                'payment_count': method['payment_count'],
                'average_payment': float(method['average_payment']),
                'percentage': round(percentage, 1)
            })
        
        return {
            'payment_methods': methods_data,
            'summary': {
                'total_revenue': float(total_revenue),
                'total_payments': sum(method['payment_count'] for method in methods_data),
                'date_range': date_range
            }
        }
    
    @staticmethod
    def _get_date_filter(date_range, field='date'):
        """Helper method to create date filters"""
        today = timezone.now().date()
        
        if date_range == 'last_7_days':
            start_date = today - timedelta(days=7)
        elif date_range == 'last_30_days':
            start_date = today - timedelta(days=30)
        elif date_range == 'last_3_months':
            start_date = today - timedelta(days=90)
        elif date_range == 'last_6_months':
            start_date = today - timedelta(days=180)
        elif date_range == 'last_year':
            start_date = today - timedelta(days=365)
        else:
            # Default to last 30 days
            start_date = today - timedelta(days=30)
        
        filter_kwargs = {f'{field}__gte': start_date}
        return Q(**filter_kwargs)
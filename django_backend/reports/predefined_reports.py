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
        """Generate technician performance report using TaskActivity logs for accuracy."""
        date_filter_q = PredefinedReportGenerator._get_date_filter(date_range, field='timestamp')

        ready_activities = TaskActivity.objects.filter(
            type=TaskActivity.ActivityType.READY
        ).filter(date_filter_q).select_related('task__assigned_to')

        if not ready_activities.exists():
            return {'technician_performance': [], 'date_range': date_range, 'total_technicians': 0}

        task_performance_list = []
        for ready_activity in ready_activities:
            task = ready_activity.task
            technician = task.assigned_to

            if not technician or not technician.is_active or technician.role != 'Technician':
                continue

            intake_activity = TaskActivity.objects.filter(
                task=task, type=TaskActivity.ActivityType.INTAKE
            ).order_by('timestamp').first()

            if not intake_activity:
                continue

            completion_duration = ready_activity.timestamp - intake_activity.timestamp
            task_performance_list.append({
                'technician_id': technician.id,
                'technician_name': technician.get_full_name(),
                'duration': completion_duration,
                'revenue': task.estimated_cost or Decimal('0.00')
            })

        aggregated_data = {}
        for perf in task_performance_list:
            tech_id = perf['technician_id']
            if tech_id not in aggregated_data:
                aggregated_data[tech_id] = {
                    'technician_name': perf['technician_name'],
                    'completed_tasks': 0,
                    'total_duration': timedelta(0),
                    'total_revenue': Decimal('0.00')
                }
            
            aggregated_data[tech_id]['completed_tasks'] += 1
            aggregated_data[tech_id]['total_duration'] += perf['duration']
            aggregated_data[tech_id]['total_revenue'] += perf['revenue']

        final_report = []
        for tech_id, data in aggregated_data.items():
            avg_duration = data['total_duration'] / data['completed_tasks']
            avg_hours = avg_duration.total_seconds() / 3600
            
            in_progress_tasks = Task.objects.filter(assigned_to_id=tech_id, status='In Progress').count()

            final_report.append({
                'technician_name': data['technician_name'],
                'completed_tasks': data['completed_tasks'],
                'in_progress_tasks': in_progress_tasks,
                'total_revenue': float(data['total_revenue']),
                'avg_completion_hours': round(avg_hours, 1),
            })

        final_report.sort(key=lambda x: x['completed_tasks'], reverse=True)

        return {
            'technician_performance': final_report,
            'date_range': date_range,
            'total_technicians': len(final_report)
        }
    
    @staticmethod
    def generate_turnaround_time_report(period_type='weekly'):
        """Generate average turnaround time report based on the new definition."""
        tasks = Task.objects.filter(activities__type='picked_up').distinct().prefetch_related('activities')

        if not tasks.exists():
            return {'periods': [], 'summary': {'overall_average': 0, 'best_period': 'N/A', 'improvement': 0}}

        grouped_tasks = {}
        for task in tasks:
            activities = task.activities.order_by('timestamp')
            
            try:
                first_intake = activities.filter(type=TaskActivity.ActivityType.INTAKE).first()
                last_picked_up = activities.filter(type=TaskActivity.ActivityType.PICKED_UP).last()

                if not first_intake or not last_picked_up:
                    continue

                gross_duration = last_picked_up.timestamp - first_intake.timestamp
                
                total_away_time = timedelta(0)
                pickup_events = activities.filter(type=TaskActivity.ActivityType.PICKED_UP)
                return_events = activities.filter(type=TaskActivity.ActivityType.RETURNED)

                for pickup in pickup_events:
                    next_return = return_events.filter(timestamp__gt=pickup.timestamp).first()
                    if next_return:
                        total_away_time += (next_return.timestamp - pickup.timestamp)

                net_turnaround_duration = gross_duration - total_away_time
                
                if net_turnaround_duration.total_seconds() < 0:
                    net_turnaround_duration = timedelta(0)

                turnaround_days = net_turnaround_duration.total_seconds() / (24 * 3600)

                end_time = last_picked_up.timestamp
                if period_type == 'weekly':
                    period_key = end_time.strftime('%Y-W%U')
                elif period_type == 'monthly':
                    period_key = end_time.strftime('%Y-%m')
                else:
                    period_key = 'overall'

                if period_key not in grouped_tasks:
                    grouped_tasks[period_key] = []
                grouped_tasks[period_key].append(turnaround_days)

            except (TaskActivity.DoesNotExist, AttributeError):
                continue

        periods_data = []
        all_turnaround_days = []
        for period, days_list in grouped_tasks.items():
            avg_turnaround = sum(days_list) / len(days_list) if days_list else 0
            periods_data.append({
                'period': period,
                'average_turnaround': round(avg_turnaround, 1),
                'tasks_completed': len(days_list),
            })
            all_turnaround_days.extend(days_list)

        periods_data.sort(key=lambda x: x['period'])

        overall_average = sum(all_turnaround_days) / len(all_turnaround_days) if all_turnaround_days else 0
        best_period_data = min(periods_data, key=lambda x: x['average_turnaround']) if periods_data else None
        best_period = best_period_data['period'] if best_period_data else 'N/A'

        improvement = 0
        if len(periods_data) > 1 and periods_data[-2]['average_turnaround'] > 0:
            improvement = ((periods_data[-2]['average_turnaround'] - periods_data[-1]['average_turnaround']) 
                           / periods_data[-2]['average_turnaround'] * 100)

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
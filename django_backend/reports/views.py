from django.shortcuts import render
from django.http import HttpResponse
import csv

# Create your views here.
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum
from financials.models import Payment
from datetime import timedelta
from .services import ReportGenerator
from Eapp.serializers import ReportConfigSerializer
from users.permissions import (
    IsAdminOrManagerOrAccountant,
    IsAdminOrManagerOrFrontDeskOrAccountant,
)
from .predefined_reports import PredefinedReportGenerator
from Eapp.models import Task


@api_view(["POST"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def generate_custom_report(request):

    try:
        report_config = request.data

        # Validate report config
        config_serializer = ReportConfigSerializer(data=report_config)
        if not config_serializer.is_valid():
            return Response(
                config_serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )

        generator = ReportGenerator(report_config)
        report_data = generator.generate_report()

        return Response({"success": True, "report": report_data})

    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_report_field_options(request):
    """
    Get available field options for reports
    """
    field_options = {
        "reportTypes": [
            {
                "id": "financial",
                "label": "Financial Analysis",
                "description": "Revenue, payments, and cost analysis",
            },
            {
                "id": "operational",
                "label": "Operational Metrics",
                "description": "Task status, turnaround times, efficiency",
            },
            {
                "id": "performance",
                "label": "Performance Review",
                "description": "Technician productivity and quality metrics",
            },
            {
                "id": "customer",
                "label": "Customer Analytics",
                "description": "Customer satisfaction and retention data",
            },
        ],
        "dataFields": [
            {"id": "task_id", "label": "Task ID", "category": "basic"},
            {"id": "customer_name", "label": "Customer Name", "category": "basic"},
            {"id": "laptop_model", "label": "Laptop Model", "category": "basic"},
            {"id": "technician", "label": "Assigned Technician", "category": "basic"},
            {"id": "status", "label": "Current Status", "category": "basic"},
            {"id": "date_in", "label": "Date In", "category": "dates"},
            {"id": "date_completed", "label": "Date Completed", "category": "dates"},
            {
                "id": "turnaround_time",
                "label": "Turnaround Time",
                "category": "performance",
            },
            {"id": "total_cost", "label": "Total Cost", "category": "financial"},
            {"id": "parts_cost", "label": "Parts Cost", "category": "financial"},
            {"id": "labor_cost", "label": "Labor Cost", "category": "financial"},
            {
                "id": "payment_status",
                "label": "Payment Status",
                "category": "financial",
            },
            {"id": "urgency", "label": "Urgency Level", "category": "basic"},
            {"id": "location", "label": "Current Location", "category": "basic"},
        ],
        "dateRanges": [
            {"value": "last_7_days", "label": "Last 7 Days"},
            {"value": "last_30_days", "label": "Last 30 Days"},
            {"value": "last_3_months", "label": "Last 3 Months"},
            {"value": "last_6_months", "label": "Last 6 Months"},
            {"value": "last_year", "label": "Last Year"},
            {"value": "custom", "label": "Custom Range"},
        ],
    }
    return Response(field_options)


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_revenue_summary(request):
    """Get revenue summary report"""
    date_range = request.GET.get("date_range", "last_30_days")

    try:
        report_data = PredefinedReportGenerator.generate_revenue_summary_report(
            date_range
        )
        return Response(
            {"success": True, "report": report_data, "type": "revenue_summary"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_outstanding_payments(request):
    """Get outstanding payments report"""
    print("Generating outstanding payments report")
    try:
        report_data = PredefinedReportGenerator.generate_outstanding_payments_report()
        return Response(
            {"success": True, "report": report_data, "type": "outstanding_payments"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_task_status_report(request):
    """Get task status report"""
    try:
        report_data = PredefinedReportGenerator.generate_task_status_report()
        return Response({"success": True, "report": report_data, "type": "task_status"})
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_technician_performance(request):
    """Get technician performance report"""
    date_range = request.GET.get("date_range", "last_30_days")

    try:
        report_data = PredefinedReportGenerator.generate_technician_performance_report(
            date_range
        )
        return Response(
            {"success": True, "report": report_data, "type": "technician_performance"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_turnaround_time(request):
    """Get turnaround time report"""
    try:
        report_data = PredefinedReportGenerator.generate_turnaround_time_report()
        return Response(
            {"success": True, "report": report_data, "type": "turnaround_time"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_technician_workload(request):
    """Get technician workload report"""
    try:
        report_data = PredefinedReportGenerator.generate_technician_workload_report()
        return Response(
            {"success": True, "report": report_data, "type": "technician_workload"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_payment_methods_report(request):
    """Get payment methods report"""
    date_range = request.GET.get("date_range", "last_30_days")

    try:
        report_data = PredefinedReportGenerator.generate_payment_methods_report(
            date_range
        )
        return Response(
            {"success": True, "report": report_data, "type": "payment_methods"}
        )
    except Exception as e:
        return Response(
            {"success": False, "error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def download_predefined_report(request, report_type):
    """Download predefined report as CSV"""
    try:
        # Map report types to generator methods
        report_generators = {
            "revenue-summary": PredefinedReportGenerator.generate_revenue_summary_report,
            "outstanding-payments": PredefinedReportGenerator.generate_outstanding_payments_report,
            "task-status": PredefinedReportGenerator.generate_task_status_report,
            "technician-performance": PredefinedReportGenerator.generate_technician_performance_report,
            "turnaround-time": PredefinedReportGenerator.generate_turnaround_time_report,
            "technician-workload": PredefinedReportGenerator.generate_technician_workload_report,
            "payment-methods": PredefinedReportGenerator.generate_payment_methods_report,
        }

        if report_type not in report_generators:
            return Response(
                {"error": "Invalid report type"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Get date range from query params
        date_range = request.GET.get("date_range", "last_30_days")

        # Generate report data
        if report_type in [
            "revenue-summary",
            "technician-performance",
            "payment-methods",
        ]:
            report_data = report_generators[report_type](date_range)
        else:
            report_data = report_generators[report_type]()

        # Create CSV response
        response = HttpResponse(content_type="text/csv")
        response["Content-Disposition"] = (
            f'attachment; filename="{report_type}_{timezone.now().date()}.csv"'
        )

        writer = csv.writer(response)

        # Write data based on report type
        if report_type == "revenue-summary":
            writer.writerow(["Date", "Daily Revenue"])
            for item in report_data.get("payments_by_date", []):
                writer.writerow([item["date"], item["daily_revenue"]])

        elif report_type == "outstanding-payments":
            writer.writerow(
                [
                    "Task ID",
                    "Customer",
                    "Total Cost",
                    "Paid Amount",
                    "Outstanding Balance",
                    "Days Overdue",
                ]
            )
            for item in report_data.get("outstanding_tasks", []):
                writer.writerow(
                    [
                        item["task_id"],
                        item["customer_name"],
                        item["total_cost"],
                        item["paid_amount"],
                        item["outstanding_balance"],
                        item["days_overdue"],
                    ]
                )

        elif report_type == "task-status":
            writer.writerow(["Status", "Count", "Percentage"])
            for item in report_data.get("status_distribution", []):
                writer.writerow(
                    [item["status"], item["count"], f"{item['percentage']}%"]
                )

        elif report_type == "technician-performance":
            writer.writerow(
                [
                    "Technician",
                    "Completed Tasks",
                    "Efficiency %",
                    "Total Revenue",
                    "Avg Completion Hours",
                ]
            )
            for item in report_data.get("technician_performance", []):
                writer.writerow(
                    [
                        item["technician_name"],
                        item["completed_tasks"],
                        item["efficiency"],
                        item["total_revenue"],
                        item["avg_completion_hours"],
                    ]
                )

        return response

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_dashboard_data(request):
    """Get data for dashboard widgets (KPI cards, charts)"""
    try:
        # KPI Data
        total_active_tasks = Task.objects.exclude(
            status__in=["Completed", "Picked Up", "Terminated"]
        ).count()

        revenue_this_month = (
            Payment.objects.filter(
                date__month=timezone.now().month, date__year=timezone.now().year
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        tasks_ready_for_pickup = Task.objects.filter(status="Ready for Pickup").count()

        # Average repair time (simplified)
        completed_tasks = Task.objects.filter(
            status="Completed", date_in__isnull=False, date_out__isnull=False
        )
        avg_repair_time = "3.2 days"  # This would be calculated

        kpi_data = {
            "totalActiveTasks": total_active_tasks,
            "revenueThisMonth": float(revenue_this_month),
            "tasksReadyForPickup": tasks_ready_for_pickup,
            "averageRepairTime": avg_repair_time,
        }

        # Technician workload for chart
        workload_data = PredefinedReportGenerator.generate_technician_workload_report()

        # Task status for pie chart
        status_data = PredefinedReportGenerator.generate_task_status_report()

        return Response(
            {
                "kpiData": kpi_data,
                "technicianWorkload": workload_data.get("workload_data", []),
                "taskStatuses": status_data.get("status_distribution", []),
            }
        )

    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes(
    [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]
)
def get_report_field_options(request):
    """
    Get available field options for reports - Updated to match frontend
    """
    field_options = {
        "reportTypes": [
            {
                "id": "financial",
                "label": "Financial Analysis",
                "description": "Revenue, payments, and cost analysis",
            },
            {
                "id": "operational",
                "label": "Operational Metrics",
                "description": "Task status, turnaround times, efficiency",
            },
            {
                "id": "performance",
                "label": "Performance Review",
                "description": "Technician productivity and quality metrics",
            },
            {
                "id": "customer",
                "label": "Customer Analytics",
                "description": "Customer satisfaction and retention data",
            },
        ],
        "dataFields": [
            {"id": "task_id", "label": "Task ID", "category": "basic"},
            {"id": "customer_name", "label": "Customer Name", "category": "basic"},
            {"id": "laptop_model", "label": "Laptop Model", "category": "basic"},
            {"id": "technician", "label": "Assigned Technician", "category": "basic"},
            {"id": "status", "label": "Current Status", "category": "basic"},
            {"id": "date_in", "label": "Date In", "category": "dates"},
            {"id": "date_completed", "label": "Date Completed", "category": "dates"},
            {
                "id": "turnaround_time",
                "label": "Turnaround Time",
                "category": "performance",
            },
            {"id": "total_cost", "label": "Total Cost", "category": "financial"},
            {"id": "parts_cost", "label": "Parts Cost", "category": "financial"},
            {"id": "labor_cost", "label": "Labor Cost", "category": "financial"},
            {
                "id": "payment_status",
                "label": "Payment Status",
                "category": "financial",
            },
            {"id": "urgency", "label": "Urgency Level", "category": "basic"},
            {"id": "location", "label": "Current Location", "category": "basic"},
        ],
        "dateRanges": [
            {"value": "last_7_days", "label": "Last 7 Days"},
            {"value": "last_30_days", "label": "Last 30 Days"},
            {"value": "last_3_months", "label": "Last 3 Months"},
            {"value": "last_6_months", "label": "Last 6 Months"},
            {"value": "last_year", "label": "Last Year"},
            {"value": "custom", "label": "Custom Range"},
        ],
    }
    return Response(field_options)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def revenue_overview(request):
    """
    Calculate revenue for this month and today, with comparisons to the previous period.
    """
    now = timezone.now()
    today = now.date()

    # Opening balance
    opening_balance = (
        Payment.objects.filter(date__lt=today).aggregate(total=Sum("amount"))["total"]
        or 0
    )

    # Today's revenue
    today_revenue = (
        Payment.objects.filter(date=today, amount__gt=0).aggregate(total=Sum("amount"))[
            "total"
        ]
        or 0
    )

    # Yesterday's revenue
    yesterday = today - timedelta(days=1)
    yesterday_revenue = (
        Payment.objects.filter(date=yesterday, amount__gt=0).aggregate(
            total=Sum("amount")
        )["total"]
        or 0
    )

    # Today's expenditure
    today_expenditure = (
        Payment.objects.filter(date=today, amount__lt=0).aggregate(total=Sum("amount"))[
            "total"
        ]
        or 0
    )

    # Yesterday's expenditure
    yesterday_expenditure = (
        Payment.objects.filter(date=yesterday, amount__lt=0).aggregate(
            total=Sum("amount")
        )["total"]
        or 0
    )

    # Percentage changes
    day_over_day_change = (
        ((today_revenue - yesterday_revenue) / yesterday_revenue * 100)
        if yesterday_revenue
        else 100
    )
    expenditure_day_over_day_change = (
        ((today_expenditure - yesterday_expenditure) / yesterday_expenditure * 100)
        if yesterday_expenditure
        else 100
    )

    return Response(
        {
            "opening_balance": opening_balance,
            "today_revenue": today_revenue,
            "day_over_day_change": day_over_day_change,
            "today_expenditure": abs(today_expenditure),
            "expenditure_day_over_day_change": expenditure_day_over_day_change,
        }
    )

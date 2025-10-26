from django.urls import path
from . import views

urlpatterns = [
    path("revenue-overview/", views.revenue_overview, name="revenue_overview"),
    # Report endpoints
    path(
        "reports/generate/", views.generate_custom_report, name="generate_custom_report"
    ),
    path(
        "reports/download-csv/", views.download_report_csv, name="download_report_csv"
    ),
    path("reports/save/", views.save_report_config, name="save_report_config"),
    path("reports/saved/", views.list_saved_reports, name="list_saved_reports"),
    path(
        "reports/saved/<int:report_id>/",
        views.get_saved_report,
        name="get_saved_report",
    ),
    path(
        "reports/saved/<int:report_id>/delete/",
        views.delete_saved_report,
        name="delete_saved_report",
    ),
    path(
        "reports/field-options/",
        views.get_report_field_options,
        name="get_report_field_options",
    ),
    path("reports/revenue-summary/", views.get_revenue_summary, name="revenue_summary"),
    path(
        "reports/outstanding-payments/",
        views.get_outstanding_payments,
        name="outstanding_payments",
    ),
    path(
        "reports/task-status/", views.get_task_status_report, name="task_status_report"
    ),
    path(
        "reports/technician-performance/",
        views.get_technician_performance,
        name="technician_performance",
    ),
    path("reports/turnaround-time/", views.get_turnaround_time, name="turnaround_time"),
    path(
        "reports/technician-workload/",
        views.get_technician_workload,
        name="technician_workload",
    ),
    path(
        "reports/payment-methods/",
        views.get_payment_methods_report,
        name="payment_methods_report",
    ),
    path(
        "reports/download/<str:report_type>/",
        views.download_predefined_report,
        name="download_predefined_report",
    ),
    path(
        "reports/custom/generate/",
        views.generate_custom_report,
        name="generate_custom_report",
    ),
]

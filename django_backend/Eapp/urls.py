from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'payments', views.PaymentViewSet, basename='payment')

router.register(r'users', views.UserViewSet, basename='user')

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_user, name='login'),
    path('register/', views.login_user, name='login'),
    path('logout/', views.logout, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User management endpoints
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/upload-picture/', views.upload_profile_picture, name='upload_profile_picture'),
    path('profile/change-password/', views.change_password, name='change_password'),
    
    path('users/role/<str:role>/', views.list_users_by_role, name='list_users_by_role'),

    # Customer endpoints
    path('customers/search/', views.CustomerSearchView.as_view(), name='customer-search'),
    path('referrers/search/', views.ReferrerSearchView.as_view(), name='referrer-search'),
    path('customers/create/', views.customer_create, name='customer_create'),
    
    # Task management endpoints
    path('tasks/', views.task_list_create, name='task_list_create'),
    path('tasks/<path:task_id>/activities/', views.task_activities, name='task_activities'),
    path('tasks/<path:task_id>/add-activity/', views.add_task_activity, name='add_task_activity'),
    path('tasks/<path:task_id>/payments/', views.task_payments, name='task_payments'),
    path('tasks/<path:task_id>/add-payment/', views.add_task_payment, name='add_task_payment'),
    path('tasks/<path:task_id>/send-update/', views.send_customer_update, name='send_customer_update'),

    path('tasks/status-options/', views.get_task_status_options, name='get_task_status_options'),
    path('tasks/urgency-options/', views.get_task_urgency_options, name='get_task_urgency_options'),
    path('tasks/<path:task_id>/', views.TaskDetailView.as_view(), name='task_detail'),

    
    # Technician endpoints
    path('technicians/', views.list_technicians, name='list_technicians'),
    path('workshop-locations/', views.list_workshop_locations, name='list_workshop_locations'),
    path('workshop-technicians/', views.list_workshop_technicians, name='list_workshop_technicians'),

    # Revenue overview endpoint
    path('revenue-overview/', views.revenue_overview, name='revenue_overview'),
    
    path('', include(router.urls)),
    
    # Report endpoints
    path('reports/generate/', views.generate_custom_report, name='generate_custom_report'),
    path('reports/download-csv/', views.download_report_csv, name='download_report_csv'),
    path('reports/save/', views.save_report_config, name='save_report_config'),
    path('reports/saved/', views.list_saved_reports, name='list_saved_reports'),
    path('reports/saved/<int:report_id>/', views.get_saved_report, name='get_saved_report'),
    path('reports/saved/<int:report_id>/delete/', views.delete_saved_report, name='delete_saved_report'),
    path('reports/field-options/', views.get_report_field_options, name='get_report_field_options'),
    path('reports/revenue-summary/', views.get_revenue_summary, name='revenue_summary'),
    path('reports/outstanding-payments/', views.get_outstanding_payments, name='outstanding_payments'),
    path('reports/task-status/', views.get_task_status_report, name='task_status_report'),
    path('reports/technician-performance/', views.get_technician_performance, name='technician_performance'),
    path('reports/turnaround-time/', views.get_turnaround_time, name='turnaround_time'),
    path('reports/technician-workload/', views.get_technician_workload, name='technician_workload'),
    path('reports/payment-methods/', views.get_payment_methods_report, name='payment_methods_report'),
    path('reports/download/<str:report_type>/', views.download_predefined_report, name='download_predefined_report'),
    path('reports/custom/generate/', views.generate_custom_report, name='generate_custom_report'),
    
    # Dashboard data
    path('dashboard/data/', views.get_dashboard_data, name='dashboard_data'),

]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    # Task management endpoints
    path('tasks/<path:task_id>/activities/', views.task_activities, name='task_activities'),
    path('tasks/<path:task_id>/add-activity/', views.add_task_activity, name='add_task_activity'),
    path('tasks/<path:task_id>/payments/', views.task_payments, name='task_payments'),
    path('tasks/<path:task_id>/add-payment/', views.add_task_payment, name='add_task_payment'),
    path('tasks/<path:task_id>/send-update/', views.send_customer_update, name='send_customer_update'),

    path('tasks/status-options/', views.get_task_status_options, name='get_task_status_options'),
    path('tasks/urgency-options/', views.get_task_urgency_options, name='get_task_urgency_options'),

    
    # Technician endpoints
    
    
    

    # Revenue overview endpoint
    path('revenue-overview/', views.revenue_overview, name='revenue_overview'),
    
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'brands', views.BrandViewSet, basename='brand')

urlpatterns = [
    # Authentication endpoints
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout, name='logout'),
    
    # User management endpoints
    path('profile/', views.get_user_profile, name='profile'),
    path('profile/update/', views.update_profile, name='update_profile'),
    path('profile/upload-picture/', views.upload_profile_picture, name='upload_profile_picture'),
    path('profile/change-password/', views.change_password, name='change_password'),
    
    path('users/', views.list_users, name='list_users'),
    path('users/<int:user_id>/', views.get_user_detail, name='user_detail'),
    path('users/<int:user_id>/update/', views.update_user, name='update_user'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('users/<int:user_id>/deactivate/', views.deactivate_user, name='deactivate_user'),
    path('users/<int:user_id>/activate/', views.activate_user, name='activate_user'),
    path('users/role/<str:role>/', views.list_users_by_role, name='list_users_by_role'),
    
    # Task management endpoints
    path('tasks/', views.task_list_create, name='task_list_create'),
    path('tasks/<int:task_id>/', views.task_detail, name='task_detail'),
    path('tasks/<int:task_id>/activities/', views.task_activities, name='task_activities'),
    path('tasks/<int:task_id>/add-activity/', views.add_task_activity, name='add_task_activity'),
    path('tasks/<int:task_id>/payments/', views.task_payments, name='task_payments'),
    path('tasks/<int:task_id>/add-payment/', views.add_task_payment, name='add_task_payment'),
    path('tasks/<int:task_id>/send-update/', views.send_customer_update, name='send_customer_update'),
    path('tasks/status-options/', views.get_task_status_options, name='get_task_status_options'),
    path('tasks/priority-options/', views.get_task_priority_options, name='get_task_priority_options'),

    
    # Technician endpoints
    path('technicians/', views.list_technicians, name='list_technicians'),
    
    # Collaboration endpoints
    path('tasks/<int:task_id>/collaboration-requests/', views.create_collaboration_request, name='create_collaboration_request'),
    path('collaboration-requests/', views.list_collaboration_requests, name='list_collaboration_requests'),
    path('collaboration-requests/<int:request_id>/', views.collaboration_request_detail, name='collaboration_request_detail'),
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'locations', views.LocationViewSet, basename='location')
router.register(r'brands', views.BrandViewSet, basename='brand')
router.register(r'accounts', views.AccountViewSet, basename='account')
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'payment-categories', views.PaymentCategoryViewSet, basename='payment-category')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'tasks', views.TaskViewSet, basename='task')

urlpatterns = [
    # Authentication endpoints
    path('login/', views.login_user, name='login'),
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
    path('tasks/<path:task_id>/activities/', views.task_activities, name='task_activities'),
    path('tasks/<path:task_id>/add-activity/', views.add_task_activity, name='add_task_activity'),
    path('tasks/<path:task_id>/payments/', views.task_payments, name='task_payments'),
    path('tasks/<path:task_id>/add-payment/', views.add_task_payment, name='add_task_payment'),
    path('tasks/<path:task_id>/send-update/', views.send_customer_update, name='send_customer_update'),
    path('tasks/<path:task_id>/cost-breakdowns/', views.CostBreakdownViewSet.as_view({'post': 'create'}), name='task-cost-breakdowns'),
    path('tasks/<path:task_id>/cost-breakdowns/<int:pk>/', views.CostBreakdownViewSet.as_view({'delete': 'destroy'}), name='task-cost-breakdown-detail'),

    path('tasks/status-options/', views.get_task_status_options, name='get_task_status_options'),
    path('tasks/urgency-options/', views.get_task_urgency_options, name='get_task_urgency_options'),

    
    # Technician endpoints
    path('technicians/', views.list_technicians, name='list_technicians'),
    path('workshop-locations/', views.list_workshop_locations, name='list_workshop_locations'),
    path('workshop-technicians/', views.list_workshop_technicians, name='list_workshop_technicians'),

    # Revenue overview endpoint
    path('revenue-overview/', views.revenue_overview, name='revenue_overview'),
    
    path('', include(router.urls)),
]

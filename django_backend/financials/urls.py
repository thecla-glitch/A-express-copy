from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'accounts', views.AccountViewSet, basename='account')
router.register(r'payment-methods', views.PaymentMethodViewSet)
router.register(r'payment-categories', views.PaymentCategoryViewSet, basename='payment-category')
router.register(r'payments', views.PaymentViewSet, basename='payment')
router.register(r'expenditure-requests', views.ExpenditureRequestViewSet, basename='expenditure-request')

urlpatterns = [
    path('', include(router.urls)),
    path('cost-breakdowns/pending_refunds/', views.CostBreakdownViewSet.as_view({'get': 'pending_refunds'}), name='pending-refunds'),
    path('cost-breakdowns/<int:pk>/approve/', views.CostBreakdownViewSet.as_view({'post': 'approve'}), name='cost-breakdown-approve'),
    path('cost-breakdowns/<int:pk>/reject/', views.CostBreakdownViewSet.as_view({'post': 'reject'}), name='cost-breakdown-reject'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')

list_router = DefaultRouter()
list_router.register(r'list', views.UserListViewSet, basename='list')

urlpatterns = [
    # Authentication endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('', include(router.urls)),
    path('', include(list_router.urls)),
]

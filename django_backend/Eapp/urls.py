from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
     path('register/', views.register_user, name='register'),
     path('login/', views.login_user, name='login'),
     path('logout/', views.logout, name='logout'),
     path('profile/', views.get_user_profile, name='profile'),
     path('profile/update/', views.update_profile, name='update-profile'),
     path('profile/upload-picture/', views.upload_profile_picture, name='upload-profile-picture'),
     path('users/', views.list_users, name='user-list'),
     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
 ]
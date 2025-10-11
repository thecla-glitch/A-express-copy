from django.urls import path
from .views import customer_search, customer_create, CustomerSearchView, ReferrerSearchView

urlpatterns = [
    path('customers/search/', customer_search, name='customer-search'),
    path('customers/create/', customer_create, name='customer-create'),
    path('customers/search-view/', CustomerSearchView.as_view(), name='customer-search-view'),
    path('referrers/search-view/', ReferrerSearchView.as_view(), name='referrer-search-view'),
]

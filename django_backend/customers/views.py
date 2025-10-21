from django.db.models import Count
from rest_framework import viewsets, permissions, filters
from .models import Customer, Referrer
from .serializers import CustomerSerializer, ReferrerSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from Eapp.pagination import StandardResultsSetPagination

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.annotate(tasks_count=Count('tasks')).order_by('name')
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'phone_numbers__phone_number']

    @action(detail=False, methods=['get'])
    def stats(self, request):
        credit_customers_count = Customer.objects.filter(tasks__is_debt=True).distinct().count()
        data = {
            'credit_customers_count': credit_customers_count
        }
        return Response(data)

class ReferrerViewSet(viewsets.ModelViewSet):
    queryset = Referrer.objects.all()
    serializer_class = ReferrerSerializer
    permission_classes = [permissions.IsAuthenticated]
from rest_framework import status, permissions, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from .models import Customer, Referrer
from .serializers import CustomerSerializer, ReferrerSerializer
from django.db.models import Q


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def customer_search(request):
    query = request.query_params.get('query', '')
    customers = Customer.objects.filter(name__icontains=query)
    serializer = CustomerSerializer(customers, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def customer_create(request):
    """
    Create a new customer or retrieve an existing one.
    """
    phone = request.data.get('phone')
    email = request.data.get('email')

    if phone:
        customer = Customer.objects.filter(phone=phone).first()
        if customer:
            serializer = CustomerSerializer(customer)
            return Response(serializer.data, status=status.HTTP_200_OK)

    if email:
        customer = Customer.objects.filter(email=email).first()
        if customer:
            serializer = CustomerSerializer(customer)
            return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        customer = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomerSearchView(generics.ListAPIView):
    serializer_class = CustomerSerializer

    def get_queryset(self):
        query = self.request.query_params.get('query', '')
        if query:
            return Customer.objects.filter(
                Q(name__icontains=query) |
                Q(phone__icontains=query)
            ).order_by('name')
        return Customer.objects.none()


class ReferrerSearchView(generics.ListAPIView):
    serializer_class = ReferrerSerializer

    def get_queryset(self):
        query = self.request.query_params.get('query', '')
        if query:
            return Referrer.objects.filter(
                Q(name__icontains=query) |
                Q(phone__icontains=query)
            ).order_by('name')
        return Referrer.objects.none()
from rest_framework import serializers
from django.core.validators import MinValueValidator
from decimal import Decimal
from .models import Payment, PaymentCategory, PaymentMethod, Account, CostBreakdown
from users.serializers import UserSerializer

class CostBreakdownSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)

    class Meta:
        model = CostBreakdown
        fields = ['id', 'description', 'amount', 'cost_type', 'category', 'created_at', 'reason', 'status', 'requested_by', 'payment_method']
        extra_kwargs = {
            'payment_method': {'write_only': True}
        }

class AccountSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Account
        fields = ['id', 'name', 'balance', 'created_by', 'created_at']
        read_only_fields = ('id', 'created_by', 'created_at')

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'


class PaymentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentCategory
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    method_name = serializers.CharField(source='method.name', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_status = serializers.CharField(source='task.status', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = ('id', 'task', 'task_title', 'task_status', 'amount', 'date', 'method', 'method_name', 'description', 'category', 'category_name')
        read_only_fields = ('task',)
        extra_kwargs = {
            'amount': {'validators': [MinValueValidator(Decimal('0.00'))]},
        }

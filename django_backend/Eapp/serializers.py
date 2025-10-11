from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import MinValueValidator
from decimal import Decimal
from common.serializers import BrandSerializer, LocationSerializer
from customers.serializers import CustomerSerializer, ReferrerSerializer, CustomerListSerializer
from .models import PaymentCategory, User, Task, TaskActivity, Payment, CostBreakdown, PaymentMethod, Account
from django.utils import timezone


class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                    'phone', 'role', 'is_workshop', 'profile_picture', 'profile_picture_url', 'is_active', 'created_at', 'last_login') 
        read_only_fields = ('id', 'created_at', 'last_login', 'full_name') 
        
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return obj.profile_picture.url
        return None

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





class UserListSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ['full_name']




        
class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('first_name', 'last_name', 'email', 'phone', 'profile_picture')
        extra_kwargs = {
            'email': {'required': False},
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def update(self, instance, validated_data):
        # Handle partial updates, especially for the profile picture
        for attr, value in validated_data.items():
            if attr == 'profile_picture':
                instance.profile_picture = value
            else:
                setattr(instance, attr, value)
        instance.save()
        return instance
    
class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8)
    confirm_password = serializers.CharField(required=True, min_length=8)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("New passwords don't match.")
        return data

    
        
class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'first_name', 
                    'last_name', 'phone', 'role', 'is_workshop')
    
    def validate_role(self, value):
        if value not in dict(User.Role.choices):
            raise serializers.ValidationError("Invalid role.")
        return value

    def create(self, validated_data):
        # Check if the requesting user has permission to create users
        request = self.context.get('request')
        if request and not request.user.has_add_user_permission():
            raise serializers.ValidationError('You do not have permission to create users.')
        
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if user:
                if not user.is_active:
                    raise serializers.ValidationError('User account is disabled.')
                data['user'] = user
                return data
            raise serializers.ValidationError('Unable to log in with provided credentials.')
        raise serializers.ValidationError('Must include "username" and "password".')


class TaskActivitySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TaskActivity
        fields = ('id', 'user', 'timestamp', 'type', 'message')


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


class TaskListSerializer(serializers.ModelSerializer):
    customer_details = CustomerListSerializer(source='customer', read_only=True)
    assigned_to_details = UserListSerializer(source='assigned_to', read_only=True)
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id',
            'title',
            'status',
            'urgency',
            'payment_status',
            'workshop_status',
            'current_location',
            'laptop_model',
            'description',
            'updated_at',
            'customer_details',
            'assigned_to_details',
            'outstanding_balance',
        )

    def get_outstanding_balance(self, obj):
        total_cost = obj.calculate_total_cost()
        paid_sum = sum(p.amount for p in obj.payments.all()) or Decimal('0.00')
        return total_cost - paid_sum

class TaskDetailSerializer(serializers.ModelSerializer):
    negotiated_by = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(is_active=True),
        allow_null=True,
        required=False
    )
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    negotiated_by_details = UserSerializer(source='negotiated_by', read_only=True)
    approved_by_details = UserSerializer(source='approved_by', read_only=True)
    sent_out_by_details = UserSerializer(source='sent_out_by', read_only=True)
    brand_details = BrandSerializer(source='brand', read_only=True)
    referred_by = serializers.CharField(source='referred_by.name', allow_blank=True, allow_null=True, required=False)
    referred_by_details = ReferrerSerializer(source='referred_by', read_only=True)
    customer_details = CustomerSerializer(source='customer', read_only=True)
    activities = TaskActivitySerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    outstanding_balance = serializers.SerializerMethodField()
    partial_payment_amount = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)
    workshop_location_details = LocationSerializer(source='workshop_location', read_only=True)
    workshop_technician_details = UserSerializer(source='workshop_technician', read_only=True)
    original_technician_details = UserSerializer(source='original_technician', read_only=True)
    cost_breakdowns = CostBreakdownSerializer(many=True, read_only=True)
    total_cost = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'urgency', 
            'assigned_to', 'assigned_to_details', 'created_by_details',
            'created_at', 'updated_at', 'due_date',
            'customer', 'customer_details',
            'brand', 'brand_details', 'laptop_model', 'serial_number',
            'device_type', 'device_notes',
            'estimated_cost', 'total_cost', 'payment_status',
            'current_location', 'date_in', 'approved_at', 'approved_by',
            'paid_date', 'next_payment_date', 'date_out', 'negotiated_by', 'negotiated_by_details',
            'activities', 'payments', 'outstanding_balance', 'is_referred', 'is_debt', 'referred_by', 'referred_by_details',
            'partial_payment_amount',
            'workshop_status', 'workshop_location', 'workshop_technician', 'original_technician',
            'workshop_location_details', 'workshop_technician_details', 'original_technician_details', 'approved_by_details',
            'sent_out_by', 'sent_out_by_details',
            'qc_notes', 'qc_rejected_at', 'qc_rejected_by',
            'cost_breakdowns'
        )
        read_only_fields = ('created_at', 'updated_at', 'assigned_to_details', 'created_by_details', 'activities', 'payments',
                            'workshop_location_details', 'workshop_technician_details', 'original_technician_details', 'approved_by_details', 'sent_out_by_details')
        extra_kwargs = {
            'estimated_cost': {'validators': [MinValueValidator(Decimal('0.00'))]},
        }

    def get_total_cost(self, obj):
        estimated_cost = obj.estimated_cost or Decimal('0.00')
        additive_costs = sum(item.amount for item in obj.cost_breakdowns.filter(cost_type='Additive'))
        subtractive_costs = sum(item.amount for item in obj.cost_breakdowns.filter(cost_type='Subtractive'))
        return estimated_cost + additive_costs - subtractive_costs

    def get_outstanding_balance(self, obj):
        total_cost = self.get_total_cost(obj)
        paid_sum = sum(p.amount for p in obj.payments.all()) or Decimal('0.00')
        return total_cost - paid_sum

    def validate(self, data):
        device_type = data.get('device_type')
        device_notes = data.get('device_notes')

        if device_type in ['Not Full', 'Motherboard Only'] and not device_notes:
            raise serializers.ValidationError({"device_notes": "Device notes are required for 'Not Full' or 'Motherboard Only' device types."})

        return data

    def create(self, validated_data):
        referred_by_data = validated_data.pop('referred_by', None)
        is_referred = validated_data.get('is_referred', False)

        if is_referred and referred_by_data:
            referrer, _ = Referrer.objects.get_or_create(name=referred_by_data.get('name'))
            validated_data['referred_by'] = referrer
        else:
            validated_data['referred_by'] = None

        if validated_data.get('assigned_to'):
            validated_data['status'] = 'In Progress'
        else:
            validated_data['status'] = 'Pending'

        device_notes = validated_data.get('device_notes', None)
        task = super().create(validated_data)

        # Log the intake activity
        TaskActivity.objects.create(
            task=task,
            user=task.created_by,
            type=TaskActivity.ActivityType.INTAKE,
            message="Task has been taken in."
        )

        if device_notes:
            TaskActivity.objects.create(
                task=task,
                user=task.created_by,
                type=TaskActivity.ActivityType.DEVICE_NOTE,
                message=f"Device Notes: {device_notes}"
            )
        return task

    def update(self, instance, validated_data):
        referred_by_data = validated_data.pop('referred_by', None)
        is_referred = validated_data.get('is_referred', instance.is_referred)

        if is_referred and referred_by_data:
            referrer, _ = Referrer.objects.get_or_create(name=referred_by_data.get('name'))
            validated_data['referred_by'] = referrer
        elif not is_referred:
            validated_data['referred_by'] = None

        if 'assigned_to' in validated_data:
            if validated_data['assigned_to']:
                validated_data['status'] = 'In Progress'
            else:
                validated_data['status'] = 'Pending'

        partial_payment_amount = validated_data.pop('partial_payment_amount', None)

        if partial_payment_amount is not None:
            payment_method, _ = PaymentMethod.objects.get_or_create(name='Partial Payment')
            Payment.objects.create(
                task=instance,
                amount=partial_payment_amount,
                method=payment_method
            )

        if 'workshop_location' in validated_data and 'workshop_technician' in validated_data:
            workshop_technician = validated_data.get('workshop_technician')
            workshop_location = validated_data.get('workshop_location')
            TaskActivity.objects.create(
                task=instance,
                user=self.context['request'].user,
                type=TaskActivity.ActivityType.WORKSHOP,
                message=f"Task sent to workshop technician {workshop_technician.get_full_name()} at {workshop_location.name}."
            )

        if 'qc_notes' in validated_data:
            instance.qc_rejected_at = timezone.now()
            instance.qc_rejected_by = self.context['request'].user
            TaskActivity.objects.create(
                task=instance,
                user=self.context['request'].user,
                type=TaskActivity.ActivityType.REJECTED,
                message=f"Task Rejected with notes: {validated_data['qc_notes']}"
            )

        return super().update(instance, validated_data)


from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.validators import MinValueValidator
from decimal import Decimal
from .models import User, Task, TaskActivity, Payment, CollaborationRequest, Location

class UserSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'full_name',
                    'phone', 'role','profile_picture', 'profile_picture_url', 'is_active', 'created_at', 'last_login') 
        read_only_fields = ('id', 'created_at', 'last_login', 'full_name') 
        
    def get_profile_picture_url(self, obj):
        request = self.context.get('request')
        if obj.profile_picture and hasattr(obj.profile_picture, 'url'):
            return request.build_absolute_uri(obj.profile_picture.url) if request else obj.profile_picture.url
        return None

        
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
        # Handle partial updates
        for attr, value in validated_data.items():
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
                    'last_name', 'phone', 'role')
    
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


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = ('id', 'amount', 'date', 'method', 'reference')
        extra_kwargs = {
            'amount': {'validators': [MinValueValidator(Decimal('0.00'))]},
        }


class TaskSerializer(serializers.ModelSerializer):
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    negotiated_by_details = UserSerializer(source='negotiated_by', read_only=True)
    activities = TaskActivitySerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    outstanding_balance = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'status', 'priority', 
            'assigned_to', 'assigned_to_details', 'created_by', 'created_by_details',
            'created_at', 'updated_at', 'due_date',
            'customer_name', 'customer_phone', 'customer_email',
            'laptop_make', 'laptop_model', 'serial_number',
            'estimated_cost', 'total_cost', 'payment_status',
            'current_location', 'urgency', 'date_in', 'approved_date',
            'paid_date', 'date_out', 'negotiated_by', 'negotiated_by_details',
            'activities', 'payments', 'outstanding_balance'
        )
        read_only_fields = ('created_by', 'created_at', 'updated_at', 'assigned_to_details', 'created_by_details', 'negotiated_by_details', 'activities', 'payments', 'payment_status')
        extra_kwargs = {
            'estimated_cost': {'validators': [MinValueValidator(Decimal('0.00'))]},
            'total_cost': {'validators': [MinValueValidator(Decimal('0.00'))]},
        }

    def get_outstanding_balance(self, obj):
        return obj.outstanding_balance

class CollaborationRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)  # Keep for response rendering
    task = TaskSerializer(read_only=True)

    class Meta:
        model = CollaborationRequest
        fields = ('id', 'task', 'requested_by', 'assigned_to', 'reason', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'task', 'requested_by', 'created_at', 'updated_at')  # Remove 'assigned_to'

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user = request.user

        # Only Managers or the assigned Technician can update
        is_manager = user.role == 'Manager' or user.is_superuser
        is_assigned = instance.assigned_to == user
        if not (is_manager or is_assigned):
            raise serializers.ValidationError(
                "Only Managers or the assigned Technician can update this collaboration request."
            )

        # If Technician is accepting, set assigned_to to themselves and status to Accepted
        if user.role == 'Technician' and 'status' in validated_data and validated_data['status'] == 'Accepted':
            validated_data['assigned_to'] = user

        # Managers can freely update assigned_to and status
        return super().update(instance, validated_data)

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name']

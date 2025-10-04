from rest_framework import status, permissions, viewsets, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from django.db.models import Sum, F, DecimalField, Q
from django.core.mail import send_mail
from django.conf import settings
from .models import User, Brand, Customer, Referrer, Task, TaskActivity, Payment, Location, CostBreakdown, PaymentMethod
from .serializers import UserSerializer, BrandSerializer, CustomerSerializer, ReferrerSerializer, TaskSerializer, TaskActivitySerializer, PaymentSerializer, LocationSerializer, CostBreakdownSerializer, PaymentMethodSerializer
from .permissions import IsManager, IsTechnician, IsFrontDesk
from .serializers import (
    UserSerializer, TaskSerializer, TaskActivitySerializer, PaymentSerializer, 
    LocationSerializer, BrandSerializer, CustomerSerializer, ReferrerSerializer, CostBreakdownSerializer,
    UserRegistrationSerializer, LoginSerializer, ChangePasswordSerializer, UserProfileUpdateSerializer
)
from django.db.models import Q
from django.shortcuts import get_object_or_404
from datetime import datetime
from .permissions import IsAdminOrManager, IsManager, IsFrontDesk, IsTechnician, IsAdminOrManagerOrFrontDesk, IsAdminOrManagerOrFrontDeskOrAccountant


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
    serializer = CustomerSerializer(data=request.data)
    if serializer.is_valid():
        # Check if customer already exists
        phone = serializer.validated_data.get('phone')
        email = serializer.validated_data.get('email')
        
        if phone:
            customer = Customer.objects.filter(phone=phone).first()
            if customer:
                return Response(CustomerSerializer(customer).data, status=status.HTTP_200_OK)

        if email:
            customer = Customer.objects.filter(email=email).first()
            if customer:
                return Response(CustomerSerializer(customer).data, status=status.HTTP_200_OK)

        customer = serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAdminOrManager])
def register_user(request):
    serializer = UserRegistrationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_user(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        user.last_login = timezone.now()
        user.save(update_fields=['last_login'])
        
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    serializer = UserSerializer(request.user, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAdminOrManagerOrFrontDeskOrAccountant])
def list_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh_token')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['PUT', 'PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    user = request.user
    serializer = UserProfileUpdateSerializer(user, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(UserSerializer(user, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_profile_picture(request):
    user = request.user
    if 'profile_picture' not in request.FILES:
        return Response({"error": "No profile picture provided"}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = UserProfileUpdateSerializer(
        user, 
        data=request.data, 
        partial=True, 
        context={'request': request}
    )
    
    if serializer.is_valid():
        serializer.save()
        user_serializer = UserSerializer(user, context={'request': request})
        return Response(user_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrManager])
def get_user_detail(request, user_id):
    user = get_object_or_404(User, id=user_id)
    serializer = UserSerializer(user, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT', 'PATCH'])
@permission_classes([IsAdminOrManager])
def update_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.is_superuser and not request.user.is_superuser:
        return Response(
            {"error": "Only superusers can update other superusers."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
    
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrManager])
def delete_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.id == request.user.id:
        return Response(
            {"error": "You cannot delete your own account."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if user.is_superuser and not request.user.is_superuser:
        return Response(
            {"error": "Only superusers can delete other superusers."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user.delete()
    return Response(
        {"message": "User deleted successfully."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAdminOrManager])
def deactivate_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    
    if user.id == request.user.id:
        return Response(
            {"error": "You cannot deactivate your own account."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    user.is_active = False
    user.save()
    
    return Response(
        {"message": "User deactivated successfully."},
        status=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([IsAdminOrManager])
def activate_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    user.is_active = True
    user.save()
    
    return Response(
        {"message": "User activated successfully."},
        status=status.HTTP_200_OK
    )


@api_view(['GET'])
@permission_classes([IsAdminOrManagerOrFrontDeskOrAccountant])
def list_users_by_role(request, role):
    valid_roles = [choice[0] for choice in User.Role.choices]
    if role not in valid_roles:
        return Response(
            {"error": f"Invalid role. Valid roles are: {', '.join(valid_roles)}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    users = User.objects.filter(role=role)
    serializer = UserSerializer(users, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def change_password(request):
    user = request.user
    serializer = ChangePasswordSerializer(data=request.data)
    
    if serializer.is_valid():
        if not user.check_password(serializer.validated_data['current_password']):
            return Response(
                {"error": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def generate_task_id():
    first_task = Task.objects.order_by('created_at').first()
    if first_task:
        first_year = first_task.created_at.year
    else:
        first_year = datetime.now().year

    current_year = datetime.now().year
    year_diff = current_year - first_year
    year_letter = chr(ord('A') + year_diff)

    current_month = datetime.now().month
    monthly_tasks = Task.objects.filter(created_at__year=current_year, created_at__month=current_month).count()
    task_number = monthly_tasks + 1

    return f'{year_letter}{current_month}-{task_number:03d}'

# Task-related views (assuming these are the missing parts based on urls.py)
@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def task_list_create(request):
    if request.method == 'GET':
        filters = {}
        for key, value in request.query_params.items():
            if key.endswith('__in'):
                filters[key] = request.query_params.getlist(key)
            else:
                filters[key] = value
        
        tasks = Task.objects.filter(**filters).select_related(
            'assigned_to', 'created_by', 'negotiated_by', 'brand', 'workshop_location', 'workshop_technician', 'original_technician'
        ).prefetch_related('activities', 'payments').annotate(
            paid_sum=Sum('payments__amount', output_field=DecimalField(max_digits=10, decimal_places=2))
        )
        
        serializer = TaskSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not (request.user.role in ['Manager', 'Front Desk'] or request.user.is_superuser):
            return Response(
                {"error": "You do not have permission to create tasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        data = request.data.copy()
        data['title'] = generate_task_id()
        serializer = TaskSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def task_detail(request, task_id):
    task = get_object_or_404(
        Task.objects.select_related(
            'assigned_to', 'created_by', 'negotiated_by', 'brand', 'workshop_location', 'workshop_technician', 'original_technician'
        ).prefetch_related('activities', 'payments').annotate(
            paid_sum=Sum('payments__amount', output_field=DecimalField(max_digits=10, decimal_places=2))
        ),
        title=task_id
    )
    user = request.user
    is_manager = user.role == 'Manager' or user.is_superuser

    if request.method == 'GET':
        serializer = TaskSerializer(task, context={'request': request})
        return Response(serializer.data)

    elif request.method in ['PUT', 'PATCH']:
        customer_data = request.data.pop('customer', None)
        if customer_data:
            customer = task.customer
            customer_serializer = CustomerSerializer(customer, data=customer_data, partial=True)
            if customer_serializer.is_valid():
                customer_serializer.save()
            else:
                return Response(customer_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if user.role == 'Front Desk' and 'current_location' in request.data:
            return Response(
                {"error": "Front Desk users cannot change the task location."},
                status=status.HTTP_403_FORBIDDEN
            )

        if 'status' in request.data and request.data['status'] == 'Pending' and user.role not in ['Manager', 'Front Desk']:
            return Response(
                {"error": "You do not have permission to return tasks."},
                status=status.HTTP_403_FORBIDDEN
            )

        if 'status' in request.data and not is_manager:
            current_status = task.status
            new_status = request.data['status']
            
            if new_status == 'Picked Up':
                request.data['sent_out_by'] = user.id
                request.data['date_out'] = timezone.now()
                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    type=TaskActivity.ActivityType.PICKED_UP,
                    message="Task has been picked up by the customer."
                )
            elif new_status == 'Completed':
                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    type=TaskActivity.ActivityType.STATUS_UPDATE,
                    message=f"Task marked as Completed."
                )
            elif new_status == 'Ready for Pickup':
                TaskActivity.objects.create(
                    task=task,
                    user=user,
                    type=TaskActivity.ActivityType.STATUS_UPDATE,
                    message="Task has been approved and is ready for pickup."
                )
            elif new_status == 'In Progress' and user.role == 'Front Desk':
                technician_id = request.data.get('assigned_to')
                if technician_id:
                    technician = get_object_or_404(User, id=technician_id, role='Technician')
                    task.assigned_to = technician
                    TaskActivity.objects.create(
                        task=task,
                        user=user,
                        type=TaskActivity.ActivityType.STATUS_UPDATE,
                        message=f"Task assigned to {technician.get_full_name()}."
                    )

            allowed_transitions = {
                'Front Desk': {
                    'Completed': ['Ready for Pickup', 'In Progress', 'Pending'],
                    'Ready for Pickup': ['Picked Up', 'Pending', 'In Progress'],
                    'Picked Up': ['In Progress'],
                    'Pending': ['Terminated'],
                    'In Progress': ['Terminated', 'Pending'],
                },
                'Technician': {
                    'Pending': ['In Progress'],
                    'In Progress': ['Awaiting Parts', 'Completed'],
                    'Awaiting Parts': ['In Progress'],
                },
                'Manager': {
                }
            }

            role_transitions = allowed_transitions.get(user.role, {})
            if new_status not in role_transitions.get(current_status, []):
                return Response(
                    {"error": f"As a {user.role}, you cannot change status from '{current_status}' to '{new_status}'."},
                    status=status.HTTP_403_FORBIDDEN
                )

        if user.role == 'Accountant' and 'payment_status' in request.data:
            task.payment_status = request.data['payment_status']
            if request.data['payment_status'] == 'Fully Paid':
                task.paid_date = timezone.now().date()
            task.save()
            return Response(TaskSerializer(task, context={'request': request}).data)

        if 'workshop_location' in request.data and 'workshop_technician' in request.data:
            task.original_location = task.current_location
            task.workshop_status = 'In Workshop'
            task.original_technician = user
            task.workshop_sent_at = timezone.now()
            workshop_technician_id = request.data.get('workshop_technician')
            workshop_technician = User.objects.get(id=workshop_technician_id)
            
            workshop_location_id = request.data.get('workshop_location')
            workshop_location = Location.objects.get(id=workshop_location_id)
            task.current_location = workshop_location.name



        if 'workshop_status' in request.data and request.data['workshop_status'] in ['Solved', 'Not Solved']:
            if task.original_location:
                task.current_location = task.original_location
                task.original_location = None
            
            task.assigned_to = task.original_technician
            task.workshop_location = None
            task.workshop_technician = None
            task.original_technician = None
            task.workshop_returned_at = timezone.now()
            TaskActivity.objects.create(
                task=task,
                user=user,
                type=TaskActivity.ActivityType.WORKSHOP,
                message=f"Task returned from workshop with status: {request.data['workshop_status']}."
            )

        serializer = TaskSerializer(task, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if not is_manager:
            return Response(
                {"error": "You do not have permission to delete tasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_activities(request, task_id):
    task = get_object_or_404(Task, title=task_id)
    activities = task.activities.all()
    serializer = TaskActivitySerializer(activities, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_task_activity(request, task_id):
    task = get_object_or_404(Task, title=task_id)
    serializer = TaskActivitySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(task=task, user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def task_payments(request, task_id):
    task = get_object_or_404(Task, title=task_id)
    payments = task.payments.all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def add_task_payment(request, task_id):
    if not (request.user.role in ['Manager', 'Front Desk', 'Accountant'] or request.user.is_superuser):
        return Response(
            {"error": "You do not have permission to add payments."},
            status=status.HTTP_403_FORBIDDEN
        )
    task = get_object_or_404(Task, title=task_id)
    serializer = PaymentSerializer(data=request.data)
    if serializer.is_valid():
        payment = serializer.save(task=task)
        payment.task.update_payment_status()  # Trigger update
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_technicians(request):
    """
    Get all users with Technician role
    """
    technicians = User.objects.filter(role='Technician', is_active=True)
    serializer = UserSerializer(technicians, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_customer_update(request, task_id):
    if not (request.user.role in ['Manager', 'Front Desk'] or request.user.is_superuser):
        return Response({'error': 'You do not have permission to perform this action.'}, status=status.HTTP_403_FORBIDDEN)

    try:
        task = get_object_or_404(Task, title=task_id)
        if not task.customer.email:
            return Response({'error': 'No customer email available for this task.'}, status=status.HTTP_400_BAD_REQUEST)
        
        subject = request.data.get('subject')
        message = request.data.get('message')
        if not subject or not message:
            return Response({'error': 'Subject and message are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [task.customer.email],
            fail_silently=False,
        )
        TaskActivity.objects.create(
            task=task, 
            user=request.user, 
            type='customer_contact', 
            message=f'Sent customer update: "{subject}"'
        )
        return Response({'message': 'Customer update sent successfully.'}, status=status.HTTP_200_OK)
    except Task.DoesNotExist:
        return Response({'error': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Failed to send email: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class LocationViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows locations to be viewed or edited.
    """
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_task_status_options(request):
    return Response(Task.Status.choices)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_task_urgency_options(request):
    return Response(Task.Urgency.choices)

class BrandViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows brands to be viewed or edited.
    """
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action == 'list':
            self.permission_classes = [permissions.IsAuthenticated]
        else:
            self.permission_classes = [IsManager]
        return super().get_permissions()

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_workshop_locations(request):
    locations = Location.objects.filter(is_workshop=True)
    serializer = LocationSerializer(locations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_workshop_technicians(request):
    technicians = User.objects.filter(is_workshop=True, is_active=True)
    serializer = UserSerializer(technicians, many=True, context={'request': request})
    return Response(serializer.data)

class TaskActivityViewSet(viewsets.ModelViewSet):
    queryset = TaskActivity.objects.all()
    serializer_class = TaskActivitySerializer
    permission_classes = [permissions.IsAuthenticated]


class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

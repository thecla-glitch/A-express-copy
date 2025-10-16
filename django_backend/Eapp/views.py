from rest_framework import status, permissions, viewsets, generics
from rest_framework.decorators import api_view, permission_classes, action
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
from .status_transitions import can_transition
from .reports.services import ReportGenerator
from .models import SavedReport
from .serializers import ReportConfigSerializer, SavedReportSerializer
import json
from django.http import HttpResponse
import csv
from .reports.predefined_reports import PredefinedReportGenerator



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


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return UserRegistrationSerializer
        return UserSerializer

    def get_permissions(self):
        if self.action in ['create', 'update_user', 'delete_user', 'deactivate', 'activate']:
            self.permission_classes = [IsAdminOrManager]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        headers = self.get_success_headers(serializer.data)
        return Response({
            'user': UserSerializer(user, context=self.get_serializer_context()).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['patch'], url_path='update')
    def update_user(self, request, pk=None):
        user = self.get_object()
        if user.is_superuser and not request.user.is_superuser:
            return Response({"error": "Only superusers can update other superusers."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['delete'], url_path='delete')
    def delete_user(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({"error": "You cannot delete your own account."}, status=status.HTTP_403_FORBIDDEN)
        if user.is_superuser and not request.user.is_superuser:
            return Response({"error": "Only superusers can delete other superusers."}, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response({"message": "User deleted successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='deactivate')
    def deactivate(self, request, pk=None):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({"error": "You cannot deactivate your own account."}, status=status.HTTP_403_FORBIDDEN)
        
        user.is_active = False
        user.save()
        return Response({"message": "User deactivated successfully."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='activate')
    def activate(self, request, pk=None):
        user = self.get_object()
        user.is_active = True
        user.save()
        return Response({"message": "User activated successfully."}, status=status.HTTP_200_OK)


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
    now = timezone.now()
    year_month = now.strftime('%y-%m')

    # Find the last task created this month to determine the next sequence number
    last_task = Task.objects.filter(title__startswith=year_month).order_by('-title').first()

    if last_task:
        # Extract the sequence number from the last task's title
        last_seq = int(last_task.title.split('-')[-1])
        new_seq = last_seq + 1
    else:
        # Start a new sequence for the month
        new_seq = 1

    return f'{year_month}-{new_seq:04d}'

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



class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.select_related(
        'assigned_to', 'created_by', 'negotiated_by', 'brand', 'workshop_location', 'workshop_technician', 'original_technician'
    ).prefetch_related('activities', 'payments').annotate(
        paid_sum=Sum('payments__amount', output_field=DecimalField(max_digits=10, decimal_places=2))
    )
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'title'
    lookup_url_kwarg = 'task_id'

    def get_object(self):
        queryset = self.get_queryset()
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        task = self.get_object()
        user = request.user

        # Handle specific field updates with dedicated methods
        self._handle_customer_update(request.data.pop('customer', None), task)
        self._handle_debt_status(request.data, task, user)
        self._handle_payment_status_update(request.data, task, user)
        self._handle_workshop_logic(request.data, task, user)

        # Handle status transitions
        if 'status' in request.data:
            response = self._handle_status_update(request.data, task, user)
            if response:
                return response

        serializer = self.get_serializer(task, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def _handle_customer_update(self, customer_data, task):
        if customer_data:
            customer_serializer = CustomerSerializer(task.customer, data=customer_data, partial=True)
            customer_serializer.is_valid(raise_exception=True)
            customer_serializer.save()

    def _handle_debt_status(self, data, task, user):
        if data.get('is_debt') is True:
            TaskActivity.objects.create(
                task=task, user=user, type=TaskActivity.ActivityType.STATUS_UPDATE, message="Task marked as debt."
            )

    def _handle_payment_status_update(self, data, task, user):
        if user.role == 'Accountant' and 'payment_status' in data:
            task.payment_status = data['payment_status']
            if data['payment_status'] == 'Fully Paid':
                task.paid_date = timezone.now().date()
            task.save()

    def _handle_workshop_logic(self, data, task, user):
        if 'workshop_location' in data and 'workshop_technician' in data:
            task.original_location = task.current_location
            task.workshop_status = 'In Workshop'
            task.original_technician = user
            task.workshop_sent_at = timezone.now()
            workshop_technician = get_object_or_404(User, id=data.get('workshop_technician'))
            workshop_location = get_object_or_404(Location, id=data.get('workshop_location'))
            task.current_location = workshop_location.name

        if data.get('workshop_status') in ['Solved', 'Not Solved']:
            if task.original_location:
                task.current_location = task.original_location
                task.original_location = None
            task.assigned_to = task.original_technician
            task.workshop_location = None
            task.workshop_technician = None
            task.original_technician = None
            task.workshop_returned_at = timezone.now()
            TaskActivity.objects.create(
                task=task, user=user, type=TaskActivity.ActivityType.WORKSHOP,
                message=f"Task returned from workshop with status: {data['workshop_status']}."
            )

    def _handle_status_update(self, data, task, user):
        new_status = data['status']
        if not can_transition(user, task, new_status):
            return Response(
                {"error": f"As a {user.role}, you cannot change status from '{task.status}' to '{new_status}'."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Create activity logs for specific transitions
        activity_messages = {
            'Picked Up': "Task has been picked up by the customer.",
            'Completed': "Task marked as Completed.",
            'Ready for Pickup': "Task has been approved and is ready for pickup."
        }
        if new_status in activity_messages:
            TaskActivity.objects.create(task=task, user=user, type=TaskActivity.ActivityType.STATUS_UPDATE, message=activity_messages[new_status])
            if new_status == 'Picked Up':
                data['sent_out_by'] = user.id
                data['date_out'] = timezone.now()

        if new_status == 'In Progress' and user.role == 'Front Desk':
            technician_id = data.get('assigned_to')
            if technician_id:
                technician = get_object_or_404(User, id=technician_id, role='Technician')
                task.assigned_to = technician
                TaskActivity.objects.create(
                    task=task, user=user, type=TaskActivity.ActivityType.STATUS_UPDATE,
                    message=f"Task assigned to {technician.get_full_name()}."
                )
        return None

    def destroy(self, request, *args, **kwargs):
        user = request.user
        if not (user.is_superuser or user.role == 'Manager'):
            return Response(
                {"error": "You do not have permission to delete tasks."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)



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

class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows payments to be viewed.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]

from django.utils import timezone
from datetime import timedelta

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def revenue_overview(request):
    """
    Calculate revenue for this month and today, with comparisons to the previous period.
    """
    now = timezone.now()
    today = now.date()

    # This month's revenue
    this_month_start = today.replace(day=1)
    this_month_revenue = Payment.objects.filter(
        date__gte=this_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Last month's revenue
    last_month_end = this_month_start - timedelta(days=1)
    last_month_start = last_month_end.replace(day=1)
    last_month_revenue = Payment.objects.filter(
        date__gte=last_month_start,
        date__lt=this_month_start
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Today's revenue
    today_revenue = Payment.objects.filter(
        date=today
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Yesterday's revenue
    yesterday = today - timedelta(days=1)
    yesterday_revenue = Payment.objects.filter(
        date=yesterday
    ).aggregate(total=Sum('amount'))['total'] or 0

    # Percentage changes
    month_over_month_change = ((this_month_revenue - last_month_revenue) / last_month_revenue * 100) if last_month_revenue else 100
    day_over_day_change = ((today_revenue - yesterday_revenue) / yesterday_revenue * 100) if yesterday_revenue else 100

    return Response({
        'this_month_revenue': this_month_revenue,
        'month_over_month_change': month_over_month_change,
        'today_revenue': today_revenue,
        'day_over_day_change': day_over_day_change,
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def generate_custom_report(request):
    """
    Generate custom report based on configuration
    """
    try:
        report_config = request.data
        
        # Validate report config
        config_serializer = ReportConfigSerializer(data=report_config)
        if not config_serializer.is_valid():
            return Response(config_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        generator = ReportGenerator(report_config)
        report_data = generator.generate_report()
        
        return Response({
            'success': True,
            'report': report_data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def download_report_csv(request):
    """
    Download report as CSV
    """
    try:
        report_config = request.data
        generator = ReportGenerator(report_config)
        report_data = generator.generate_report()
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_config.get("reportName", "report")}.csv"'
        
        writer = csv.writer(response)
        
        # Write headers
        if report_data['data']:
            headers = report_data['data'][0].keys()
            writer.writerow(headers)
            
            # Write data
            for row in report_data['data']:
                writer.writerow([row.get(header, '') for header in headers])
        
        return response
        
    except Exception as e:
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def save_report_config(request):
    """
    Save report configuration for future use
    """
    serializer = SavedReportSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def list_saved_reports(request):
    """
    List all saved reports for the current user
    """
    reports = SavedReport.objects.filter(
        Q(created_by=request.user) | Q(is_public=True)
    ).order_by('-created_at')
    serializer = SavedReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_saved_report(request, report_id):
    """
    Get a specific saved report
    """
    report = get_object_or_404(SavedReport, id=report_id)
    if not report.is_public and report.created_by != request.user:
        return Response(
            {"error": "You don't have permission to access this report."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    serializer = SavedReportSerializer(report)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def delete_saved_report(request, report_id):
    """
    Delete a saved report
    """
    report = get_object_or_404(SavedReport, id=report_id)
    if report.created_by != request.user:
        return Response(
            {"error": "You can only delete your own reports."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    report.delete()
    return Response({"message": "Report deleted successfully."}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_report_field_options(request):
    """
    Get available field options for reports
    """
    field_options = {
        'reportTypes': [
            {'id': 'financial', 'label': 'Financial Analysis', 'description': 'Revenue, payments, and cost analysis'},
            {'id': 'operational', 'label': 'Operational Metrics', 'description': 'Task status, turnaround times, efficiency'},
            {'id': 'performance', 'label': 'Performance Review', 'description': 'Technician productivity and quality metrics'},
            {'id': 'customer', 'label': 'Customer Analytics', 'description': 'Customer satisfaction and retention data'},
        ],
        'dataFields': [
            {'id': 'task_id', 'label': 'Task ID', 'category': 'basic'},
            {'id': 'customer_name', 'label': 'Customer Name', 'category': 'basic'},
            {'id': 'laptop_model', 'label': 'Laptop Model', 'category': 'basic'},
            {'id': 'technician', 'label': 'Assigned Technician', 'category': 'basic'},
            {'id': 'status', 'label': 'Current Status', 'category': 'basic'},
            {'id': 'date_in', 'label': 'Date In', 'category': 'dates'},
            {'id': 'date_completed', 'label': 'Date Completed', 'category': 'dates'},
            {'id': 'turnaround_time', 'label': 'Turnaround Time', 'category': 'performance'},
            {'id': 'total_cost', 'label': 'Total Cost', 'category': 'financial'},
            {'id': 'parts_cost', 'label': 'Parts Cost', 'category': 'financial'},
            {'id': 'labor_cost', 'label': 'Labor Cost', 'category': 'financial'},
            {'id': 'payment_status', 'label': 'Payment Status', 'category': 'financial'},
            {'id': 'urgency', 'label': 'Urgency Level', 'category': 'basic'},
            {'id': 'location', 'label': 'Current Location', 'category': 'basic'},
        ],
        'dateRanges': [
            {'value': 'last_7_days', 'label': 'Last 7 Days'},
            {'value': 'last_30_days', 'label': 'Last 30 Days'},
            {'value': 'last_3_months', 'label': 'Last 3 Months'},
            {'value': 'last_6_months', 'label': 'Last 6 Months'},
            {'value': 'last_year', 'label': 'Last Year'},
            {'value': 'custom', 'label': 'Custom Range'},
        ]
    }
    return Response(field_options)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_revenue_summary(request):
    """Get revenue summary report"""
    date_range = request.GET.get('date_range', 'last_30_days')
    
    try:
        report_data = PredefinedReportGenerator.generate_revenue_summary_report(date_range)
        return Response({
            'success': True,
            'report': report_data,
            'type': 'revenue_summary'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_outstanding_payments(request):
    """Get outstanding payments report"""
    try:
        report_data = PredefinedReportGenerator.generate_outstanding_payments_report()
        return Response({
            'success': True,
            'report': report_data,
            'type': 'outstanding_payments'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_task_status_report(request):
    """Get task status report"""
    try:
        report_data = PredefinedReportGenerator.generate_task_status_report()
        return Response({
            'success': True,
            'report': report_data,
            'type': 'task_status'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_technician_performance(request):
    """Get technician performance report"""
    date_range = request.GET.get('date_range', 'last_30_days')
    
    try:
        report_data = PredefinedReportGenerator.generate_technician_performance_report(date_range)
        return Response({
            'success': True,
            'report': report_data,
            'type': 'technician_performance'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_turnaround_time(request):
    """Get turnaround time report"""
    try:
        report_data = PredefinedReportGenerator.generate_turnaround_time_report()
        return Response({
            'success': True,
            'report': report_data,
            'type': 'turnaround_time'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_technician_workload(request):
    """Get technician workload report"""
    try:
        report_data = PredefinedReportGenerator.generate_technician_workload_report()
        return Response({
            'success': True,
            'report': report_data,
            'type': 'technician_workload'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_payment_methods_report(request):
    """Get payment methods report"""
    date_range = request.GET.get('date_range', 'last_30_days')
    
    try:
        report_data = PredefinedReportGenerator.generate_payment_methods_report(date_range)
        return Response({
            'success': True,
            'report': report_data,
            'type': 'payment_methods'
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def download_predefined_report(request, report_type):
    """Download predefined report as CSV"""
    try:
        # Map report types to generator methods
        report_generators = {
            'revenue-summary': PredefinedReportGenerator.generate_revenue_summary_report,
            'outstanding-payments': PredefinedReportGenerator.generate_outstanding_payments_report,
            'task-status': PredefinedReportGenerator.generate_task_status_report,
            'technician-performance': PredefinedReportGenerator.generate_technician_performance_report,
            'turnaround-time': PredefinedReportGenerator.generate_turnaround_time_report,
            'technician-workload': PredefinedReportGenerator.generate_technician_workload_report,
            'payment-methods': PredefinedReportGenerator.generate_payment_methods_report,
        }
        
        if report_type not in report_generators:
            return Response({'error': 'Invalid report type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get date range from query params
        date_range = request.GET.get('date_range', 'last_30_days')
        
        # Generate report data
        if report_type in ['revenue-summary', 'technician-performance', 'payment-methods']:
            report_data = report_generators[report_type](date_range)
        else:
            report_data = report_generators[report_type]()
        
        # Create CSV response
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{report_type}_{timezone.now().date()}.csv"'
        
        writer = csv.writer(response)
        
        # Write data based on report type
        if report_type == 'revenue-summary':
            writer.writerow(['Date', 'Daily Revenue'])
            for item in report_data.get('payments_by_date', []):
                writer.writerow([item['date'], item['daily_revenue']])
                
        elif report_type == 'outstanding-payments':
            writer.writerow(['Task ID', 'Customer', 'Total Cost', 'Paid Amount', 'Outstanding Balance', 'Days Overdue'])
            for item in report_data.get('outstanding_tasks', []):
                writer.writerow([
                    item['task_id'], item['customer_name'], item['total_cost'],
                    item['paid_amount'], item['outstanding_balance'], item['days_overdue']
                ])
                
        elif report_type == 'task-status':
            writer.writerow(['Status', 'Count', 'Percentage'])
            for item in report_data.get('status_distribution', []):
                writer.writerow([item['status'], item['count'], f"{item['percentage']}%"])
                
        elif report_type == 'technician-performance':
            writer.writerow(['Technician', 'Completed Tasks', 'Efficiency %', 'Total Revenue', 'Avg Completion Hours'])
            for item in report_data.get('technician_performance', []):
                writer.writerow([
                    item['technician_name'], item['completed_tasks'], item['efficiency'],
                    item['total_revenue'], item['avg_completion_hours']
                ])
        
        return response
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant])
def get_dashboard_data(request):
    """Get data for dashboard widgets (KPI cards, charts)"""
    try:
        # KPI Data
        total_active_tasks = Task.objects.exclude(
            status__in=['Completed', 'Picked Up', 'Terminated']
        ).count()
        
        revenue_this_month = Payment.objects.filter(
            date__month=timezone.now().month,
            date__year=timezone.now().year
        ).aggregate(total=Sum('amount'))['total'] or 0
        
        tasks_ready_for_pickup = Task.objects.filter(status='Ready for Pickup').count()
        
        # Average repair time (simplified)
        completed_tasks = Task.objects.filter(
            status='Completed',
            date_in__isnull=False,
            date_out__isnull=False
        )
        avg_repair_time = "3.2 days"  # This would be calculated
        
        kpi_data = {
            'totalActiveTasks': total_active_tasks,
            'revenueThisMonth': float(revenue_this_month),
            'tasksReadyForPickup': tasks_ready_for_pickup,
            'averageRepairTime': avg_repair_time
        }
        
        # Technician workload for chart
        workload_data = PredefinedReportGenerator.generate_technician_workload_report()
        
        # Task status for pie chart
        status_data = PredefinedReportGenerator.generate_task_status_report()
        
        return Response({
            'kpiData': kpi_data,
            'technicianWorkload': workload_data.get('workload_data', []),
            'taskStatuses': status_data.get('status_distribution', [])
        })
        
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
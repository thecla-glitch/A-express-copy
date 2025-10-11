from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import (
    Payment, PaymentCategory, PaymentMethod, Account, CostBreakdown, ExpenditureRequest
)
from .serializers import (
    PaymentSerializer, 
    PaymentCategorySerializer, 
    PaymentMethodSerializer, 
    AccountSerializer, 
    CostBreakdownSerializer,
    ExpenditureRequestSerializer
)
from Eapp.models import Task
from users.permissions import IsManager, IsAdminOrManagerOrFrontDeskOrAccountant, IsAdminOrManagerOrAccountant


class AccountViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows accounts to be viewed or edited by managers.
    """
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [IsManager]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.filter(is_user_selectable=True)
    serializer_class = PaymentMethodSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()

class PaymentCategoryViewSet(viewsets.ModelViewSet):
    queryset = PaymentCategory.objects.all()
    serializer_class = PaymentCategorySerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrAccountant]


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows payments to be viewed.
    """
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]

    def get_queryset(self):
        queryset = Payment.objects.all()
        task_payments = self.request.query_params.get('task_payments')
        is_refunded = self.request.query_params.get('is_refunded')

        if task_payments:
            queryset = queryset.filter(task__isnull=False)
        
        if is_refunded:
            queryset = queryset.filter(amount__lt=0)

        return queryset


class CostBreakdownViewSet(viewsets.ModelViewSet):
    queryset = CostBreakdown.objects.all()
    serializer_class = CostBreakdownSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = CostBreakdown.objects.all()
        task_id = self.kwargs.get('task_id')
        if task_id:
            queryset = queryset.filter(task__title=task_id)
        return queryset

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            self.permission_classes = [IsManager]
        elif self.action == 'create':
            self.permission_classes = [IsAdminOrManagerOrFrontDeskOrAccountant]
        else:
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    def create(self, request, *args, **kwargs):
        task_id = kwargs.get('task_id')
        task = get_object_or_404(Task, title=task_id)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user.role == 'Accountant':
            serializer.save(task=task, requested_by=request.user, status=CostBreakdown.RefundStatus.PENDING, payment_method=serializer.validated_data.get('payment_method'))
        elif request.user.role == 'Manager':
            cost_breakdown = serializer.save(task=task, requested_by=request.user, status=CostBreakdown.RefundStatus.APPROVED, approved_by=request.user)
            if cost_breakdown.cost_type == 'Subtractive':
                tech_support_category, _ = PaymentCategory.objects.get_or_create(name='Tech Support')
                Payment.objects.create(
                    task=task,
                    amount=-cost_breakdown.amount,
                    method=cost_breakdown.payment_method,
                    description=cost_breakdown.description,
                    category=tech_support_category
                )
                TaskActivity.objects.create(
                    task=task,
                    user=request.user,
                    type=TaskActivity.ActivityType.NOTE,
                    message=f"Refund of {cost_breakdown.amount} issued. Reason: {cost_breakdown.reason}"
                )
        else:
            return Response({"error": "You do not have permission to create a refund request."}, status=status.HTTP_403_FORBIDDEN)

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        cost_breakdown = self.get_object()
        cost_breakdown.status = CostBreakdown.RefundStatus.APPROVED
        cost_breakdown.approved_by = request.user
        cost_breakdown.save()

        if cost_breakdown.cost_type == 'Subtractive':
            payment_method = cost_breakdown.payment_method
            if not payment_method:
                payment_method, _ = PaymentMethod.objects.get_or_create(name='Refund')
            
            tech_support_category, _ = PaymentCategory.objects.get_or_create(name='Tech Support')
            Payment.objects.create(
                task=cost_breakdown.task,
                amount=-cost_breakdown.amount,
                method=payment_method,
                description=cost_breakdown.description,
                category=tech_support_category
            )
            TaskActivity.objects.create(
                task=cost_breakdown.task,
                user=request.user,
                type=TaskActivity.ActivityType.NOTE,
                message=f"Refund of {cost_breakdown.amount} approved. Reason: {cost_breakdown.reason}"
            )

        return Response(self.get_serializer(cost_breakdown).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        cost_breakdown = self.get_object()
        cost_breakdown.status = CostBreakdown.RefundStatus.REJECTED
        cost_breakdown.save()
        return Response(self.get_serializer(cost_breakdown).data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdminOrManagerOrAccountant])
    def pending_refunds(self, request):
        pending_refunds = CostBreakdown.objects.filter(status=CostBreakdown.RefundStatus.PENDING)
        serializer = self.get_serializer(pending_refunds, many=True)
        return Response(serializer.data)

class ExpenditureRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenditureRequestSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrAccountant]

    def get_queryset(self):
        user = self.request.user
        queryset = ExpenditureRequest.objects.all()

        if not user.is_staff and not user.role in ['Manager', 'Admin']:
            queryset = queryset.filter(requester=user)
            
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        return queryset

    def get_permissions(self):
        if self.action in ['approve', 'reject']:
            self.permission_classes = [IsManager]
        else:
            self.permission_classes = [IsAdminOrManagerOrAccountant]
        return super().get_permissions()

    def perform_create(self, serializer):
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        expenditure = self.get_object()
        if expenditure.status != 'Pending':
            return Response({'error': 'This request has already been processed.'}, status=status.HTTP_400_BAD_REQUEST)

        expenditure.status = ExpenditureRequest.Status.APPROVED
        expenditure.approver = request.user
        expenditure.save()

        # Create a corresponding payment record
        Payment.objects.create(
            task=expenditure.task,
            amount=-expenditure.amount,  # Expenditures are negative amounts
            method=expenditure.payment_method,
            description=f"Expenditure: {expenditure.description}",
            category=expenditure.category
        )

        # If linked to a task, create a cost breakdown item
        if expenditure.task:
            CostBreakdown.objects.create(
                task=expenditure.task,
                description=f"Expenditure: {expenditure.description}",
                amount=expenditure.amount,
                cost_type=expenditure.cost_type,
                category=expenditure.category.name,
                status=CostBreakdown.RefundStatus.APPROVED, # Assuming approved status for breakdown
                requested_by=expenditure.requester,
                approved_by=request.user,
                payment_method=expenditure.payment_method
            )

        serializer = self.get_serializer(expenditure)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        expenditure = self.get_object()
        if expenditure.status != 'Pending':
            return Response({'error': 'This request has already been processed.'}, status=status.HTTP_400_BAD_REQUEST)

        expenditure.status = ExpenditureRequest.Status.REJECTED
        expenditure.approver = request.user
        expenditure.save()

        serializer = self.get_serializer(expenditure)
        return Response(serializer.data)
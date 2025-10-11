from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Payment, PaymentCategory, PaymentMethod, Account, CostBreakdown
from .serializers import (
    PaymentSerializer, 
    PaymentCategorySerializer, 
    PaymentMethodSerializer, 
    AccountSerializer, 
    CostBreakdownSerializer
)
from users.permissions import IsManager, IsAdminOrManagerOrFrontDeskOrAccountant
from Eapp.models import Task, TaskActivity

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
    permission_classes = [permissions.IsAuthenticated, IsManager]


class PaymentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows payments to be viewed.
    """
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrManagerOrFrontDeskOrAccountant]


class CostBreakdownViewSet(viewsets.ModelViewSet):
    queryset = CostBreakdown.objects.all()
    serializer_class = CostBreakdownSerializer
    permission_classes = [permissions.IsAuthenticated]

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
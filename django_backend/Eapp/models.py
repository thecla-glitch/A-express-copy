from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.core.exceptions import PermissionDenied
from django.utils.translation import gettext_lazy as _
import os
from uuid import uuid4
from decimal import Decimal
from datetime import datetime

def get_current_date():
    return timezone.now().date()

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'Manager')
        
        return self.create_user(username, email, password, **extra_fields)
    
def user_profile_picture_path(instance, filename):
    """Generate file path for user profile pictures"""
    ext = filename.split('.')[-1]
    filename = f"{uuid4().hex}.{ext}"
    return os.path.join('profile_pictures', str(instance.id), filename)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        MANAGER = 'Manager', _('Manager')
        FRONT_DESK = 'Front Desk', _('Front Desk')
        TECHNICIAN = 'Technician', _('Technician')
        ACCOUNTANT = 'Accountant', _('Accountant')
    
    profile_picture = models.ImageField(
        upload_to=user_profile_picture_path,
        blank=True,
        null=True,
        verbose_name=_('Profile Picture'),
        default='profile_pictures/default.png'
    )
    username = models.CharField(max_length=50, unique=True, verbose_name=_('Username'))
    email = models.EmailField(max_length=100, unique=True, verbose_name=_('Email'))
    first_name = models.CharField(max_length=50, verbose_name=_('First Name'))
    last_name = models.CharField(max_length=50, verbose_name=_('Last Name'))
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name=_('Phone'))
    role = models.CharField(max_length=20, choices=Role.choices, verbose_name=_('Role'))
    is_workshop = models.BooleanField(default=False, verbose_name=_('Workshop'))
    is_active = models.BooleanField(default=True, verbose_name=_('Active'))
    created_at = models.DateTimeField(default=timezone.now, verbose_name=_('Created At'))
    last_login = models.DateTimeField(null=True, blank=True, verbose_name=_('Last Login'))
    
    is_staff = models.BooleanField(default=False, verbose_name=_('Staff Status'))
    
    objects = CustomUserManager()
    
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'first_name', 'last_name', 'role']
    
    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['id']  # Changed from 'user_id' to 'id'
    
    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        return self.first_name
    
    def get_profile_picture_url(self):
        """Return the URL for the user's profile picture or a default"""
        if self.profile_picture and hasattr(self.profile_picture, 'url'):
            return self.profile_picture.url
        return '/media/profile_pictures/default.png'
    
    def save(self, *args, **kwargs):
        # Update last_login if password is being set (during login)
        if 'update_fields' in kwargs and 'last_login' in kwargs['update_fields']:
            self.last_login = timezone.now()
        
        # Delete old profile picture when updating to a new one
        if self.pk:
            try:
                old_instance = User.objects.get(pk=self.pk)
                if old_instance.profile_picture and old_instance.profile_picture != self.profile_picture:
                    old_instance.profile_picture.delete(save=False)
            except User.DoesNotExist:
                pass
        
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Delete the profile picture when user is deleted"""
        if self.profile_picture:
            self.profile_picture.delete(save=False)
        super().delete(*args, **kwargs)
    
    def has_add_user_permission(self):
        """Check if user has permission to add other users"""
        return self.is_superuser or self.role == 'Manager'
    

class Brand(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Customer(models.Model):
    class CustomerType(models.TextChoices):
        NORMAL = 'Normal', _('Normal')
        REPAIRMAN = 'Repairman', _('Repairman')

    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True, blank=True, null=True)
    phone = models.CharField(max_length=20, unique=True, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    customer_type = models.CharField(
        max_length=20,
        choices=CustomerType.choices,
        default=CustomerType.NORMAL,
        verbose_name=_('Customer Type')
    )

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Referrer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Task(models.Model):
    class Status(models.TextChoices):
        PENDING = 'Pending', _('Pending')
        IN_PROGRESS = 'In Progress', _('In Progress')
        AWAITING_PARTS = 'Awaiting Parts', _('Awaiting Parts')
        COMPLETED = 'Completed', _('Completed')
        READY_FOR_PICKUP = 'Ready for Pickup', _('Ready for Pickup')
        PICKED_UP = 'Picked Up', _('Picked Up')
        TERMINATED = 'Terminated', _('Terminated')

    class Urgency(models.TextChoices):
        YUPO = 'Yupo', _('Yupo')
        KATOKA_KIDOGO = 'Katoka kidogo', _('Katoka kidogo')
        KAACHA = 'Kaacha', _('Kaacha')
        EXPEDITED = 'Expedited', _('Expedited')
        INA_HARAKA = 'Ina Haraka', _('Ina Haraka')

    class PaymentStatus(models.TextChoices):
        UNPAID = 'Unpaid', _('Unpaid')
        PARTIALLY_PAID = 'Partially Paid', _('Partially Paid')
        FULLY_PAID = 'Fully Paid', _('Fully Paid')
        REFUNDED = 'Refunded', _('Refunded')

    class DeviceType(models.TextChoices):
        FULL = 'Full', _('Full')
        NOT_FULL = 'Not Full', _('Not Full')
        MOTHERBOARD_ONLY = 'Motherboard Only', _('Motherboard Only')

    class WorkshopStatus(models.TextChoices):
        IN_WORKSHOP = 'In Workshop', _('In Workshop')
        SOLVED = 'Solved', _('Solved')
        NOT_SOLVED = 'Not Solved', _('Not Solved')

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING
    )

    assigned_to = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    due_date = models.DateField(null=True, blank=True)

    # New fields
    customer = models.ForeignKey('Customer', on_delete=models.CASCADE, related_name='tasks')
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True)
    device_type = models.CharField(max_length=20, choices=DeviceType.choices, default=DeviceType.FULL)
    device_notes = models.TextField(blank=True)
    laptop_model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, blank=True, default='Not Available')
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.UNPAID
    )
    current_location = models.CharField(max_length=100)
    urgency = models.CharField(max_length=20, choices=Urgency.choices, default=Urgency.YUPO)
    date_in = models.DateField(default=get_current_date)
    approved_at = models.DateTimeField(null=True, blank=True)
    approved_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_tasks'
    )
    paid_date = models.DateField(null=True, blank=True)
    next_payment_date = models.DateField(null=True, blank=True)
    date_out = models.DateTimeField(null=True, blank=True)
    sent_out_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_out_tasks'
    )
    negotiated_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='negotiated_tasks'
    )
    is_debt = models.BooleanField(default=False)
    is_referred = models.BooleanField(default=False)
    referred_by = models.ForeignKey(
        'Referrer', on_delete=models.SET_NULL, null=True, blank=True, related_name='referred_tasks'
    )

    # Workshop fields
    workshop_status = models.CharField(
        max_length=20,
        choices=WorkshopStatus.choices,
        null=True,
        blank=True
    )
    workshop_location = models.ForeignKey(
        'Location', on_delete=models.SET_NULL, null=True, blank=True, related_name='workshop_tasks'
    )
    workshop_technician = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='workshop_assigned_tasks'
    )
    original_technician = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='sent_to_workshop_tasks'
    )
    workshop_sent_at = models.DateTimeField(null=True, blank=True)
    workshop_returned_at = models.DateTimeField(null=True, blank=True)
    original_location = models.CharField(max_length=100, blank=True, null=True)
    qc_notes = models.TextField(blank=True, null=True)
    qc_rejected_at = models.DateTimeField(null=True, blank=True)
    qc_rejected_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='rejected_tasks'
    )

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if self.pk:
            original = Task.objects.get(pk=self.pk)
            if original.status == self.Status.IN_PROGRESS and self.assigned_to != original.assigned_to:
                raise PermissionDenied("Cannot change the assigned technician for a task that is in progress.")
        super().save(*args, **kwargs)

    def calculate_total_cost(self):
        estimated_cost = self.estimated_cost or Decimal('0.00')
        additive_costs = sum(item.amount for item in self.cost_breakdowns.filter(cost_type='Additive'))
        subtractive_costs = sum(item.amount for item in self.cost_breakdowns.filter(cost_type='Subtractive'))
        return estimated_cost + additive_costs - subtractive_costs

    @property
    def outstanding_balance(self):
        total_cost = self.calculate_total_cost()
        if not total_cost:
            return Decimal('0.00')
        paid = sum(p.amount for p in self.payments.all()) or Decimal('0.00')
        return total_cost - paid

    def update_payment_status(self):
        paid = sum(p.amount for p in self.payments.all()) or Decimal('0.00')
        total = self.calculate_total_cost() or Decimal('0.00')
        if paid == 0:
            self.payment_status = self.PaymentStatus.UNPAID
        elif paid < total:
            self.payment_status = self.PaymentStatus.PARTIALLY_PAID
        elif paid == total:
            self.payment_status = self.PaymentStatus.FULLY_PAID
            if not self.paid_date:
                self.paid_date = timezone.now().date()
        else:
            self.payment_status = self.PaymentStatus.REFUNDED
        self.save(update_fields=['payment_status', 'paid_date'])


class TaskActivity(models.Model):
    class ActivityType(models.TextChoices):
        STATUS_UPDATE = 'status_update', _('Status Update')
        NOTE = 'note', _('Note')
        DIAGNOSIS = 'diagnosis', _('Diagnosis')
        CUSTOMER_CONTACT = 'customer_contact', _('Customer Contact')
        INTAKE = 'intake', _('Intake')
        WORKSHOP = 'workshop', _('Workshop')
        REJECTED = 'rejected', _('Rejected')
        RETURNED = 'returned', _('Returned')
        PICKED_UP = 'picked_up', _('Picked Up')
        DEVICE_NOTE = 'device_note', _('Device Note')

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='activities')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=20, choices=ActivityType.choices)
    message = models.TextField()

    def __str__(self):
        return f'{self.get_type_display()} for {self.task.title} at {self.timestamp}'

    class Meta:
        ordering = ['-timestamp']


class PaymentMethod(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_user_selectable = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']


class Payment(models.Model):

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(default=get_current_date)
    method = models.ForeignKey(PaymentMethod, on_delete=models.PROTECT)
    description = models.CharField(max_length=255, default='Customer Payment', blank=True)

    def __str__(self):
        return f'Payment of {self.amount} for {self.task.title} on {self.date}'

    class Meta:
        ordering = ['-date']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.task.update_payment_status()

class Location(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_workshop = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']

class CostBreakdown(models.Model):
    class CostType(models.TextChoices):
        ADDITIVE = 'Additive', _('Additive')
        SUBTRACTIVE = 'Subtractive', _('Subtractive')
        INCLUSIVE = 'Inclusive', _('Inclusive')

    class RefundStatus(models.TextChoices):
        PENDING = 'Pending', _('Pending')
        APPROVED = 'Approved', _('Approved')
        REJECTED = 'Rejected', _('Rejected')

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='cost_breakdowns')
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    cost_type = models.CharField(max_length=20, choices=CostType.choices, default=CostType.INCLUSIVE)
    category = models.CharField(max_length=100, default='Inclusive')
    created_at = models.DateTimeField(auto_now_add=True)
    reason = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=RefundStatus.choices, default=RefundStatus.APPROVED)
    requested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='requested_refunds')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_refunds')
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f'{self.get_cost_type_display()} cost of {self.amount} for {self.task.title}'

    class Meta:
        ordering = ['created_at']


class Account(models.Model):
    name = models.CharField(max_length=100, unique=True)
    balance = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
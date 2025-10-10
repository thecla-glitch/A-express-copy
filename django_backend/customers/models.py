from django.db import models
from django.utils.translation import gettext_lazy as _

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
        db_table = 'Eapp_customer'


class Referrer(models.Model):
    name = models.CharField(max_length=100, unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        db_table = 'Eapp_referrer'
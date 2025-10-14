from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task
from financials.models import Account, PaymentMethod



@receiver(post_save, sender=Account)
def create_payment_method_for_account(sender, instance, created, **kwargs):
    if created:
        PaymentMethod.objects.get_or_create(name=instance.name)

@receiver(post_delete, sender=Account)
def delete_payment_method_for_account(sender, instance, **kwargs):
    PaymentMethod.objects.filter(name=instance.name).delete()

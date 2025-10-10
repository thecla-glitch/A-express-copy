from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task, Account, PaymentMethod
from customers.models import Customer

@receiver(post_save, sender=Task)
def create_customer_from_task(sender, instance, created, **kwargs):
    if created:
        customer_name = instance.customer.name
        customer_email = instance.customer.email
        customer_phone = instance.customer.phone

        if not Customer.objects.filter(name=customer_name, email=customer_email, phone=customer_phone).exists():
            Customer.objects.create(name=customer_name, email=customer_email, phone=customer_phone)

@receiver(post_save, sender=Account)
def create_payment_method_for_account(sender, instance, created, **kwargs):
    if created:
        PaymentMethod.objects.get_or_create(name=instance.name)

@receiver(post_delete, sender=Account)
def delete_payment_method_for_account(sender, instance, **kwargs):
    PaymentMethod.objects.filter(name=instance.name).delete()

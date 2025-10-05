from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Task, Customer

@receiver(post_save, sender=Task)
def create_customer_from_task(sender, instance, created, **kwargs):
    if created:
        customer_name = instance.customer.name
        customer_email = instance.customer.email
        customer_phone = instance.customer.phone

        if not Customer.objects.filter(name=customer_name, email=customer_email, phone=customer_phone).exists():
            Customer.objects.create(name=customer_name, email=customer_email, phone=customer_phone)
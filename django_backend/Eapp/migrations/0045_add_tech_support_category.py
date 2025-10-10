
from django.db import migrations

def create_tech_support_category(apps, schema_editor):
    PaymentCategory = apps.get_model('Eapp', 'PaymentCategory')
    PaymentCategory.objects.create(name='Tech Support')

class Migration(migrations.Migration):

    dependencies = [
        ('Eapp', '0044_paymentcategory_payment_category'),
    ]

    operations = [
        migrations.RunPython(create_tech_support_category),
    ]

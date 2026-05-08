from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User
from .tasks import send_customer_welcome_email

@receiver(post_save, sender=User)
def customer_active_signal(sender, instance, created, **kwargs):
    if instance.is_active and instance.role == User.Role.CUSTOMER:
        
        send_customer_welcome_email.delay(instance.email, instance.name)
        print(f"Signal: Welcome email queued for Customer: {instance.email}")
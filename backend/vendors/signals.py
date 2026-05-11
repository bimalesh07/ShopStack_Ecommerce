from django.db.models.signals import post_save
from django.dispatch import receiver
from users.models import User
from .models import Vendor
from .tasks import send_verified_welcome_email

@receiver(post_save, sender=User)
def vendor_approval_handler(sender, instance, created, **kwargs):
    if instance.role == User.Role.VENDOR and instance.is_active:
        
        # Checck the vendor already exists
        # if not exits then crate
        vendor_exists = Vendor.objects.filter(user=instance).exists()
        
        if not vendor_exists:
            # Vendor profile (user=instance set )
            Vendor.objects.create(user=instance)
            
            # Celery task: 
            send_verified_welcome_email.delay(instance.email, instance.name)
            print(f"Signal: Vendor profile created and approval mail sent to: {instance.email}")
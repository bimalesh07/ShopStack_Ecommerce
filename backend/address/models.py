import uuid
from django.db import models
from users.models import User

class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="address")
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    country = models.CharField(max_length=100, default="india")
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default","-created_at"]
        verbose_name_plural = "Addresses"

    def __str__(self):
        return f"{self.user.email} - {self.city}, {self.state}"
    
    def save(self, *args, **kwargs):
        if self.is_default:
            Address.objects.filter(
                user = self.user,
                is_default =True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)
            
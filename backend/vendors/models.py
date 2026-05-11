from django.db import models
import uuid
from django.contrib.auth import get_user_model

User = get_user_model()

class Vendor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="vendor")
    shop_name = models.CharField(max_length=25, unique=True)
    shop_descriptions = models.TextField(blank=True, null=True)
    shop_logo = models.ImageField(upload_to="vendor/logo/", blank=True, null=True)
    is_approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering =["-created_at"]
    
    def __str__(self):
        return self.shop_name
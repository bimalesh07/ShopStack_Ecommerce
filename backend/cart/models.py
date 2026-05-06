from django.db import models
import uuid
from users .models import User
from products .models import Product

class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        User, on_delete=models.CASCADE,
        related_name="cart"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} =cart"
    
    @property
    def total_amount(self):
        return sum( item.total_price for item in self.items.all())
    
    @property 
    def total_items(self):
        return self.items.count()


class CartItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering =["-created_at"]
        unique_together =("cart","product")
    
    def __str__(self):
        return f"{self.cart.user.email} - {self.product.name} x {self.quantity}"
    
    @property
    def total_price(self):
        return self.product.price * self.quantity
    


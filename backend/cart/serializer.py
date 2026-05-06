from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Cart, CartItem


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)
    total_price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )

    class Meta:
        model = CartItem
        fields = (
            "id",
            "product",
            "product_id",
            "quantity",
            "total_price",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
    
    def validate_product_id(self, value):
        from products.models import Product
        try:
            product = Product.objects.get(pk=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")
        
        return value
    
    def validate_quantity(self, value):
        if value <1:
            raise serializers.ValidationError("Quantity must be at least 1")
        return value
    

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True
    )
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Cart
        fields = (
            "id",
            "total_items",
            "total_amount",
            "items",
            "created_at",
        )
        read_only_fields = ("id", "created_at")






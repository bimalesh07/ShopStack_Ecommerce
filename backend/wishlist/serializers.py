from rest_framework import serializers
from products.serializers import ProductSerializer
from .models import Wishlist, WishlistItem


class wishlistItemSerailizer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only = True)

    class Meta:
        model = WishlistItem
        fields = ("id", "product", "product_id", "added_at")
        read_only_fields = ("id", "added_at")

    def validate(self, attrs):
        from products.models import Product

        try:
            Product.objects.get(pk=attrs.get("product_id"), is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found")
        return attrs

class WishlistSerializer(serializers.ModelSerializer):
    items =wishlistItemSerailizer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()

    class Meta:
        model = Wishlist
        fields = ("id","total_items","items","created_at")
        read_only_fields = ("id","created_at")
    
    def get_total_items(self, obj):
        return obj.items.count()
    

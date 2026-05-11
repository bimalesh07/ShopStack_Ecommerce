from rest_framework import serializers
from .models import Vendor

class VendorSerializers(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)


    class Meta:
        model = Vendor
        fields = ("id", "email", "name", "shop_name", "shop_descriptions", "shop_logo", "is_approved", "created_at")

        read_only_fields = ("id", "created_at", "is_approved")

class VendorUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vendor
        fields = ("shop_name", "shop_descriptions", "shop_logo")
        



from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):
  class Meta:
        model = Address
        fields = (
            "id",
            "full_name",
            "phone",
            "street",
            "city",
            "state",
            "pincode",
            "country",
            "is_default",
            "created_at",
        )
        read_only_fields = ("id", "created_at")
        
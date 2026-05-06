from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from django.contrib.auth import get_user_model
User = get_user_model()

class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "full_name", "phone", "password","password2")
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
             raise serializers.ValidationError("This Email is Already Register")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password is too short. Must be at least 8 characters.")
        
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one capital letter.")
        
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one numeric digit.")
        
        return value
    
    def validate(self, attrs):
        if attrs["password"]!= attrs["password2"]:
            raise serializers.ValidationError({"message":"Password do not match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop("password2")
        validated_data["role"] = User.Role.CUSTOMER
        return User.objects.create_user(**validated_data)
    
    
"""

        email = validated_data.get('email')
        password = validated_data.get('password')
        full_name = validated_data.get('full_name')
        phone = validated_data.get('phone')

        validated_data.pop('password2', None)
        user = User.objects.create_users(
            email = email,
            password = password,
            full_name = full_name,
            phone = phone,
            role= User.Role.CUSTOMER

        )
        return user"""
    
class VendorRegisterSeralizer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    invite_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password is too short. Must be at least 8 characters.")
        
        if not any(char.isupper() for char in value):
            raise serializers.ValidationError("Password must contain at least one capital letter.")
        
        if not any(char.isdigit() for char in value):
            raise serializers.ValidationError("Password must contain at least one numeric digit.")
        
        return value

    class Meta:
        model = User
        fields = ("email","full_name","phone","password","password2","invite_code", "shop_name", "shop_descriptions")

    shop_name = serializers.CharField(write_only=True)
    shop_descriptions = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    def validate(self, attrs):
        password = attrs.get("password")
        password2 = attrs.get("password2")
        invite_code = attrs.get("invite_code")

        if password != password2:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        
        # Validate invite code only if it's provided and not empty
        if invite_code:
            valid_codes = [settings.ADMIN_INVITE_CODE, "vendorSecret@123"]
            if invite_code.strip() not in valid_codes:
                raise serializers.ValidationError({"invite_code": "Invalid invite code. Try 'vendorSecret@123' for testing."})
        
        return attrs
    
    def create(self, validated_data):
        password2 = validated_data.pop("password2", None)
        invite_code = validated_data.pop("invite_code", None)
        shop_name = validated_data.pop("shop_name")
        shop_descriptions = validated_data.pop("shop_descriptions", "")
        
        validated_data["role"] = User.Role.VENDOR
        validated_data["is_active"] = False
        user = User.objects.create_user(**validated_data)
        
        from vendors.models import Vendor
        Vendor.objects.create(
            user=user,
            shop_name=shop_name,
            shop_descriptions=shop_descriptions
        )
        return user
    

class LoginSerializers(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    def validate(self, attrs):
        from django.contrib.auth import authenticate
        user = authenticate(
            email = attrs['email'],
            password = attrs['password']
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError(
                "Account is not active.Please wait for approval"
            )
        
        attrs["user"] = user
        return attrs
    
class UserSerializer(serializers.ModelSerializer):
    vendor_details = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ("id", "email", "full_name", "phone", "role", "created_at", "vendor_details")
        read_only_fields = ("id", "email", "role", "created_at")

    def get_vendor_details(self, obj):
        if obj.role == User.Role.VENDOR:
            from vendors.models import Vendor
            from vendors.serializers import VendorSerializers
            try:
                vendor = obj.vendor
                return VendorSerializers(vendor).data
            except Exception:
                return None
        return None

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"]!= attrs["new_password2"]:
            raise serializers.ValidationError({"new_password":"Password do not match"})
        return attrs

    
        


        
    
         
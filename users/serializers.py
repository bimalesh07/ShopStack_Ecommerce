from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from decouple import config
from django.contrib.auth import get_user_model
User = get_user_model()

class CustomerRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email", "full_name", "phone", "password","password2")
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
             raise serializers.ValidationError("This Email is Already Register")
        return value
    
    def validated_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password to Short")
        
        if not any(char.isupper() for char in value):
         raise serializers.ValidationError("Password must contain at least one capital letter.")
        
        if not any(char.isdigit() for char in value):
         raise serializers.ValidationError("Password must contain at least one numeric digit.")
    
    def validate(self, attrs):
        if attrs["password"]!= attrs["password2"]:
            raise serializers.ValidationError({"Message":"Password do not match"})
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
    password = serializers.CharField(write_only = True, min_length=True)
    password2 = serializers.CharField(write_only =True)
    invite_code = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("email","full_name","phone","password","password2","invite_code")
    
    def validate(self, attrs):
        if attrs["password"]!=attrs["password2"]:
            raise serializers.ValidationError({"message":"Password do not match"})
        if attrs["invite_code"]!=config("ADMIN_INVITE_CODE"):
            raise serializers.ValidationError({"invite_code":" invalid invite_code."})
    
    def create(self, validated_data):
        validated_data.pop("password2")
        validated_data.pop("invite_code")
        validated_data["role"] = User.Role.VENDOR
        validated_data["is_active"] = False
        return User.objects.create_user(**validated_data)
    

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
    class Meta:
        model =User
        fields =("id","email","full_name","phone","role","created_at")
        read_only_fields =("id","email","role","crated_at")

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password2 = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"]!= attrs["new_password2"]:
            raise serializers.ValidationError({"new_password":"Password do not match"})
        return attrs

    
        


        
    
         
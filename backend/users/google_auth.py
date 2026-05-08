from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from vendors.models import Vendor

User = get_user_model()

def verify_google_token(token):
    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        return idinfo
    except ValueError:
        raise serializers.ValidationError("Invalid Google Token")

def get_or_create_google_user(idinfo, role='customer'):
    email = idinfo.get('email')
    first_name = idinfo.get('given_name', '')
    last_name = idinfo.get('family_name', '')
    name = idinfo.get('name', f"{first_name} {last_name}".strip())


    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'name': name,
            'role': role,

            'is_active': True
        }
    )

    if not created:
        
        user.name = name
        user.is_active = True
        user.save()
    else:
       
        user.set_unusable_password()
        user.save()

        if role == 'vendor':
            Vendor.objects.get_or_create(
                user=user,
                defaults={
                    'shop_name': f"{first_name}'s Shop" if first_name else "My Shop",
                    'shop_descriptions': "Welcome to my shop!"
                }
            )
    
    return user

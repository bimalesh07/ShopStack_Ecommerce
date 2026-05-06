from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers
from vendors.models import Vendor

User = get_user_model()

def verify_google_token(token):
    try:
        # Specify the CLIENT_ID of the app that accesses the backend:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)

        # ID token is valid. Get the user's Google Account ID from the decoded token.
        # userid = idinfo['sub']
        return idinfo
    except ValueError:
        # Invalid token
        raise serializers.ValidationError("Invalid Google Token")

def get_or_create_google_user(idinfo, role='customer'):
    email = idinfo.get('email')
    first_name = idinfo.get('given_name', '')
    last_name = idinfo.get('family_name', '')
    full_name = idinfo.get('name', f"{first_name} {last_name}".strip())
    # picture = idinfo.get('picture')

    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            'full_name': full_name,
            'role': role,
            'is_active': True if role == 'customer' else False # Vendors need approval
        }
    )

    if created:
        # Set a random password since they are logging in via Google
        user.set_unusable_password()
        user.save()

        # Create Profile/Vendor if needed
        if role == 'vendor':
            Vendor.objects.get_or_create(
                user=user,
                defaults={
                    'shop_name': f"{first_name}'s Shop" if first_name else "My Shop",
                    'shop_descriptions': "Welcome to my shop!"
                }
            )
    
    return user

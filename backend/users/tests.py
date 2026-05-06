from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.test import override_settings
User = get_user_model()

class UserTests(APITestCase):
    #Customers test
    def test_customer_registration_success(self):
        url = reverse('customer-register')
        data = {
            "email": "customer@example.com",
            "password": "Password123!",
            "password2": "Password123!",
            "full_name": "Test Customer",
            "phone": "9876543210",
        }
        response = self.client.post(url, data)
        
        # Expecting Success
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, "customer@example.com")

    def test_customer_registration_password_mismatch(self):
        url = reverse('customer-register')
        data = {
            "email": "wrongpass@example.com",
            "password": "Password123!",
            "password2": "DifferentPass123!", # Passwords don't match
            "full_name": "Test User",
            "phone": "9876543210",
        }
        response = self.client.post(url, data)
        
        # Expecting Failure
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data) 

#Vendor Test
    @override_settings(ADMIN_INVITE_CODE='PRO_VENDOR_2026')
    def test_vendor_registration_success(self):
        """Check ki vendor sahi invite code ke saath register ho raha hai"""
        url = reverse('vendor-register')
        data = {
            "email": "vendor@example.com",
            "full_name": "Vendor Shop",
            "phone": "1234567890",
            "password": "VendorPassword123!",
            "password2": "VendorPassword123!",
            "invite_code": "PRO_VENDOR_2026" }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    @override_settings(ADMIN_INVITE_CODE='PRO_VENDOR_2026')
    def test_vendor_registration_fails_wrong_invite(self):
        url = reverse('vendor-register')
        data = {
            "email": "badvendor@example.com",
            "full_name": "Bad Vendor",
            "phone": "1234567890",
            "password": "VendorPassword123!",
            "password2": "VendorPassword123!",
            "invite_code": "WRONG_CODE_123" # Incorrect code
        }
        response = self.client.post(url, data)
        
        # Expecting Failure
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('invite_code', response.data)

    def test_registration_fails_duplicate_email(self):
        """Check ki ek hi email se do baar registration nahi ho sakta"""
        # Pehle ek user banate hain
        User.objects.create_user(
            email="duplicate@example.com", 
            password="Password123!", 
            full_name="User One",
            phone="12345"
        )
        
        url = reverse('customer-register')
        data = {
            "email": "duplicate@example.com", # Same email
            "password": "Password123!",
            "password2": "Password123!",
            "full_name": "User Two",
            "phone": "67890",
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
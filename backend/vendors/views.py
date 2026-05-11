from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import isVendor
from .models import Vendor
from .serializers import VendorSerializers, VendorUpdateSerializer
from rest_framework.views import APIView

class VenderProfileView(APIView):
    permission_classes = [IsAuthenticated, isVendor]

    def get(self, request):
        try:
            vendor = Vendor.objects.get(user=request.user)
        except Vendor.DoesNotExist:
            return Response({
                "error":"Vendor profile not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VendorSerializers(vendor, context={'request': request})

        return Response(serializer.data)
    
    def patch(self, request):
        try:
            vendor= Vendor.objects.get(user=request.user)
        except Vendor.DoesNotExist:
            return Response({
                "error":"Vendor profile is Not Found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = VendorUpdateSerializer(vendor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(VendorSerializers(vendor, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VendorCreateProfileView(APIView):
    permission_classes = (IsAuthenticated, isVendor)
    def post(self, request):
        if hasattr(request.user, "vendor"):
            return Response(
                {
                    "error":"Vendor profile already Exists",
                }, status=status.HTTP_400_BAD_REQUEST
            )
        serializer = VendorUpdateSerializer(data= request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                VendorSerializers(serializer.instance, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
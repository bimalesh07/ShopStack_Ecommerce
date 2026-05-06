from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCustomer
from .models import Address
from .serializers import AddressSerializer
from rest_framework.response import Response


class AddressListCreateView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get(self, request):
        address = Address.objects.filter(user=request.user)
        serializer = AddressSerializer(address, many=True)
        return Response(serializer.data)
    
    def post(self, request):
        serializer = AddressSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors , status=status.HTTP_400_BAD_REQUEST)
    
class AddressDetailView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get_object(self, pk, user):
        try:
            return Address.objects.get(pk=pk, user=user)
        except Address.DoesNotExist:
            return None
        
    def get(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({"error":"Address not found"},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = AddressSerializer(address)
        return Response(serializer.data)
    
    def patch(self, request, pk):
        address = self.get_object(pk, request.user)
        if not address:
            return Response({"error":"Address not found"},
                            status=status.HTTP_404_NOT_FOUND)
        serializer = AddressSerializer(address, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, pk):
        address = self.get_object(pk, request.user)

        if not address:
            return Response({"error":"Address not found"}, status=status.HTTP_404_NOT_FOUND)
        
        address.delete()
        return Response({"message":"Address deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


class SetDefaultAddressView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def post(self, request,pk):
        try:
            address = Address.objects.get(pk=pk, user=request.user)
        except Address.DoesNotExist:
            return Response({"error":"Adress not found"},
                            status=status.HTTP_404_NOT_FOUND)
        
        address.is_default = True
        address.save()
        return Response({"message": "Default address updated."})
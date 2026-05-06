from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCustomer
from products.models import Product
from .models import Wishlist,WishlistItem
from .serializers import WishlistSerializer, wishlistItemSerailizer
from rest_framework.views import APIView

class WishlistView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get_or_create_wishlist(self, user):
        wishlist, _= Wishlist.objects.get_or_create(user=user)
        return wishlist
    
    def get(self, request):
        wishlist = self.get_or_create_wishlist(request.user)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        wishlist = self.get_or_create_wishlist(request.user)
        product_id = request.data.get("product_id")

        try:
            product = Product.objects.get(pk=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {"error":"Product not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
            return Response({"message": "Product already in wishlist"}, status=status.HTTP_200_OK)
        
        WishlistItem.objects.create(wishlist=wishlist, product=product)
        serializer = WishlistSerializer(wishlist, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
class WishlistItemDeleteView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def delete(self, request, pk):
        try:
            item = WishlistItem.objects.get(pk=pk, wishlist__user=request.user)
        except WishlistItem.DoesNotExist:
            return Response(
                {"error":"Item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        item.delete()
        return Response()

class WishlistClearView(APIView):
    permission_classes =(IsAuthenticated, IsCustomer)

    def delete(self,request):
        try:
            wishlist = Wishlist.objects.get(user=request.user)
            wishlist.items.all().delete()
            return Response({
                "message":"Wishlist cleared"
            }, status=status.HTTP_204_NO_CONTENT)
        
        except Wishlist.DoesNotExist:
            return Response({"error":"Wishlist not found"},
                            status=status.HTTP_404_NOT_FOUND)
        

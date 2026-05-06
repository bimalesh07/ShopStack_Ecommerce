from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCustomer
from products.models import Product
from .models import Cart, CartItem
from .serializer import CartItemSerializer, CartSerializer
from rest_framework.views import APIView

class CartView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get_or_create_cart(self, user):
        cart, _ = Cart.objects.get_or_create(user=user)
        return cart
    
    def get(self, request):
        cart = self.get_or_create_cart(request.user)
        serializers = CartSerializer(cart, context={'request': request})
        return Response(serializers.data)
    
    def post(self, request):
        cart = self.get_or_create_cart(request.user)
        product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity",1))

        try:
            product = Product.objects.get(
                pk=product_id,
                is_active = True,
                vendor__is_approved = True
            )
        except Product.DoesNotExist:
            return Response({
                "error":"Product not found"
            }, status=status.HTTP_404_NOT_FOUND)
        
        if product.stock < quantity:
            return Response({"error": f"only {product.stock} itmes availabel in stock."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={"quantity": quantity}
        )
        if not created:
            new_quantity = cart_item.quantity + quantity
            if product.stock < new_quantity:
                return Response({
                    "error": f"Only {product.stock} items available in stock"
                }, status=status.HTTP_400_BAD_REQUEST)
            
            cart_item.quantity = new_quantity
            cart_item.save()
        
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK if not created else status.HTTP_201_CREATED)
    
    def delete(self, request):
        try:
            cart = Cart.objects.get(user=request.user)
            cart.items.all().delete()
            return Response(
                {"message": "Cart cleared successfully."},
                status=status.HTTP_204_NO_CONTENT
            )
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found."},
                status=status.HTTP_404_NOT_FOUND
            )

class CartItemUpdateView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)
    def patch(self, request, pk):
        try:
            cart_item = CartItem.objects.get(
                pk=pk,
                cart__user = request.user
            )
        except CartItem.DoesNotExist:
            return Response({"error":"Cart item not found"}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get("quantity")
        if not quantity:
            return Response(
                {"error":" Quantity is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        quantity = int(quantity)
        if quantity <1:
            return Response({"error":"Quantity must be at least 1"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        if cart_item.product.stock < quantity:
            return Response(
                {"error":f"Only {cart_item.product.stock} items available"},
                status=status.HTTP_400_BAD_REQUEST
            )
        cart_item.quantity = quantity
        cart_item.save()
        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request, pk):
        try:
            cart_item = CartItem.objects.get(
                pk=pk,
                cart__user = request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {"error":"Cart item not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        cart_item.delete()
        cart = Cart.objects.get(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)

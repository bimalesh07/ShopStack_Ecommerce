from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from users.permissions import IsCustomer, isVendor
from address.models import Address
from cart.models import Cart
from config.pagination import StandardPagination
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer
)
from django.db import transaction
from django.db.models import Prefetch
from django.conf import settings
from payments.utils import create_razorpay_order
from payments.models import Payment
import logging

logger = logging.getLogger(__name__)

class OrderListCreateView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get(self, request):
        orders = Order.objects.filter(
            user=request.user
        ).prefetch_related("items").select_related("address")

        paginator = StandardPagination()
        result = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(result, many=True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        serializer = OrderCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                # cart check
                try:
                    cart = Cart.objects.prefetch_related(
                        "items__product__vendor"
                    ).get(user=request.user)
                except Cart.DoesNotExist:
                    return Response(
                        {"error": "Cart not found"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                
                if not cart.items.exists():
                    return Response(
                        {"error": "Cart is empty"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # stock check
                for item in cart.items.all():
                    if item.product.stock < item.quantity:
                        if item.product.stock == 0:
                             return Response(
                                {"error": f"'{item.product.name}' is currently out of stock. Please remove it from your cart."},
                                status=status.HTTP_400_BAD_REQUEST,
                            )
                        return Response(
                            {"error": f"We're sorry, '{item.product.name}' has only {item.product.stock} items left in stock."},
                            status=status.HTTP_400_BAD_REQUEST,
                        )
                    
                # Address
                try:
                    address = Address.objects.get(
                        pk=serializer.validated_data["address_id"],
                        user=request.user
                    )
                except Address.DoesNotExist:
                    return Response(
                        {"error": "Shipping address not found."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # order create
                order = Order.objects.create(
                    user=request.user,
                    address=address,
                    payment_method=serializer.validated_data["payment_method"],
                    note=serializer.validated_data.get("note", ""),
                    shipping_fee=cart.shipping_fee,
                    total_amount=cart.total_amount,
                    payment_status=Order.PaymentStatus.PENDING,
                )

                # orderItem create + stock reduce
                for item in cart.items.all():
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        vendor=item.product.vendor,
                        product_name=item.product.name,
                        product_price=item.product.selling_price,
                        quantity=item.quantity,
                        total_price=item.total_price,
                    )
                    # stock reduce
                    item.product.stock -= item.quantity
                    item.product.save()
                
                # Empty the cart
                cart.items.all().delete()

                # If Online Payment, create Razorpay order
                if order.payment_method == Order.PaymentMethod.ONLINE:
                    try:
                        razorpay_order = create_razorpay_order(order.total_amount)
                        
                        # Create Payment record
                        Payment.objects.create(
                            order=order,
                            razorpay_order_id=razorpay_order["id"],
                            amount=order.total_amount,
                            status=Payment.PaymentStatus.PENDING
                        )
                        
                        return Response({
                            "order": OrderSerializer(order, context={'request': request}).data,
                            "razorpay_order_id": razorpay_order["id"],
                            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                            "amount": int(order.total_amount * 100),
                            "currency": "INR",
                        }, status=status.HTTP_201_CREATED)
                    except Exception as e:
                        # If Razorpay fails,  fail the transaction
                        raise Exception(f"Payment gateway error: {str(e)}")
                
                return Response(
                    OrderSerializer(order, context={'request': request}).data,
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            logger.exception("Order creation failed")
            return Response(
                {"error": f"An error occurred while creating your order: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )

class OrderCancelView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error":"Order not found"},
                            status=status.HTTP_404_NOT_FOUND)
        
        if order.order_status != Order.OrderStatus.PENDING:
            return Response({"error":"Only pending orders can be cancelled"},
                             status=status.HTTP_400_BAD_REQUEST)
        
        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.order_status = Order.OrderStatus.CANCELLED
        order.save()
        return Response({"message":"Order cancelled successfully"}, status=status.HTTP_200_OK)


class OrderDetailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, pk):
        try:
            # Allow both customer and authorized vendor
            order = Order.objects.prefetch_related("items").select_related("address").get(pk=pk)
            
            is_customer = order.user == request.user
            vendor = getattr(request.user, 'vendor', None)
            is_authorized_vendor = vendor and order.items.filter(vendor=vendor).exists()
            
            if not (is_customer or is_authorized_vendor):
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
                
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
            
            is_customer = order.user == request.user
            vendor = getattr(request.user, 'vendor', None)
            is_authorized_vendor = vendor and order.items.filter(vendor=vendor).exists()
            
            if not (is_customer or is_authorized_vendor):
                return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)
                
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=status.HTTP_404_NOT_FOUND)

        # If order is already in a terminal state, allow permanent deletion
        if order.order_status in [Order.OrderStatus.CANCELLED, Order.OrderStatus.DELIVERED]:
            order.delete()
            return Response({"message": "Order removed from history"}, status=status.HTTP_204_NO_CONTENT)

        # If pending and customer is deleting, just cancel it
        if order.order_status == Order.OrderStatus.PENDING and is_customer:
            for item in order.items.all():
                if item.product:
                    item.product.stock += item.quantity
                    item.product.save()

            order.order_status = Order.OrderStatus.CANCELLED
            order.save()
            return Response({"message": "Order cancelled successfully"})
        
        return Response(
            {"error": "Only cancelled or delivered orders can be permanently removed. Active orders must be finalized first."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
# Vendor Orders


class VendorOrderListView(APIView):
    permission_classes = (IsAuthenticated, isVendor)

    def get(self, request):
        vendor = getattr(request.user, 'vendor', None)
        if not vendor:
             return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)

        # Get orders that contain at least one product from this vendor
        orders = Order.objects.filter(
            items__vendor=vendor
        ).distinct().prefetch_related(
            Prefetch(
                'items', 
                queryset=OrderItem.objects.filter(vendor=vendor)
            ),
            'address'
        ).order_by("-created_at")

        paginator = StandardPagination()
        result = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(result, many=True, context={'request': request})
        
        return paginator.get_paginated_response(serializer.data)
        


class VendorOrderStatusUpdateView(APIView):
    permission_classes = (IsAuthenticated, isVendor)
    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)

            vendor = getattr(request.user, 'vendor', None)
            if not vendor or not order.items.filter(vendor=vendor).exists():
                return Response(
                    {"error":"You are not authorized for this order"},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Order.DoesNotExist:
            return Response(
                {"error":"Order not Found"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = OrderStatusUpdateSerializer(
            order,
            data= request.data,
            partial = True

        )
        if serializer.is_valid():
            # If status changed to cancelled, restore stock
            new_status = serializer.validated_data.get('order_status')
            if new_status == Order.OrderStatus.CANCELLED and order.order_status != Order.OrderStatus.CANCELLED:
                for item in order.items.all():
                    if item.product:
                        item.product.stock += item.quantity
                        item.product.save()
            
            serializer.save()
            return Response(OrderSerializer(order, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminOrderListView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request):
        orders = Order.objects.all().prefetch_related(
            "items"
        ).select_related("address","user")
        paginator = StandardPagination()
        result = paginator.paginate_queryset(orders, request)
        serializer = OrderSerializer(result, many = True, context={'request': request})
        return paginator.get_paginated_response(serializer.data)
    

class  AdminOrderStatusUpdateView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def patch(self, request, pk):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response(
                {"error":"Order not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = OrderStatusUpdateSerializer(
            order,
            data= request.data,
            partial = True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(OrderSerializer(order, context={'request': request}).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

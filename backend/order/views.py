from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from users.permissions import IsCustomer, isVendor
from address.models import Address
from cart.models import Cart
from config.pagination import StandardPagination
from.models import Order,OrderItem

from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderStatusUpdateSerializer
)

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
            data= request.data,
            context = {"request":request}
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # cart check
        try:
            cart = Cart.objects.prefetch_related(
                "items__product__vendor"

            ).get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {"error":"Cart not found"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not cart.items.exists():
            return Response({"error":"Cart is empty"},
                            status=status.HTTP_400_BAD_REQUEST)
        
        # stock chek

        for item in cart.items.all():
            if item.product.stock< item.quantity:
             return Response(
                    {"error": f"'{item.product.name}' has only "
                               f"{item.product.stock} items in stock."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
         # Address
        address = Address.objects.get(
            pk=serializer.validated_data["address_id"],
            user=request.user
        )

        # order create
        order = Order.objects.create(
            user=request.user,
            address = address,
            payment_method=serializer.validated_data["payment_method"],
            note = serializer.validated_data.get("note",""),
            total_amount = cart.total_amount,
            payment_status=(
                Order.PaymentStatus.PENDING
                if serializer.validated_data["payment_method"] == Order.PaymentMethod.ONLINE
                else Order.PaymentStatus.PENDING
            ),
        )
         # orderItem create + stock reduce
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product= item.product,
                vendor = item.product.vendor,
                product_name = item.product.name,
                product_price=item.product.price,
                quantity=item.quantity,
                total_price=item.total_price,
            )
            # stock reduce
            item.product.stock -= item.quantity
            item.product.save()
        
        cart.items.all().delete()
        return Response(OrderSerializer(order, context={'request': request}).data, status=status.HTTP_201_CREATED)
    

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
    permission_classes = (IsAuthenticated, IsCustomer)

    def get(self,request, pk):
        try:
            order = Order.objects.prefetch_related(
                "items"
            ).select_related("address").get(
                pk=pk,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response({"error":"Order not found"},
                            status=status.HTTP_404_NOT_FOUND)

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"error":"Order not found"},
                            status=status.HTTP_404_NOT_FOUND)
        if order.order_status!= Order.OrderStatus.PENDING:
            return Response({"error":"Only pending orders can be cancelled"},
             status=status.HTTP_400_BAD_REQUEST,)
        
        for  item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.order_status = Order.OrderStatus.CANCELLED
        order.save()
        return Response({"message":"Order cancelled successfully"})
    
# Vendor Orders


class VendorOrderListView(APIView):
    permission_classes = (IsAuthenticated, isVendor)

    def get(self, request):
        vendor = getattr(request.user, 'vendor', None)
        if not vendor:
             return Response({"error": "Vendor profile not found"}, status=status.HTTP_404_NOT_FOUND)

        order_items = OrderItem.objects.filter(
            vendor=vendor
        ).select_related("order", "product").order_by("-order__created_at")

        paginator = StandardPagination()
        result = paginator.paginate_queryset(order_items, request)

        data = []
        for item in result:
            data.append({
                "order_id": item.order.id,
                "order_status": item.order.order_status,
                "payment_method": item.order.payment_method,
                "payment_status": item.order.payment_status,
                "product_name": item.product_name,
                "quantity": item.quantity,
                "total_price": item.total_price,
                "customer_email": item.order.user.email,
                "ordered_at": item.order.created_at,
            })
        return paginator.get_paginated_response(data)
        


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


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from users.permissions import IsCustomer
from order.models import Order
from .models import Payment
from .serializers import PaymentSerializer, PaymentVerifySerializer
from .utils import create_razorpay_order, verify_razorpay_signature
from django.conf import settings


class CreatePaymentView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def post(self, request, order_id):
        # Order check
        try:
            order = Order.objects.get(
                pk=order_id,
                user=request.user,
            )
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # online payment user orders
        if order.payment_method != Order.PaymentMethod.ONLINE:
            return Response(
                {"error": "This order is Cash on Delivery."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Already payment done for this order
        if hasattr(order, "payment") and order.payment.status == Payment.PaymentStatus.SUCCESS:
            return Response(
                {"error": "Payment already done for this order."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Razorpay order crate
        razorpay_order = create_razorpay_order(order.total_amount)

        # Payment record 
        payment, _ = Payment.objects.get_or_create(
            order=order,
            defaults={
                "razorpay_order_id": razorpay_order["id"],
                "amount": order.total_amount,
            }
        )

        # if already then  update it
        if not _:
            payment.razorpay_order_id = razorpay_order["id"]
            payment.status = Payment.PaymentStatus.PENDING
            payment.save()

        return Response(
            {
                "razorpay_order_id": razorpay_order["id"],
                "razorpay_key_id": settings.RAZORPAY_KEY_ID,
                "amount": int(order.total_amount * 100),
                "currency": "INR",
                "order_id": str(order.id),
            },
            status=status.HTTP_200_OK,
        )


class VerifyPaymentView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def post(self, request):
        serializer = PaymentVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        razorpay_order_id = serializer.validated_data["razorpay_order_id"]
        razorpay_payment_id = serializer.validated_data["razorpay_payment_id"]
        razorpay_signature = serializer.validated_data["razorpay_signature"]

        # Signature verify
        is_valid = verify_razorpay_signature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        )

        if not is_valid:
            # Payment failed
            try:
                payment = Payment.objects.get(
                    razorpay_order_id=razorpay_order_id
                )
                payment.status = Payment.PaymentStatus.FAILED
                payment.save()
                payment.order.payment_status = Order.PaymentStatus.FAILED
                payment.order.save()
            except Payment.DoesNotExist:
                pass

            return Response(
                {"error": "Payment verification failed. Invalid signature."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Payment success
        try:
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id
            )
        except Payment.DoesNotExist:
            return Response(
                {"error": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Payment update 
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature = razorpay_signature
        payment.status = Payment.PaymentStatus.SUCCESS
        payment.save()

        # Order update 
        order = payment.order
        order.payment_status = Order.PaymentStatus.PAID
        order.order_status = Order.OrderStatus.CONFIRMED
        order.save()

        return Response(
            {
                "message": "Payment successful.",
                "payment": PaymentSerializer(payment).data,
            },
            status=status.HTTP_200_OK,
        )


class PaymentDetailView(APIView):
    permission_classes = (IsAuthenticated, IsCustomer)

    def get(self, request, order_id):
        try:
            order = Order.objects.get(pk=order_id, user=request.user)
            payment = Payment.objects.get(order=order)
        except (Order.DoesNotExist, Payment.DoesNotExist):
            return Response(
                {"error": "Payment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)
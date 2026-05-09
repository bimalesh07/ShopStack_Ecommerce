from django.urls import path
from .views import (
    CreatePaymentView,
    VerifyPaymentView,
    PaymentDetailView,
)

urlpatterns = [
    path("create/<uuid:order_id>/", CreatePaymentView.as_view(), name="payment-create"),
    path("verify/", VerifyPaymentView.as_view(), name="payment-verify"),
    path("detail/<uuid:order_id>/", PaymentDetailView.as_view(), name="payment-detail"),
]
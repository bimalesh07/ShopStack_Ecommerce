from django.urls import path
from .views import (
    OrderListCreateView,
    OrderDetailView,
    OrderCancelView,
    VendorOrderListView,
    VendorOrderStatusUpdateView,
    AdminOrderListView,
    AdminOrderStatusUpdateView
)

urlpatterns = [
    # Customer
    path("", OrderListCreateView.as_view(), name="order-list"),
    path("user-orders/", OrderListCreateView.as_view(), name="user-order-list"),
    path("<uuid:pk>/", OrderDetailView.as_view(), name="order-detail"),
    path("<uuid:pk>/cancel/", OrderCancelView.as_view(), name="order-cancel"),

    # Vendor
    path("vendor/", VendorOrderListView.as_view(), name="vendor-order-list"),
    path("vendor/<uuid:pk>/status/", VendorOrderStatusUpdateView.as_view(), name="vendor-order-status"),
    path("vendor/order/<uuid:pk>/update-status/", VendorOrderStatusUpdateView.as_view(), name="vendor-order-status-update"),

    # Admin
    path("admin/", AdminOrderListView.as_view(), name="admin-order-list"),
    path("admin/<uuid:pk>/status/", AdminOrderStatusUpdateView.as_view(), name="admin-order-status"),
]
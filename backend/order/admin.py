from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ("product_name", "product_price", "quantity", "total_price")


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "id", "user", "order_status",
        "payment_method", "payment_status",
        "total_amount", "created_at"
    )
    list_filter = ("order_status", "payment_method", "payment_status")
    search_fields = ("user__email",)
    list_editable = ("order_status", "payment_status")
    readonly_fields = ("total_amount", "created_at")
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ("order", "product_name", "vendor", "quantity", "total_price")
    search_fields = ("product_name", "order__user__email")
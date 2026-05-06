from django.contrib import admin
from .models import Cart, CartItem

class CartIteminline(admin.TabularInline):
    model = CartItem
    extra =0
    readonly_fields =("total_price",)


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display =("user","total_items","total_amount","created_at")
    inlines =[CartIteminline]

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display =("cart","product","quantity","total_price")

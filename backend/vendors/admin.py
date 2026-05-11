from django.contrib import admin
from .models import Vendor

@admin.register(Vendor)
class VendorAdmin(admin.ModelAdmin):
    list_display =("shop_name","user","is_approved","created_at")
    list_filter = ("is_approved",)
    search_fields =("shop_name", "user__email")
    list_editable =("is_approved",)
    ordering =("-created_at",)

from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "full_name", "city", "state", "pincode", "is_default")
    list_filter = ("is_default", "state")
    search_fields = ("user__email", "full_name", "city")
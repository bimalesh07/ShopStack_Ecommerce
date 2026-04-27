from django.contrib import admin

from .models import Category, Product, ProductImage

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display =("name","slug","created_at")
    search_fields =("name")
    prepopulated_fields={"slug":("name,")}

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra =1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "vendor", "category", "price", "stock", "is_active", "created_at")
    list_filter = ("is_active", "category", "vendor")
    search_fields = ("name", "vendor__shop_name")
    list_editable = ("is_active", "stock", "price")
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductImageInline]

@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
        list_display = ("product", "is_primary", "created_at")
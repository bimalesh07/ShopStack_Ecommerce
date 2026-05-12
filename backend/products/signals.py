# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, Category

@receiver([post_save, post_delete], sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    # if product change its cache will be cleared
    cache.delete(f"product_detail_{instance.slug}")
    cache.delete("all_products_list") # if product list also cache 
    print(f"Cache cleared for: {instance.name}")

@receiver([post_save, post_delete], sender=Category)
def clear_category_cache(sender, instance, **kwargs):
    cache.delete("all_categories")
    print("Category cache cleared!")
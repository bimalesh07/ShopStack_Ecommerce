# signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Product, Category

@receiver([post_save, post_delete], sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    # if product change its cache will be cleared
    cache.delete(f"product_detail_{instance.slug}")

   # 2. List View (Jo dispatch) ke liye poora cache saaf pura clean
    # Kyunki dispatch/cache_page ki keys dynamic hoti hain, unhe delete so this method is used
    cache.clear()
    print(f"Cache cleared for: {instance.name}")

@receiver([post_save, post_delete], sender=Category)
def clear_category_cache(sender, instance, **kwargs):
    #cache.delete("all_categories")
    # Category badli toh Products ki list bhi badal sakti hai, isliye clear()
    cache.clear()
    print("Category cache cleared!")
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver 
from django.core.cache import cache
from .models import Product, Category

@receiver([post_save, post_delete], sender=Product)
def clear_product_cache(sender, instance, **kwargs):
    try:
        # Specific product ka cache delete
        cache.delete(f"product_detail_{instance.slug}")
        # Global clear taaki dispatch wali saari categories/products refresh ho jayein
        cache.clear() 
    except Exception:
        pass

@receiver([post_save, post_delete], sender=Category)
def clear_category_cache(sender, instance, **kwargs):
    try:
        # Jab category badle, toh all_categories wali key aur baaki sab udaao
        cache.delete("all_categories")
        cache.clear()
    except Exception:
        pass
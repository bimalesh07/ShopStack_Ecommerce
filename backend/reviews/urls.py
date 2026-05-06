from django.urls import path
from .views import ReviewListCreateView, ProductRatingView

urlpatterns = [
    path('product/<uuid:product_id>/', ReviewListCreateView.as_view(), name='product-reviews'),
    path('product/<uuid:product_id>/rating/', ProductRatingView.as_view(), name='product-rating'),
]

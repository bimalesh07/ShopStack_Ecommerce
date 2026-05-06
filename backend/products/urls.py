from django.urls import path
from .views import (
    CategoryListView,
    CategoryCreateView,
    ProductListView,
    ProductDetailView,
    VendorProductListCreateview,
    VendorProductDetailView,
    ProductImageUploadView
)

urlpatterns =[
    #Public
    path("", ProductListView.as_view(), name="product_list"),
    path("<uuid:pk>/", ProductDetailView.as_view(), name="Product-detail"),

    # category
    path("categories/", CategoryListView.as_view(), name="category-list"),
    path("categories/create/", CategoryCreateView.as_view(), name="category-create"),


    # vendor 
    path("vendor/", VendorProductListCreateview.as_view(), name="vendor-product-list"),
     path("vendor/<uuid:pk>/", VendorProductDetailView.as_view(), name="vendor-product-detail"),
    path("vendor/<uuid:pk>/images/", ProductImageUploadView.as_view(), name="product-image-upload"),
    path("vendor/<uuid:pk>/images/<uuid:image_id>/", ProductImageUploadView.as_view(), name="product-image-delete"),
]
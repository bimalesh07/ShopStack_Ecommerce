from django.urls import path
from .views import WishlistView, WishlistItemDeleteView, WishlistClearView

urlpatterns =[
    path("", WishlistView.as_view(), name="wishlist"),
    path("add/", WishlistView.as_view(), name="wishlist-add"),
    path("clear/", WishlistClearView.as_view(), name="wishlist-clear"),
    path("<uuid:pk>", WishlistItemDeleteView.as_view(), name="wishlist-item-delete"),
]
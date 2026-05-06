from django.urls import path
from .views import CartView, CartItemUpdateView


urlpatterns =[
    path("", CartView.as_view(), name="cart"),
    path("add/", CartView.as_view(), name="cart-add"),
    path("<uuid:pk>", CartItemUpdateView.as_view(), name="cart-item-update"),
]
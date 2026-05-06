from django.urls import path
from .views import (
    AddressListCreateView,
    AddressDetailView,
    SetDefaultAddressView,
)

urlpatterns = [
    path("", AddressListCreateView.as_view(), name="address-list"),
    path("<uuid:pk>/", AddressDetailView.as_view(), name="address-detail"),
    path("<uuid:pk>/set-default/", SetDefaultAddressView.as_view(), name="address-set-default"),
]
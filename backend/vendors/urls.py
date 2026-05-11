from django.urls import path
from .views import VenderProfileView, VendorCreateProfileView

urlpatterns =[
    path("profile/", VenderProfileView.as_view(), name ="vendor-profile"),
    path("profile/create", VendorCreateProfileView.as_view(), name ="vendor-profile-create"),
]
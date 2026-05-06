from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CustomerRegisterView,
    VenderRegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    GoogleLoginView
)

urlpatterns =[
    path("register/", CustomerRegisterView.as_view(), name = "customer-register"),
    path("vendor/register/", VenderRegisterView.as_view(), name = "vendor-register"),
    path("login/", LoginView.as_view(), name = "login"),
    path("logout/", LogoutView.as_view(), name = "logout"),
    path("token/refresh/", TokenRefreshView.as_view(), name = "token_refresh"),
    path("profile/", ProfileView.as_view(), name = "profile"),
    path("change-password/", ChangePasswordView.as_view(), name = "change-password"),
    path("google-login/", GoogleLoginView.as_view(), name = "google-login"),

]
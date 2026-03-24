from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import MeView, RegisterView, CreateUserView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="auth-token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="auth-token-refresh"),
    path("auth/me/", MeView.as_view(), name="auth-me"),
    path("auth/users/", CreateUserView.as_view(), name="create-user"),
]
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserSerializer, CreateUserSerializer


class RegisterView(generics.CreateAPIView):
    """Public endpoint — creates a new user account."""
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class CreateUserView(generics.CreateAPIView):
    """Admin endpoint — creates a new user (staff, owner, super_admin)."""
    queryset = User.objects.all()
    serializer_class = CreateUserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Only allow owners and super_admin to create new users
        if self.request.user.role not in [User.Role.OWNER, User.Role.SUPER_ADMIN]:
            self.permission_denied(self.request)
        serializer.save()


class MeView(APIView):
    """Returns or updates the profile of the currently authenticated user."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
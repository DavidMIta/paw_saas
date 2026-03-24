from rest_framework import generics, permissions, viewsets
from rest_framework.permissions import IsAuthenticated

from users.models import User

from .models import Business, Client, Service, Staff, WorkingHours
from .permissions import IsOwner, IsOwnerOrStaffReadOnly, IsOwnerStaffOrClientReadOnly
from .serializers import (
    BusinessSerializer,
    ClientSerializer,
    PublicBusinessSerializer,
    ServiceSerializer,
    StaffSerializer,
    WorkingHoursSerializer,
)


def _get_user_business(user):
    """Resolve the single Business the requesting user is tied to."""
    if user.role == User.Role.OWNER:
        return Business.objects.filter(owner=user).first()
    if user.role == User.Role.SUPER_ADMIN:
        # Super admin can see all businesses, return the first active one
        return Business.objects.filter(is_active=True).first()
    if user.role == User.Role.STAFF:
        profile = user.staff_profiles.filter(is_active=True).select_related("business").first()
        return profile.business if profile else None
    if user.role == User.Role.CLIENT:
        profile = user.client_profiles.select_related("business").first()
        return profile.business if profile else None
    return None


class PublicBusinessListView(generics.ListAPIView):
    """Public list of active businesses for client signup."""

    serializer_class = PublicBusinessSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Business.objects.filter(is_active=True).order_by("name")


class BusinessViewSet(viewsets.ModelViewSet):
    """
    Owners can create and manage their own businesses.
    One owner → one business for MVP (get_queryset returns 0 or 1 item).
    """
    serializer_class = BusinessSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Business.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class StaffViewSet(viewsets.ModelViewSet):
    """Owners manage staff members for their business."""
    serializer_class = StaffSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        business = _get_user_business(self.request.user)
        if not business:
            return Staff.objects.none()
        return Staff.objects.filter(business=business).select_related("user")

    def perform_create(self, serializer):
        business = _get_user_business(self.request.user)
        serializer.save(business=business)


class ServiceViewSet(viewsets.ModelViewSet):
    """
    Owners have full CRUD; Staff can read only.
    Queryset is scoped to the user's business.
    """
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated, IsOwnerStaffOrClientReadOnly]

    def get_queryset(self):
        business = _get_user_business(self.request.user)
        if not business:
            return Service.objects.none()
        return Service.objects.filter(business=business).order_by("name")

    def perform_create(self, serializer):
        business = _get_user_business(self.request.user)
        serializer.save(business=business)


class WorkingHoursViewSet(viewsets.ModelViewSet):
    """Owners manage working hours; Staff can read only."""
    serializer_class = WorkingHoursSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaffReadOnly]

    def get_queryset(self):
        business = _get_user_business(self.request.user)
        if not business:
            return WorkingHours.objects.none()
        return WorkingHours.objects.filter(business=business)

    def perform_create(self, serializer):
        business = _get_user_business(self.request.user)
        serializer.save(business=business)


class ClientViewSet(viewsets.ModelViewSet):
    """Owners register and manage client records for their business."""
    serializer_class = ClientSerializer
    permission_classes = [IsAuthenticated, IsOwner]

    def get_queryset(self):
        business = _get_user_business(self.request.user)
        if not business:
            return Client.objects.none()
        return Client.objects.filter(business=business).select_related("user")

    def perform_create(self, serializer):
        business = _get_user_business(self.request.user)
        serializer.save(business=business)

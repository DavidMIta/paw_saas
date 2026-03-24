from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from business.models import Business
from users.models import User

from .models import Appointment, Pet
from .serializers import AppointmentSerializer, PetSerializer


def _get_user_business(user):
    if user.role == User.Role.OWNER:
        return Business.objects.filter(owner=user).first()
    if user.role == User.Role.STAFF:
        profile = user.staff_profiles.filter(is_active=True).select_related("business").first()
        return profile.business if profile else None
    if user.role == User.Role.CLIENT:
        profile = user.client_profiles.select_related("business").first()
        return profile.business if profile else None
    return None


class PetViewSet(viewsets.ModelViewSet):
    """
    - Clients   → see & manage only their own pets.
    - Owner/Staff → see all pets belonging to their business.
    """
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.CLIENT:
            return Pet.objects.filter(
                owner__user=user
            ).select_related("owner__user")
        business = _get_user_business(user)
        if not business:
            return Pet.objects.none()
        return Pet.objects.filter(
            owner__business=business
        ).select_related("owner__user")

    def perform_create(self, serializer):
        # Clients create pets under their own client profile.
        user = self.request.user
        if user.role == User.Role.CLIENT:
            client = user.client_profiles.first()
            if not client:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("No client profile found for this user.")
            serializer.save(owner=client)
        else:
            serializer.save()


class AppointmentViewSet(viewsets.ModelViewSet):
    """
    - Clients   → see & manage only appointments for their own pets.
    - Owner/Staff → see all appointments for their business.
    Write operations infer business from context; price is locked from service.
    """
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == User.Role.CLIENT:
            return Appointment.objects.filter(
                pet__owner__user=user
            ).select_related("pet", "service", "staff__user")
        business = _get_user_business(user)
        if not business:
            return Appointment.objects.none()
        return Appointment.objects.filter(
            business=business
        ).select_related("pet", "service", "staff__user")

    def perform_create(self, serializer):
        user = self.request.user
        service = serializer.validated_data["service"]
        if user.role == User.Role.CLIENT:
            # Business is derived from the pet's owner profile
            pet = serializer.validated_data["pet"]
            business = pet.owner.business
        else:
            business = _get_user_business(user)
        serializer.save(
            business=business,
            price_charged=service.price,
        )

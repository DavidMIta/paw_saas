from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, PetViewSet

router = DefaultRouter()
router.register("pets", PetViewSet, basename="pet")
router.register("appointments", AppointmentViewSet, basename="appointment")

urlpatterns = [
    path("", include(router.urls)),
]

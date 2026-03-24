from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BusinessViewSet,
    ClientViewSet,
    PublicBusinessListView,
    ServiceViewSet,
    StaffViewSet,
    WorkingHoursViewSet,
)

router = DefaultRouter()
router.register("businesses", BusinessViewSet, basename="business")
router.register("staff", StaffViewSet, basename="staff")
router.register("services", ServiceViewSet, basename="service")
router.register("working-hours", WorkingHoursViewSet, basename="working-hours")
router.register("clients", ClientViewSet, basename="client")

urlpatterns = [
    path("public/businesses/", PublicBusinessListView.as_view(), name="public-businesses"),
    path("", include(router.urls)),
]

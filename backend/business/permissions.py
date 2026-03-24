from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwner(BasePermission):
    """User must have the 'owner' or 'super_admin' role to access management endpoints."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("owner", "super_admin")
        )


class IsOwnerOrStaffReadOnly(BasePermission):
    """
    Owner/Super Admin → full CRUD.
    Active Staff of the same business → read-only (SAFE_METHODS).
    Enforced at view level; queryset scoping handles row-level isolation.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ("owner", "super_admin"):
            return True
        if request.user.role == "staff" and request.method in SAFE_METHODS:
            return True
        return False


class IsOwnerStaffOrClientReadOnly(BasePermission):
    """
    Owner/Super Admin → full CRUD.
    Staff/Client → read-only for endpoints like services used during booking.
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role in ("owner", "super_admin"):
            return True
        if request.user.role in {"staff", "client"} and request.method in SAFE_METHODS:
            return True
        return False

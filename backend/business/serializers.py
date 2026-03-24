from rest_framework import serializers

from .models import Business, Client, Service, Staff, WorkingHours


class PublicBusinessSerializer(serializers.ModelSerializer):
    class Meta:
        model = Business
        fields = ["id", "name", "slug", "timezone"]


class BusinessSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Business
        fields = [
            "id", "name", "slug", "phone", "address", "timezone",
            "plan", "is_active", "owner_email", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "slug", "plan", "owner_email", "created_at", "updated_at"]


class StaffSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            "id", "business", "user", "user_email", "user_full_name",
            "role", "is_active", "created_at",
        ]
        read_only_fields = ["id", "business", "user_email", "user_full_name", "created_at"]

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = [
            "id", "business", "name", "description",
            "duration_min", "price", "is_active", "created_at",
        ]
        read_only_fields = ["id", "business", "created_at"]


class WorkingHoursSerializer(serializers.ModelSerializer):
    weekday_display = serializers.CharField(source="get_weekday_display", read_only=True)

    class Meta:
        model = WorkingHours
        fields = ["id", "business", "weekday", "weekday_display", "open_time", "close_time"]
        read_only_fields = ["id", "business", "weekday_display"]


class ClientSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_full_name = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            "id", "business", "user", "user_email", "user_full_name",
            "notes", "created_at",
        ]
        read_only_fields = ["id", "business", "user_email", "user_full_name", "created_at"]

    def get_user_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip()

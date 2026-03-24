from rest_framework import serializers

from .models import Appointment, Pet


class PetSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.user.email", read_only=True)
    species_display = serializers.CharField(source="get_species_display", read_only=True)

    class Meta:
        model = Pet
        fields = [
            "id", "owner", "owner_email", "name", "species", "species_display",
            "breed", "birth_date", "weight_kg", "notes", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "owner", "owner_email", "species_display", "created_at", "updated_at",
        ]


class AppointmentSerializer(serializers.ModelSerializer):
    pet_name = serializers.CharField(source="pet.name", read_only=True)
    service_name = serializers.CharField(source="service.name", read_only=True)
    staff_email = serializers.SerializerMethodField()
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Appointment
        fields = [
            "id", "business", "pet", "pet_name", "service", "service_name",
            "staff", "staff_email", "scheduled_at", "status", "status_display",
            "notes", "price_charged", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "business", "pet_name", "service_name", "staff_email",
            "status_display", "price_charged", "created_at", "updated_at",
        ]

    def get_staff_email(self, obj):
        return obj.staff.user.email if obj.staff else None

    def validate(self, attrs):
        request = self.context.get("request")
        if not request:
            return attrs
        pet = attrs.get("pet")
        service = attrs.get("service")
        if pet and service and pet.owner.business_id != service.business_id:
            raise serializers.ValidationError(
                {"service": "Service does not belong to the same business as the pet."}
            )
        return attrs

from django.db import transaction
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from business.models import Business, Client

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")
    business_slug = serializers.SlugField(write_only=True, required=True)

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone",
            "role",
            "business_slug",
        ]
        extra_kwargs = {"role": {"required": False}}

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})
        attrs["role"] = User.Role.CLIENT

        business_slug = attrs.get("business_slug")
        business = Business.objects.filter(slug=business_slug, is_active=True).first()
        if not business:
            raise serializers.ValidationError(
                {"business_slug": "Business not found or unavailable."}
            )
        attrs["business"] = business
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        business = validated_data.pop("business")
        validated_data.pop("business_slug", None)

        user = User.objects.create_user(**validated_data)
        Client.objects.create(user=user, business=business)
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "phone", "role", "created_at"]
        read_only_fields = ["id", "email", "role", "created_at"]


class CreateUserSerializer(serializers.ModelSerializer):
    """Admin endpoint to create users with specific roles (staff, owner)"""
    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password")

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "password2",
            "first_name",
            "last_name",
            "phone",
            "role",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs.pop("password2"):
            raise serializers.ValidationError({"password": "Passwords do not match."})

        # Only allow creating staff and owner users (not client)
        role = attrs.get("role")
        if role not in [User.Role.STAFF, User.Role.OWNER, User.Role.SUPER_ADMIN]:
            raise serializers.ValidationError(
                {"role": "Invalid role. Only staff, owner, or super_admin allowed."}
            )

        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

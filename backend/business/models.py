import uuid

from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Business(models.Model):
    class Plan(models.TextChoices):
        FREE = "free", "Free"
        BASIC = "basic", "Basic"
        PRO = "pro", "Pro"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="owned_businesses",
    )
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True, max_length=160, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    timezone = models.CharField(max_length=63, default="UTC")
    plan = models.CharField(max_length=20, choices=Plan.choices, default=Plan.FREE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "businesses"
        verbose_name = "Business"
        verbose_name_plural = "Businesses"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Staff(models.Model):
    class Role(models.TextChoices):
        MANAGER = "manager", "Manager"
        GROOMER = "groomer", "Groomer"
        RECEPTIONIST = "receptionist", "Receptionist"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="staff_members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="staff_profiles",
    )
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.GROOMER)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "staff"
        unique_together = ("business", "user")
        verbose_name = "Staff Member"

    def __str__(self):
        return f"{self.user.email} @ {self.business.name}"


class Service(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="services"
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    duration_min = models.PositiveIntegerField(help_text="Duration in minutes")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "services"
        verbose_name = "Service"

    def __str__(self):
        return f"{self.name} ({self.business.name})"


class WorkingHours(models.Model):
    class Weekday(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="working_hours"
    )
    weekday = models.IntegerField(choices=Weekday.choices)
    open_time = models.TimeField()
    close_time = models.TimeField()

    class Meta:
        db_table = "working_hours"
        unique_together = ("business", "weekday")

    def __str__(self):
        return f"{self.business.name} — {self.get_weekday_display()}"


class Client(models.Model):
    """Links a User (role=CLIENT) to a specific Business (row-level tenancy)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        Business, on_delete=models.CASCADE, related_name="clients"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="client_profiles",
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "clients"
        unique_together = ("business", "user")
        verbose_name = "Client"

    def __str__(self):
        return f"{self.user.email} @ {self.business.name}"

import uuid

from django.db import models

from business.models import Business, Client, Service, Staff


class Pet(models.Model):
    class Species(models.TextChoices):
        DOG = "dog", "Dog"
        CAT = "cat", "Cat"
        BIRD = "bird", "Bird"
        RABBIT = "rabbit", "Rabbit"
        OTHER = "other", "Other"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(Client, on_delete=models.CASCADE, related_name="pets")
    name = models.CharField(max_length=100)
    species = models.CharField(
        max_length=20, choices=Species.choices, default=Species.DOG
    )
    breed = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    weight_kg = models.DecimalField(
        max_digits=5, decimal_places=2, null=True, blank=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "pets"
        verbose_name = "Pet"

    def __str__(self):
        return f"{self.name} ({self.get_species_display()})"


class Appointment(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"
        CANCELLED = "cancelled", "Cancelled"
        NO_SHOW = "no_show", "No Show"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    business = models.ForeignKey(
        Business, on_delete=models.PROTECT, related_name="appointments"
    )
    pet = models.ForeignKey(Pet, on_delete=models.PROTECT, related_name="appointments")
    service = models.ForeignKey(
        Service, on_delete=models.PROTECT, related_name="appointments"
    )
    staff = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="appointments",
    )
    scheduled_at = models.DateTimeField()
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    notes = models.TextField(blank=True)
    price_charged = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Final price charged; copied from service at booking time",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "appointments"
        ordering = ["-scheduled_at"]
        indexes = [
            models.Index(fields=["business", "scheduled_at"]),
            models.Index(fields=["business", "status"]),
        ]
        verbose_name = "Appointment"

    def __str__(self):
        return (
            f"{self.pet.name} — {self.service.name} "
            f"@ {self.scheduled_at:%Y-%m-%d %H:%M}"
        )

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI, petAPI, serviceAPI } from "../services/api.ts";
import type { PaginatedResponse, Pet, Service } from "../types";

const INITIAL_PET_FORM = {
  name: "",
  species: "dog",
  breed: "",
  birth_date: "",
  weight_kg: "",
  notes: "",
};

const INITIAL_BOOKING_FORM = {
  pet: "",
  service: "",
  scheduled_at: "",
  notes: "",
  customer_email: "",
  customer_name: "",
  customer_phone: "",
};

interface PublicPet extends Pet {
  id: string;
}

export default function PublicBookingPage() {
  const navigate = useNavigate();

  const [pets, setPets] = useState<PublicPet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [petForm, setPetForm] = useState(INITIAL_PET_FORM);
  const [bookingForm, setBookingForm] = useState(INITIAL_BOOKING_FORM);
  const [loading, setLoading] = useState(true);
  const [savingPet, setSavingPet] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"info" | "pet" | "booking">("info");

  const selectedService = useMemo(
    () => services.find((service) => service.id === bookingForm.service),
    [services, bookingForm.service],
  );

  useEffect(() => {
    Promise.all([petAPI.list(), serviceAPI.list()])
      .then(([petResponse, serviceResponse]) => {
        const petData = petResponse.data as PaginatedResponse<Pet>;
        const serviceData = serviceResponse.data as PaginatedResponse<Service>;
        setPets(petData.results);
        setServices(serviceData.results);
        if (petData.results[0]) {
          setBookingForm((prev) => ({
            ...prev,
            pet: petData.results[0].id,
          }));
        }
      })
      .catch(() =>
        setError("We could not load the booking options. Please try again."),
      )
      .finally(() => setLoading(false));
  }, []);

  async function handleCreatePet(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingPet(true);

    try {
      const response = await petAPI.create({
        ...petForm,
        weight_kg: petForm.weight_kg || null,
        birth_date: petForm.birth_date || null,
      });
      const newPet = response.data;
      setPets((prev) => [newPet, ...prev]);
      setBookingForm((prev) => ({ ...prev, pet: newPet.id }));
      setPetForm(INITIAL_PET_FORM);
      setSuccess("Pet registered! Now choose your service.");
      setStep("booking");
    } catch {
      setError("We could not register the pet. Please review the information.");
    } finally {
      setSavingPet(false);
    }
  }

  async function handleCreateAppointment(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSavingAppointment(true);

    try {
      await appointmentAPI.create({
        pet: bookingForm.pet,
        service: bookingForm.service,
        scheduled_at: bookingForm.scheduled_at,
        notes: bookingForm.notes,
      });
      setSuccess("✨ Appointment booked successfully! We'll confirm soon.");
      setBookingForm((prev) => ({
        ...INITIAL_BOOKING_FORM,
        pet: prev.pet,
        customer_email: prev.customer_email,
        customer_name: prev.customer_name,
        customer_phone: prev.customer_phone,
      }));
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch {
      setError(
        "We could not complete the booking. Please check your information.",
      );
    } finally {
      setSavingAppointment(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reserve Your Appointment</h1>
          <p className="page-sub">
            Quick and easy booking for our grooming services
          </p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading ? (
        <div className="empty-state">Loading available services…</div>
      ) : (
        <div className="content-grid">
          {/* Step 1: Customer Info */}
          {step === "info" && (
            <section className="panel-card">
              <div className="section-header">
                <h2 className="section-title">1. Your Information</h2>
              </div>
              <form
                className="stack-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (
                    bookingForm.customer_name &&
                    bookingForm.customer_email &&
                    bookingForm.customer_phone
                  ) {
                    setStep("pet");
                  } else {
                    setError("Please fill in all fields.");
                  }
                }}
              >
                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label className="field-label" htmlFor="customer_name">
                      Full Name
                    </label>
                    <input
                      id="customer_name"
                      className="field-input"
                      type="text"
                      value={bookingForm.customer_name}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          customer_name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="customer_email">
                      Email
                    </label>
                    <input
                      id="customer_email"
                      className="field-input"
                      type="email"
                      value={bookingForm.customer_email}
                      onChange={(e) =>
                        setBookingForm((prev) => ({
                          ...prev,
                          customer_email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="customer_phone">
                    Phone
                  </label>
                  <input
                    id="customer_phone"
                    className="field-input"
                    type="tel"
                    value={bookingForm.customer_phone}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        customer_phone: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <button type="submit" className="btn btn--primary">
                  Continue to Pet Details
                </button>
              </form>
            </section>
          )}

          {/* Step 2: Pet Registration */}
          {step === "pet" && (
            <section className="panel-card">
              <div className="section-header">
                <h2 className="section-title">2. Register Your Pet</h2>
              </div>
              <form className="stack-form" onSubmit={handleCreatePet}>
                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label className="field-label" htmlFor="pet_name">
                      Pet Name
                    </label>
                    <input
                      id="pet_name"
                      className="field-input"
                      value={petForm.name}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="pet_species">
                      Species
                    </label>
                    <select
                      id="pet_species"
                      className="field-input"
                      value={petForm.species}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          species: e.target.value,
                        }))
                      }
                    >
                      <option value="dog">Dog</option>
                      <option value="cat">Cat</option>
                      <option value="bird">Bird</option>
                      <option value="rabbit">Rabbit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-grid form-grid--2">
                  <div className="field">
                    <label className="field-label" htmlFor="pet_breed">
                      Breed
                    </label>
                    <input
                      id="pet_breed"
                      className="field-input"
                      value={petForm.breed}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          breed: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="pet_weight">
                      Weight (kg)
                    </label>
                    <input
                      id="pet_weight"
                      type="number"
                      min="0"
                      step="0.1"
                      className="field-input"
                      value={petForm.weight_kg}
                      onChange={(e) =>
                        setPetForm((prev) => ({
                          ...prev,
                          weight_kg: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="pet_birth_date">
                    Birth Date
                  </label>
                  <input
                    id="pet_birth_date"
                    type="date"
                    className="field-input"
                    value={petForm.birth_date}
                    onChange={(e) =>
                      setPetForm((prev) => ({
                        ...prev,
                        birth_date: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="pet_notes">
                    Notes
                  </label>
                  <textarea
                    id="pet_notes"
                    className="field-input field-input--textarea"
                    value={petForm.notes}
                    onChange={(e) =>
                      setPetForm((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder="Temperament, allergies, special care..."
                  />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setStep("info")}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={savingPet}
                  >
                    {savingPet ? "Saving pet…" : "Continue to Booking"}
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Step 3: Book Appointment */}
          {step === "booking" && (
            <section className="panel-card">
              <div className="section-header">
                <h2 className="section-title">3. Book Your Appointment</h2>
              </div>
              <form className="stack-form" onSubmit={handleCreateAppointment}>
                <div className="field">
                  <label className="field-label" htmlFor="booking_pet">
                    Pet
                  </label>
                  <select
                    id="booking_pet"
                    className="field-input"
                    value={bookingForm.pet}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        pet: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select your pet</option>
                    {pets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} · {pet.species_display}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="booking_service">
                    Service
                  </label>
                  <select
                    id="booking_service"
                    className="field-input"
                    value={bookingForm.service}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        service: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} · {service.duration_min} min · $
                        {service.price}
                      </option>
                    ))}
                  </select>
                  {selectedService && (
                    <p className="form-help">
                      {selectedService.description ||
                        "No additional description."}
                    </p>
                  )}
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="booking_datetime">
                    Date and Time
                  </label>
                  <input
                    id="booking_datetime"
                    type="datetime-local"
                    className="field-input"
                    value={bookingForm.scheduled_at}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        scheduled_at: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label" htmlFor="booking_notes">
                    Special Instructions
                  </label>
                  <textarea
                    id="booking_notes"
                    className="field-input field-input--textarea"
                    value={bookingForm.notes}
                    onChange={(e) =>
                      setBookingForm((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                    placeholder="Any grooming preferences or extra instructions"
                  />
                </div>

                <div className="button-group">
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={() => setStep("pet")}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn--primary"
                    disabled={savingAppointment || pets.length === 0}
                  >
                    {savingAppointment ? "Booking…" : "Complete Booking"}
                  </button>
                </div>

                {pets.length === 0 && (
                  <p className="form-help form-help--warning">
                    Create at least one pet before booking.
                  </p>
                )}
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

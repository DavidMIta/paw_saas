import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useAuth } from "../contexts/AuthContext";
import { appointmentAPI, petAPI, serviceAPI } from "../services/api.ts";
import type { Appointment, PaginatedResponse, Pet, Service } from "../types";

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
};

export default function ReservePage() {
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [petForm, setPetForm] = useState(INITIAL_PET_FORM);
  const [bookingForm, setBookingForm] = useState(INITIAL_BOOKING_FORM);
  const [loading, setLoading] = useState(true);
  const [savingPet, setSavingPet] = useState(false);
  const [savingAppointment, setSavingAppointment] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedService = useMemo(
    () => services.find((service) => service.id === bookingForm.service),
    [services, bookingForm.service],
  );

  useEffect(() => {
    Promise.all([petAPI.list(), serviceAPI.list(), appointmentAPI.list()])
      .then(([petResponse, serviceResponse, appointmentResponse]) => {
        const petData = petResponse.data as PaginatedResponse<Pet>;
        const serviceData = serviceResponse.data as PaginatedResponse<Service>;
        const appointmentData =
          appointmentResponse.data as PaginatedResponse<Appointment>;
        setPets(petData.results);
        setServices(serviceData.results);
        setAppointments(appointmentData.results);
        if (petData.results[0]) {
          setBookingForm((prev) => ({
            ...prev,
            pet: prev.pet || petData.results[0].id,
          }));
        }
      })
      .catch(() => setError("We could not load your booking data."))
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
      setSuccess(
        "Pet registered successfully. Now you can book an appointment.",
      );
    } catch {
      setError("We could not create the pet. Please review the information.");
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
      const response = await appointmentAPI.create({
        pet: bookingForm.pet,
        service: bookingForm.service,
        scheduled_at: bookingForm.scheduled_at,
        notes: bookingForm.notes,
      });
      setAppointments((prev) => [response.data, ...prev]);
      setBookingForm((prev) => ({ ...INITIAL_BOOKING_FORM, pet: prev.pet }));
      setSuccess("Appointment booked successfully 🎉");
    } catch {
      setError("We could not book the appointment. Check the selected data.");
    } finally {
      setSavingAppointment(false);
    }
  }

  if (user?.role !== "client") {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1 className="page-title">Reserve appointment</h1>
            <p className="page-sub">
              This page is only available for client accounts.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reserve appointment</h1>
          <p className="page-sub">
            Register your pet and pick the grooming service you need.
          </p>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {loading ? (
        <div className="empty-state">Loading booking options…</div>
      ) : (
        <div className="content-grid">
          <section className="panel-card">
            <div className="section-header">
              <h2 className="section-title">1. Register your pet</h2>
            </div>
            <form className="stack-form" onSubmit={handleCreatePet}>
              <div className="form-grid form-grid--2">
                <div className="field">
                  <label className="field-label" htmlFor="pet_name">
                    Pet name
                  </label>
                  <input
                    id="pet_name"
                    className="field-input"
                    value={petForm.name}
                    onChange={(e) =>
                      setPetForm((prev) => ({ ...prev, name: e.target.value }))
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
                      setPetForm((prev) => ({ ...prev, breed: e.target.value }))
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
                  Birth date
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

              <button
                type="submit"
                className="btn btn--primary"
                disabled={savingPet}
              >
                {savingPet ? "Saving pet…" : "Save pet"}
              </button>
            </form>
          </section>

          <section className="panel-card">
            <div className="section-header">
              <h2 className="section-title">2. Book the appointment</h2>
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
                    setBookingForm((prev) => ({ ...prev, pet: e.target.value }))
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
                  Date and time
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
                  Notes
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

              <button
                type="submit"
                className="btn btn--primary"
                disabled={savingAppointment || pets.length === 0}
              >
                {savingAppointment ? "Booking…" : "Book appointment"}
              </button>

              {pets.length === 0 && (
                <p className="form-help">
                  Create at least one pet before booking.
                </p>
              )}
            </form>
          </section>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">My appointments</h2>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Pet</th>
                  <th>Service</th>
                  <th>When</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.pet_name}</td>
                    <td>{appointment.service_name}</td>
                    <td className="text-muted">
                      {new Date(appointment.scheduled_at).toLocaleString()}
                    </td>
                    <td>{appointment.status_display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appointmentAPI, petAPI } from "../services/api";
import type { Appointment, Pet } from "../types";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [appointmentsRes, petsRes] = await Promise.all([
          appointmentAPI.list(),
          petAPI.list(),
        ]);
        setAppointments(appointmentsRes.data.results || []);
        setPets(petsRes.data.results || []);
      } catch (err) {
        setError("Error al cargar las reservas. Intenta de nuevo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "yellow",
      confirmed: "green",
      completed: "blue",
      cancelled: "red",
    };
    return colors[status] || "gray";
  };

  if (loading) {
    return <div className="loading">Cargando tus reservas...</div>;
  }

  return (
    <div className="client-dashboard">
      <div className="page-header">
        <h2>Mis Reservas</h2>
        <button className="btn btn--primary" onClick={() => navigate("/book")}>
          + Hacer una Reserva
        </button>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {appointments.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes reservas programadas.</p>
          <p>¡Haz tu primera reserva para que tu mascota luzca hermosa! 🐾</p>
        </div>
      ) : (
        <div className="appointments-grid">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="appointment-card">
              <div className="appointment-card__header">
                <h3>{appointment.pet_name}</h3>
                <span
                  className={`appointment-card__status appointment-card__status--${getStatusColor(appointment.status)}`}
                >
                  {appointment.status_display}
                </span>
              </div>

              <div className="appointment-card__body">
                <div className="appointment-card__item">
                  <strong>Servicio:</strong>
                  <span>{appointment.service_name}</span>
                </div>

                <div className="appointment-card__item">
                  <strong>Fecha y Hora:</strong>
                  <span>{formatDate(appointment.scheduled_at)}</span>
                </div>

                {appointment.staff_email && (
                  <div className="appointment-card__item">
                    <strong>Groomer:</strong>
                    <span>{appointment.staff_email}</span>
                  </div>
                )}

                {appointment.notes && (
                  <div className="appointment-card__item">
                    <strong>Notas:</strong>
                    <span>{appointment.notes}</span>
                  </div>
                )}

                {appointment.price_charged && (
                  <div className="appointment-card__item appointment-card__item--price">
                    <strong>Precio:</strong>
                    <span className="price">${appointment.price_charged}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="section-divider"></div>

      <h3>Mis Mascotas ({pets.length})</h3>

      {pets.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes mascotas registradas.</p>
        </div>
      ) : (
        <div className="pets-grid">
          {pets.map((pet) => (
            <div key={pet.id} className="pet-card">
              <div className="pet-card__header">
                <h4>{pet.name}</h4>
                <span className="pet-card__species">{pet.species_display}</span>
              </div>

              <div className="pet-card__body">
                {pet.breed && (
                  <div className="pet-card__item">
                    <strong>Raza:</strong>
                    <span>{pet.breed}</span>
                  </div>
                )}

                {pet.weight_kg && (
                  <div className="pet-card__item">
                    <strong>Peso:</strong>
                    <span>{pet.weight_kg}kg</span>
                  </div>
                )}

                {pet.notes && (
                  <div className="pet-card__item">
                    <strong>Notas:</strong>
                    <span>{pet.notes}</span>
                  </div>
                )}

                <small className="pet-card__date">
                  Registrado:{" "}
                  {new Date(pet.created_at).toLocaleDateString("es-ES")}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

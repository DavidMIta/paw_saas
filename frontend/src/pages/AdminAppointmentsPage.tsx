import { useState, useEffect } from "react";
import { appointmentAPI, serviceAPI, clientAPI, petAPI } from "../services/api";
import type { Appointment, Service, Client, Pet } from "../types";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [formData, setFormData] = useState({
    pet: "",
    service: "",
    staff: "",
    scheduled_at: "",
    status: "pending",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadPetsByClient();
  }, [selectedClientId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, servicesRes, clientsRes, petsRes] =
        await Promise.all([
          appointmentAPI.list(),
          serviceAPI.list(),
          clientAPI.list(),
          petAPI.list(),
        ]);
      setAppointments(appointmentsRes.data.results || []);
      setServices(servicesRes.data.results || []);
      setClients(clientsRes.data.results || []);
      setPets(petsRes.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPetsByClient = async () => {
    if (!selectedClientId) {
      setPets([]);
      return;
    }
    try {
      const allPets = await petAPI.list();
      const clientPets = (allPets.data.results || []).filter(
        (pet) => pet.owner === selectedClientId,
      );
      setPets(clientPets);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        service: formData.service || undefined,
        pet: formData.pet || undefined,
        staff: formData.staff || undefined,
      };

      if (editingId) {
        await appointmentAPI.update(editingId, payload);
      } else {
        await appointmentAPI.create(payload);
      }

      setFormData({
        pet: "",
        service: "",
        staff: "",
        scheduled_at: "",
        status: "pending",
        notes: "",
      });
      setSelectedClientId("");
      setEditingId(null);
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setFormData({
      pet: appointment.pet,
      service: appointment.service,
      staff: appointment.staff || "",
      scheduled_at: appointment.scheduled_at.split(".")[0],
      status: appointment.status,
      notes: appointment.notes,
    });
    // Find and set the client ID based on the pet
    const petData = pets.find((p) => p.id === appointment.pet);
    if (petData) {
      setSelectedClientId(petData.owner);
    }
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que deseas cancelar esta cita?")) {
      try {
        await appointmentAPI.remove(id);
        await loadData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredAppointments =
    filterStatus === "all"
      ? appointments
      : appointments.filter((a) => a.status === filterStatus);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "pending",
      confirmed: "confirmed",
      in_progress: "in-progress",
      done: "done",
      cancelled: "cancelled",
    };
    return colors[status] || "pending";
  };

  if (loading) {
    return <div className="loading">Cargando citas...</div>;
  }

  return (
    <div className="admin-appointments">
      <div className="page-header">
        <div>
          <h1>Gestionar Citas</h1>
          <p className="subtitle">{filteredAppointments.length} citas</p>
        </div>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => {
              setFormData({
                pet: "",
                service: "",
                staff: "",
                scheduled_at: "",
                status: "pending",
                notes: "",
              });
              setSelectedClientId("");
              setEditingId(null);
              setShowForm(true);
            }}
          >
            + Nueva Cita
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-container form-container--large">
          <h3>{editingId ? "Editar Cita" : "Crear Nueva Cita"}</h3>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-grid form-grid--2">
              <div className="form-group">
                <label htmlFor="client">Cliente *</label>
                <select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.user_full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="pet">Mascota *</label>
                <select
                  id="pet"
                  name="pet"
                  value={formData.pet}
                  onChange={handleChange}
                  required
                  disabled={!selectedClientId}
                >
                  <option value="">
                    {selectedClientId
                      ? "Selecciona una mascota"
                      : "Selecciona un cliente primero"}
                  </option>
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.species_display})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="service">Servicio *</label>
                <select
                  id="service"
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="scheduled_at">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  name="scheduled_at"
                  value={formData.scheduled_at}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="staff">Groomer (Opcional)</label>
                <select
                  id="staff"
                  name="staff"
                  value={formData.staff}
                  onChange={handleChange}
                >
                  <option value="">Sin asignar</option>
                  {/* Staff options would come from staffAPI */}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmada</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="done">Completada</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales"
                rows={3}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn--primary">
                {editingId ? "Actualizar Cita" : "Crear Cita"}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setShowForm(false);
                  setSelectedClientId("");
                  setEditingId(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas las citas</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="in_progress">En Progreso</option>
          <option value="done">Completadas</option>
          <option value="cancelled">Canceladas</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No hay citas.</p>
        </div>
      ) : (
        <div className="appointments-table">
          <table className="table">
            <thead>
              <tr>
                <th>Mascota</th>
                <th>Servicio</th>
                <th>Fecha y Hora</th>
                <th>Groomer</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <strong className="pet-badge">🐾 {apt.pet_name}</strong>
                  </td>
                  <td>{apt.service_name}</td>
                  <td>{new Date(apt.scheduled_at).toLocaleString("es-ES")}</td>
                  <td>{apt.staff_email || "Sin asignar"}</td>
                  <td>
                    <span
                      className={`badge badge--${getStatusColor(apt.status)}`}
                    >
                      {apt.status_display}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button
                      className="btn btn--small btn--secondary"
                      onClick={() => handleEdit(apt)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn--small btn--danger"
                      onClick={() => handleDelete(apt.id)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

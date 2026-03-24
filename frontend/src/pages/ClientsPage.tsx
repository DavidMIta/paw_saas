import { useState, useEffect } from "react";
import { clientAPI, appointmentAPI, serviceAPI } from "../services/api.ts";
import type { Client, Service } from "../types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    notes: "",
  });
  const [bookingData, setBookingData] = useState({
    pet_name: "",
    service: "",
    scheduled_at: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [clientsRes, servicesRes] = await Promise.all([
        clientAPI.list(),
        serviceAPI.list(),
      ]);
      setClients(clientsRes.data.results || []);
      setServices(servicesRes.data.results || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBookingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await clientAPI.create(formData);
      setFormData({ first_name: "", last_name: "", notes: "" });
      setShowForm(false);
      await loadData();
    } catch (err) {
      console.error("Error al crear cliente:", err);
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await appointmentAPI.create({
        pet_name: bookingData.pet_name,
        service: bookingData.service,
        scheduled_at: bookingData.scheduled_at,
        notes: bookingData.notes,
      });
      setBookingData({
        pet_name: "",
        service: "",
        scheduled_at: "",
        notes: "",
      });
      setShowBookingForm(false);
      setSelectedClient(null);
      await loadData();
    } catch (err) {
      console.error("Error al crear cita:", err);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty-state">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestionar Clientes</h1>
          <p className="page-sub">{clients.length} clientes registrados</p>
        </div>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => setShowForm(true)}
          >
            + Nuevo Cliente
          </button>
        )}
      </div>

      {showForm && (
        <div className="form-container">
          <h3>Crear Nuevo Cliente</h3>
          <form onSubmit={handleCreateClient} className="admin-form">
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="first_name">Nombre *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Juan"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="last_name">Apellido *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Notas adicionales del cliente"
                rows={3}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn--primary">
                Crear Cliente
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {showBookingForm && selectedClient && (
        <div className="form-container">
          <h3>Nueva Cita para {selectedClient.user_full_name}</h3>
          <form onSubmit={handleCreateAppointment} className="admin-form">
            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="pet_name">Nombre Mascota *</label>
                <input
                  type="text"
                  id="pet_name"
                  name="pet_name"
                  value={bookingData.pet_name}
                  onChange={handleBookingChange}
                  placeholder="Ej: Max"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="service">Servicio *</label>
                <select
                  id="service"
                  name="service"
                  value={bookingData.service}
                  onChange={handleBookingChange}
                  required
                >
                  <option value="">Selecciona un servicio</option>
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="scheduled_at">Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  id="scheduled_at"
                  name="scheduled_at"
                  value={bookingData.scheduled_at}
                  onChange={handleBookingChange}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="notes">Notas</label>
              <textarea
                id="notes"
                name="notes"
                value={bookingData.notes}
                onChange={handleBookingChange}
                placeholder="Notas especiales para la cita"
                rows={3}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn--primary">
                Crear Cita
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => {
                  setShowBookingForm(false);
                  setSelectedClient(null);
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No tienes clientes registrados.</p>
          <p>Crea tu primer cliente para empezar a agendar citas.</p>
        </div>
      ) : (
        <div className="clients-grid">
          {clients.map((client) => (
            <div key={client.id} className="client-card">
              <div className="client-card__header">
                <div className="client-avatar">
                  {(client.user_full_name ||
                    client.user_email)[0].toUpperCase()}
                </div>
                <div className="client-info">
                  <h3>{client.user_full_name || "Sin nombre"}</h3>
                  <p className="client-email">{client.user_email}</p>
                </div>
              </div>

              <div className="client-card__body">
                {client.notes && (
                  <div className="client-item">
                    <strong>Notas:</strong>
                    <span>{client.notes}</span>
                  </div>
                )}

                <small className="client-date">
                  Se unió:{" "}
                  {new Date(client.created_at).toLocaleDateString("es-ES")}
                </small>
              </div>

              <div className="client-card__footer">
                <button
                  className="btn btn--primary btn--small"
                  onClick={() => {
                    setSelectedClient(client);
                    setShowBookingForm(true);
                  }}
                >
                  + Nueva Cita
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

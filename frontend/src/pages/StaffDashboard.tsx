import { useState, useEffect } from "react";
import { appointmentAPI } from "../services/api";
import type { Appointment } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function StaffDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentAPI.list();
      // Filter to only show appointments assigned to current staff
      const staffAppointments = (response.data.results || []).filter(
        (apt) => apt.staff_email === user?.email,
      );
      setAppointments(staffAppointments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedApt || !newStatus) return;

    try {
      await appointmentAPI.update(selectedApt.id, {
        status: newStatus,
      });
      setSelectedApt(null);
      setNewStatus("");
      await loadAppointments();
    } catch (err) {
      console.error(err);
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

  const statusOptions = [
    { value: "pending", label: "Pendiente" },
    { value: "confirmed", label: "Confirmada" },
    { value: "in_progress", label: "En Progreso" },
    { value: "done", label: "Completada" },
  ];

  if (loading) {
    return <div className="loading">Cargando tus citas...</div>;
  }

  return (
    <div className="staff-dashboard">
      <div className="page-header">
        <div>
          <h1>Mis Citas</h1>
          <p className="subtitle">
            {filteredAppointments.length} citas{" "}
            {filterStatus !== "all" ? filterStatus : ""}
          </p>
        </div>
      </div>

      <div className="filter-bar">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Todas mis citas</option>
          <option value="pending">Pendientes</option>
          <option value="confirmed">Confirmadas</option>
          <option value="in_progress">En Progreso</option>
          <option value="done">Completadas</option>
        </select>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="empty-state">
          <p>No tienes citas asignadas.</p>
        </div>
      ) : (
        <div className="appointments-grid-staff">
          {filteredAppointments.map((apt) => (
            <div key={apt.id} className="appointment-card-staff">
              <div className="appointment-card-staff__header">
                <h3>🐾 {apt.pet_name}</h3>
                <span className={`badge badge--${getStatusColor(apt.status)}`}>
                  {apt.status_display}
                </span>
              </div>

              <div className="appointment-card-staff__body">
                <div className="appointment-item">
                  <strong>Servicio:</strong>
                  <span>{apt.service_name}</span>
                </div>

                <div className="appointment-item">
                  <strong>Fecha y Hora:</strong>
                  <span>
                    {new Date(apt.scheduled_at).toLocaleString("es-ES")}
                  </span>
                </div>

                <div className="appointment-item">
                  <strong>Notas Especiales:</strong>
                  <span>{apt.notes || "Ninguna"}</span>
                </div>

                <div className="appointment-item">
                  <strong>Precio:</strong>
                  <span className="price">
                    ${apt.price_charged || "Pendiente"}
                  </span>
                </div>
              </div>

              <div className="appointment-card-staff__footer">
                <button
                  className="btn btn--small btn--primary"
                  onClick={() => {
                    setSelectedApt(apt);
                    setNewStatus(apt.status);
                  }}
                >
                  Actualizar Estado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedApt && (
        <div className="modal-overlay" onClick={() => setSelectedApt(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Actualizar Estado - {selectedApt.pet_name}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedApt(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="status">Nuevo Estado</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="modal-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn--secondary"
                onClick={() => setSelectedApt(null)}
              >
                Cancelar
              </button>
              <button className="btn btn--primary" onClick={handleStatusUpdate}>
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { appointmentAPI } from "../services/api.ts";
import type { Appointment, PaginatedResponse } from "../types";

const STATUS_CLASS: Record<string, string> = {
  pending: "badge--pending",
  confirmed: "badge--confirmed",
  in_progress: "badge--in-progress",
  done: "badge--done",
  cancelled: "badge--cancelled",
  no_show: "badge--no-show",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    appointmentAPI
      .list()
      .then(({ data }: { data: PaginatedResponse<Appointment> }) =>
        setAppointments(data.results)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Appointments</h1>
          <p className="page-sub">{appointments.length} total</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">No appointments yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Pet</th>
                <th>Service</th>
                <th>Staff</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>
                    <strong>🐾 {a.pet_name}</strong>
                  </td>
                  <td>{a.service_name}</td>
                  <td className="text-muted">
                    {a.staff_email ?? (
                      <span className="text-muted">Unassigned</span>
                    )}
                  </td>
                  <td className="text-muted">
                    {new Date(a.scheduled_at).toLocaleString()}
                  </td>
                  <td>
                    <span className={`badge ${STATUS_CLASS[a.status] ?? ""}`}>
                      {a.status_display}
                    </span>
                  </td>
                  <td className="text-muted">
                    {a.price_charged ? `$${a.price_charged}` : "—"}
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

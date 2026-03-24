import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { clientAPI, petAPI, appointmentAPI } from "../services/api.ts";
import type { Appointment, PaginatedResponse } from "../types";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  clients: number;
  pets: number;
  appointments: number;
  upcoming: number;
}

const STATUS_CLASS: Record<string, string> = {
  pending: "badge--pending",
  confirmed: "badge--confirmed",
  in_progress: "badge--in-progress",
  done: "badge--done",
  cancelled: "badge--cancelled",
  no_show: "badge--no-show",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([clientAPI.list(), petAPI.list(), appointmentAPI.list()])
      .then(([c, p, a]) => {
        const appts = a.data as PaginatedResponse<Appointment>;
        setStats({
          clients: c.data.count,
          pets: p.data.count,
          appointments: appts.count,
          upcoming: appts.results.filter(
            (x: Appointment) =>
              x.status === "pending" || x.status === "confirmed"
          ).length,
        });
        setRecent(appts.results.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  const CARDS = [
    { label: "Clients", value: stats?.clients ?? 0, icon: "👥", mod: "blue", to: "/clients" },
    { label: "Pets", value: stats?.pets ?? 0, icon: "🐾", mod: "purple", to: "/pets" },
    { label: "Appointments", value: stats?.appointments ?? 0, icon: "📅", mod: "green", to: "/appointments" },
    { label: "Upcoming", value: stats?.upcoming ?? 0, icon: "⏰", mod: "amber", to: "/appointments" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">
            Welcome back,{" "}
            <strong>{user?.first_name || user?.email}</strong> 👋
          </p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : (
        <>
          <div className="stats-grid">
            {CARDS.map(({ label, value, icon, mod, to }) => (
              <Link key={label} to={to} className={`stat-card stat-card--${mod}`}>
                <span className="stat-icon">{icon}</span>
                <div className="stat-body">
                  <span className="stat-value">{value}</span>
                  <span className="stat-label">{label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Recent appointments</h2>
              <Link to="/appointments" className="section-link">
                View all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="empty-state">No appointments yet.</div>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Pet</th>
                      <th>Service</th>
                      <th>Scheduled</th>
                      <th>Status</th>
                      <th>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.pet_name}</strong>
                        </td>
                        <td>{a.service_name}</td>
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
        </>
      )}
    </div>
  );
}

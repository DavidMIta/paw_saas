import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = [
    { to: "/", label: "Dashboard", icon: "◈" },
    ...(user?.role === "client"
      ? [{ to: "/reservar", label: "Reservar", icon: "✦" }]
      : []),
    { to: "/clients", label: "Clients", icon: "⬡" },
    { to: "/pets", label: "Pets", icon: "❋" },
    { to: "/appointments", label: "Appointments", icon: "▦" },
    ...(user?.role === "owner" || user?.role === "super_admin"
      ? [{ to: "/users", label: "Users", icon: "👤" }]
      : []),
  ];
  const initials = user?.first_name
    ? `${user.first_name[0]}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : (user?.email?.[0]?.toUpperCase() ?? "U");

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">🐾</span>
          <span className="brand-name">PawSaaS</span>
        </div>

        <nav className="sidebar-nav">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `nav-link${isActive ? " nav-link--active" : ""}`
              }
            >
              <span className="nav-icon">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user?.first_name
                  ? `${user.first_name} ${user.last_name ?? ""}`.trim()
                  : user?.email}
              </span>
              <span className="sidebar-user-role">{user?.role}</span>
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title="Sign out">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <div className="layout-body">
        <main className="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

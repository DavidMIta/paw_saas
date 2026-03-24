import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ClientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Mis Reservas", path: "/client/reservations" },
    { label: "Mis Mascotas", path: "/client/pets" },
    { label: "Perfil", path: "/client/profile" },
  ];

  return (
    <div className="layout--client">
      <header className="client-header">
        <div className="client-header__container">
          <div className="client-header__logo">
            <h1>🐾 Paw Grooming</h1>
          </div>
          <div className="client-header__info">
            <span className="client-header__name">
              {user?.first_name || user?.email}
            </span>
            <button
              className="btn btn--secondary btn--small"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="client-layout__container">
        <nav className="client-nav">
          {navItems.map((item) => (
            <a
              key={item.path}
              href={item.path}
              className={`client-nav__item ${location.pathname === item.path ? "client-nav__item--active" : ""}`}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <main className="client-content">
          <Outlet />
        </main>
      </div>

      <footer className="client-footer">
        <p>&copy; 2026 Paw Grooming. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

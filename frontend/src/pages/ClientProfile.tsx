import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ClientProfile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Tu perfil ha sido actualizado correctamente.");
    setIsEditing(false);
  };

  return (
    <div className="client-profile">
      <h2>Mi Perfil</h2>

      {message && <div className="alert alert--success">{message}</div>}

      <div className="profile-card">
        <div className="profile-section">
          <h3>Información Personal</h3>

          {!isEditing ? (
            <div className="profile-display">
              <div className="profile-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>

              <div className="profile-item">
                <label>Nombre</label>
                <p>{user?.first_name || "-"}</p>
              </div>

              <div className="profile-item">
                <label>Apellido</label>
                <p>{user?.last_name || "-"}</p>
              </div>

              <div className="profile-item">
                <label>Teléfono</label>
                <p>{user?.phone || "-"}</p>
              </div>

              <div className="profile-item">
                <label>Fecha de Registro</label>
                <p>
                  {new Date(user?.created_at || "").toLocaleDateString("es-ES")}
                </p>
              </div>

              <button
                className="btn btn--primary"
                onClick={() => setIsEditing(true)}
              >
                Editar Perfil
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label htmlFor="first_name">Nombre</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name">Apellido</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Tu número de teléfono"
                />
              </div>

              <div className="button-group">
                <button type="submit" className="btn btn--primary">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="profile-section">
          <h3>Cambiar Contraseña</h3>
          <form className="profile-form">
            <div className="form-group">
              <label htmlFor="current_password">Contraseña Actual</label>
              <input
                type="password"
                id="current_password"
                placeholder="Tu contraseña actual"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new_password">Nueva Contraseña</label>
              <input
                type="password"
                id="new_password"
                placeholder="Tu nueva contraseña"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm_password">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirm_password"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <button type="submit" className="btn btn--primary">
              Cambiar Contraseña
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

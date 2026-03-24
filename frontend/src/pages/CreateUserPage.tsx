import { useState } from "react";
import { authAPI } from "../services/api";

export default function CreateUserPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    password: "",
    password2: "",
    role: "staff",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (formData.password !== formData.password2) {
        setError("Las contraseñas no coinciden");
        setLoading(false);
        return;
      }

      await authAPI.createUser({
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        password: formData.password,
        password2: formData.password2,
        role: formData.role as "staff" | "owner" | "super_admin",
      });

      setMessage(
        `✅ Usuario ${formData.email} creado exitosamente como ${formData.role}`,
      );
      setFormData({
        email: "",
        first_name: "",
        last_name: "",
        phone: "",
        password: "",
        password2: "",
        role: "staff",
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.email?.[0] ||
        err.response?.data?.detail ||
        "Error al crear el usuario";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Crear Nuevo Usuario</h1>
          <p className="page-sub">
            Crea empleados (staff) o dueños (owner) del negocio
          </p>
        </div>
      </div>

      <div className="content-grid">
        <div className="card">
          <form onSubmit={handleSubmit} className="form">
            {error && (
              <div className="alert alert--error">
                <strong>Error:</strong> {error}
              </div>
            )}

            {message && (
              <div className="alert alert--success">
                <strong>Éxito:</strong> {message}
              </div>
            )}

            <div className="form-grid form-grid--2">
              <div className="field">
                <label htmlFor="first_name">Nombre *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Ej: Juan"
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
                  placeholder="Ej: Pérez"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@ejemplo.com"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="phone">Teléfono</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+34 600 123 456"
                />
              </div>

              <div className="field">
                <label htmlFor="password">Contraseña *</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password2">Confirmar Contraseña *</label>
                <input
                  type="password"
                  id="password2"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="role">Rol *</label>
              <div className="role-options">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="staff"
                    checked={formData.role === "staff"}
                    onChange={handleChange}
                  />
                  <span className="radio-label-text">
                    <strong>Groomer/Empleado</strong>
                    <small>Puede ver y gestionar sus citas asignadas</small>
                  </span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="owner"
                    checked={formData.role === "owner"}
                    onChange={handleChange}
                  />
                  <span className="radio-label-text">
                    <strong>Dueño/Administrador</strong>
                    <small>Acceso total a gestión de negocio</small>
                  </span>
                </label>

                <label className="radio-label">
                  <input
                    type="radio"
                    name="role"
                    value="super_admin"
                    checked={formData.role === "super_admin"}
                    onChange={handleChange}
                  />
                  <span className="radio-label-text">
                    <strong>Super Administrador</strong>
                    <small>Acceso total del sistema</small>
                  </span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={loading}
            >
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </form>
        </div>

        <div className="card card--info">
          <h3>Información</h3>
          <div className="info-section">
            <h4>👨‍💼 Groomer/Empleado</h4>
            <ul>
              <li>Acceso a `/staff`</li>
              <li>Ve solo sus citas asignadas</li>
              <li>Puede cambiar estado de citas</li>
              <li>No puede crear ni editar citas</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>👔 Dueño/Administrador</h4>
            <ul>
              <li>Acceso completo a `/`</li>
              <li>Puede ver y crear citas</li>
              <li>Gestiona clientes y mascotas</li>
              <li>Asigna groomers a citas</li>
              <li>Gestiona empleados</li>
            </ul>
          </div>

          <div className="info-section">
            <h4>🔐 Super Administrador</h4>
            <ul>
              <li>Acceso a todas las funciones</li>
              <li>Gestión de empresas/negocios</li>
              <li>Gestión de usuarios y roles</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

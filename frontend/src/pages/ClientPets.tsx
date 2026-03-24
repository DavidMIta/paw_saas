import { useEffect, useState } from "react";
import { petAPI } from "../services/api";
import type { Pet } from "../types";

export default function ClientPets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    species: "dog",
    breed: "",
    weight_kg: "",
    notes: "",
  });

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      setLoading(true);
      const response = await petAPI.list();
      setPets(response.data.results || []);
      setError("");
    } catch (err) {
      setError("Error al cargar tus mascotas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
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
      const weight = formData.weight_kg ? parseFloat(formData.weight_kg) : null;
      await petAPI.create({
        ...formData,
        weight_kg: weight as unknown as string | null,
      });
      setFormData({
        name: "",
        species: "dog",
        breed: "",
        weight_kg: "",
        notes: "",
      });
      setShowForm(false);
      await loadPets();
    } catch (err) {
      setError("Error al registrar la mascota");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Cargando tus mascotas...</div>;
  }

  return (
    <div className="client-pets">
      <div className="page-header">
        <h2>Mis Mascotas</h2>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => setShowForm(true)}
          >
            + Agregar Mascota
          </button>
        )}
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <h3>Registrar Nueva Mascota</h3>
          <form onSubmit={handleSubmit} className="pet-form">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nombre de tu mascota"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="species">Especie *</label>
                <select
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                >
                  <option value="dog">Perro</option>
                  <option value="cat">Gato</option>
                  <option value="rabbit">Conejo</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="breed">Raza</label>
                <input
                  type="text"
                  id="breed"
                  name="breed"
                  value={formData.breed}
                  onChange={handleChange}
                  placeholder="Ej: Golden Retriever"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="weight_kg">Peso (kg)</label>
              <input
                type="number"
                id="weight_kg"
                name="weight_kg"
                value={formData.weight_kg}
                onChange={handleChange}
                placeholder="Ej: 15.5"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notas Especiales</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ej: Alergias, comportamiento, preferencias..."
                rows={3}
              />
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn--primary">
                Registrar Mascota
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

      {pets.length === 0 ? (
        <div className="empty-state">
          <p>Aún no tienes mascotas registradas.</p>
          <p>¡Registra tu primera mascota para poder hacer reservas! 🐾</p>
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

import { useState, useEffect } from "react";
import { petAPI } from "../services/api.ts";
import type { Pet, PaginatedResponse } from "../types";

const EMOJI: Record<string, string> = {
  dog: "🐕",
  cat: "🐈",
  bird: "🐦",
  rabbit: "🐰",
  other: "🐾",
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    petAPI
      .list()
      .then(({ data }: { data: PaginatedResponse<Pet> }) =>
        setPets(data.results)
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pets</h1>
          <p className="page-sub">{pets.length} registered</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading…</div>
      ) : pets.length === 0 ? (
        <div className="empty-state">No pets yet.</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Species</th>
                <th>Breed</th>
                <th>Owner</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="cell-avatar">
                      <span className="pet-emoji">
                        {EMOJI[p.species] ?? "🐾"}
                      </span>
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge--species">
                      {p.species_display}
                    </span>
                  </td>
                  <td className="text-muted">{p.breed || "—"}</td>
                  <td className="text-muted">{p.owner_email}</td>
                  <td className="text-muted">
                    {p.weight_kg ? `${p.weight_kg} kg` : "—"}
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

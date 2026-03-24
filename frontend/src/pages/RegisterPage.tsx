import axios from "axios";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../contexts/AuthContext";
import { authAPI, publicAPI } from "../services/api.ts";
import type { PaginatedResponse, PublicBusiness } from "../types";

const INITIAL_FORM = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  business_slug: "",
  password: "",
  password2: "",
};

type RegisterForm = typeof INITIAL_FORM;
type RegisterField = keyof RegisterForm;
type FieldErrors = Partial<Record<RegisterField, string[]>>;

function normalizeMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
}

function getRegisterErrors(payload: unknown): {
  formError: string;
  fieldErrors: FieldErrors;
} {
  const fieldErrors: FieldErrors = {};
  const generalErrors: string[] = [];

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    for (const [key, value] of Object.entries(payload)) {
      const messages = normalizeMessages(value);
      if (!messages.length) continue;

      if (key in INITIAL_FORM) {
        fieldErrors[key as RegisterField] = messages;
      } else if (key === "non_field_errors" || key === "detail") {
        generalErrors.push(...messages);
      } else {
        generalErrors.push(...messages);
      }
    }
  }

  return {
    formError:
      generalErrors[0] ||
      "We could not create your account. Check the highlighted fields.",
    fieldErrors,
  };
}

export default function RegisterPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [businesses, setBusinesses] = useState<PublicBusiness[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function updateField<K extends RegisterField>(
    field: K,
    value: RegisterForm[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  useEffect(() => {
    publicAPI
      .businesses()
      .then((response) => {
        const payload = response.data as PaginatedResponse<PublicBusiness>;
        setBusinesses(payload.results ?? []);
      })
      .catch(() => setError("We could not load the available businesses."))
      .finally(() => setLoadingBusinesses(false));
  }, []);

  if (isAuthenticated) {
    return <Navigate to="/reservar" replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setLoading(true);

    try {
      await authAPI.register({
        ...form,
        role: "client",
      });
      await login(form.email, form.password);
      navigate("/client");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const { formError, fieldErrors: nextFieldErrors } = getRegisterErrors(
          err.response?.data,
        );
        setError(formError);
        setFieldErrors(nextFieldErrors);
      } else {
        setError(
          "We could not create your account. Check the highlighted fields.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card login-card--wide">
        <div className="login-header">
          <span className="login-logo">🐾</span>
          <h1 className="login-title">Create your client account</h1>
          <p className="login-sub">
            Join your grooming business and start booking online.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert--error">{error}</div>}

          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field-label" htmlFor="first_name">
                First name
              </label>
              <input
                id="first_name"
                className={`field-input${fieldErrors.first_name ? " field-input--error" : ""}`}
                value={form.first_name}
                onChange={(e) => updateField("first_name", e.target.value)}
                aria-invalid={!!fieldErrors.first_name}
                required
              />
              {fieldErrors.first_name && (
                <p className="field-error">
                  {fieldErrors.first_name.join(" ")}
                </p>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="last_name">
                Last name
              </label>
              <input
                id="last_name"
                className={`field-input${fieldErrors.last_name ? " field-input--error" : ""}`}
                value={form.last_name}
                onChange={(e) => updateField("last_name", e.target.value)}
                aria-invalid={!!fieldErrors.last_name}
                required
              />
              {fieldErrors.last_name && (
                <p className="field-error">{fieldErrors.last_name.join(" ")}</p>
              )}
            </div>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              className={`field-input${fieldErrors.phone ? " field-input--error" : ""}`}
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              aria-invalid={!!fieldErrors.phone}
              placeholder="+1 555 123 4567"
            />
            {fieldErrors.phone && (
              <p className="field-error">{fieldErrors.phone.join(" ")}</p>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="register_email">
              Email
            </label>
            <input
              id="register_email"
              type="email"
              className={`field-input${fieldErrors.email ? " field-input--error" : ""}`}
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              aria-invalid={!!fieldErrors.email}
              required
            />
            {fieldErrors.email && (
              <p className="field-error">{fieldErrors.email.join(" ")}</p>
            )}
          </div>

          <div className="field">
            <label className="field-label" htmlFor="business_slug">
              Business
            </label>
            <select
              id="business_slug"
              className={`field-input${fieldErrors.business_slug ? " field-input--error" : ""}`}
              value={form.business_slug}
              onChange={(e) => updateField("business_slug", e.target.value)}
              aria-invalid={!!fieldErrors.business_slug}
              required
              disabled={loadingBusinesses}
            >
              <option value="">
                {loadingBusinesses
                  ? "Loading businesses…"
                  : "Select a business"}
              </option>
              {businesses.map((business) => (
                <option key={business.id} value={business.slug}>
                  {business.name} ({business.slug})
                </option>
              ))}
            </select>
            {fieldErrors.business_slug && (
              <p className="field-error">
                {fieldErrors.business_slug.join(" ")}
              </p>
            )}
          </div>

          <div className="form-grid form-grid--2">
            <div className="field">
              <label className="field-label" htmlFor="register_password">
                Password
              </label>
              <input
                id="register_password"
                type="password"
                className={`field-input${fieldErrors.password ? " field-input--error" : ""}`}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                aria-invalid={!!fieldErrors.password}
                required
              />
              {fieldErrors.password && (
                <p className="field-error">{fieldErrors.password.join(" ")}</p>
              )}
            </div>

            <div className="field">
              <label className="field-label" htmlFor="register_password2">
                Confirm password
              </label>
              <input
                id="register_password2"
                type="password"
                className={`field-input${fieldErrors.password2 ? " field-input--error" : ""}`}
                value={form.password2}
                onChange={(e) => updateField("password2", e.target.value)}
                aria-invalid={!!fieldErrors.password2}
                required
              />
              {fieldErrors.password2 && (
                <p className="field-error">{fieldErrors.password2.join(" ")}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>

          <p className="auth-switch">
            Already registered? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

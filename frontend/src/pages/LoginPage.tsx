import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    const redirectPath = user?.role === "client" ? "/client" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      // Will redirect via Navigate component above on next render
    } catch {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">🐾</span>
          <h1 className="login-title">PawSaaS</h1>
          <p className="login-sub">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert--error">{error}</div>}

          <div className="field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary btn--full"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <p className="auth-switch">
            Don&apos;t have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
